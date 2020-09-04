import test from 'ava'
import got from 'got'
import {runProcess} from '../index.js'

test.serial('starting a server', async (t) => {
  const script = `
    import * as http from 'http'
    const server = http.createServer((request, response) => {
      response.end('Hello World!')
    })
    server.listen(10000, () => {
      console.log('Listening')
    })
  `

  const program = runProcess(t, {
    command: ['node', '--input-type', 'module', '--eval', script]
  })

  await program.waitForOutput('Listening')

  t.is(program.output, 'Listening\n')

  const response = await got('http://localhost:10000')
  t.is(response.body, 'Hello World!')
})

test.serial('automatically killing the process', async (t) => {
  await t.throwsAsync(got('http://localhost:10000'))
})

test('not seeing the expected output', async (t) => {
  const script = `
    import * as http from 'http'
    const server = http.createServer((request, response) => {
      response.end('Hello World!')
    })
    server.listen(10001)
  `

  const program = runProcess(t, {
    command: ['node', '--input-type', 'module', '--eval', script]
  })

  await t.throwsAsync(program.waitForOutput('Listening'))
})

test('not seeing the expected output before a timeout', async (t) => {
  const script = `
    import * as http from 'http'
    const server = http.createServer((request, response) => {
      response.end('Hello World!')
    })
    server.listen(10002, () => {
      setTimeout(() => {
        console.log('Listening')
      }, 3000)
    })
  `

  const program = runProcess(t, {
    command: ['node', '--input-type', 'module', '--eval', script]
  })

  await t.throwsAsync(program.waitForOutput('Listening'))
})

test('setting the working directory and environment variables', async (t) => {
  const script = `
    console.log(process.cwd())
    console.log('FOO', process.env.FOO)
    console.log('Done!')
  `

  const program = runProcess(t, {
    command: ['node', '--input-type', 'module', '--eval', script],
    cwd: '/tmp',
    env: {FOO: 'bar'}
  })

  await program.waitForOutput('Done!')
  t.is(program.output, '/tmp\nFOO bar\nDone!\n')
})
