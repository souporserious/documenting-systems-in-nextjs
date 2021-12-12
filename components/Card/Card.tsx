import * as React from 'react'
import { Box } from '../Box'

export type CardProps = {
  children: React.ReactNode
  variant: 'default' | 'outlined' | 'elevated' | 'flat'
}

export function Card({ variant, children }: CardProps) {
  return <Box>{children}</Box>
}
