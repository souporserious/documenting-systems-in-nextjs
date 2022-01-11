import * as fs from 'fs'
import snap from 'red-snapper'

import { allComponents } from '../.data'

const allExamples = allComponents.flatMap((component) => component.examples)

Promise.all(
  allExamples.map(async (example) =>
    snap({
      url: `http://localhost:4000/components/${example.parentSlug}/examples/${example.slug}`,
      width: 1200,
      height: 800,
      delay: 1,
      format: 'png',
    })
  )
).then((screenshots) => {
  if (!fs.existsSync('screenshots/images')) {
    fs.mkdirSync('screenshots/images')
  }

  screenshots.forEach((screenshot, index) => {
    const example = allExamples[index]

    fs.writeFileSync(
      `screenshots/images/${example.parentSlug}-${example.slug}.png`,
      Buffer.from(screenshot, 'base64')
    )
  })
})
