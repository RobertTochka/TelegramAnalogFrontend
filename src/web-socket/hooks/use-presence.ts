import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

import { useSocket } from '../SocketProvider'

import { EnumUserStatus } from '@/types'

type PresenceSingle =
  | { type: 'online'; userId: string; at?: string }
  | { type: 'offline'; userId: string; lastSeen?: string }

export function usePresence() {
  const qc = useQueryClient()
  const { statusSocket } = useSocket()

  useEffect(() => {
    if (!statusSocket) return

    const toIso = (v?: string | Date | null) =>
      v ? (typeof v === 'string' ? v : v.toISOString()) : null

    const updateUserCache = (
      userId: string,
      status: EnumUserStatus,
      lastSeen?: string | Date | null
    ) => {
      qc.setQueryData(['user', userId], (old: any) => ({
        ...(old || {}),
        status,
        lastSeen: toIso(lastSeen ?? old?.lastSeen ?? null)
      }))
    }

    const updateParticipantInChatsList = (
      userId: string,
      status: EnumUserStatus,
      lastSeen?: string | Date | null
    ) => {
      qc.setQueriesData({ queryKey: ['chats', 'list'] }, (oldData: any) => {
        if (!oldData) return oldData

        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            data: page.data.map((chat: any) => {
              if (!chat.participants) return chat
              return {
                ...chat,
                participants: chat.participants.map((p: any) =>
                  p.id === userId
                    ? {
                        ...p,
                        status,
                        lastSeen: toIso(lastSeen ?? p.lastSeen ?? null)
                      }
                    : p
                )
              }
            })
          }))
        }
      })
    }

    const updateParticipantInChatDetails = (
      userId: string,
      status: EnumUserStatus,
      lastSeen?: string | Date | null
    ) => {
      qc.setQueriesData({ queryKey: ['chats', 'detail'] }, (old: any) => {
        if (!old) return old

        if (!old.participants) return old

        const found = old.participants.some((p: any) => p.id === userId)
        if (!found) return old

        return {
          ...old,
          participants: old.participants.map((p: any) =>
            p.id === userId
              ? {
                  ...p,
                  status,
                  lastSeen: toIso(lastSeen ?? p.lastSeen ?? null)
                }
              : p
          )
        }
      })
    }

    const handleOnline = (data: { userId: string; at?: string }) => {
      const uid = data.userId
      const at = data.at ? data.at : new Date().toISOString()
      updateUserCache(uid, EnumUserStatus.ONLINE, at)
      updateParticipantInChatsList(uid, EnumUserStatus.ONLINE, at)
      updateParticipantInChatDetails(uid, EnumUserStatus.ONLINE, at)
    }

    const handleOffline = (data: { userId: string; lastSeen?: string }) => {
      const uid = data.userId
      const ls = data.lastSeen ? data.lastSeen : new Date().toISOString()
      updateUserCache(uid, EnumUserStatus.OFFLINE, ls)
      updateParticipantInChatsList(uid, EnumUserStatus.OFFLINE, ls)
      updateParticipantInChatDetails(uid, EnumUserStatus.OFFLINE, ls)
    }

    const handlePresence = (payload: any) => {
      if (Array.isArray(payload)) {
        payload.forEach((u: any) => {
          const status =
            u.status === 'online' || u.type === 'online'
              ? EnumUserStatus.ONLINE
              : EnumUserStatus.OFFLINE
          const lastSeen = u.lastSeen ?? u.at ?? new Date().toISOString()
          updateUserCache(u.userId, status, lastSeen)
          updateParticipantInChatsList(u.userId, status, lastSeen)
          updateParticipantInChatDetails(u.userId, status, lastSeen)
        })
        return
      }

      const p = payload as PresenceSingle & {
        status?: string
        at?: string
        lastSeen?: string
      }
      if (p && 'type' in p) {
        if (p.type === 'online') {
          handleOnline({ userId: p.userId, at: p.at })
        } else {
          handleOffline({ userId: p.userId, lastSeen: p.lastSeen })
        }
        return
      }

      if (
        p &&
        (p as any).userId &&
        ((p as any).status || (p as any).lastSeen || (p as any).at)
      ) {
        const status =
          (p as any).status === 'online' || (p as any).type === 'online'
            ? EnumUserStatus.ONLINE
            : EnumUserStatus.OFFLINE
        const lastSeen =
          (p as any).lastSeen ?? (p as any).at ?? new Date().toISOString()
        updateUserCache((p as any).userId, status, lastSeen)
        updateParticipantInChatsList((p as any).userId, status, lastSeen)
        updateParticipantInChatDetails((p as any).userId, status, lastSeen)
      }
    }

    statusSocket.on('user:online', handleOnline)
    statusSocket.on('user:offline', handleOffline)
    statusSocket.on('user:presence', handlePresence)

    return () => {
      statusSocket.off('user:online', handleOnline)
      statusSocket.off('user:offline', handleOffline)
      statusSocket.off('user:presence', handlePresence)
    }
  }, [statusSocket, qc])
}
