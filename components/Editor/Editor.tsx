import * as React from 'react'

import type { MonacoOptions } from './hooks/use-monaco'
import { useMonaco } from './hooks/use-monaco'

export function Editor({
  value,
  id,
  onChange,
}: Omit<MonacoOptions, 'containerRef'>) {
  const ref = React.useRef()

  useMonaco({
    containerRef: ref,
    value,
    id,
    onChange,
  })

  return <div ref={ref} style={{ height: '100vh' }} />
}
