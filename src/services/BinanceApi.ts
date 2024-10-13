import { AppConstants } from '@utils/AppContants'
import axios from 'axios'
import crypto from 'crypto'
import querystring from 'querystring'

export class BinanceApi {
  async get (path: string, data = {}) {
    return await this.privateCall(path, 'GET', data);
  }

  async post (path: string, data = {}, isExecution = false) {
    return await this.privateCall(path, 'POST', data, isExecution);
  }

  async privateCall (path: string, method = 'GET', data: any = {}, isExecution = false) {
    data.timestamp = Date.now();
    // data.recvWindows = 60000; // janela de tolerância para execução de ordens
    data.signature = crypto.createHmac('sha256', AppConstants.API_SECRET as string)
      .update(`${querystring.stringify(data)}`)
      .digest('hex');
    const qs = `?${querystring.stringify(data)}`
    const result = await axios({
      method,
      url: isExecution ? `${AppConstants.API_URL_EXECUTION}${path}${qs}` : `${AppConstants.API_URL}${path}${qs}`,
      headers: {
        'X-MBX-APIKEY': AppConstants.API_KEY
      }
    });
    return result.data;
  }
}
