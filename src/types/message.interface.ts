export interface Message {
  id: string
  chatId: string
  sender?: MessageSenderDto
  content: string
  isSystem: boolean
  replyTo?: Message
  forwardedFrom?: Message
  statuses: Record<string, EnumMessageStatus>
  createdAt: string
  isEdited: boolean
}

export interface MessageFilter {
  chatId?: string
  senderId?: string
  fromDate?: string
  page?: number
  limit?: number
  search?: string
}

export interface CreateMessageDto {
  chatId: string
  content?: string
  replyToId?: string
  forwardedFromId?: string
}

export interface MessageDto {
  id: string
  content: string
  createdAt: string
  senderId?: string
  sender?: MessageSenderDto
}

export interface MessageSenderDto {
  id: string
  firstName: string
  lastName: string
  avatar: string
}

export interface TypingEvent {
  chatId: string
  userId: string
  isTyping: boolean
}

export interface MessageStatusEvent {
  messageId: string
  status: EnumMessageStatus
  userId: string
}

export interface ReadReceiptEvent {
  chatId: string
  userId: string
  messageIds?: string[]
  readAt: string
}

export enum EnumMessageStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED',
  DELETED = 'DELETED'
}
