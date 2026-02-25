export interface User {
  id: string;   
  profilePic: string;
  profilePictureFile: string;
  fullName: string;
  isOnline: boolean;
  userName: string;
  photoUrl: string;
  connectionId: string;
  lastMessage: string;
  unreadCount: number;
  isTyping: boolean;
  profilePictureUrl?: string; 
 
}