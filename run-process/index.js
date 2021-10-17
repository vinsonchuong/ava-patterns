import process from 'node:process'
import {spawn} from 'node:child_process'
import {PassThrough} from 'node:stream'
import {wait} from '../index.js'

export default function (
  t,
  {command: [command, ...args], env = {}, cwd = process.cwd()},
) {
  const child = spawn(command, args, {
    env: {...process.env, ...env},
    cwd,
    detached: true,
  })
  t.teardown(() => {
    try {
      process.kill(-child.pid)
    } catch (error) {
      if (error.code !== 'ESRCH') {
        throw error
      }
    }
  })

  const program = new Promise((resolve) => {
    child.on('close', (code) => {
      resolve({code, output: program.output})
    })
  })
  program.childProcess = child
  program.output = ''
  program.outputStream = new PassThrough()

  program.outputStream.setEncoding('utf8')
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  Promise.all([
    (async () => {
      for await (const data of child.stdout) {
        program.output += data
        program.outputStream.write(data)
      }
    })(),
    (async () => {
      for await (const data of child.stderr) {
        program.output += data
        program.outputStream.write(data)
      }
    })(),
  ]).then(
    () => {
      program.outputStream.end()
    },
    (error) => {
      program.outputStream.emit('error', error)
    },
  )

  program.waitForOutput = async (pattern, timeout = 1000) => {
    const match =
      typeof pattern === 'string'
        ? (string) => string.includes(pattern)
        : (string) => Boolean(pattern.test(string))

    await Promise.race([
      (async () => {
        await wait(timeout)
        throw new Error(
          `Timeout exceeded without seeing expected output:\n${program.output}`,
        )
      })(),
      (async () => {
        for await (const data of program.outputStream) {
          if (match(data)) {
            return
          }
        }

        throw new Error(
          `Process ended without emitting expected output:\n${program.output}`,
        )
      })(),
    ])
  }

  return program
}
