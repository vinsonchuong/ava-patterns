import {sendRequest} from 'passing-notes'

/**
 * @typedef {'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'} Method
 * @typedef {{ [name: string]: string }} Headers
 * @typedef {string | Buffer} Data
 * @typedef {Data | ReadableStream<Data> | AsyncIterable<Data>} Body
 *
 * @typedef {{
 *   method: Method,
 *   url: string,
 *   headers?: Headers,
 *   body?: Body
 * }} Request
 *
 * @typedef {{
 *   status: number,
 *   headers: Headers,
 *   body: Body
 * }} Response
 */

/**
 * Make an HTTP request
 *
 * @param {Request} request - Request `method` and `url`, with optional
 *   `headers` and `body`
 *
 * @return {Promise<Response>} - The response `status`, `headers`, and `body`
 */
export default function (request) {
  return sendRequest(request)
}
