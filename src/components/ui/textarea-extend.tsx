'use client'

import { useEffect, useRef } from 'react'
import { cn } from '~/lib/utils'
import { Textarea } from './textarea'

interface TextareaExtendProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onInput?: (e: React.FormEvent<HTMLTextAreaElement>) => void
  onSubmit?: () => void
  onEsc?: () => void
}
export const TextareaExtend = ({
  className,
  onSubmit,
  onEsc,
  onInput,
  ...props
}: TextareaExtendProps) => {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const updateTextareaHeight = () => {
    if (!inputRef.current) {
      return
    }
    inputRef.current.style.height = '60px'
    const target = inputRef.current
    let height = target.scrollHeight
    if (height > 240) {
      height = 240
    }
    inputRef.current.style.height = height + 'px'
  }

  const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    updateTextareaHeight()
    onInput?.(e)
  }
  useEffect(() => {
    if (inputRef.current) {
      updateTextareaHeight()
    }
  })

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault()
      onSubmit?.()
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      onEsc?.()
    }
  }
  return (
    <Textarea
      ref={inputRef}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className={cn('leading-6 resize-none', className)}
      {...props}
    />
  )
}
