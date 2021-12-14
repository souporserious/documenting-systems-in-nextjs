import { promises as fs } from 'fs'
import * as path from 'path'

export async function getComponents() {
  const json = await fs.readFile(
    path.resolve(process.cwd(), '.cache/components.json'),
    'utf-8'
  )
  return JSON.parse(json)
}
