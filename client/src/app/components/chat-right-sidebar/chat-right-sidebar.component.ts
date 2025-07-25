import { Component } from '@angular/core';
import { inject } from '@angular/core';
import { ChatService } from '../../services/chat.service';
import { TitleCasePipe } from '@angular/common';

@Component({
  standalone: true,
  selector: 'app-chat-right-sidebar',
  imports: [TitleCasePipe],
  templateUrl: './chat-right-sidebar.component.html',
  styles: ``
})
export class ChatRightSidebarComponent {
  chatService = inject(ChatService);
  group = inject(ChatService).currentOpenedGroup;
}
