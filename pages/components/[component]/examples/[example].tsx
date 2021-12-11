import * as React from 'react'
import { useComponent } from 'hooks'
import { getExamples } from 'utils'

export default function Example({ example }) {
  const Component = useComponent(example.code)
  return (
    <div>
      <h2>{example.name}</h2>
      <Component />
    </div>
  )
}

export async function getStaticPaths() {
  const examples = await getExamples()
  return {
    paths: examples.map((example) => ({
      params: {
        component: example.component,
        example: example.slug,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps(query) {
  const examples = await getExamples()
  return {
    props: {
      example: examples.find(
        (example) =>
          example.component === query.params.component &&
          example.slug === query.params.example
      ),
    },
  }
}
