using System;
using System.Collections.Concurrent;
using API.Data;
using API.DTOs;
using API.Extentions;
using API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using API.Services;
using MongoDB.Driver;

namespace API.Hubs;

[Authorize]
public class ChatHub : Hub
{
    private readonly UserManager<AppUser> userManager;
    private readonly MongoMessageService messageService;

    public static readonly ConcurrentDictionary<string, OnlineUserDto> onlineUsers = new();

    public ChatHub(UserManager<AppUser> userManager, MongoMessageService messageService)
    {
        this.userManager = userManager;
        this.messageService = messageService;
    }

    public override async Task OnConnectedAsync()
    {
        var HttpContext = Context.GetHttpContext();
        var receiverId = HttpContext?.Request.Query["senderId"].ToString();
        var userName = Context.User!.Identity!.Name!;
        var currentUser = await userManager.FindByNameAsync(userName);
        var connectionId = Context.ConnectionId;

        if (onlineUsers.ContainsKey(userName))
        {
            onlineUsers[userName].ConnectionId = connectionId;
        }
        else
        {
            var user = new OnlineUserDto
            {
                UserName = userName,
                ConnectionId = connectionId,
                ProfilePictureUrl = currentUser!.ProfilePic,
                FullName = currentUser!.FullName
            };
            onlineUsers.TryAdd(userName, user);
            await Clients.AllExcept(connectionId).SendAsync("Notify", currentUser);
        }

        if (!string.IsNullOrEmpty(receiverId))
        {
            await LoadMessages(receiverId);
        }

        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());
    }

    public async Task LoadMessages(string receiverId, int pageNumber = 1)
    {
        int pageSize = 10;
        var userName = Context.User!.Identity!.Name;
        var currentUser = await userManager.FindByNameAsync(userName!);
        if (currentUser is null) return;

        List<Message> messages = new List<Message>();
        try
        {
            messages = await messageService.GetMessagesAsync(currentUser.Id, receiverId, pageNumber, pageSize);
            foreach (var message in messages)
            {
                if (message.ReceiverId == currentUser.Id && !message.IsRead)
                {
                    await messageService.MarkAsReadAsync(message.Id);
                }
            }
        }
        catch (Exception ex)
        {
            // Log the error, but don't throw
            Console.WriteLine($"Error loading messages: {ex.Message}");
            messages = new List<Message>();
        }

        await Clients.User(currentUser.Id).SendAsync("ReceiveMessageList", messages);
    }

    public async Task SendMessage(MessageRequestDto message)
    {
        var senderUser = await userManager.FindByNameAsync(Context.User!.Identity!.Name!);
        var receiverUser = await userManager.FindByIdAsync(message.ReceiverId!);
        if (senderUser == null || receiverUser == null) return;

        var newMsg = new Message
        {
            SenderId = senderUser.Id,
            ReceiverId = receiverUser.Id,
            Content = message.Content,
            Timestamp = DateTime.UtcNow,
            IsRead = false
        };

        try
        {
            await messageService.AddMessageAsync(newMsg);
            await Clients.User(receiverUser.Id).SendAsync("ReceiveNewMessage", newMsg);
        }
        catch (Exception ex)
        {
            // Log the error, but don't throw
            Console.WriteLine($"Error sending message: {ex.Message}");
            // Optionally, you could notify the sender of the failure here
        }
    }

    public async Task NotifyTyping(string receiverUserName)
    {
        var senderUserName = Context.User!.Identity!.Name;

        if (senderUserName is null)
        {
            return;
        }

        var connectionId = onlineUsers.Values.FirstOrDefault(u => u.UserName == receiverUserName)?.ConnectionId;

        if (connectionId != null)
        {
            await Clients.Client(connectionId).SendAsync("UserTyping", senderUserName);
        }
    }

    public async Task DeleteMessage(string messageId)
    {
        // Find the message
        var userName = Context.User!.Identity!.Name;
        var senderUser = await userManager.FindByNameAsync(userName!);
        if (senderUser == null) return;

        // Get the message from MongoDB
        var message = await messageService.GetMessageByIdAsync(messageId);
        if (message == null) return;

        // Only allow sender to delete and only within 15 minutes
        if (message.SenderId == senderUser.Id && (DateTime.UtcNow - message.Timestamp).TotalMinutes <= 15)
        {
            await messageService.SoftDeleteMessageAsync(messageId);
            // Optionally, notify clients to remove/hide the message
            await Clients.User(message.ReceiverId).SendAsync("MessageDeleted", messageId);
            await Clients.User(message.SenderId).SendAsync("MessageDeleted", messageId);
        }
    }

    public async Task EditMessage(string messageId, string newContent)
    {
        var userName = Context.User!.Identity!.Name;
        var senderUser = await userManager.FindByNameAsync(userName!);
        if (senderUser == null) return;

        var message = await messageService.GetMessageByIdAsync(messageId);
        if (message == null || message.IsDeleted) return;

        // Only allow sender to edit and only within 15 minutes
        if (message.SenderId == senderUser.Id && (DateTime.UtcNow - message.Timestamp).TotalMinutes <= 15)
        {
            await messageService.EditMessageAsync(messageId, newContent);
            // Notify both users
            await Clients.User(message.ReceiverId).SendAsync("MessageEdited", messageId, newContent);
            await Clients.User(message.SenderId).SendAsync("MessageEdited", messageId, newContent);
        }
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userName = Context.User!.Identity!.Name!;

        onlineUsers.TryRemove(userName!, out _);

        await Clients.All.SendAsync("OnlineUsers", await GetAllUsers());

    }

    private async Task<IEnumerable<OnlineUserDto>> GetAllUsers()
    {
        var username = Context.User!.GetUserName();

        var onlineUsersSet = new HashSet<string>(onlineUsers.Keys);

        var users = await userManager.Users.Select(user => new OnlineUserDto
        {
            Id = user.Id,
            UserName = user.UserName,
            FullName = user.FullName,
            ProfilePictureUrl = user.ProfilePic,
            IsOnline = onlineUsersSet.Contains(user.UserName!),
            UnreadMessagesCount = 0
        }).OrderByDescending(user => user.IsOnline).ToListAsync();

        return users;
    }

    public async Task CreateGroup(GroupDto groupDto)
    {
        // Validate input
        if (groupDto == null || string.IsNullOrWhiteSpace(groupDto.Name) || groupDto.MemberIds == null || !groupDto.MemberIds.Any())
            return; // Or throw a HubException with a message

        await messageService.CreateGroupAsync(groupDto);
        foreach (var memberId in groupDto.MemberIds)
        {
            await Clients.User(memberId).SendAsync("GroupCreated");
        }
    }

    public async Task<List<GroupDto>> GetMyGroups()
    {
        var userName = Context.User!.Identity!.Name;
        var user = await userManager.FindByNameAsync(userName!);
        if (user == null) return new List<GroupDto>();
        var groups = await messageService.GetGroupsForUserAsync(user.Id);

        // Populate member details
        var allUserIds = groups.SelectMany(g => g.MemberIds).Distinct().ToList();
        var users = await userManager.Users.Where(u => allUserIds.Contains(u.Id)).ToListAsync();

        return groups.Select(g => new GroupDto {
            Id = g.Id,
            Name = g.Name,
            MemberIds = g.MemberIds,
            Type = g.Type,
            Members = users.Where(u => g.MemberIds.Contains(u.Id))
                           .Select(u => new { id = u.Id, userName = u.UserName, fullName = u.FullName, profilePictureUrl = u.ProfilePic }).ToList<object>()
        }).ToList();
    }

    public async Task LoadGroupMessages(string groupId, int pageNumber = 1)
    {
        // Fetch messages for the group from MongoDB and send to caller
        var messages = await messageService.GetGroupMessagesAsync(groupId, pageNumber);
        await Clients.Caller.SendAsync("ReceiveGroupMessageList", messages);
    }

    public async Task SendGroupMessage(GroupMessageDto message)
    {
        // Save message to MongoDB
        var newMsg = new GroupMessage
        {
            GroupId = message.GroupId,
            SenderId = Context.UserIdentifier,
            Content = message.Content,
            Timestamp = DateTime.UtcNow,
            IsRead = false
        };
        await messageService.AddGroupMessageAsync(newMsg);

        // Notify all group members
        var group = await messageService.GetGroupByIdAsync(message.GroupId);
        foreach (var memberId in group.MemberIds)
        {
            await Clients.User(memberId).SendAsync("ReceiveNewGroupMessage", newMsg);
        }
    }
}
