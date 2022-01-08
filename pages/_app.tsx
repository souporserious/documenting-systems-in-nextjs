import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRemoteRefresh } from 'next-remote-refresh/hook'
import { Spacer } from 'components'

import { allComponents, allHooks, allUtils } from '.data'

import '../app.css'

function Nav({ children }) {
  return (
    <nav role="navigation" style={{ padding: 16 }}>
      <ul>{children}</ul>
    </nav>
  )
}

function NavLink({ to, children }) {
  return (
    <li>
      <Link href={to} passHref>
        <a style={{ display: 'flex', fontSize: 18, padding: 8 }}>{children}</a>
      </Link>
    </li>
  )
}

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const isComponents = router.asPath.includes('components')

  if (process.env.NODE_ENV === 'development') {
    useRemoteRefresh()
  }

  if (
    router.asPath.includes('examples') ||
    router.asPath.includes('preview') ||
    (router.asPath.includes('playground') && !isComponents)
  ) {
    return <Component {...pageProps} />
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr' }}>
      <Nav>
        <NavLink to="/">👻</NavLink>
        <NavLink to="/playground">Playground</NavLink>
        <Spacer size="16px" />
        <li>
          <h3 style={{ padding: 8 }}>Components</h3>
        </li>
        {allComponents.map(({ name, slug }) => (
          <NavLink key={name} to={`/components/${slug}`}>
            {name}
          </NavLink>
        ))}
        <Spacer size="16px" />
        <li>
          <h3 style={{ padding: 8 }}>Hooks</h3>
        </li>
        {allHooks.map(({ name, slug }) => (
          <NavLink key={name} to={`/hooks/${slug}`}>
            {name}
          </NavLink>
        ))}
        <li>
          <h3 style={{ padding: 8 }}>Utils</h3>
        </li>
        {allUtils.map(({ name, slug }) => (
          <NavLink key={name} to={`/utils/${slug}`}>
            {name}
          </NavLink>
        ))}
      </Nav>
      <div style={{ maxWidth: '80ch', padding: 40 }}>
        <Component {...pageProps} />
      </div>
    </div>
  )
}
