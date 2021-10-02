import { useRemoteRefresh } from 'next-remote-refresh/hook'

export default function App({ Component, pageProps }) {
  if (process.env.NODE_ENV === 'development') {
    useRemoteRefresh()
  }
  return <Component {...pageProps} />
}
