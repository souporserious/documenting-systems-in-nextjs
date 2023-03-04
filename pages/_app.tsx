import Link from 'next/link'
import { useRouter } from 'next/router'
import { useRemoteRefresh } from 'next-remote-refresh/hook'
import { Spacer } from 'components'
import { useRoutes } from 'hooks'
import { allLinks } from '.data'

import '../app.css'
import { Fragment } from 'react'

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
      <Link href={to} style={{ display: 'flex', fontSize: 18, padding: 8 }}>
        {children}
      </Link>
    </li>
  )
}

export default function App({ Component, pageProps }) {
  const { activeRoute, previousRoute, nextRoute } = useRoutes()
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
        {Object.entries(allLinks).map(([category, links]) => (
          <Fragment key={category}>
            <li>
              <h3 style={{ padding: 8 }}>{category}</h3>
            </li>
            {links.map(({ name, slug }) => (
              <NavLink key={name} to={slug}>
                {name}
              </NavLink>
            ))}
            <Spacer size="16px" />
          </Fragment>
        ))}
      </Nav>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxWidth: '80ch',
          padding: 40,
        }}
      >
        <Component {...pageProps} />
        <nav style={{ marginTop: 'auto' }}>
          <ul
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              paddingTop: 64,
            }}
          >
            {previousRoute && (
              <li style={{ gridColumn: 1 }}>
                <Link
                  href={previousRoute.slug}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'start',
                    gap: 8,
                  }}
                >
                  <div>Previous</div>
                  <div>{previousRoute.name}</div>
                </Link>
              </li>
            )}
            {nextRoute && (
              <li style={{ gridColumn: 2 }}>
                <Link
                  href={nextRoute.slug}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'end',
                    gap: 8,
                  }}
                >
                  <div>Next</div>
                  <div>{nextRoute.name}</div>
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </div>
  )
}
