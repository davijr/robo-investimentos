import axios from 'axios'
import WebSocket from 'ws'

// constants
const AppConstants = {
  API: {
    URL_STREAM: `${process.env.API_URL_STREAM}/!ticker@arr`
  },
  QUOTE: 'USDT',
  PROFITABILITY: 1.02 // 1.003 está considerando as taxas em todas as operações
}

// variables
let pairs: any = {}
let book: any = {}
let amount = 100;

const ws = new WebSocket(AppConstants.API.URL_STREAM)
ws.on('message', async (event: any) => {
  const obj = JSON.parse(event?.toString())
  obj.forEach((element: any) => {
    book[element.s] = {
      ask: parseFloat(element.a),
      bid: parseFloat(element.b)
    }
  })
  // processBuyBuySell()
  // processBuySellSell()
})

function processBuyBuySell () {
  console.log(new Date().toLocaleTimeString())
  pairs?.buyBuySell?.combinations?.forEach((candidate: any) => {
    // buy1
    let priceBuy1 = book[candidate.buy1.symbol]
    priceBuy1 = priceBuy1?.ask
    // buy2
    let priceBuy2 = book[candidate.buy2.symbol]
    priceBuy2 = priceBuy2?.ask
    // buy1
    let priceSell = book[candidate.sell.symbol]
    priceSell = priceSell?.bid
    // profitability strategy
    const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell
    if (crossRate > AppConstants.PROFITABILITY && priceBuy1 && priceBuy2 && priceSell) {
      console.log(`Oportunidade BBS em ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell.symbol} = ${crossRate}.`)
      console.log(`Inicial: ${AppConstants.QUOTE} ${amount}, Final ${AppConstants.QUOTE} ${((amount / priceBuy1) / priceBuy2) * priceSell}`)
    }
  })
}

function processBuySellSell () {
  console.log(new Date().toLocaleTimeString())
  pairs?.buySellSell?.combinations?.forEach((candidate: any) => {
    // buy1
    let priceBuy =  book[candidate.buy.symbol]
    priceBuy = priceBuy?.ask
    // buy2
    let priceSell1 = book[candidate.sell1.symbol]
    priceSell1 = priceSell1?.ask
    // buy1
    let priceSell2 = book[candidate.sell2.symbol]
    priceSell2 = priceSell2?.bid
    // profitability strategy
    const crossRate = (1 / priceBuy) * priceSell1 * priceSell2
    if (crossRate > AppConstants.PROFITABILITY && priceBuy && priceSell1 && priceSell2) {
      console.log(`Oportunidade BSS em ${candidate.buy.symbol} > ${candidate.sell1.symbol} > ${candidate.sell2.symbol} = ${crossRate}.`)
      console.log(`Inicial: ${AppConstants.QUOTE} ${amount}, Final: ${AppConstants.QUOTE} ${(amount / priceBuy) * priceSell1 * priceSell2}`)
    }
  })
}

export class RobotService {
  getPairs () {
    return pairs
  }

  getPrices (assets = []) {
    const prices: any = []
    assets.forEach(asset => {
      const symbol = asset + AppConstants.QUOTE
      const price = book[symbol]
      if (price) {
        prices.push({
          asset,
          ...price
        })
      }
    })
    return prices
  }

  async processPairs () {
    try {
      const allSymbols: any = await this.getExchangeInfo()

      const buySymbols = allSymbols.filter((symbol: any) => symbol.quote === AppConstants.QUOTE)

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
    buySymbols.forEach((buy: any) => {
      const right = allSymbols.filter((s: any) => s.base === buy.base && s.quote !== buy.quote)
      right.forEach((sell1: any) => {
        const sell2 = allSymbols.find((s: any) => s.base === sell1.quote && s.quote === buy.quote)
        if (sell2) {
          buyBuySell.push({ buy, sell1, sell2 })
        }
      })
    })
    return buyBuySell
  }

  /*************
   * WEB SOCKET
   *************/

  processBuyBuySell () {
    pairs?.buyBuySell?.combinations?.forEach((candidate: any) => {
      // buy1
      let priceBuy1 = book[candidate.buy1.symbol]
      priceBuy1 = priceBuy1.ask
      // buy2
      let priceBuy2 = book[candidate.buy2.symbol]
      priceBuy2 = priceBuy1.ask
      // buy1
      let priceSell = book[candidate.sell.symbol]
      priceSell = priceSell.bid
      // profitability strategy
      const crossRate = (1/priceBuy1) * (1/priceBuy2) * priceSell
      if (crossRate > AppConstants.PROFITABILITY && priceBuy1 && priceBuy2 && priceSell) {
        console.log(`Oportunidade em ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell.symbol}.`)
      }
    })
  }
}
