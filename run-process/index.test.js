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
    command: ['node', '--input-type', 'module', '--eval', script],
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
    console.log("Hello World!")
  `

  const program = runProcess(t, {
    command: ['node', '--input-type', 'module', '--eval', script],
  })

  await t.throwsAsync(program.waitForOutput('Listening'), {
    message: /Hello World/,
  })
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
    command: ['node', '--input-type', 'module', '--eval', script],
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
    env: {FOO: 'bar'},
  })

  await program.waitForOutput('Done!')
  t.is(program.output, '/tmp\nFOO bar\nDone!\n')
})

test('running a simple command that terminates', async (t) => {
  const program = runProcess(t, {command: ['ls', '/']})
  const code = await program.waitUntilExit()

  t.true(program.output.includes('tmp'))
  t.is(code, 0)
})

test('emitting the right events', async (t) => {
  const script = `
    import {setTimeout} from 'node:timers/promises'
    console.log('One!')
    await setTimeout(100)
    console.log('Two!')
    await setTimeout(100)
    console.error('Error!')
    await setTimeout(100)
    console.log('Three!')
  `

  const program = runProcess(t, {
    command: ['node', '--input-type', 'module', '--eval', script],
  })

  const stdout = []
  program.events.on('stdout', (message) => {
    stdout.push(message)
  })

  const stderr = []
  program.events.on('stderr', (message) => {
    stderr.push(message)
  })

  const output = []
  program.events.on('output', (message) => {
    output.push(message)
  })

  const exit = []
  program.events.on('exit', (code) => {
    exit.push(code)
  })

  await program.waitUntilExit()

  t.deepEqual(stdout, ['One!\n', 'Two!\n', 'Three!\n'])
  t.deepEqual(stderr, ['Error!\n'])
  t.deepEqual(output, ['One!\n', 'Two!\n', 'Error!\n', 'Three!\n'])
  t.deepEqual(exit, [0])
})
