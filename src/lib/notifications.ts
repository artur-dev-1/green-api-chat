import { extractText } from '../api/greenApi'
import type {
  IncomingMessageBody,
  NotificationBody,
  OutgoingMessageBody,
  OutgoingStatusBody,
} from '../api/greenApi'
import type { ChatAction } from '../hooks/useChatStore'
import type { MessageStatus } from '../types'

const KNOWN_STATUSES: MessageStatus[] = ['sent', 'delivered', 'read', 'failed']

/**
 * Turns a GREEN-API notification into a store action.
 * Everything that isn't a text message or a delivery status is skipped.
 */
export function notificationToAction(body: NotificationBody): ChatAction | null {
  switch (body.typeWebhook) {
    case 'incomingMessageReceived': {
      const { idMessage, timestamp, senderData, messageData } = body as IncomingMessageBody
      const text = extractText(messageData)
      if (text === null) return null

      return {
        type: 'addMessage',
        chatName: senderData.chatName || senderData.senderContactName || senderData.senderName,
        message: {
          id: idMessage,
          chatId: senderData.chatId,
          text,
          direction: 'incoming',
          timestamp: timestamp * 1000,
        },
      }
    }

    // Sent from the phone (outgoingMessageReceived) or through the API, including this app
    case 'outgoingMessageReceived':
    case 'outgoingAPIMessageReceived': {
      const { idMessage, timestamp, senderData, messageData } = body as OutgoingMessageBody
      const text = extractText(messageData)
      if (text === null) return null

      return {
        type: 'addMessage',
        chatName: senderData.chatName,
        message: {
          id: idMessage,
          chatId: senderData.chatId,
          text,
          direction: 'outgoing',
          timestamp: timestamp * 1000,
          status: 'sent',
        },
      }
    }

    case 'outgoingMessageStatus': {
      const { idMessage, chatId, status } = body as OutgoingStatusBody
      const known = KNOWN_STATUSES.find((item) => item === status)
      return known ? { type: 'updateStatus', chatId, id: idMessage, status: known } : null
    }

    default:
      return null
  }
}
