import { inject, Injectable, signal } from '@angular/core';
import { User } from '../Models/User';
import { AuthService } from './auth.service';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { Message } from '../Models/message';
import { envirenmont } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private authService = inject(AuthService);
  private hubUrl = `${envirenmont.baseUrl}/hubs/chat`;
  onlineUsers = signal<User[]>([]);
  currentOpenedChat = signal<User | null>(null);
  chatMessages = signal<Message[]>([]);
  isLoading = signal<boolean>(true);
  currentOpenedGroup = signal<any | null>(null);

  private hubConnection?:HubConnection;

  startConnection(token: string, senderId?: string, onConnected?: () => void): void {
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${this.hubUrl}?senderId=${senderId || ''}`,{
        accessTokenFactory: () => token
      }).withAutomaticReconnect().build()

      this.hubConnection.start().then(() => {
        console.log('Hub connection started');
        if (onConnected) onConnected();
      }).catch((err) => {
        console.error('Error while starting hub connection:', err);
      });

      this.hubConnection!.on('Notify',(user:User)=> {
        Notification.requestPermission().then((result) => {
          if (result === 'granted') {
         
          new Notification('Active now', {
            body: user.fullName + ' is online',
            icon: user.profilePictureUrl ,
          });
        }
        });
      });
   
    this.hubConnection!.on('OnlineUsers', (users: User[]) => {
      console.log(users);
      this.onlineUsers.update(() =>
        users.filter((user) => user.userName !== this.authService.currentLoggedInUser!.userName)
      );
    });

    this.hubConnection!.on('ReceiveMessageList', (message) => {
      this.chatMessages.update((messages) => [...message, ...messages]);
      this.isLoading.update(()=>false);
    });

    this.hubConnection!.on('ReceiveNewMessage', (message: Message) => {
      this.chatMessages.update((messages) => [...messages, message]);
    });

    this.hubConnection!.on('MessageEdited', (messageId: string, newContent: string) => {
      this.chatMessages.update(messages =>
        messages.map(m => m.id === messageId ? { ...m, content: newContent } : m)
      );
    });

    this.hubConnection!.on('GroupCreated', () => {
      this.getMyGroups().then(groups => {
        // You may want to update a signal or emit an event
        // For now, you can call a callback or update a property
      });
    });

    this.hubConnection!.on('ReceiveGroupMessageList', (messages) => {
      this.chatMessages.set(messages);
      this.isLoading.update(() => false);
    });
    this.hubConnection!.on('ReceiveNewGroupMessage', (message) => {
      // Only add the message if it belongs to the currently opened group
      const currentGroup = this.currentOpenedGroup();
      if (currentGroup && message.groupId === currentGroup.id) {
        this.chatMessages.update((msgs) => [...msgs, message]);
      }
    });
  } 

  disConnectConnection() {
    if(this.hubConnection?.state == HubConnectionState.Connected)
      {
      this.hubConnection.stop().catch((err) => console.error(err));
    }

  }

  sendMessage(message: string) {
    this.chatMessages.update((messages) =>[
       ...messages, 
        {
           content: message,
           senderId: this.authService.currentLoggedInUser!.id,
           receiverId: this.currentOpenedChat()?.id!,
           timestamp: new Date().toString(),
           isRead: false,
           id: Date.now().toString() // Use a unique string, not 0
        } 
      ])

      this.hubConnection?.invoke("SendMessage", {
        receiverId: this.currentOpenedChat()?.id,
        content: message
      }).then((id) => {
        console.log("message sent successfully", id);
      }).catch((err) => {
        console.error('Error sending message:', err);
      }
    );

  }

  status(userName: string): string {
    const currentChatUser = this.currentOpenedChat();
    if (!currentChatUser) {
      return 'Offline';
    }
    const onlineUser = this.onlineUsers().find((user) => user.userName === userName);

    return onlineUser?.isTyping ? 'Typing...' : this.isUserOnline();
  }

  isUserOnline():string {
    let onlineUser = this.onlineUsers().find(user => user.userName === this.currentOpenedChat()?.userName);
    return onlineUser?.isOnline ? 'Online' : this.currentOpenedChat()!.userName;
  }

  loadMessages(pageNumber: number) {
    this.hubConnection?.invoke("LoadMessages", this.currentOpenedChat()?.id, pageNumber)
      .then(() => {
        this.isLoading.update(() => true);
      })
      .catch((err) => {
        console.error('Error loading messages:', err);
        this.isLoading.update(() => false);
      }
    ).finally(() => {
        this.isLoading.update(() => false);
      }
    );
  }

  get filteredMessages() {
    const myId = this.authService.currentLoggedInUser?.id;
    const otherId = this.currentOpenedChat()?.id;
    return this.chatMessages().filter(
      m => (m.senderId === myId && m.receiverId === otherId) ||
           (m.senderId === otherId && m.receiverId === myId)
    );
  }

  deleteMessage(messageId: string) {
    this.hubConnection?.invoke("DeleteMessage", messageId)
      .then(() => {
        this.chatMessages.update(messages => messages.filter(m => m.id !== messageId));
      })
      .catch((err) => {
        console.error('Error deleting message:', err);
      });
  }

  editMessage(messageId: string, newContent: string) {
    this.hubConnection?.invoke("EditMessage", messageId, newContent)
      .catch(err => console.error('Error editing message:', err));
  }

  createGroup(groupData: { name: string, memberIds: string[], type: string }) {
    this.hubConnection?.invoke("CreateGroup", groupData)
      .then(() => {
        console.log("Group creation requested");
      })
      .catch(err => console.error('Error creating group:', err));
  }

  getMyGroups(): Promise<any[]> {
    return this.hubConnection?.invoke("GetMyGroups") ?? Promise.resolve([]);
  }

  loadGroupMessages(groupId: string, pageNumber: number) {
    this.hubConnection?.invoke("LoadGroupMessages", groupId, pageNumber)
      .then(() => {
        this.isLoading.update(() => true);
      })
      .catch((err) => {
        console.error('Error loading group messages:', err);
        this.isLoading.update(() => false);
      })
      .finally(() => {
        this.isLoading.update(() => false);
      });
  }

  sendGroupMessage(message: string) {
    const group = this.currentOpenedGroup();
    if (!group) return;
    this.hubConnection?.invoke("SendGroupMessage", {
      groupId: group.id,
      content: message
    }).catch((err) => {
      console.error('Error sending group message:', err);
    });
  }
}
