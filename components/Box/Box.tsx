import * as React from 'react'

export type BoxProps = {
  as?: string
  children?: React.ReactNode
  padding?: number | string
  backgroundColor?: string
  color?: string
} & React.HTMLAttributes<HTMLElement>

export const Box = React.forwardRef(function Box(
  {
    as: Element = 'div',
    padding,
    backgroundColor,
    color,
    children,
    ...props
  }: BoxProps,
  ref
) {
  return (
    <Element
      ref={ref}
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
})
