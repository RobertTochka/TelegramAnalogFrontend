import { Message } from './message.interface'
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
  inviteLink?: InviteLinkDto
  participants: ChatParticipant[]
  lastMessage?: Message
  pinnedMessage?: Message
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
  cursor?: string
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

export interface InviteLinkDto {
  link: string
  expiresAt: Date
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
    limit: number
    nextCursor: string | null
    hasNextPage: boolean
  }
}
