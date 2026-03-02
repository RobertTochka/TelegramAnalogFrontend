export interface Profile {
  id: string
  email: string
  phone?: string
  password?: string
  username?: string
  firstName: string
  lastName: string
  description?: string
  avatar: string
  isPasswordEnabled: boolean
  status: EnumUserStatus
  role: EnumUserRole
  visibility: EnumUserVisibility
  friends: User[]
  lastSeen: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  username?: string
  firstName: string
  lastName: string
  description?: string
  avatar: string
  status: EnumUserStatus
  lastSeen: string
  friends: User[]
}

export interface ChangePasswordDto {
  oldPassword?: string
  password: string
  passwordRepeat: string
}

export interface GetFriendsResponseDto {
  friends: Omit<User, 'friends'>[]
  friendRequests: FriendRequestsDto
}

export interface FriendRequestsDto {
  incomingRequests: Omit<User, 'friends'>[]
  outgoingRequests: Omit<User, 'friends'>[]
}

export enum EnumUserStatus {
  ONLINE,
  OFFLINE
}

export enum EnumUserRole {
  ADMIN,
  USER
}

export enum EnumUserVisibility {
  VISIBLE,
  INVISIBLE
}
