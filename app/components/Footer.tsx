import { cn } from '@/libs/utils.ts'
import Wordmark from '@/components/Wordmark.tsx'

type Props = {
  className?: string
}

export default function Footer({ className }: Props) {
  return (
    <footer className={cn('flex items-center justify-between p-3 bg-inverted inverted text-xs', className)}>
      <Wordmark />

      <span>2026</span>

      <a href='mailto:hi@liamfunk.de'>hi@liamfunk.de</a>
    </footer>
  )
}
