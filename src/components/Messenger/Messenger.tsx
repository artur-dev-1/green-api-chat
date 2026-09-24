import { greenApi } from '../../api/greenApi'
import { useChatStore } from '../../hooks/useChatStore'
import { useNotifications } from '../../hooks/useNotifications'
import { notificationToAction } from '../../lib/notifications'
import { isValidPhone, normalizePhone, phoneToChatId } from '../../lib/phone'
import type { Credentials, Message } from '../../types'
import { ChatWindow, EmptyChatWindow } from '../ChatWindow/ChatWindow'
import { Sidebar } from '../Sidebar/Sidebar'
import styles from './Messenger.module.scss'

interface MessengerProps {
  credentials: Credentials
  onLogout: () => void
}

export function Messenger({ credentials, onLogout }: MessengerProps) {
  const [state, dispatch] = useChatStore(credentials.idInstance)
  const { error: connectionError } = useNotifications(credentials, (body) => {
    const action = notificationToAction(body)
    if (action) dispatch(action)
  })

  const activeChat = state.chats.find((chat) => chat.chatId === state.activeChatId) ?? null

  async function createChat(input: string) {
    const phone = normalizePhone(input)
    if (!isValidPhone(phone)) {
      throw new Error('Введите номер в международном формате, например 79991234567')
    }

    const chatId = phoneToChatId(phone)
    if (!state.chats.some((chat) => chat.chatId === chatId)) {
      const { existsWhatsapp } = await greenApi.checkWhatsapp(credentials, phone)
      if (!existsWhatsapp) throw new Error('Этот номер не зарегистрирован в WhatsApp')
    }

    dispatch({ type: 'openChat', chat: { chatId, phone, name: `+${phone}` } })
  }

  async function deliver(chatId: string, localId: string, text: string) {
    try {
      const { idMessage } = await greenApi.sendMessage(credentials, chatId, text)
      dispatch({ type: 'updateMessage', chatId, id: localId, patch: { id: idMessage, status: 'sent' } })
    } catch {
      dispatch({ type: 'updateStatus', chatId, id: localId, status: 'failed' })
    }
  }

  function sendMessage(text: string) {
    if (!activeChat) return

    // Shown right away, confirmed or marked as failed when the API responds
    const message: Message = {
      id: `local-${crypto.randomUUID()}`,
      chatId: activeChat.chatId,
      text,
      direction: 'outgoing',
      timestamp: Date.now(),
      status: 'sending',
    }
    dispatch({ type: 'addMessage', message })
    deliver(message.chatId, message.id, text)
  }

  function retryMessage(message: Message) {
    dispatch({ type: 'updateStatus', chatId: message.chatId, id: message.id, status: 'sending' })
    deliver(message.chatId, message.id, message.text)
  }

  return (
    <div className={activeChat ? styles.layoutChatOpen : styles.layout}>
      <Sidebar
        chats={state.chats}
        messages={state.messages}
        activeChatId={state.activeChatId}
        connectionError={connectionError}
        onSelectChat={(chatId) => dispatch({ type: 'selectChat', chatId })}
        onCreateChat={createChat}
        onLogout={onLogout}
      />
      {activeChat ? (
        <ChatWindow
          chat={activeChat}
          messages={state.messages[activeChat.chatId] ?? []}
          onSend={sendMessage}
          onRetry={retryMessage}
          onBack={() => dispatch({ type: 'selectChat', chatId: null })}
        />
      ) : (
        <EmptyChatWindow />
      )}
    </div>
  )
}
