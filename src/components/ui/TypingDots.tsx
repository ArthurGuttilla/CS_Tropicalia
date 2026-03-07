'use client'

import { cn } from '@/lib/utils'

interface TypingDotsProps {
  className?: string
}

export default function TypingDots({ className }: TypingDotsProps) {
  return (
    <div className={cn('flex items-center gap-1 px-4 py-3', className)}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-gray-300"
          style={{ animation: `pulseDot 1.4s ${i * 0.2}s infinite` }}
        />
      ))}
    </div>
  )
}
