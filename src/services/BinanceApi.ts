import querystring from 'querystring'
import crypto from 'crypto'
import logger from '@config/logger'
import axios from 'axios'

export class BinanceApi {
    private apiUrl = process.env.API_URL
    private apiKey = process.env.API_KEY
    private apiSecret = process.env.API_SECRET

    async get (path: string, data = {}) {
      return this.privateCall(path, 'GET', data)
    }

    async post (path: string, data = {}) {
      return this.privateCall(path, 'POST', data)
    }

    async privateCall (path: string, method = 'GET', data = {}) {
      const timestamp = Date.now()
      const signature = crypto.createHmac('sha256', this.apiSecret as string)
        .update(`${querystring.stringify({ ...data, timestamp })}`)
        .digest('hex')
      const newData = { ...data, timestamp, signature }
      const qs = `?${querystring.stringify(newData)}`

      try {
        const result = await axios({
          method,
          url: `${this.apiUrl}${path}${qs}`,
          headers: {
            'X-MBX-APIKEY': this.apiKey
          }
        })
        return result.data
      } catch (e: any) {
        logger.error('Erro ao efetuar private call:', e.message)
      }
    }
}
