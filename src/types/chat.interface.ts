import { MessageDto } from './message.interface'
import { EnumUserStatus } from './user.interface'

export interface Chat {
  id: string
  type: EnumChatType
  name?: string
  description?: string
  avatar: string
  createdById: string
  createdBy?: ChatParticipant
  isPrivate: boolean
  inviteLink?: string
  participants: ChatParticipant[]
  lastMessage?: MessageDto
  pinnedMessage?: MessageDto
  unreadCount?: number
  createdAt: string
  updatedAt: string
  participantCount: number
  isArchived: boolean
  isMuted: boolean
  isPinned: boolean
}

export interface ChatParticipant {
  id: string
  username?: string
  firstName: string
  lastName: string
  avatar: string
  role: EnumParticipantRole
  status: EnumUserStatus
  lastSeen: string
  joinedAt: string
  lastReadAt?: string
}

export interface ChatFilter {
  type?: EnumChatType
  isPrivate?: string
  isArchived?: boolean
  isMuted?: boolean
  search?: string
  page?: number
  limit?: number
}

export interface CreateChatDto {
  name?: string
  description?: string
  type: string
  participantIds: string[]
  isPrivate?: boolean
  avatar?: string
}

export enum EnumChatType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
  CHANNEL = 'CHANNEL'
}

export enum EnumParticipantRole {
  OWNER = 'OWNER',
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface PaginatedResponse<T> {
  data: T
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}
