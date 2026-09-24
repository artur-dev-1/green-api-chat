/** Keeps digits only and turns a Russian "8XXXXXXXXXX" into "7XXXXXXXXXX" */
export function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`
  return digits
}

export function isValidPhone(digits: string) {
  return digits.length >= 10 && digits.length <= 15
}

export function phoneToChatId(digits: string) {
  return `${digits}@c.us`
}

export function chatIdToPhone(chatId: string) {
  return chatId.split('@')[0]
}
