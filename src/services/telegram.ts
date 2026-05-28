export async function sendTelegramNotification(payload: {
  chatId: string
  message: string
  imageUrl?: string
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token) return
  const baseUrl = `https://api.telegram.org/bot${token}`
  const endpoint = payload.imageUrl ? 'sendPhoto' : 'sendMessage'
  const body = payload.imageUrl
    ? { chat_id: payload.chatId, photo: payload.imageUrl, caption: payload.message, parse_mode: 'HTML' }
    : { chat_id: payload.chatId, text: payload.message, parse_mode: 'HTML' }
  await fetch(`${baseUrl}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}
