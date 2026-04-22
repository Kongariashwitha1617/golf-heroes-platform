import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info' | 'secondary'
  size?: 'sm' | 'md'
  children: React.ReactNode
}

const variants = {
  default: 'bg-blue-100 text-blue-800',
  success: 'bg-green-100 text-green-800',
  danger: 'bg-red-100 text-red-800',
  warning: 'bg-yellow-100 text-yellow-800',
  info: 'bg-cyan-100 text-cyan-800',
  secondary: 'bg-gray-100 text-gray-800',
}

const sizes = {
  sm: 'px-2 py-0.5 text-xs font-semibold rounded',
  md: 'px-3 py-1 text-sm font-semibold rounded-md',
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({
    variant = 'default',
    size = 'md',
    className,
    children,
    ...props
  }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-block font-medium',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
)

Badge.displayName = 'Badge'
