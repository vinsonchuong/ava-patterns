import * as path from 'path'
import fs from 'fs-extra'
import tempy from 'tempy'
import stripIndent from 'strip-indent'

export default async function (t) {
  const directory = tempy.directory()

  await fs.ensureDir(directory)
  t.teardown(async () => {
    await fs.remove(directory)
  })

  return {
    path: directory,
    async writeFile(filePath, fileContents) {
      await fs.writeFile(
        path.join(directory, filePath),
        stripIndent(fileContents.trim()) + '\n'
      )
    }
  }
}
