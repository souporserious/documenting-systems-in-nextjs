import * as React from 'react'

export type BoxProps = {
  as?: string
  children?: React.ReactNode
  padding?: number | string
  backgroundColor?: string
  color?: string
} & React.HTMLAttributes<HTMLElement>

export function Box({
  as: Element = 'div',
  padding,
  backgroundColor,
  color,
  children,
  ...props
}: BoxProps) {
  return (
    <Element
      {...props}
      style={{
        padding,
        backgroundColor,
        color,
      }}
    >
      {children}
    </Element>
  )
}
