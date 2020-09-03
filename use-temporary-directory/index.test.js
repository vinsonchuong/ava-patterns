import test from 'ava'
import {promises as fs} from 'fs'
import {useTemporaryDirectory} from '../index.js'

test.serial('creating a directory', async (t) => {
  const directory = await useTemporaryDirectory(t)

  const stats = await fs.stat(directory)
  t.true(stats.isDirectory())

  global.directory = directory
})

test.serial('cleaning up the directory', async (t) => {
  await t.throwsAsync(fs.stat(global.directory))
})
