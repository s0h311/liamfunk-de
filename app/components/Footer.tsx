import { cn } from '@/libs/utils.ts'

type Props = {
  className?: string
}

export default function Footer({ className }: Props) {
  return (
    <footer className={cn('flex items-center justify-between p-3 bg-inverted inverted text-xs', className)}>
      <a href='mailto:hi@liamfunk.de'>hi@liamfunk.de</a>

      <a href='/legal'>Legal</a>
    </footer>
  )
}
