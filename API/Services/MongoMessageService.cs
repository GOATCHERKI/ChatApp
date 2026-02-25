using API.Models;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using API.Common;
using API.DTOs;

namespace API.Services;

public class MongoMessageService
{
    private readonly IMongoCollection<Message> _messages;

    public MongoMessageService(IOptions<MongoDBSettings> settings)
    {
        var client = new MongoClient(settings.Value.ConnectionString);
        var database = client.GetDatabase(settings.Value.DatabaseName);
        _messages = database.GetCollection<Message>("messages");
    }

    public async Task<List<Message>> GetMessagesAsync(string userId, string receiverId, int pageNumber, int pageSize)
    {
        var filter = Builders<Message>.Filter.And(
            Builders<Message>.Filter.Or(
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.ReceiverId, userId),
                    Builders<Message>.Filter.Eq(m => m.SenderId, receiverId)
                ),
                Builders<Message>.Filter.And(
                    Builders<Message>.Filter.Eq(m => m.SenderId, userId),
                    Builders<Message>.Filter.Eq(m => m.ReceiverId, receiverId)
                )
            ),
            Builders<Message>.Filter.Or(
                Builders<Message>.Filter.Eq(m => m.IsDeleted, false),
                Builders<Message>.Filter.Exists(m => m.IsDeleted, false)
            )
        );
        return await _messages.Find(filter)
            .SortByDescending(m => m.Timestamp)
            .Skip((pageNumber - 1) * pageSize)
            .Limit(pageSize)
            .SortBy(m => m.Timestamp)
            .ToListAsync();
    }

    public async Task<Message> AddMessageAsync(Message message)
    {
        await _messages.InsertOneAsync(message);
        return message;
    }

    public async Task MarkAsReadAsync(string messageId)
    {
        var update = Builders<Message>.Update.Set(m => m.IsRead, true);
        await _messages.UpdateOneAsync(m => m.Id == messageId, update);
    }

    public async Task SoftDeleteMessageAsync(string messageId)
    {
        var update = Builders<Message>.Update.Set(m => m.IsDeleted, true);
        await _messages.UpdateOneAsync(m => m.Id == messageId, update);
    }

    public async Task<long> CountUnreadAsync(string receiverId, string senderId)
    {
        var filter = Builders<Message>.Filter.And(
            Builders<Message>.Filter.Eq(m => m.ReceiverId, receiverId),
            Builders<Message>.Filter.Eq(m => m.SenderId, senderId),
            Builders<Message>.Filter.Eq(m => m.IsRead, false)
        );
        return await _messages.CountDocumentsAsync(filter);
    }

    public async Task<Message?> GetMessageByIdAsync(string messageId)
    {
        return await _messages.Find(m => m.Id == messageId).FirstOrDefaultAsync();
    }

    public async Task EditMessageAsync(string messageId, string newContent)
    {
        var update = Builders<Message>.Update.Set(m => m.Content, newContent);
        await _messages.UpdateOneAsync(m => m.Id == messageId, update);
    }
    
public async Task CreateGroupAsync(GroupDto groupDto)
{
    if (groupDto == null || string.IsNullOrWhiteSpace(groupDto.Name) || groupDto.MemberIds == null || !groupDto.MemberIds.Any())
        return;

    var group = new Group
    {
        Name = groupDto.Name,
        MemberIds = groupDto.MemberIds,
        Type = groupDto.Type
    };
    var database = _messages.Database;
    var groupsCollection = database.GetCollection<Group>("groups");
    await groupsCollection.InsertOneAsync(group);
}

public async Task<List<Group>> GetGroupsForUserAsync(string userId)
{
    var database = _messages.Database;
    var groupsCollection = database.GetCollection<Group>("groups");
    var filter = Builders<Group>.Filter.AnyEq(g => g.MemberIds, userId);
    return await groupsCollection.Find(filter).ToListAsync();
}

public async Task<List<GroupMessage>> GetGroupMessagesAsync(string groupId, int pageNumber, int pageSize = 20)
{
    var database = _messages.Database;
    var groupMessages = database.GetCollection<GroupMessage>("groupMessages");
    return await groupMessages.Find(m => m.GroupId == groupId)
        .SortByDescending(m => m.Timestamp)
        .Skip((pageNumber - 1) * pageSize)
        .Limit(pageSize)
        .SortBy(m => m.Timestamp)
        .ToListAsync();
}

public async Task AddGroupMessageAsync(GroupMessage message)
{
    var database = _messages.Database;
    var groupMessages = database.GetCollection<GroupMessage>("groupMessages");
    await groupMessages.InsertOneAsync(message);
}

public async Task<Group> GetGroupByIdAsync(string groupId)
{
    var database = _messages.Database;
    var groupsCollection = database.GetCollection<Group>("groups");
    return await groupsCollection.Find(g => g.Id == groupId).FirstOrDefaultAsync();
}
} 