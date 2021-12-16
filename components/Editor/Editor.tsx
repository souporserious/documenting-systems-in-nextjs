import * as React from 'react'
import { usePlaygroundPosition } from 'atoms'

import type { MonacoOptions } from './hooks/use-monaco'
import { useMonaco } from './hooks/use-monaco'

export function Editor({
  value,
  id,
  onChange,
}: Omit<MonacoOptions, 'containerRef'>) {
  const ref = React.useRef()
  const [position] = usePlaygroundPosition()

  useMonaco({
    containerRef: ref,
    value,
    id,
    onChange,
    decorationRange: position,
  })

  return <div ref={ref} style={{ height: '100vh' }} />
}
