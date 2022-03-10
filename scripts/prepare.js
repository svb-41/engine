import * as fs from 'fs/promises'
import * as path from 'path'

// prettier-ignore
const replaceModuleNames = file => {
  return file
    .replace(/declare module "engine/g, 'declare module "@svb-41/engine')
    .replace(/declare module "helpers/g, 'declare module "@svb-41/engine/helpers')
    .replace(/import (.*) from "engine/g, 'import $1 from "@svb-41/engine')
    .replace(/import (.*) from "helpers/g, 'import $1 from "@svb-41/engine/helpers')
    .replace(/export (.*) from "engine/g, 'export $1 from "@svb-41/engine')
    .replace(/export (.*) from "helpers/g, 'export $1 from "@svb-41/engine/helpers')
    .replace(/\/\/\#.*/, '')
}

const dirname = process.cwd()
const filepath = path.resolve(dirname, 'types.d.ts')
const file = await fs.readFile(filepath, 'utf-8')
const withModuleNames = replaceModuleNames(file)
const replaced = withModuleNames.replace(
  /declare module "index"/g,
  'declare module "@svb-41/engine"'
)
await fs.writeFile(filepath, replaced)

const jspath = filepath.replace('.d.ts', '.js')
await fs.writeFile(jspath, `export default \`${replaced}\``)
