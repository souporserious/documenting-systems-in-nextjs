import Head from 'next/head'
import { Stack } from 'components'
import { getSourceLink } from 'utils'
import { allUtils } from 'data/utils'

export default function Util({ util }) {
  return (
    <>
      <Head>
        <title>Utils / {util.name}</title>
      </Head>
      <Stack gap={32}>
        {util.path && (
          <a href={getSourceLink({ path: util.path })}>View Source</a>
        )}
        <code>import {`{ ${util.name} }`} from 'utils'</code>
        <Stack gap={16}>
          <h1>{util.name}</h1>
          <p>{util.description}</p>
        </Stack>
        {util.types.map((type) => (
          <div
            key={type.name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <Stack gap={32}>
              <h4 style={{ fontWeight: 600, margin: 0 }}>{type.name}</h4>
              {Array.isArray(type.type) ? (
                <Stack gap={16}>
                  {type.type.map((subType) => (
                    <Stack key={subType.name} gap={8}>
                      <h5 style={{ margin: 0 }}>{subType.name}</h5>
                      <code>{subType.type}</code>
                      <p>{subType.comment}</p>
                    </Stack>
                  ))}
                </Stack>
              ) : (
                <code>{type.type}</code>
              )}
            </Stack>
            {type.comment && <p style={{ margin: 0 }}>{type.comment[0]}</p>}
          </div>
        ))}
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
