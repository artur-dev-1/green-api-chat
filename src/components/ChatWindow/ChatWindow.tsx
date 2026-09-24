import { Fragment, useLayoutEffect, useRef, useState } from 'react'
import type { FormEvent, KeyboardEvent } from 'react'
import { formatDayLabel, formatPhone, formatTime, isDifferentDay } from '../../lib/format'
import type { Chat, Message } from '../../types'
import { Avatar } from '../Avatar/Avatar'
import { AlertIcon, BackIcon, CheckIcon, ClockIcon, DoubleCheckIcon, SendIcon } from '../Icons'
import styles from './ChatWindow.module.scss'

interface ChatWindowProps {
  chat: Chat
  messages: Message[]
  onSend: (text: string) => void
  onRetry: (message: Message) => void
  onBack: () => void
}

export function ChatWindow({ chat, messages, onSend, onRetry, onBack }: ChatWindowProps) {
  const listRef = useRef<HTMLDivElement>(null)

  // Keep the newest message in view when the chat opens or a message arrives
  useLayoutEffect(() => {
    const list = listRef.current
    if (list) list.scrollTop = list.scrollHeight
  }, [chat.chatId, messages.length])

  return (
    <section className={styles.window}>
      <header className={styles.header}>
        <button className={styles.back} type="button" aria-label="Назад к чатам" onClick={onBack}>
          <BackIcon width={22} height={22} />
        </button>
        <Avatar name={chat.name} seed={chat.chatId} size={40} />
        <div className={styles.headerText}>
          <h2 className={styles.name}>{chat.name}</h2>
          {chat.name !== formatPhone(chat.phone) && <p className={styles.phone}>{formatPhone(chat.phone)}</p>}
        </div>
      </header>

      <div className={styles.messages} ref={listRef}>
        {messages.length === 0 ? (
          <p className={styles.placeholder}>Здесь пока пусто. Напишите первое сообщение</p>
        ) : (
          messages.map((message, index) => {
            const previous = messages[index - 1]
            const showDay = !previous || isDifferentDay(previous.timestamp, message.timestamp)
            return (
              <Fragment key={message.id}>
                {showDay && <div className={styles.day}>{formatDayLabel(message.timestamp)}</div>}
                <MessageBubble message={message} onRetry={onRetry} />
              </Fragment>
            )
          })
        )}
      </div>

      <Composer key={chat.chatId} onSend={onSend} />
    </section>
  )
}

function MessageBubble({ message, onRetry }: { message: Message; onRetry: ChatWindowProps['onRetry'] }) {
  const isOutgoing = message.direction === 'outgoing'

  return (
    <div className={isOutgoing ? styles.rowOutgoing : styles.row}>
      <div className={isOutgoing ? styles.bubbleOutgoing : styles.bubble}>
        <span className={styles.text}>{message.text}</span>
        <span className={styles.meta}>
          {formatTime(message.timestamp)}
          {isOutgoing && <StatusIcon status={message.status} />}
        </span>
      </div>
      {message.status === 'failed' && (
        <button className={styles.retry} type="button" onClick={() => onRetry(message)}>
          Не отправлено. Повторить
        </button>
      )}
    </div>
  )
}

function StatusIcon({ status }: { status: Message['status'] }) {
  switch (status) {
    case 'sending':
      return <ClockIcon width={14} height={14} aria-label="Отправляется" />
    case 'failed':
      return <AlertIcon width={14} height={14} className={styles.failed} aria-label="Ошибка" />
    case 'delivered':
      return <DoubleCheckIcon width={16} height={16} aria-label="Доставлено" />
    case 'read':
      return <DoubleCheckIcon width={16} height={16} className={styles.read} aria-label="Прочитано" />
    default:
      return <CheckIcon width={14} height={14} aria-label="Отправлено" />
  }
}

const MAX_TEXTAREA_HEIGHT = 160

function Composer({ onSend }: { onSend: ChatWindowProps['onSend'] }) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    // scrollHeight doesn't include borders, while the height of a border-box element does
    const height = textarea.scrollHeight + textarea.offsetHeight - textarea.clientHeight
    textarea.style.height = `${Math.min(height, MAX_TEXTAREA_HEIGHT)}px`
    textarea.style.overflowY = height > MAX_TEXTAREA_HEIGHT ? 'auto' : 'hidden'
  }, [text])

  function send() {
    const value = text.trim()
    if (!value) return
    onSend(value)
    setText('')
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    send()
  }

  // Enter sends, Shift+Enter adds a new line
  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault()
      send()
    }
  }

  return (
    <form className={styles.composer} onSubmit={handleSubmit}>
      <textarea
        ref={textareaRef}
        className={styles.input}
        rows={1}
        placeholder="Сообщение"
        aria-label="Текст сообщения"
        value={text}
        autoFocus
        onChange={(event) => setText(event.target.value)}
        onKeyDown={handleKeyDown}
      />
      <button className={styles.send} type="submit" disabled={!text.trim()} aria-label="Отправить">
        <SendIcon width={22} height={22} />
      </button>
    </form>
  )
}

export function EmptyChatWindow() {
  return (
    <section className={styles.emptyWindow}>
      <p className={styles.emptyText}>Выберите чат или создайте новый по номеру телефона</p>
    </section>
  )
}
