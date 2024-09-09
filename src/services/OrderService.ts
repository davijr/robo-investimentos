import logger from '@config/logger'
import { OrderTypeEnum } from '../enum/OrderTypeEnum'
import { Order } from '@models/Order'
import { AppConstants } from '@utils/AppContants'
import { AppUtils } from '@utils/AppUtils'
import axios from 'axios'
import { BinanceApi } from './BinanceApi'
import { ExchangeService } from './ExchangeService'

const binance = new BinanceApi()
const exchangeService = new ExchangeService();

export class OrderService {
  private orderUrl = '/v3/order'
  private orderHistoryUrl = '/v3/myTrades'

  async newOrder (order: Order) {
    order.type = order.type || OrderTypeEnum.MARKET
    if (order.type === OrderTypeEnum.LIMIT) {
      order.timeInForce = 'GTC'
    }
    try {
      return binance.post(this.orderUrl, order)
    } catch (e: any) {
      logger.error('Erro ao efetuar chamada à API Binance.', e.message)
    }
  }

  async getHistory () {
    try {
      const symbols = await this.getPairs()
      const allHistory: any[] = []
      const calls: any[] = []
      for (let i = 0; i < symbols.length; i++) {
        const symbol = symbols[i]
        calls.push(this.getOneHistory(symbol).catch(e => e))
      }
      await Promise.all(calls).then(result => {
        symbols.forEach((symbol: string, i: number) => {
          const element = result[i]
          if (element.length !== 0 && element.code !== 'ERR_BAD_REQUEST') {
            AppUtils.sort(element, 'time', 'DESC')
            allHistory.push({
              symbol,
              history: [...element]
            })
          }
        })
      })
      return allHistory
    } catch (e: any) {
      logger.error(`Erro ao efetuar chamada à API Binance. ${AppUtils.extractErrorMessage(e)}`)
    }
  }

  private async getOneHistory (symbol: string) {
    return binance.get(this.orderHistoryUrl, { symbol })
  }

  // ##########################
  //  TODO remove
  // ##########################

  private async getPairs (): Promise<any[]> {
    try {
      const allSymbols: any = await exchangeService.getExchangeInfoApi();
      const buySymbols = allSymbols.filter((symbol: any) => symbol.quote === AppConstants.QUOTE)
      const buyBuySell = this.getBuyBuySell(allSymbols, buySymbols)
      const buySellSell = this.getBuySellSell(allSymbols, buySymbols)
      const symbols: any = []
      buyBuySell.forEach((i: any) => {
        if (!symbols.includes(i.buy1.symbol)) symbols.push(i.buy1.symbol)
        if (!symbols.includes(i.buy2.symbol)) symbols.push(i.buy2.symbol)
        if (!symbols.includes(i.sell.symbol)) symbols.push(i.sell.symbol)
      })
      buySellSell.forEach((i: any) => {
        if (!symbols.includes(i.buy.symbol)) symbols.push(i.buy.symbol)
        if (!symbols.includes(i.sell1.symbol)) symbols.push(i.sell1.symbol)
        if (!symbols.includes(i.sell2.symbol)) symbols.push(i.sell2.symbol)
      })
      return symbols
    } catch (e: any) {
      logger.error('Ocorreu um erro ao obter pares de símbolos.')
      logger.error(e)
      return []
    }
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

  // private async getExchangeInfo () {
  //   const response = await axios.get(AppConstants.URL_EXCHANGE_INFO)
  //   return response.data?.symbols?.filter((symbol: any) => symbol.status === 'TRADING')
  //     .map((symbol: any) => {
  //       return {
  //         symbol: symbol.symbol,
  //         base: symbol.baseAsset,
  //         quote: symbol.quoteAsset
  //       }
  //     })
  // }
}
