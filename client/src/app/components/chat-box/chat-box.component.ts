import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat-box',
  imports: [MatProgressSpinner, DatePipe, MatIconModule, MatMenuModule, FormsModule],
  templateUrl: './chat-box.component.html',
  styles: [`
    .chat-box {
      scroll-behavior: smooth;
      overflow-y: auto;
      padding: 10px;
      background-color: #f0f0f0;
      display: flex;
      flex-direction: column;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      border-radius: 5px;
      height: 84vh;
      scrollbar-width: thin;
      scrollbar-color: transparent ;
      transition: scrollbar-color 0.3s;
    }
    .chat-box::-webkit-scrollbar {
      width: 4px;
      background: transparent;
    }
    .chat-box::-webkit-scrollbar-thumb {
      background: transparent;
      border-radius: 10px;
      transition: background 0.3s;
    }
    .chat-box::-webkit-scrollbar-track {
      background: transparent;
      border-radius:10px;
    }
    .chat-box::-webkit-scrollbar-corner {
      background: transparent;
    }
    .chat-box:hover::-webkit-scrollbar-thumb {
      background: #bdbdbd;
    }
    .chat-box {
      scrollbar-width: thin;
      scrollbar-color: transparent transparent;
    }
    .chat-box:hover {
      scrollbar-color: #bdbdbd transparent;
    }
    .chat-icon{
      width:40px;
      height:40px;
      font-size:40px;
    }
    `]
})
export class ChatBoxComponent {
  chatService = inject(ChatService);
  authService = inject(AuthService);  
  menuItem: any = null;
  editingMessageId: string | null = null;
  editContent: string = '';

  setMenuItem(item: any) {
    this.menuItem = item;
    this.editContent = item.content;
  }

  startEdit(item: any) {
    this.editingMessageId = item.id;
    this.editContent = item.content;
  }

  saveEdit() {
    if (this.editingMessageId) {
      this.chatService.editMessage(this.editingMessageId, this.editContent);
      this.editingMessageId = null;
      this.editContent = '';
    }
  }

  cancelEdit() {
    this.editingMessageId = null;
    this.editContent = '';
  }

  editMessage(item: any) {
    this.startEdit(item);
  }

  isWithin15Minutes(timestamp: string): boolean {
    return (Date.now() - new Date(timestamp).getTime()) / 60000 <= 15;
  }
}
