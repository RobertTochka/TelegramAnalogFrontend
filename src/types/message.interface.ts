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
  senderId: string
  sender: MessageSenderDto
}

export interface MessageSenderDto {
  id: string
  firstName: string
  lastName: string
  avatar: string
}

export enum EnumMessageStatus {
  SENT,
  DELIVERED,
  READ,
  FAILED,
  DELETED
}
