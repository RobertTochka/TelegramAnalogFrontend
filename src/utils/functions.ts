export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export const formatMessageTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export const formatLongWords = (
  text?: string,
  maxLength: number = 30
): string => {
  if (!text) return ''

  const words = text.split(' ')
  const result: string[] = []

  for (let i = 0; i < words.length; i++) {
    const word = words[i]

    if (word.length > maxLength && i > 0) {
      result.push('\n' + word)
    } else {
      result.push(word)
    }
  }

  return result.join(' ')
}
