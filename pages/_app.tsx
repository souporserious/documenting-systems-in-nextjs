import { useRemoteRefresh } from 'next-remote-refresh/hook'

export default function App({ Component, pageProps }) {
  useRemoteRefresh()
  return <Component {...pageProps} />
}
