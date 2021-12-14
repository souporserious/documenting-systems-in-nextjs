import * as React from 'react'

export type BoxProps = {
  as?: string
  children?: React.ReactNode
  padding?: number | string
  backgroundColor?: string
}

export function Box({
  as: Element = 'div',
  padding,
  backgroundColor,
  children,
  ...props
}: BoxProps) {
  return (
    <Element
      {...props}
      style={{
        padding,
        backgroundColor,
      }}
    >
      {children}
    </Element>
  )
}
