import { BinanceApi } from './BinanceApi'

const binance = new BinanceApi()
export class WalletService {
  accountUrl = '/v3/account'

  async getAccountInfo () {
    return binance.get(this.accountUrl)
  }
}
