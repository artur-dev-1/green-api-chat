import { useState } from 'react'
import type { FormEvent } from 'react'
import { formatListTime } from '../../lib/format'
import type { Chat, Message } from '../../types'
import { Avatar } from '../Avatar/Avatar'
import { LogoutIcon, PlusIcon } from '../Icons'
import styles from './Sidebar.module.scss'

interface SidebarProps {
  chats: Chat[]
  messages: Record<string, Message[]>
  activeChatId: string | null
  connectionError: string | null
  onSelectChat: (chatId: string) => void
  onCreateChat: (phone: string) => Promise<void>
  onLogout: () => void
}

export function Sidebar({
  chats,
  messages,
  activeChatId,
  connectionError,
  onSelectChat,
  onCreateChat,
  onLogout,
}: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Чаты</h1>
          <p className={connectionError ? styles.statusError : styles.status}>
            {connectionError ?? 'Подключено'}
          </p>
        </div>
        <button className={styles.iconButton} type="button" title="Выйти" aria-label="Выйти" onClick={onLogout}>
          <LogoutIcon width={20} height={20} />
        </button>
      </header>

      <NewChatForm onCreateChat={onCreateChat} />

      {chats.length === 0 ? (
        <p className={styles.empty}>Чатов пока нет. Введите номер телефона, чтобы начать переписку</p>
      ) : (
        <ul className={styles.list}>
          {chats.map((chat) => {
            const lastMessage = messages[chat.chatId]?.at(-1)
            return (
              <li key={chat.chatId}>
                <button
                  className={chat.chatId === activeChatId ? styles.itemActive : styles.item}
                  type="button"
                  onClick={() => onSelectChat(chat.chatId)}
                >
                  <Avatar name={chat.name} seed={chat.chatId} />
                  <span className={styles.itemBody}>
                    <span className={styles.itemRow}>
                      <span className={styles.itemName}>{chat.name}</span>
                      {lastMessage && (
                        <span className={styles.itemTime}>{formatListTime(lastMessage.timestamp)}</span>
                      )}
                    </span>
                    <span className={styles.itemRow}>
                      <span className={styles.itemPreview}>
                        {lastMessage
                          ? `${lastMessage.direction === 'outgoing' ? 'Вы: ' : ''}${lastMessage.text}`
                          : 'Нет сообщений'}
                      </span>
                      {chat.unread > 0 && <span className={styles.counter}>{chat.unread}</span>}
                    </span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </aside>
  )
}

function NewChatForm({ onCreateChat }: Pick<SidebarProps, 'onCreateChat'>) {
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!phone.trim() || loading) return

    setLoading(true)
    setError(null)
    try {
      await onCreateChat(phone)
      setPhone('')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Не удалось создать чат')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form className={styles.newChat} onSubmit={handleSubmit}>
      <div className={styles.newChatRow}>
        <input
          className={styles.newChatInput}
          type="tel"
          inputMode="tel"
          placeholder="Номер, например 79991234567"
          aria-label="Номер телефона получателя"
          value={phone}
          onChange={(event) => {
            setPhone(event.target.value)
            setError(null)
          }}
        />
        <button
          className={styles.newChatButton}
          type="submit"
          disabled={!phone.trim() || loading}
          title="Создать чат"
          aria-label="Создать чат"
        >
          <PlusIcon width={20} height={20} />
        </button>
      </div>
      {error && (
        <p className={styles.newChatError} role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
