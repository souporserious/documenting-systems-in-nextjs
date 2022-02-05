import Head from 'next/head'
import * as React from 'react'
import * as fs from 'fs'
import { CompiledComponent } from 'components'
import { getSourceLink } from 'utils'
import { pascalCase } from 'case-anything'
import { allComponents } from '.data/components'
import * as components from 'components'
import * as hooks from 'hooks'
import {
  SandpackProvider,
  SandpackLayout,
  SandpackCodeEditor,
  SandpackPreview,
} from '@codesandbox/sandpack-react'
import { useCompiledCode } from 'hooks'

function Playground({ code, bundles }) {
  return (
    <SandpackProvider
      template="react"
      customSetup={{
        files: { '/App.js': code, ...bundles },
        dependencies: { 'styled-components': '^5.3.3' },
      }}
    >
      <SandpackLayout>
        <SandpackCodeEditor />
        <SandpackPreview />
      </SandpackLayout>
    </SandpackProvider>
  )
}

export default function Examples({ component, example, bundles }) {
  return (
    <>
      <Head>
        <title>
          {pascalCase(component)} / {example.name}
        </title>
      </Head>
      <Playground code={example.code} bundles={bundles} />
      {/* <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        {example.path && (
          <a href={getSourceLink({ path: example.path })}>View Source</a>
        )}
      </div> */}
      {/* <CompiledComponent codeString={example.compiledCode} /> */}
    </>
  )
}

export async function getStaticPaths() {
  const allExamples = allComponents.flatMap((component) => component.examples)
  return {
    paths: allExamples.map((example) => ({
      params: {
        component: example.parentSlug,
        example: example.slug,
      },
    })),
    fallback: false,
  }
}

export async function getStaticProps(query) {
  const allExamples = allComponents.flatMap((component) => component.examples)
  const bundles = {
    components: fs.readFileSync('.data/components-bundle.js', 'utf-8'),
    hooks: fs.readFileSync('.data/hooks-bundle.js', 'utf-8'),
    utils: fs.readFileSync('.data/utils-bundle.js', 'utf-8'),
  }

  return {
    props: {
      component: query.params.component,
      example: allExamples.find(
        (example) =>
          example.parentSlug === query.params.component &&
          example.slug === query.params.example
      ),
      bundles: Object.fromEntries(
        ['components', 'hooks', 'utils'].flatMap((name) => [
          [
            `/node_modules/${name}/package.json`,
            JSON.stringify({
              name: name,
              main: './index.js',
            }),
          ],
          [`/node_modules/${name}/index.js`, bundles[name]],
        ])
      ),
    },
  }
}
