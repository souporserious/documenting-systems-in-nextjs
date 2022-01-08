import Head from 'next/head'
import { Stack } from 'components'
import { getSourceLink } from 'utils'
import { allUtils } from '.data/utils'

export default function Util({ util }) {
  return (
    <>
      <Head>
        <title>Utils / {util.name}</title>
      </Head>
      <Stack gap={32}>
        <code>import {`{ ${util.name} }`} from 'utils'</code>
        <Stack gap={16}>
          <h1>{util.name}</h1>
          <p>{util.description}</p>
          {util.path && (
            <a href={getSourceLink({ path: util.path })}>View Source</a>
          )}
        </Stack>
      </Stack>
    </>
  )
}

export async function getStaticPaths() {
  return {
    paths: allUtils.map((util) => ({
      params: { util: util.slug },
    })),
    fallback: false,
  }
}

export async function getStaticProps({ params }) {
  const util = allUtils.find((util) => util.slug === params.util)
  return { props: { util } }
}
