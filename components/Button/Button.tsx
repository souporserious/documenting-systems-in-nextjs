import * as React from 'react'
import { Box } from '../Box'

export const variants = {
  primary: {
    backgroundColor: '#0070f3',
    color: '#fff',
  },
  secondary: {
    backgroundColor: '#fff',
    color: '#0070f3',
  },
}

export type ButtonProps = {
  children?: React.ReactNode
  backgroundColor?: string
  color?: string
  variant: 'primary' | 'secondary'
}

export function Button({
  variant,
  backgroundColor: propsBackgroundColor,
  color: propsColor,
  children,
}: ButtonProps) {
  const { backgroundColor, color } = variants[variant] || {}
  return (
    <Box
      as="button"
      style={{
        backgroundColor: propsBackgroundColor || backgroundColor,
        color: propsColor || color,
      }}
    >
      {children}
    </Box>
  )
}
