# Documenting Systems In NextJS

This repo is an example of how to document a system of components, hooks, utilities, and themes in [NextJS](https://nextjs.org/) using [TS Morph](https://ts-morph.com/).

## Features

♻️ Fast Refresh for everything

📝 MDX for mixing Markdown and JSX

🤖 Component, hook, and utility doc generation

🎨 Theme and design token doc generation (Not implemented)

🖼 Server rendered live code examples

🕹 Playground powered by Monaco Editor with Go to Definition

🐇 Quick links to source code in development and production

🌈 CLI for easily adding new features

🔀 Theme, component, hook, and utility relationships (Not implemented)

📸 Screenshot diffing (Not implemented)

## Development

```bash
pnpm install
pnpm dev
```

This will start the development servers. One server handles gathering and caching the data while the other is a NextJS server that serves the site.

When debugging data gathering, you can use the `pnpm dev:data --debug` command to start the data server in debug mode.
