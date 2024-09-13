import logger from '@config/logger';
import { AppConstants } from '@utils/AppContants';
import { AppUtils } from '@utils/AppUtils';
import WebSocket from 'ws';
import { OrderSideEnum } from '../enum/OrderSideEnum';
import { OrderTypeEnum } from '../enum/OrderTypeEnum';
import { RobotStatusEnum } from '../enum/RobotStatusEnum';
import { ExchangeService } from './ExchangeService';
import { NotificationService, NotificationSoundType } from './NotificationService';
import { OportunityService } from './OportunityService';
import { OrderService } from './OrderService';

export class RobotService {
  robotStatus: RobotStatusEnum = RobotStatusEnum.STOPPED;
  pairs: any = {};
  book: any = {};

  // inject
  oportunityService = new OportunityService();

  async init() {
    await this.processPairs();
    this.createWebSocket(async (event: any) => {
      if (robotStatus !== RobotStatusEnum.STOPPED && robotStatus !== RobotStatusEnum.TRADING) {
        robotStatus = RobotStatusEnum.SEARCHING;
        this.parseStream(event);
        this.processBuyBuySell();
        this.processBuySellSell();
      }
    });
  }

  private parseStream(event: any) {
    // "e": "24hrTicker",  // Event type
    // "E": 123456789,     // Event time
    // "s": "BTCUSDT",     // Symbol
    // "p": "0.0015",      // Price change
    // "P": "250.00",      // Price change percent
    // "w": "0.0018",      // Weighted average price
    // "c": "0.0025",      // Last price
    // "Q": "10",          // Last quantity
    // "o": "0.0010",      // Open price
    // "h": "0.0025",      // High price
    // "l": "0.0010",      // Low price
    // "v": "10000",       // Total traded base asset volume
    // "q": "18",          // Total traded quote asset volume
    // "O": 0,             // Statistics open time
    // "C": 86400000,      // Statistics close time
    // "F": 0,             // First trade ID
    // "L": 18150,         // Last trade Id
    // "n": 18151          // Total number of trades
    const obj = JSON.parse(event?.toString());
    obj.forEach((element: any) => {
      this.book[element.s] = {
        ask: parseFloat(element.a),
        bid: parseFloat(element.b),
        time: element.E,
        baseVolume: element.v,
        quoteVolume: element.q
      };
    });
  }

  getRobotStatus() {
    return robotStatus
  }

  setRobotStatus(status: RobotStatusEnum) {
    robotStatus = status
  }

  getPairs() {
    return this.pairs;
  }

  getBook() {
    return this.book;
  }

  getPrices(assets = []) {
    const prices: any = []
    assets.forEach(asset => {
      const symbol = asset + AppConstants.QUOTE
      const price = this.book[symbol]
      if (price) {
        prices.push({
          asset,
          ...price
        })
      }
    })
    return prices
  }

  async processPairs() {
    try {
      const allSymbols: any = await exchangeService.getUpdateExchange();
      const buySymbols = allSymbols.filter((symbol: any) => symbol.quote === AppConstants.QUOTE);
      const buyBuySell = this.getBuyBuySell(allSymbols, buySymbols);
      const buySellSell = this.getBuySellSell(allSymbols, buySymbols);
      this.pairs = {
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
      logger.info(`Foram encontrados ${this.pairs.size} pares disponíveis para triangulação.`)
    } catch (e: any) {
      logger.error('Ocorreu um erro ao obter pares de símbolos.', AppUtils.extractErrorMessage(e))
    }
  }

  private getBuyBuySell(allSymbols: any, buySymbols: any) {
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

  private getBuySellSell(allSymbols: any, buySymbols: any) {
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

  async processBuyBuySell() {
    logger.info('Process BBS - ' + new Date().toLocaleString());
    // try {
      this.pairs?.buyBuySell?.combinations?.forEach(async (candidate: any) => {
        let priceBuy1 = this.book[candidate.buy1.symbol]?.ask;
        let priceBuy2 = this.book[candidate.buy2.symbol]?.ask;
        let priceSell = this.book[candidate.sell.symbol]?.bid;
        // profitability:
        const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell;
        if (crossRate > AppConstants.PROFITABILITY && priceBuy1 && priceBuy2 && priceSell) {
          const qty1 = AppConstants.AMOUNT / priceBuy1; // comprar 300 dólares da moeda X = 300 ÷ Px (preço de X) = Qx
          const qty2 = qty1 / priceBuy2; // comprar Qx da moeda Y = Qx ÷ Py (preço de Y) = Qy
          const qty3 = qty2 / priceSell; // agora vou vender Qy da moeda Z = Qy ÷ P = Qz
          const symbols = [
            {
              symbol: candidate.buy1.symbol,
              ...this.doFilters('B', priceBuy1, qty1, candidate.buy1.filters)
            }, {
              symbol: candidate.buy2.symbol,
              ...this.doFilters('B', priceBuy2, qty2, candidate.buy2.filters)
            }, {
              symbol: candidate.sell.symbol,
              ...this.doFilters('S', priceSell, qty3, candidate.sell.filters)
            }
          ];
          NotificationService.playSound(NotificationSoundType.FOUND);
          // await executeStrategy('BBS', symbols);
          this.oportunityService.saveUpdate('BBS', symbols, crossRate);
        }
      });
    // } catch(e) {
    //   logger.error('Ocorreu um erro ao processar as oportunidades BBS.', e);
    // }
  }

  async processBuySellSell() {
    logger.info('Process BSS - ' + new Date().toLocaleString());
    // try {
      this.pairs?.buySellSell?.combinations?.forEach(async (candidate: any) => {
        const priceBuy = this.book[candidate.buy.symbol]?.ask;
        const priceSell1 = this.book[candidate.sell1.symbol]?.bid;
        const priceSell2 = this.book[candidate.sell2.symbol]?.bid;
        // buy1
        // let priceBuy = priceBuy = priceBuy?.ask
        // buy2
        // let priceSell1 = priceSell1Param = priceSell1?.bid
        // buy1
        // let priceSell2 = priceSell1Param = priceSell2?.bid
        // profitability strategy
        const crossRate = (1 / priceBuy) * priceSell1 * priceSell2;
        if (crossRate > AppConstants.PROFITABILITY && priceBuy && priceSell1 && priceSell2) {
          const qty1 = AppConstants.AMOUNT / priceBuy;
          const qty2 = qty1 / priceSell1;
          const qty3 = qty2 / priceSell2;
          const symbols = [
            {
              symbol: candidate.buy.symbol,
              ...this.doFilters('B', priceBuy, qty1, candidate.buy.filters)
            }, {
              symbol: candidate.sell1.symbol,
              ...this.doFilters('S', priceSell1, qty2, candidate.sell1.filters)
            }, {
              symbol: candidate.sell2.symbol,
              ...this.doFilters('S', priceSell2, qty3, candidate.sell2.filters)
            }
          ];
          NotificationService.playSound(NotificationSoundType.FOUND);
          // await executeStrategy('BSS', symbols);
          this.oportunityService.saveUpdate('BBS', symbols, crossRate);
          logger.info(`Oportunidade BSS em ${symbols.map(i => i.symbol).join(' > ')} = ${crossRate}.`);
          logger.info(`Inicial: ${AppConstants.QUOTE} ${AppConstants.AMOUNT}, Final: ${AppConstants.QUOTE} ${(AppConstants.AMOUNT / priceBuy) * priceSell1 * priceSell2}`);
        }
      });
    // } catch(e) {
    //   logger.error('Ocorreu um erro ao processar as oportunidades BBS.', e);
    // }
  }

  /**
   * Propósito: calcular a quantidade a ser negociada com base nos filtros do symbol.
   * Parâmetros: symbol, quantity.
   * Link: https://developers.binance.com/docs/binance-spot-api-docs/filters
   * Retorno: possibleQuantity.
   */
  private doFilters(side: string, price: number, quantity: number, filters: any[]) {
    try {
      filters.forEach(filter => {
        switch (filter.filterType) {
          case "PRICE_FILTER":
            if (price < filter.minPrice) {
              this.runFilterError(filter.filterType, 'minPrice');
            }
            if (price > filter.maxPrice) {
              this.runFilterError(filter.filterType, 'maxPrice');
            }
            price = this.handleStepSize(price, filter.tickSize);
            break;
          case "PERCENT_PRICE_BY_SIDE":
            if (side === "B") {
              // BUY: Order price <= weightedAveragePrice * bidMultiplierUp
              // BUY: Order price >= weightedAveragePrice * bidMultiplierDown
              if (price > filter.weightedAveragePrice * filter.bidMultiplierUp) {
                this.runFilterError(filter.filterType, 'bidMultiplierUp (BUY)');
              }
              if (price < filter.weightedAveragePrice * filter.bidMultiplierDown) {
                this.runFilterError(filter.filterType, 'bidMultiplierDown (BUY)');
              }
            } else if (side === "S") {
              // SELL: <= weightedAveragePrice * askMultiplierUp
              // SELL: >= weightedAveragePrice * askMultiplierDown
              if (price > filter.weightedAveragePrice * filter.askMultiplierUp) {
                this.runFilterError(filter.filterType, 'askMultiplierUp (SELL)');
              }
              if (price < filter.weightedAveragePrice * filter.askMultiplierDown) {
                this.runFilterError(filter.filterType, 'askMultiplierDown (SELL)');
              }
            }
            break;
          case "LOT_SIZE":
            if (quantity < filter.minQty) {
              this.runFilterError(filter.filterType, 'minQty');
            }
            if (quantity > filter.maxQty) {
              this.runFilterError(filter.filterType, 'maxQty');
            }
            quantity = this.handleStepSize(quantity, filter.stepSize);
            break;
          case "NOTIONAL":
            const notional = price * quantity;
            if (notional < filter.minNotional) {
              this.runFilterError(filter.filterType, 'minNotional');
            }
            if (notional > filter.maxNotional) {
              this.runFilterError(filter.filterType, 'maxNotional');
            }
            break;
        }
      });
      /**
        PS: Não implementei os filtros para ordens do tipo MARKET.
        OK >> filterType: "PRICE_FILTER", minPrice: "0.01000000", maxPrice: "1000000.00000000", tickSize: "0.01000000",
        OK >> filterType: "LOT_SIZE", minQty: "0.00001000", maxQty: "9000.00000000", stepSize: "0.00001000",
        filterType: "ICEBERG_PARTS", limit: 10,
        filterType: "MARKET_LOT_SIZE", minQty: "0.00000000", maxQty: "129.84957276", stepSize: "0.00000000",
        filterType: "TRAILING_DELTA", minTrailingAboveDelta: 10, maxTrailingAboveDelta: 2000, minTrailingBelowDelta: 10, maxTrailingBelowDelta: 2000,
        OK >> filterType: "PERCENT_PRICE_BY_SIDE", bidMultiplierUp: "5", bidMultiplierDown: "0.2", askMultiplierUp: "5", askMultiplierDown: "0.2", avgPriceMins: 5,
        OK >> filterType: "NOTIONAL", minNotional: "5.00000000", applyMinToMarket: true, maxNotional: "9000000.00000000", applyMaxToMarket: false, avgPriceMins: 5,
        filterType: "MAX_NUM_ORDERS", maxNumOrders: 200,
        filterType: "MAX_NUM_ALGO_ORDERS", maxNumAlgoOrders: 5,
      */
      return { price, quantity };
    } catch(e) {
      logger.error('Ocorreu um erro ao processar as oportunidades BSS.', e);
      // throw new Error();
    }
  }

  private runFilterError(name: string, error: string) {
    const msg = `## ERRO! NÃO PASSOU NO FILTRO: ${name}. ERRO: ${error}`;
    throw new Error(msg);
  }

  /**
   * Propósito: Trocar/remover casas decimais para obedecer ao step/tick size.
   * Exemplo: Se o ticksize for 0.0001, o valor dado for 25.21009, a correção deve transformar o número para: 25.21000.
   * @param quantity 
   * @param stepSize 
   * @returns quantity
   */
  private handleStepSize(quantity: number, stepSize: number) {
    return quantity - (quantity % stepSize);
  }

  /**
   * Propósito: Troca casas decimais por zero para obedecer ao tick size.
   * Exemplo: Se o ticksize for 0.0001, o valor dado for 25.21009, a correção deve transformar o número para: 25.21000.
   * @param quantity 
   * @param tickSize 
   * @returns quantity
   */
  private handleTickSize(quantity: number, tickSize: number) {
    const beforeDot = new String(quantity).split(".")[0];
    const afterDot = new String(quantity).split(".")[1];
    const qtyPositions = new String(tickSize).split(".")[1]?.length;
    if (!afterDot) return quantity;
    return Number(`${beforeDot}.${afterDot.substring(0, qtyPositions).padEnd(qtyPositions, '0')}`);
  }

  /*************
   * WEB SOCKET
   *************/

  private createWebSocket(callback: (event: any) => {}) {
    const ws = new WebSocket(AppConstants.URL_STREAM);
    ws.on('open', () => logger.info('Cliente WebSocket foi iniciado.'));
    ws.on('message', callback);
  }
  
  private processBuyBuySellOld() {
    this.pairs?.buyBuySell?.combinations?.forEach((candidate: any) => {
      // buy1
      let priceBuy1 = this.book[candidate.buy1.symbol]
      priceBuy1 = priceBuy1.ask
      // buy2
      let priceBuy2 = this.book[candidate.buy2.symbol]
      priceBuy2 = priceBuy1.ask
      // buy1
      let priceSell = this.book[candidate.sell.symbol]
      priceSell = priceSell.bid
      // profitability strategy
      const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell
      if (crossRate > AppConstants.PROFITABILITY && priceBuy1 && priceBuy2 && priceSell) {
        logger.info(`Oportunidade em ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell.symbol}.`);
      }
    })
  }
}








// ####################################################
// #################################################### END
// ####################################################








const orderService = new OrderService()
const exchangeService = new ExchangeService()

// TODO move variables to database (maybe)
let pairs: any = [];
const book: any = {}

let robotStatus: RobotStatusEnum = RobotStatusEnum.ACTIVE

// initializeService()

async function initializeService() {
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

async function executeStrategy(type: 'BSS' | 'BBS', symbols: any[]) {
  try {
    if (robotStatus !== RobotStatusEnum.STOPPED && robotStatus !== RobotStatusEnum.TRADING) {
      robotStatus = RobotStatusEnum.TRADING
      logger.info(`##### INICIANDO ESTRATÉGIA DE TRIANGULAÇÃO - ${type} ${symbols.map(i => i.symbol).join(' > ')} #####`)
      // ORDER 1
      logger.info(`EXECUTANDO TRANSAÇÃO 1: BUY ${symbols[0].symbol}`)
      const newOrder1 = {
        type: OrderTypeEnum.LIMIT,
        price: symbols[0].price,
        symbol: symbols[0].symbol,
        quantity: symbols[0].quantity.toFixed(5),
        side: OrderSideEnum.BUY
      }
      // await AppUtils.sleep(5)
      const order1: any = await orderService.newOrder(newOrder1)
      logger.info('ORDER 1', JSON.stringify(order1))
      // ORDER 2
      const transactionType = (type === 'BBS') ? OrderSideEnum.BUY : OrderSideEnum.SELL
      logger.info(`EXECUTANDO TRANSAÇÃO 2: ${transactionType} ${symbols[1].symbol}`)
      const newOrder2 = {
        type: OrderTypeEnum.LIMIT,
        price: symbols[1].price,
        symbol: symbols[1].symbol,
        quantity: symbols[1].quantity?.toFixed(5) || Number(order1.fills?.[0].qty).toFixed(5),
        side: transactionType
      }
      // await AppUtils.sleep(5)
      const order2: any = await orderService.newOrder(newOrder2)
      logger.info('ORDER 2', JSON.stringify(order2))
      // ORDER 3
      logger.info(`EXECUTANDO TRANSAÇÃO 3: SELL ${symbols[2].symbol}`)
      const newOrder3 = {
        type: OrderTypeEnum.LIMIT,
        price: symbols[2].price,
        symbol: symbols[2].symbol,
        quantity: Number(order1.fills?.[0].qty).toFixed(5),
        side: OrderSideEnum.SELL
      }
      // await AppUtils.sleep(5)
      const order3: any = await orderService.newOrder(newOrder3)
      logger.info('ORDER 3', JSON.stringify(order3))
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

function createWebSocket() {
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
      processBuySellSell(null, null, null)
    }
  })
}

async function processBuyBuySell() {
  logger.info('processBuyBuySell()' + new Date().toLocaleString())
  pairs?.buyBuySell?.combinations?.forEach(async (candidate: any) => {
    // buy1
    let priceBuy1 = book[candidate.buy1.symbol]
    priceBuy1 = priceBuy1?.ask
    // TODO quantas aunidades dá pra comprar com o AMOUNT que eu desejo diponibilizar para a triangulação??
    // buy2
    let priceBuy2 = book[candidate.buy2.symbol]
    priceBuy2 = priceBuy2?.ask
    // buy1
    let priceSell = book[candidate.sell.symbol]
    priceSell = priceSell?.bid
    // profitability strategy
    const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell
    if (crossRate > AppConstants.PROFITABILITY && priceBuy1 && priceBuy2 && priceSell) {
      const qty1 = AppConstants.AMOUNT / priceBuy1 // a primeira quantidade é do par com a moeda que eu já tenho
      const qty2 = qty1 / priceBuy2 // a segunda quantidade é de acordo com o par da segunda operação
      const qty3 = qty2 // nesse caso a conta é: quantidade da moeda da segunda operação pela moeda par da terceira operação
      const symbols = [
        {
          symbol: candidate.buy1.symbol,
          quantity: qty1,
          price: priceBuy1
        }, {
          symbol: candidate.buy2.symbol,
          quantity: qty2,
          price: priceBuy2
        }, {
          symbol: candidate.sell.symbol,
          quantity: qty3,
          price: priceSell
        }
      ]
      NotificationService.playSound(NotificationSoundType.FOUND)
      logger.info(`Oportunidade BBS em ${symbols.map(i => i.symbol).join(' > ')} = ${crossRate}.`)
      logger.info(`Inicial: ${AppConstants.QUOTE} ${AppConstants.AMOUNT}, Final ${AppConstants.QUOTE} ${((AppConstants.AMOUNT / priceBuy1) / priceBuy2) * priceSell}`)
      await executeStrategy('BBS', symbols)
    }
  })
}

async function processBuySellSell(priceBuyParam: any, priceSell1Param: any, priceSell2Param: any) {
  logger.info('processBuySellSell() ' + new Date().toLocaleString())
  pairs?.buySellSell?.combinations?.forEach(async (candidate: any) => {
    const qty1 = AppConstants.AMOUNT / priceBuyParam // a primeira quantidade é do par com a moeda que eu já tenho
    const qty2 = qty1 // a segunda quantidade é de acordo com o par da segunda operação
    const qty3 = qty2 / priceSell1Param // nesse caso a conta é: quantidade da moeda da segunda operação pela moeda par da terceira operação
    const symbols = [
      {
        symbol: candidate.buy.symbol,
        quantity: qty1,
        price: book[candidate.buy.symbol]?.ask
      }, {
        symbol: candidate.sell1.symbol,
        quantity: qty2,
        price: book[candidate.sell1.symbol]?.ask
      }, {
        symbol: candidate.sell2.symbol,
        quantity: qty3,
        price: book[candidate.sell2.symbol].bid
      }
    ]
    // TODO ñ sei o q tá acontecendo aqui
    const priceBuy = priceBuyParam
    const priceSell1 = priceSell1Param
    const priceSell2 = priceSell2Param

    // buy1
    // let priceBuy = priceBuy = priceBuy?.ask
    // buy2
    // let priceSell1 = priceSell1Param = priceSell1?.bid
    // buy1
    // let priceSell2 = priceSell1Param = priceSell2?.bid
    // profitability strategy
    const crossRate = (1 / priceBuy) * priceSell1 * priceSell2
    // const canBeTraded = this.canBeTraded(symbols)
    if (crossRate > AppConstants.PROFITABILITY && priceBuy && priceSell1 && priceSell2) {
      NotificationService.playSound(NotificationSoundType.FOUND)
      logger.info(`Oportunidade BSS em ${symbols.map(i => i.symbol).join(' > ')} = ${crossRate}.`)
      logger.info(`Inicial: ${AppConstants.QUOTE} ${AppConstants.AMOUNT}, Final: ${AppConstants.QUOTE} ${(AppConstants.AMOUNT / priceBuy) * priceSell1 * priceSell2}`)
      await executeStrategy('BSS', symbols)
    }
  })
}
