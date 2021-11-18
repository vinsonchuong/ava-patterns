import {promisify} from 'node:util'

const promisifiedSetTimeout = promisify(setTimeout)

/**
 * Stop execution for a specified number of milliseconds
 *
 * @param {number} time
 *
 * @return {Promise<void>} Resolves after the specified amount of time
 */
export default async function (time) {
  await promisifiedSetTimeout(time)
}
