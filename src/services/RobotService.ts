import logger from '@config/logger'
import { OrderSideEnum } from '@models/enum/OrderSideEnum'
import { RobotStatusEnum } from '@models/enum/RobotStatusEnum'
import { AppConstants } from '@utils/AppContants'
import { AppUtils } from '@utils/AppUtils'
import axios from 'axios'
import WebSocket from 'ws'
import { NotificationService, NotificationSoundType } from './NotificationService'
import { OrderService } from './OrderService'

const orderService = new OrderService()

// TODO move variables to database (maybe)
let pairs: any = {}
const book: any = {}

let robotStatus: RobotStatusEnum = RobotStatusEnum.SEARCHING

initializeService()

async function initializeService () {
  createWebSocket()

  // TODO some tests
  // const symbols = ['TRXBTC', '', '']
  // logger.info(`EXECUTANDO TRANSAÇÃO 1: BUY ${symbols[0]}`)
  // const newOrder1 = {
  //   symbol: symbols[0],
  //   quantity: 100,
  //   side: OrderSideEnum.BUY
  // }
  // const order1: any = await orderService.newOrder(newOrder1)
  // logger.info('order 1:', JSON.stringify(order1))
  // logger.info(`EXECUTANDO TRANSAÇÃO 1: BUY ${symbols[1]}`)
  // const newOrder1 = {
  //   symbol: symbols[1],
  //   quantity: 1,
  //   side: OrderSideEnum.BUY
  // }
  // const order2: any = await orderService.newOrder(newOrder1)
  // logger.info('order 2:', order2)
}

async function executeStrategy (type: 'BSS' | 'BBS', symbols: string[]) {
  try {
    if (robotStatus !== RobotStatusEnum.STOPPED && robotStatus !== RobotStatusEnum.TRADING) {
      robotStatus = RobotStatusEnum.TRADING
      logger.info(`##### INICIANDO ESTRATÉGIA DE TRIANGULAÇÃO - ${type} ${symbols.join(' > ')} #####`)
      // ORDER 1
      logger.info(`EXECUTANDO TRANSAÇÃO 1: BUY ${symbols[0]}`)
      const newOrder1 = {
        symbol: symbols[0],
        quantity: AppConstants.AMOUNT,
        side: OrderSideEnum.BUY
      }
      // await AppUtils.sleep(5)
      const order1: any = await orderService.newOrder(newOrder1)
      logger.info('ORDER 1', order1)
      // ORDER 2
      const transactionType = (type === 'BBS') ? OrderSideEnum.BUY : OrderSideEnum.SELL
      logger.info(`EXECUTANDO TRANSAÇÃO 2: ${transactionType} ${symbols[1]}`)
      const newOrder2 = {
        symbol: symbols[1],
        quantity: order1.fills?.[0].qty,
        side: transactionType
      }
      // await AppUtils.sleep(5)
      const order2: any = await orderService.newOrder(newOrder2)
      logger.info('ORDER 2', order2)
      // ORDER 3
      logger.info(`EXECUTANDO TRANSAÇÃO 3: SELL ${symbols[2]}`)
      const newOrder3 = {
        symbol: symbols[2],
        quantity: order2.fills?.[0].qty,
        side: OrderSideEnum.SELL
      }
      // await AppUtils.sleep(5)
      const order3: any = await orderService.newOrder(newOrder3)
      logger.info('ORDER 3', order3)
      NotificationService.playSound(NotificationSoundType.COMPLETED)
      logger.info('##################### ESPERAR 1 MINUTO #####################')
      await AppUtils.sleep(60)
      robotStatus = RobotStatusEnum.SEARCHING
    }
  } catch (e: any) {
    NotificationService.playSound(NotificationSoundType.ERROR)
    logger.error(`Deu ruim na hora de tentar executar estratégia. ${AppUtils.extractErrorMessage(e)}`)
    robotStatus = RobotStatusEnum.SEARCHING
    // logger.info('##################### PARAR ROBÔ #####################')
    // await AppUtils.sleep(60)
  }
}

function createWebSocket () {
  const ws = new WebSocket(AppConstants.URL_STREAM)
  ws.on('message', async (event: any) => {
    if (robotStatus !== RobotStatusEnum.STOPPED && robotStatus !== RobotStatusEnum.TRADING) {
      robotStatus = RobotStatusEnum.SEARCHING
      const obj = JSON.parse(event?.toString())
      obj.forEach((element: any) => {
        book[element.s] = {
          ask: parseFloat(element.a),
          bid: parseFloat(element.b)
        }
      })
      processBuyBuySell()
      processBuySellSell()
    }
  })
}

async function processBuyBuySell () {
  // logger.info(new Date().toLocaleString())
  pairs?.buyBuySell?.combinations?.forEach(async (candidate: any) => {
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
      const symbols = [candidate.buy1.symbol, candidate.buy2.symbol, candidate.sell.symbol]
      NotificationService.playSound(NotificationSoundType.FOUND)
      logger.info(`Oportunidade BBS em ${symbols.join(' > ')} = ${crossRate}.`)
      logger.info(`Inicial: ${AppConstants.QUOTE} ${AppConstants.AMOUNT}, Final ${AppConstants.QUOTE} ${((AppConstants.AMOUNT / priceBuy1) / priceBuy2) * priceSell}`)
      await executeStrategy('BBS', symbols)
    }
  })
}

async function processBuySellSell () {
  // logger.info(new Date().toLocaleString())
  pairs?.buySellSell?.combinations?.forEach(async (candidate: any) => {
    // buy1
    let priceBuy = book[candidate.buy.symbol]
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
      const symbols = [candidate.buy.symbol, candidate.sell1.symbol, candidate.sell2.symbol]
      NotificationService.playSound(NotificationSoundType.FOUND)
      logger.info(`Oportunidade BSS em ${symbols.join(' > ')} = ${crossRate}.`)
      logger.info(`Inicial: ${AppConstants.QUOTE} ${AppConstants.AMOUNT}, Final: ${AppConstants.QUOTE} ${(AppConstants.AMOUNT / priceBuy) * priceSell1 * priceSell2}`)
      await executeStrategy('BSS', symbols)
    }
  })
}

export class RobotService {
  getPairs () {
    return pairs
  }

  getBook () {
    return book
  }

  getRobotStatus() {
    return robotStatus
  }

  setRobotStatus(status: RobotStatusEnum) {
    robotStatus = status
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
      logger.info(`Foram encontrados ${pairs.size} pares disponíveis para triangulação.`)
    } catch (e: any) {
      logger.error('Ocorreu um erro ao obter pares de símbolos.', AppUtils.extractErrorMessage(e))
    }
  }

  private async getExchangeInfo () {
    const response = await axios.get(AppConstants.URL_EXCHANGE_INFO)
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
      const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell
      if (crossRate > AppConstants.PROFITABILITY && priceBuy1 && priceBuy2 && priceSell) {
        logger.info(`Oportunidade em ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell.symbol}.`)
      }
    })
  }
}
