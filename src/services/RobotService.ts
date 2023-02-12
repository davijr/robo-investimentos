import axios from 'axios'

const QUOTE = 'USDT'
const AMOUNT = 10
let pairs: any = {}

export class RobotService {
  getPairs () {
    return pairs
  }

  async processPairs () {
    try {
      const allSymbols: any = await this.getExchangeInfo()

      const buySymbols = allSymbols.filter((symbol: any) => symbol.quote === QUOTE)

      const buyBuySell = this.getBuyBuySell(allSymbols, buySymbols)
      const buySellSell = this.getBuySellSell(allSymbols, buySymbols)

      pairs = {
        size: allSymbols?.length,
        buyBuySell: {
          size: buyBuySell.length,
          combinations: buyBuySell
        },
        buySellSell: {
          size: buySellSell.length,
          combinations: buySellSell
        }
      }
    } catch (e: any) {
      console.log('Ocorreu um erro ao obter pares de símbolos.', e)
    }
  }

  private async getExchangeInfo () {
    const response = await axios.get('https://api.binance.com/api/v3/exchangeInfo')
    return response.data?.symbols?.filter((symbol: any) => symbol.status === 'TRADING')
      .map((symbol: any) => {
        return {
          symbol: symbol.symbol,
          base: symbol.baseAsset,
          quote: symbol.quoteAsset
        }
      })
  }

  private getBuyBuySell (allSymbols: any, buySymbols: any) {
    const buyBuySell: any[] = []
    buySymbols.forEach((buy1: any) => {
      const right = allSymbols.filter((s: any) => s.quote === buy1.base)
      right.forEach((buy2: any) => {
        const sell = allSymbols.find((s: any) => s.base === buy2.base && s.quote === buy1.quote)
        if (sell) {
          buyBuySell.push({ buy1, buy2, sell })
        }
      })
    })
    return buyBuySell
  }

  private getBuySellSell (allSymbols: any, buySymbols: any) {
    const buyBuySell: any[] = []
    buySymbols.forEach((buy1: any) => {
      const right = allSymbols.filter((s: any) => s.base === buy1.base && s.quote !== buy1.quote)
      right.forEach((sell1: any) => {
        const sell2 = allSymbols.find((s: any) => s.base === sell1.quote && s.quote === buy1.quote)
        if (sell2) {
          buyBuySell.push({ buy1, sell1, sell2 })
        }
      })
    })
    return buyBuySell
  }

  /*************
   * WEB SOCKET
   *************/

  // todo
}
