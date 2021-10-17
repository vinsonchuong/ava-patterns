import {sendRequest} from 'passing-notes'

export default async function (request) {
  if (typeof request === 'string') {
    const response = await sendRequest({
      method: 'GET',
      headers: {},
      url: request,
    })
    return response.body
  }

  return sendRequest(request)
}
