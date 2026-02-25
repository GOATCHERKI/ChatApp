export interface Message {
  id: string;
  senderId: string | null;
  receiverId?: string | null; // Make optional for group messages
  groupId?: string;           // Add this line
  content: string;
  timestamp: string;
  isRead: boolean;
}