import styles from './Avatar.module.scss'

// Avatar gradients of web.max.ru
const GRADIENTS = [
  ['#ff48b6', '#ff8a35'],
  ['#ffc93d', '#ff832a'],
  ['#14e1d5', '#03c722'],
  ['#08d7f3', '#5398ff'],
  ['#bf97ff', '#526eff'],
]

function pickGradient(seed: string) {
  let hash = 0
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const [from, to] = GRADIENTS[hash % GRADIENTS.length]
  return `linear-gradient(135deg, ${from}, ${to})`
}

function getInitials(name: string) {
  const words = name.replace(/[^\p{L}\p{N}\s]/gu, '').trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '#'
  return words
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('')
}

interface AvatarProps {
  name: string
  seed: string
  size?: number
}

export function Avatar({ name, seed, size = 48 }: AvatarProps) {
  return (
    <div
      className={styles.avatar}
      style={{ width: size, height: size, fontSize: size * 0.38, background: pickGradient(seed) }}
      aria-hidden
    >
      {getInitials(name)}
    </div>
  )
}
