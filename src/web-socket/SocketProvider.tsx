'use client'

import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState
} from 'react'
import { io, Socket } from 'socket.io-client'

import { SERVER_URL } from '@/constants'

interface SocketContextType {
  chatSocket: Socket | null
  messageSocket: Socket | null
  statusSocket: Socket | null
  isChatConnected: boolean
  isMessageConnected: boolean
  isStatusConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
  chatSocket: null,
  messageSocket: null,
  statusSocket: null,
  isChatConnected: false,
  isMessageConnected: false,
  isStatusConnected: false
})

export const useSocket = () => useContext(SocketContext)

const CHAT_SOCKET_URL = `${SERVER_URL}/chats`
const MESSAGE_SOCKET_URL = `${SERVER_URL}/messages`
const USER_SOCKET_URL = `${SERVER_URL}/user`

export const SocketProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [chatSocket, setChatSocket] = useState<Socket | null>(null)
  const [messageSocket, setMessageSocket] = useState<Socket | null>(null)
  const [statusSocket, setStatusSocket] = useState<Socket | null>(null)

  const [isChatConnected, setIsChatConnected] = useState(false)
  const [isMessageConnected, setIsMessageConnected] = useState(false)
  const [isStatusConnected, setIsStatusConnected] = useState(false)

  useEffect(() => {
    const socketConfig = {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    }

    // Подключение к разным namespace
    const chatInstance = io(CHAT_SOCKET_URL, socketConfig)
    const messageInstance = io(MESSAGE_SOCKET_URL, socketConfig)
    const statusInstance = io(USER_SOCKET_URL, socketConfig)

    // Обработчики для chat socket
    chatInstance.on('connect', () => setIsChatConnected(true))
    chatInstance.on('disconnect', () => setIsChatConnected(false))

    // Обработчики для message socket
    messageInstance.on('connect', () => setIsMessageConnected(true))
    messageInstance.on('disconnect', () => setIsMessageConnected(false))

    // Обработчики для status socket
    statusInstance.on('connect', () => setIsStatusConnected(true))
    statusInstance.on('disconnect', () => setIsStatusConnected(false))

    setChatSocket(chatInstance)
    setMessageSocket(messageInstance)
    setStatusSocket(statusInstance)

    return () => {
      chatInstance.disconnect()
      messageInstance.disconnect()
      statusInstance.disconnect()
    }
  }, [])

  return (
    <SocketContext.Provider
      value={{
        chatSocket,
        messageSocket,
        statusSocket,
        isChatConnected,
        isMessageConnected,
        isStatusConnected
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}
