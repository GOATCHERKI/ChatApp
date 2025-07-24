import { Component, inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TitleCasePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ChatBoxComponent } from "../chat-box/chat-box.component";
import { AuthService } from '../../services/auth.service';
import { DatePipe } from '@angular/common';


@Component({
  standalone: true,
  selector: 'app-chat-window',
  imports: [TitleCasePipe, MatIconModule, FormsModule, ChatBoxComponent, DatePipe],
  templateUrl: './chat-window.component.html',
  styles: ``
})
export class ChatWindowComponent {

  chatService = inject(ChatService); 
  message: string = ''; 
  authService = inject(AuthService);

  sendMessage() {
    if (!this.message) return;
    if (this.chatService.currentOpenedGroup()) {
      this.chatService.sendGroupMessage(this.message);
    } else {
      this.chatService.sendMessage(this.message);
    }
    this.message = '';
  }

  closeChatWindow() {
    this.chatService.currentOpenedChat.set(null);
    this.chatService.currentOpenedGroup.set(null);
  }

  getUserName(senderId?: string | null): string {
    const group = this.chatService.currentOpenedGroup();
    if (group && group.members) { // <-- lowercase 'members'
      const user = group.members.find((u: any) => u.id === senderId);
      return user ? (user.userName || user.fullName || 'Member') : 'Member';
    }
    return senderId?.slice(0, 6) || 'Member';
  }
}
