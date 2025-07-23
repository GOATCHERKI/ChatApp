import { Component, inject, OnInit } from '@angular/core';
import {  MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { TitleCasePipe } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { User } from '../../Models/User';
import { MatDialog } from '@angular/material/dialog';
import { CreateGroupDialogComponent } from '../create-group-dialog/create-group-dialog.component';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-chat-sidebar',
  imports: [
    MatIconModule,
    MatMenuModule,
    TitleCasePipe,
    NgIf,
  ],
  templateUrl: './chat-sidebar.component.html',
  styles: ``
})
export class ChatSidebarComponent implements OnInit {


  authService = inject(AuthService);
  chatService = inject(ChatService);
  router = inject(Router);

  groups: any[] = [];

  constructor(private dialog: MatDialog) {}

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.chatService.disConnectConnection();
  }

ngOnInit(): void {
  this.chatService.startConnection(this.authService.getAccessToken!, undefined, () => {
    this.chatService.getMyGroups().then(groups => {
      this.groups = groups;
    });
  });
}

  openChatWindow(user: User) {
    this.chatService.currentOpenedGroup.set(null); // Close any group chat
    this.chatService.chatMessages.set([]);
    this.chatService.currentOpenedChat.set(user);
    this.chatService.loadMessages(1);
  }

  openCreateGroupDialog() {
    const dialogRef = this.dialog.open(CreateGroupDialogComponent, {
      data: { users: this.chatService.onlineUsers() }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const adminId = this.authService.currentLoggedInUser?.id;
        const uniqueMembers = Array.from(new Set([...(result.memberIds || []), adminId])).filter((id): id is string => !!id);
        this.chatService.createGroup({
          ...result,
          memberIds: uniqueMembers
        });
        // Fetch groups again after creation
        setTimeout(() => {
          this.chatService.getMyGroups().then(groups => {
            this.groups = groups;
          });
        }, 500); // slight delay to allow backend to save
      }
    });
  }

  openGroupChatWindow(group: any) {
    console.log('Opening group:', group); // <-- Add this line
    if (group && group.Members) {
      console.log('Group Members:', group.Members);
    } else {
      console.warn('No Members property on group:', group);
    }
    this.chatService.currentOpenedChat.set(null); // Close any user chat
    this.chatService.currentOpenedGroup.set(group); // Set the opened group
    this.chatService.chatMessages.set([]); // Clear previous messages
    this.chatService.loadGroupMessages(group.id, 1); // Load group messages
  }
}
