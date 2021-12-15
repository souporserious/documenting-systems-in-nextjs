import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRemoteRefresh } from 'next-remote-refresh/hook'

import { allComponents, allHooks } from '.data'

import '../app.css'

export default function App({ Component, pageProps }) {
  const router = useRouter()

  if (process.env.NODE_ENV === 'development') {
    useRemoteRefresh()
  }

  if (
    router.asPath.includes('playground') ||
    router.asPath.includes('preview') ||
    router.asPath.includes('examples')
  ) {
    return <Component {...pageProps} />
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
      <nav>
        <Link href="/" passHref>
          <a style={{ display: 'flex', fontSize: 18, padding: 8 }}>👻</a>
        </Link>
        <Link href={`/playground`} passHref>
          <a style={{ display: 'flex', fontSize: 18, padding: 8 }}>
            Playground
          </a>
        </Link>
        <h2>Components</h2>
        {allComponents.map(({ name, slug }) => (
          <Link key={name} href={`/components/${slug}`} passHref>
            <a style={{ display: 'flex', fontSize: 18, padding: 8 }}>{name}</a>
          </Link>
        ))}
        <h2>Hooks</h2>
        {allHooks.map(({ name, slug }) => (
          <Link key={name} href={`/hooks/${slug}`} passHref>
            <a style={{ display: 'flex', fontSize: 18, padding: 8 }}>{name}</a>
          </Link>
        ))}
      </nav>
      <div style={{ padding: 32 }}>
        <Component {...pageProps} />
      </div>
    </div>
  )
}
