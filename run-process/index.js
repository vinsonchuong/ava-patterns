import process from 'node:process'
import {spawn} from 'node:child_process'
import {PassThrough} from 'node:stream'
import {wait} from '../index.js'

/**
 * Create a temporary directory and delete it at the end of the test.
 *
 * @param {import('ava').ExecutionContext<any>} t - the AVA test context
 * @param {Object} options
 * @param {Array<string>} options.command - a shell command to spawn a process
 * @param {{ [name: string]: string }} [options.env] - Environment variables to
 *   pass into the process
 * @param {string} [options.cwd] - Working directory in which to run the process
 *
 * @return {{
 *   childProcess: import('node:child_process').ChildProcess
 *   output: string,
 *   outputStream: import('stream').Readable,
 *   waitForOutput(output: string | RegExp, timeout?: number): Promise<void>,
 *   waitUntilExit(): Promise<number>
 * }}
 */
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

  const exitCode = new Promise((resolve) => {
    child.on('close', (code) => {
      resolve(code)
    })
  })

  let output = ''

  const outputStream = new PassThrough()
  outputStream.setEncoding('utf8')
  child.stdout.setEncoding('utf8')
  child.stderr.setEncoding('utf8')
  Promise.all([
    (async () => {
      for await (const data of child.stdout) {
        output += data
        outputStream.write(data)
      }
    })(),
    (async () => {
      for await (const data of child.stderr) {
        output += data
        outputStream.write(data)
      }
    })(),
  ]).then(
    () => {
      outputStream.end()
    },
    (error) => {
      outputStream.emit('error', error)
    },
  )

  return {
    childProcess: child,
    get output() {
      return output
    },
    outputStream,
    async waitForOutput(pattern, timeout = 1000) {
      await Promise.race([
        (async () => {
          await wait(timeout)
          throw new Error(
            `Timeout exceeded without seeing expected output:\n${output}`,
          )
        })(),
        (async () => {
          for await (const data of outputStream) {
            if (
              typeof pattern === 'string'
                ? data.includes(pattern)
                : pattern.test(data)
            ) {
              return
            }
          }

          throw new Error(
            `Process ended without emitting expected output:\n${output}`,
          )
        })(),
      ])
    },
    waitUntilExit() {
      return exitCode
    },
  }
}
