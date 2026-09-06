import LinkedInIcon from '@/components/icons/LinkedInIcon.tsx'
import GithubIcon from '@/components/icons/GithubIcon.tsx'
import { cn } from '@/libs/utils.ts'
import Wordmark from '@/components/Wordmark.tsx'

type Props = {
  className?: string
}

export default function Navbar({ className }: Props) {
  return (
    <nav className={cn('flex items-center justify-between border-2 border-dashed p-3', className)}>
      <Wordmark />

      <div className='flex items-center gap-2'>
        <a
          className='border-2 border-dashed hover:border-solid border-sky-500 px-1'
          href='mailto:hi@liamfunk.de'
        >
          hi@liamfunk.de
        </a>

        <a href='https://linkedin.com/in/liam-funk/'>
          <LinkedInIcon />
        </a>

        <a href='https://github.com/s0h311'>
          <GithubIcon />
        </a>
      </div>
    </nav>
  )
}
