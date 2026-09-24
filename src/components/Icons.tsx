import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base: IconProps = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export function SendIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12 3.5 4.5 21 12 3.5 19.5 5 12Zm0 0h7" />
    </svg>
  )
}

export function PlusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  )
}

export function LogoutIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H4" />
    </svg>
  )
}

export function BackIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

export function CheckIcon(props: IconProps) {
  return (
    <svg {...base} viewBox="0 0 16 16" strokeWidth={1.6} {...props}>
      <path d="m3 8.5 3 3 7-7" />
    </svg>
  )
}

export function DoubleCheckIcon(props: IconProps) {
  return (
    <svg {...base} viewBox="0 0 16 16" strokeWidth={1.6} {...props}>
      <path d="m1 8.5 3 3 7-7M8 11.5l7-7" />
    </svg>
  )
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} viewBox="0 0 16 16" strokeWidth={1.4} {...props}>
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 1.5" />
    </svg>
  )
}

export function AlertIcon(props: IconProps) {
  return (
    <svg {...base} viewBox="0 0 16 16" strokeWidth={1.6} {...props}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 4.5v4M8 11.2v.1" />
    </svg>
  )
}

export function ChatIcon(props: IconProps) {
  return (
    <svg {...base} strokeWidth={1.5} {...props}>
      <path d="M12 3a9 9 0 0 0-7.8 13.5L3 21l4.6-1.2A9 9 0 1 0 12 3Z" />
    </svg>
  )
}
