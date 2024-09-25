import logger from '@config/logger';
import { Order } from '@models/Order';
import Trade from '@schemas/Trade';
import { AppUtils } from '@utils/AppUtils';
import { OrderTypeEnum } from '../enum/OrderTypeEnum';
import { BinanceApi } from './BinanceApi';
import { OrderStatusEnum } from 'src/enum/OrderStatusEnum';

const binance = new BinanceApi();

// memory
let settings: any;
let allSymbols: any;

export class OrderService {
  private orderUrl = '/v3/order';
  private orderHistoryUrl = '/v3/myTrades';

  async newOrder (order: Order) {
    order.type = order.type ?? OrderTypeEnum.MARKET
    if (order.type === OrderTypeEnum.LIMIT) {
      order.timeInForce = 'GTC'; // TODO comentei pra testar o recWindows
    }
    try {
      return await binance.post(this.orderUrl, order)
    } catch (e: any) {
      const msg = `Erro ao efetuar chamada à API Binance. ${AppUtils.extractErrorMessage(e)}`;
      logger.error(msg);
      throw new Error(msg);
    }
  }

  setSettings(settingsParam: any) {
    settings = settingsParam;
  }

  setAllSymbols(allSymbolsParam: any) {
    allSymbols = allSymbolsParam;
  }

  async getHistory () {
    const allHistory: any[] = [];
    const trades: any = await Trade.find();
    const firstTrade = trades[0] || {};
    const updateInterval = AppUtils.diffSec(firstTrade?.lastUpdate) || 999;
    if (trades && updateInterval <= settings.myTradesUpdateInterval) {
      settings.includeSymbols.forEach((symbol: string, i: number) => {
        const history = trades.find((trade: any) => trade.symbol === symbol)?.trades;
        if (history) {
          allHistory.push({
            symbol,
            history: [...history]
          });
        }
      });
      return allHistory;
    }
    try {
      // const symbols = this.getPairs();
      const calls: any[] = [];
      for (const symbol of settings.includeSymbols) {
        calls.push(this.getOneHistory(symbol).catch(e => e));
      }
      await Promise.all(calls).then(result => {
        settings.includeSymbols.forEach((symbol: string, i: number) => {
          const element = result[i];
          if (element.length !== 0 && element.code !== 'ERR_BAD_REQUEST') {
            AppUtils.sort(element, 'time', 'DESC');
            allHistory.push({
              symbol,
              history: [...element]
            });
          }
        });
      });
      await this.saveTrades(allHistory);
      return allHistory;
    } catch (e: any) {
      logger.error(`Erro ao efetuar chamada à API Binance. ${AppUtils.extractErrorMessage(e)}`);
      await this.saveTrades(allHistory);
      return allHistory;
    }
  }

  private async getOneHistory (symbol: string) {
    return await binance.get(this.orderHistoryUrl, { symbol });
  }

  private async saveTrades(history: any) {
    await Trade.deleteMany();
    for (const element of history) {
      const trade: any = new Trade({});
      trade.symbol = element.symbol;
      trade.trades = element.history;
      trade.lastUpdate = new Date().getTime();
      await trade.save();
    }
  }

  async getFinalStatus(order: any): Promise<string> {
    for (const interval of settings.attemptIntervals) {
      logger.info(`ORDER STATUS: ${order.status}`);
      order = await binance.get(this.orderUrl, { symbol: order?.symbol, orderId: order?.orderId });
      if ([OrderStatusEnum.FILLED, OrderStatusEnum.CANCELED, OrderStatusEnum.REJECTED].includes(order?.status)) {
        return order;
      }
      logger.info(`## Aguardando ordem ser preenchida. Intervalo: ${interval} segundo(s). ORDER STATUS: ${order.status}.`);
      await AppUtils.sleep(interval);
    }
    const error = `!! ERRO: A ordem não foi preenchida. ORDER ID: ${order._id}`;
    logger.error(error);
    throw new Error(error);
  }

  // private async getOneHistory (symbol: string) {
  //   let trade: any = await Trade.findOne();
  //   const updateInterval = AppUtils.diffMinutes(trade?.lastUpdate) || 999;
  //   if (trade && updateInterval < settings.myTradesUpdateInterval) {
  //     return trade[symbol];
  //   }
  //   if (!trade) {
  //     trade = new Trade({});
  //   }
  //   trade[symbol] = await binance.get(this.orderHistoryUrl, { symbol });
  //   trade.lastUpdate = new Date().getTime();
  //   await trade.save();
  //   return trade[symbol];
  // }

  private getPairs (): any[] {
    try {
      const buySymbols = allSymbols.filter(
        (symbol: any) => symbol.quote === settings.quote && settings.includeSymbols.includes(symbol.symbol));
      const buyBuySell = this.getBuyBuySell(allSymbols, buySymbols);
      const buySellSell = this.getBuySellSell(allSymbols, buySymbols);
      const symbols: any = [];
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
