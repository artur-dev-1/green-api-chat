import { useEffect, useReducer } from 'react'
import { loadJson, saveJson } from '../lib/storage'
import type { Chat, Message, MessageStatus } from '../types'

export interface ChatState {
  /** Most recently active chat first */
  chats: Chat[]
  messages: Record<string, Message[]>
  activeChatId: string | null
}

export type ChatAction =
  | { type: 'openChat'; chat: Omit<Chat, 'unread'> }
  | { type: 'selectChat'; chatId: string | null }
  | { type: 'addMessage'; message: Message; chatName?: string }
  | { type: 'updateMessage'; chatId: string; id: string; patch: Partial<Message> }
  | { type: 'updateStatus'; chatId: string; id: string; status: MessageStatus }

const initialState: ChatState = { chats: [], messages: {}, activeChatId: null }

function moveToTop(chats: Chat[], chat: Chat) {
  return [chat, ...chats.filter((item) => item.chatId !== chat.chatId)]
}

function upsertMessage(list: Message[], message: Message) {
  if (list.some((item) => item.id === message.id)) return null

  // An outgoing notification for a message sent from this app can arrive before
  // sendMessage resolves — then it replaces the pending copy instead of duplicating it
  if (message.direction === 'outgoing') {
    const pendingIndex = list.findIndex(
      (item) => item.status === 'sending' && item.text === message.text,
    )
    if (pendingIndex !== -1) {
      const next = [...list]
      next[pendingIndex] = { ...message, status: 'sent' }
      return next
    }
  }

  return [...list, message].sort((a, b) => a.timestamp - b.timestamp)
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'openChat': {
      const existing = state.chats.find((chat) => chat.chatId === action.chat.chatId)
      const chat: Chat = existing ? { ...existing, unread: 0 } : { ...action.chat, unread: 0 }
      return { ...state, chats: moveToTop(state.chats, chat), activeChatId: chat.chatId }
    }

    case 'selectChat': {
      const chats = state.chats.map((chat) =>
        chat.chatId === action.chatId ? { ...chat, unread: 0 } : chat,
      )
      return { ...state, chats, activeChatId: action.chatId }
    }

    case 'addMessage': {
      const { message, chatName } = action
      const list = upsertMessage(state.messages[message.chatId] ?? [], message)
      if (!list) return state

      const existing = state.chats.find((chat) => chat.chatId === message.chatId)
      const isUnread = message.direction === 'incoming' && state.activeChatId !== message.chatId
      const phone = message.chatId.split('@')[0]
      const chat: Chat = {
        chatId: message.chatId,
        phone,
        name: chatName || existing?.name || `+${phone}`,
        unread: (existing?.unread ?? 0) + (isUnread ? 1 : 0),
      }

      return {
        ...state,
        chats: moveToTop(state.chats, chat),
        messages: { ...state.messages, [message.chatId]: list },
      }
    }

    case 'updateMessage':
    case 'updateStatus': {
      const list = state.messages[action.chatId]
      if (!list?.some((item) => item.id === action.id)) return state

      const patch = action.type === 'updateStatus' ? { status: action.status } : action.patch
      return {
        ...state,
        messages: {
          ...state.messages,
          [action.chatId]: list.map((item) => (item.id === action.id ? { ...item, ...patch } : item)),
        },
      }
    }
  }
}

function restoreState(storageKey: string): ChatState {
  const saved = loadJson<ChatState>(storageKey)
  if (!saved) return initialState

  // A message still "sending" after a reload never got a response
  const messages = Object.fromEntries(
    Object.entries(saved.messages).map(([chatId, list]) => [
      chatId,
      list.map((item) => (item.status === 'sending' ? { ...item, status: 'failed' as const } : item)),
    ]),
  )
  return { ...saved, messages }
}

/** Chat history is kept per instance, so different accounts don't mix */
export function useChatStore(idInstance: string) {
  const storageKey = `green-api-chat:${idInstance}`
  const [state, dispatch] = useReducer(chatReducer, storageKey, restoreState)

  useEffect(() => {
    saveJson(storageKey, state)
  }, [storageKey, state])

  return [state, dispatch] as const
}
