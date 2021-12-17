import * as React from 'react'
import { useEffect, useState } from 'react'
import { decode } from 'base64-url'
import { useRouter } from 'next/router'
import { executeCode } from 'utils/execute-code'
import { usePlaygroundList } from 'atoms'
import * as components from 'components'
import * as hooks from 'hooks'

export default function Preview() {
  const [code, setCode] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [preview, setPreview] = useState(null)
  const router = useRouter()
  const [, setList] = usePlaygroundList()

  /** Decode "code" query parameter */
  useEffect(() => {
    if (router.query.code) {
      setCode(decode(router.query.code as string))
    }
  }, [router.query.code])

  /** Listen for incoming window events and set the code. */
  React.useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (
        window.location.origin === event.origin &&
        event.data.type === 'preview'
      ) {
        setCode(decode(event.data.code))
      }
    }

    window.addEventListener('message', handleMessage)

    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  /** Execute preview to render */
  useEffect(() => {
    if (code === null) return

    setError(null)
    setLoading(true)

    executeCode(
      code,
      {
        react: React,
        components,
        hooks,
      },
      ({ list }) => setList(list)
    )
      .then((Preview: React.ComponentType) => {
        setPreview(<Preview />)
      })
      .catch((error) => {
        setError(error.toString())
      })
      .finally(() => {
        setLoading(false)
      })
  }, [code])

  return (
    <>
      {loading ? 'Loading preview...' : preview}
      {error}
    </>
  )
}
