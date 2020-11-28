import test from 'ava'
import path from 'path'
import {promises as fs} from 'fs'
import {useTemporaryDirectory, runProcess} from '../index.js'

test.serial('creating a directory', async (t) => {
  const directory = await useTemporaryDirectory(t)

  const stats = await fs.stat(directory.path)
  t.true(stats.isDirectory())

  await directory.writeFile(
    'file.txt',
    `
    Hello World!
  `
  )

  t.is(
    await fs.readFile(path.join(directory.path, 'file.txt'), 'utf8'),
    'Hello World!\n'
  )

  global.directory = directory
})

test.serial('cleaning up the directory', async (t) => {
  await t.throwsAsync(fs.stat(global.directory))
})

test('automatically setting permissions for executable files', async (t) => {
  const directory = await useTemporaryDirectory(t)

  await directory.writeFile(
    'bin.js',
    `
      #!/usr/bin/env node
      console.log('Hello World!')
    `
  )

  const {output} = await runProcess(t, {
    command: ['./bin.js'],
    cwd: directory.path
  })
  t.is(output, 'Hello World!\n')
})
