import { AppConstants } from '@utils/AppContants'
import axios from 'axios'
import crypto from 'crypto'
import querystring from 'querystring'

export class BinanceApi {
  async get (path: string, data = {}) {
    return this.privateCall(path, 'GET', data)
  }

  async post (path: string, data = {}) {
    return this.privateCall(path, 'POST', data)
  }

  async privateCall (path: string, method = 'GET', data: any = {}) {
    data.timestamp = Date.now()
    // TODO data.recvWindows = 60000
    data.signature = crypto.createHmac('sha256', AppConstants.API_SECRET as string)
      .update(`${querystring.stringify(data)}`)
      .digest('hex')
    const qs = `?${querystring.stringify(data)}`
    const result = await axios({
      method,
      url: `${AppConstants.API_URL}${path}${qs}`,
      headers: {
        'X-MBX-APIKEY': AppConstants.API_KEY
      }
    })
    return result.data
  }
}
