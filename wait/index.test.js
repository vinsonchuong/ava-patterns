import test from 'ava'
import {wait} from '../index.js'

test('waiting for an amount of time', async (t) => {
  const start = Date.now()
  await wait(500)
  const end = Date.now()
  t.true(end - start >= 500)
})
