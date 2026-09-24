import type { Credentials } from '../types'

export class GreenApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

interface MessageData {
  typeMessage: string
  textMessageData?: { textMessage: string }
  extendedTextMessageData?: { text: string }
}

interface SenderData {
  chatId: string
  chatName?: string
  sender?: string
  senderName?: string
  senderContactName?: string
}

export interface IncomingMessageBody {
  typeWebhook: 'incomingMessageReceived'
  timestamp: number
  idMessage: string
  senderData: SenderData
  messageData: MessageData
}

export interface OutgoingMessageBody {
  typeWebhook: 'outgoingMessageReceived' | 'outgoingAPIMessageReceived'
  timestamp: number
  idMessage: string
  senderData: SenderData
  messageData: MessageData
}

export interface OutgoingStatusBody {
  typeWebhook: 'outgoingMessageStatus'
  timestamp: number
  idMessage: string
  chatId: string
  status: string
}

export type NotificationBody =
  | IncomingMessageBody
  | OutgoingMessageBody
  | OutgoingStatusBody
  | { typeWebhook: string }

export interface Notification {
  receiptId: number
  body: NotificationBody
}

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Некорректный запрос',
  401: 'Неверный idInstance или apiTokenInstance',
  403: 'Доступ запрещён: проверьте apiTokenInstance',
  429: 'Слишком много запросов, попробуйте позже',
  466: 'Превышен лимит тарифа GREEN-API',
}

function buildUrl({ apiUrl, idInstance, apiTokenInstance }: Credentials, method: string, suffix = '') {
  const host = apiUrl.trim().replace(/\/+$/, '')
  return `${host}/waInstance${idInstance.trim()}/${method}/${apiTokenInstance.trim()}${suffix}`
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  try {
    response = await fetch(url, init)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new GreenApiError('Не удалось связаться с GREEN-API. Проверьте apiUrl и подключение к сети')
  }

  if (!response.ok) {
    const message = ERROR_MESSAGES[response.status] ?? `Ошибка GREEN-API (${response.status})`
    throw new GreenApiError(message, response.status)
  }

  // receiveNotification returns an empty body ("null") when the queue is empty
  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

function postJson<T>(credentials: Credentials, method: string, body: unknown) {
  return request<T>(buildUrl(credentials, method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

export const greenApi = {
  getStateInstance(credentials: Credentials) {
    return request<{ stateInstance: string }>(buildUrl(credentials, 'getStateInstance'))
  },

  checkWhatsapp(credentials: Credentials, phoneNumber: string) {
    return postJson<{ existsWhatsapp: boolean }>(credentials, 'checkWhatsapp', {
      phoneNumber: Number(phoneNumber),
    })
  },

  sendMessage(credentials: Credentials, chatId: string, message: string) {
    return postJson<{ idMessage: string }>(credentials, 'sendMessage', { chatId, message })
  },

  receiveNotification(credentials: Credentials, receiveTimeout: number, signal?: AbortSignal) {
    return request<Notification | null>(
      buildUrl(credentials, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`),
      { signal },
    )
  },

  deleteNotification(credentials: Credentials, receiptId: number) {
    return request<{ result: boolean }>(buildUrl(credentials, 'deleteNotification', `/${receiptId}`), {
      method: 'DELETE',
    })
  },
}

/** Returns the text of a text message or null for any other message type */
export function extractText(messageData: MessageData): string | null {
  if (messageData.textMessageData) return messageData.textMessageData.textMessage
  if (messageData.extendedTextMessageData) return messageData.extendedTextMessageData.text
  return null
}
