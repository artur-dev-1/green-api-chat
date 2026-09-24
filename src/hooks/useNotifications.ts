import { useEffect, useRef, useState } from 'react'
import { greenApi } from '../api/greenApi'
import type { NotificationBody } from '../api/greenApi'
import type { Credentials } from '../types'

/** GREEN-API holds the request open up to this many seconds while the queue is empty */
const RECEIVE_TIMEOUT_SECONDS = 20
const RETRY_DELAY_MS = 5000

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

/**
 * Long polling of the GREEN-API notification queue (HTTP API technology):
 * receiveNotification → handle → deleteNotification → repeat.
 */
export function useNotifications(
  credentials: Credentials,
  onNotification: (body: NotificationBody) => void,
) {
  const [error, setError] = useState<string | null>(null)
  const handlerRef = useRef(onNotification)

  useEffect(() => {
    handlerRef.current = onNotification
  })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function poll() {
      while (!signal.aborted) {
        try {
          const notification = await greenApi.receiveNotification(
            credentials,
            RECEIVE_TIMEOUT_SECONDS,
            signal,
          )
          setError(null)
          if (!notification) continue

          try {
            handlerRef.current(notification.body)
          } finally {
            // Otherwise the same notification comes back on the next request
            await greenApi.deleteNotification(credentials, notification.receiptId)
          }
        } catch (reason) {
          if (signal.aborted) return
          setError(reason instanceof Error ? reason.message : 'Ошибка получения сообщений')
          await wait(RETRY_DELAY_MS, signal)
        }
      }
    }

    poll()
    return () => controller.abort()
  }, [credentials])

  return { error }
}
