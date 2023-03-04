import Head from 'next/head'
import Link from 'next/link'
import { allComponents } from '.data/components'

export default function Components() {
  return (
    <>
      <Head>
        <title>Components</title>
      </Head>
      <h1>Components</h1>
      {allComponents.map(({ name, slug }) => (
        <Link
          key={name}
          href={`components/${slug}`}
          style={{ display: 'flex', fontSize: 32, padding: 16 }}
        >
          {name}
        </Link>
      ))}
    </>
  )
}
