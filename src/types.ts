export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type MessageDirection = 'incoming' | 'outgoing'

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read' | 'failed'

export interface Message {
  id: string
  chatId: string
  text: string
  direction: MessageDirection
  /** Unix time in milliseconds */
  timestamp: number
  status?: MessageStatus
}

export interface Chat {
  chatId: string
  name: string
  phone: string
  unread: number
}
