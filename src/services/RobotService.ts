import logger from '@config/logger';
import { AppConstants } from '@utils/AppContants';
import { AppUtils } from '@utils/AppUtils';
import { OrderSideEnum } from '@enum/OrderSideEnum';
import { OrderTypeEnum } from '@enum/OrderTypeEnum';
import WebSocket from 'ws';
import { RobotStatusEnum } from '../enum/RobotStatusEnum';
import { ExchangeService } from './ExchangeService';
import { NotificationService, NotificationSoundType } from './NotificationService';
import { OportunityService } from './OportunityService';
import { OrderService } from './OrderService';
import { SettingsService } from './SettingsService';
import { WalletService } from './WalletService';
import { OportunityStatusEnum } from '@enum/OportunityStatusEnum';
import { OrderStatusEnum } from '@enum/OrderStatusEnum';
import { TickerService } from './TickerService';

const oportunityService = new OportunityService();
const orderService = new OrderService();
const exchangeService = new ExchangeService();
const settingsService = new SettingsService();
const walletSettings = new WalletService();
const tickerService = new TickerService();

// memory
let settings: any = {};
let exchangeInfo: any = {};
let allSymbols: any = {};
let pairs: any = {};
const book: any = {};

export class RobotService {

  async init() {
    settings = await settingsService.initSettings();
    exchangeService.setSettings(settings);
    orderService.setSettings(settings);
    walletSettings.setSettings(settings);
    const lastStatus = settings.status;
    logger.info(`# Settings carregada: ${AppUtils.stringify(settings)}`);
    await this.setRobotStatus(RobotStatusEnum.PREPARING);
    await this.processPairs();
    await this.populateOrderBook();
    await this.setRobotStatus(lastStatus);
    if ([RobotStatusEnum.ACTIVE, RobotStatusEnum.SEARCHING].includes(lastStatus)) {
      await this.run();
    } else if ([RobotStatusEnum.TRADING].includes(lastStatus)) {
      await this.verifyStatus();
    }
  }

  async run() {
    if (settings.robotStatus !== RobotStatusEnum.ERROR) {
      if (settings.robotStatus !== RobotStatusEnum.SEARCHING) {
        await this.setRobotStatus(RobotStatusEnum.SEARCHING);
      }
      this.createWebSocket(async (event: any) => {
        this.parseStream(event);
        if (![RobotStatusEnum.STOPPED, RobotStatusEnum.TRADING, RobotStatusEnum.ERROR, RobotStatusEnum.PREPARING].includes(settings.robotStatus)) {
          this.processBuyBuySell();
          this.processBuySellSell();
        }
      });
    }
  }

  private async verifyStatus() {
    // get last order
    const lastOportunity: any = await oportunityService.getLast();
    const qtyOrdersFilled = lastOportunity?.ordersResponse?.filter((o: any) => o.status === OrderStatusEnum.FILLED).length;
    if (qtyOrdersFilled === 3 && lastOportunity.status === OportunityStatusEnum.SUCCESS) {
      this.run();
    } else if (qtyOrdersFilled > 1) {
      const lastOrderResponse = lastOportunity?.ordersResponse?.at(-1); // last element
      const order: any = await orderService.getFinalStatus(lastOrderResponse);
      if (order.status === OrderStatusEnum.FILLED) {
        lastOportunity.ordersResponse.push(AppUtils.validateJson(order));
        lastOportunity.status = OportunityStatusEnum.SUCCESS;
        await oportunityService.update(lastOportunity);
        this.run();
      }
    } else if (qtyOrdersFilled === 1) {
      const lastOrderResponse = lastOportunity?.ordersResponse?.at(-1); // last element
      await orderService.getFinalStatus(lastOrderResponse);
    }
  }

  private async populateOrderBook() {
    const symbols = allSymbols.map((s: any) => s.symbol);
    const result: any = await tickerService.getAll(symbols);
    result?.forEach((element: any) => {
      book[element.symbol] = {
        ask: AppUtils.toFixed(element.askPrice),
        bid: AppUtils.toFixed(element.bidPrice),
        time: element.closeTime,
        baseVolume: element.volume,
        quoteVolume: element.quoteVolume
      };
    });
    logger.info(`# Prices loaded with ${Object.keys(book).length} symbols.`);
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
      // console.log('element', element);
      book[element.s] = {
        ask: AppUtils.toFixed(element.a || element.c),
        bid: AppUtils.toFixed(element.b || element.c),
        time: element.E,
        baseVolume: element.v,
        quoteVolume: element.q
      };
    });
  }

  getRobotStatus() {
    return settings.robotStatus;
  }

  async setRobotStatus(status: RobotStatusEnum) {
    settings.robotStatus = status;
    await settingsService.setRobotStatus(status);
    logger.info(`*************************************** ROBOT STATUS: ${status} ***************************************`);
  }

  getPairs() {
    return pairs;
  }

  getBook() {
    return book;
  }

  getExchangeInfo() {
    return exchangeInfo;
  }

  getPrices(assets = []) {
    const prices: any = []
    assets.forEach(asset => {
      const symbol = asset + settings.quote
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

  async processPairs() {
    try {
      exchangeInfo = await exchangeService.getUpdateExchange();
      allSymbols = exchangeInfo.symbols;
      const buySymbols = allSymbols.filter((symbol: any) => symbol.quote === settings.quote);
      const buyBuySell = this.getBuyBuySell(allSymbols, buySymbols);
      const buySellSell = this.getBuySellSell(allSymbols, buySymbols);
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
      };
      orderService.setAllSymbols(allSymbols);
      logger.info(`# Foram encontrados ${pairs.size} pares disponíveis para triangulação.`);
    } catch (e: any) {
      await this.setRobotStatus(RobotStatusEnum.ERROR);
      logger.error('(!) Ocorreu um erro ao obter pares de símbolos.', AppUtils.extractErrorMessage(e));
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
    for (const candidate of pairs?.buyBuySell?.combinations) {
      try {
        if (settings.robotStatus === RobotStatusEnum.SEARCHING) {
          // console.log(`book[candidate.buy1.symbol]?.ask: ${book[candidate.buy1.symbol]?.ask}, book[candidate.buy2.symbol]?.ask: ${book[candidate.buy2.symbol]?.ask}, book[candidate.sell2.symbol]?.bid: ${book[candidate.sell.symbol]?.bid}`)
          const p1 = book[candidate.buy1.symbol]?.ask;
          const p2 = book[candidate.buy2.symbol]?.ask;
          const p3 = book[candidate.sell.symbol]?.bid;
          const crossRate = (1 / p1) * (1 / p2) * p3;
          if (crossRate >= settings.profitability && p1 && p2 && p3) {
            // logger.info(`crossRate[${crossRate}] = (1 / priceBuy1[${priceBuy1}]) * (1 / priceBuy2[${priceBuy2}]) * priceSell2[${priceSell}]`);
            // logger.info(`BBS - ${candidate.buy1.symbol} (${priceBuy1}) > ${candidate.buy2.symbol} (${priceBuy2}) > ${candidate.sell.symbol} (${priceSell}) = crossRate: ${crossRate}`);
            const q1 = this.applyValidations(settings.amount / p1, candidate.buy1.filters, 'LOT_SIZE');
            const q2 = this.applyValidations(q1 / p2, candidate.buy2.filters, 'LOT_SIZE');
            const q3 = this.applyValidations(q2, candidate.sell.filters, 'LOT_SIZE');
            const finalAmount = (q3 * p3) - settings.amount;
            const operations = [
              {
                symbol: candidate.buy1.symbol,
                price: p1,
                quantity: q1
                // ...this.doFilters('B', priceBuy1, qty1, candidate.buy1.filters)
              }, {
                symbol: candidate.buy2.symbol,
                price: p2,
                quantity: q2
                // ...this.doFilters('B', priceBuy2, qty2, candidate.buy2.filters)
              }, {
                symbol: candidate.sell.symbol,
                price: p3,
                quantity: q3
                // ...this.doFilters('S', priceSell, qty3, candidate.sell.filters)
              }
            ];
            if (![RobotStatusEnum.ERROR, RobotStatusEnum.TRADING].includes(settings.robotStatus)
              && !this.hasInvalidParams('BBS', crossRate, operations) && this.isFiltersValid('BBS', p1, q1, candidate.buy1.filters)) {
              await this.setRobotStatus(RobotStatusEnum.TRADING);
              NotificationService.playSound(NotificationSoundType.FOUND);
              const oportunidade = await oportunityService.create({ strategy: 'BBS', symbols: operations, profitability: crossRate, initialValue: settings.amount, ordersRequest: operations });
              logger.info(`# BBS: BUY qty1 = ${q1} ${candidate.buy1.symbol}(${p1}), BUY qty2 = ${q2} ${candidate.buy2.symbol}(${p2}), SELL qty3 = ${q3} ${candidate.sell.symbol}(${p3})`);
              logger.info(`# Previsão de retorno de aproximadamente: ${finalAmount} ${settings.quote}`);
              await this.executeStrategy(oportunidade);
            }
          } else if (crossRate > 1.00075) {
            logger.warn(`BBS - crossRate: ${crossRate} = ${candidate.buy1.symbol} (${p1}) > ${candidate.buy2.symbol} (${p2}) > ${candidate.sell.symbol} (${p3})`);
          }
        }
      } catch (e: any) {
        await this.setRobotStatus(RobotStatusEnum.ERROR);
        logger.error(`Ocorreu algum erro ao avaliar a oportunidade. Erro: ${AppUtils.extractErrorMessage(e)}`);
      }
    }
  }

  async processBuySellSell() {
    for (const candidate of pairs?.buySellSell?.combinations) {
      try {
        if (settings.robotStatus === RobotStatusEnum.SEARCHING) {
          // console.log(`book[candidate.buy.symbol]?.ask: ${book[candidate.buy.symbol]?.ask}, book[candidate.sell1.symbol]?.bid: ${book[candidate.sell1.symbol]?.bid}, book[candidate.sell2.symbol]?.bid: ${book[candidate.sell2.symbol]?.bid}`)
          const p1 = book[candidate.buy.symbol]?.ask;
          const p2 = book[candidate.sell1.symbol]?.bid;
          const p3 = book[candidate.sell2.symbol]?.bid;
          const crossRate = (1 / p1) * p2 * p3;
          if (crossRate >= settings.profitability && p1 && p2 && p3) {
            // logger.info(`crossRate[${crossRate}] = (1 / priceBuy[${priceBuy}]) * priceSell1[${priceSell1}] * priceSell2[${priceSell2}]`);
            // logger.debug(`BSS - ${candidate.buy.symbol} (${priceBuy}) > ${candidate.sell1.symbol} (${priceSell1}) > ${candidate.sell2.symbol} (${priceSell2}) = crossRate: ${crossRate}`);
            const q1 = this.applyValidations(settings.amount / p1, candidate.buy.filters, 'LOT_SIZE');
            const q2 = this.applyValidations(q1, candidate.sell1.filters, 'LOT_SIZE');
            const q3 = this.applyValidations(q2 * p2, candidate.sell2.filters, 'LOT_SIZE');
            const finalAmount = (q3 * p3) - settings.amount;
            // logger.info(`# Investindo ${settings.quote} ${settings.amount}, retorna ${settings.quote} ${((settings.amount / priceBuy) / priceSell1) * priceSell2}`);
            const operations = [
              {
                symbol: candidate.buy.symbol,
                price: p1,
                quantity: q1
                // ...this.doFilters('B', priceBuy, qty1, candidate.buy.filters)
              }, {
                symbol: candidate.sell1.symbol,
                price: p2,
                quantity: q2
                // ...this.doFilters('S', priceSell1, qty2, candidate.sell1.filters)
              }, {
                symbol: candidate.sell2.symbol,
                price: p3,
                quantity: q3
                // ...this.doFilters('S', priceSell2, qty3, candidate.sell2.filters)
              }
            ];
            if (![RobotStatusEnum.ERROR, RobotStatusEnum.TRADING].includes(settings.robotStatus)
              && !this.hasInvalidParams('BSS', crossRate, operations) && this.isFiltersValid('BSS', p1, q1, candidate.buy.filters)) {
              await this.setRobotStatus(RobotStatusEnum.TRADING);
              NotificationService.playSound(NotificationSoundType.FOUND);
              const oportunidade = await oportunityService.create({ strategy: 'BSS', profitability: crossRate, initialValue: settings.amount, ordersRequest: operations });
              logger.info(`# BSS: BUY qty1 = ${q1} ${candidate.buy.symbol}(${p1}), SELL qty2 = ${q2} ${candidate.buy.symbol}(${p2}), SELL qty3 = ${q3} ${candidate.sell1.symbol}(${p3})`);
              logger.info(`# Previsão de retorno de aproximadamente: ${finalAmount} ${settings.quote}`);
              await this.executeStrategy(oportunidade);
            }
          } else if (crossRate > 1.00075) {
            logger.warn(`BSS - crossRate: ${crossRate} = ${candidate.buy.symbol} (${p1}) > ${candidate.sell1.symbol} (${p2}) > ${candidate.sell2.symbol} (${p3})`);
          }
        }
      } catch (e: any) {
        await this.setRobotStatus(RobotStatusEnum.ERROR);
        logger.error(`Ocorreu algum erro ao avaliar a oportunidade. Erro: ${AppUtils.extractErrorMessage(e)}`);
      }
    }
  }

  private applyValidations(valueParam: number, filters: any[], filterName: 'PRICE_FILTER' | 'LOT_SIZE') {
    try {
      // console.log(`applyValidations() valueParam: ${valueParam}, filters: ${filters.toString()}, filterName: ${filterName}`);
      // const newValue = AppUtils.toFixed(valueParam);
      const filter = filters.find((f: any) => f.filterType === filterName);
      // console.log(`>>>>>>>>>>>>>>>>>>> valueParam: ${valueParam}, filter: ${JSON.stringify(filter)}`);
      const final = this.handleTickSize(valueParam, AppUtils.toFixed(filter.tickSize || filter.stepSize));
      // console.log(`>>>>>>>>>>>>>>>>>>> final(handleTickSize): ${final}`);
      
      //  POR QUESTÃO DE ENTENDIMENTO, VOU FAZER AQUI DENTRO A VALIDAÇÃO DO FILTRO LOT_SIZE
      if (final < AppUtils.toFixed(filter.minQty)) {
        this.runFilterError(filter.filterType, `quantity: ${final} < minQty: ${filter.minQty}`);
      }
      if (final > AppUtils.toFixed(filter.maxQty)) {
        this.runFilterError(filter.filterType, `quantity: ${final} > maxQty: ${filter.maxQty}`);
      }

      return final;
    } catch (e) {
      console.error(AppUtils.extractErrorMessage(e));
      throw new Error(AppUtils.extractErrorMessage(e));
    }
  }

  // private applyQuantityFilter(quantity: number, filters: any[]) {
  //   const filter = filters.find((f: any) => f.filterType === 'LOT_SIZE');
  //   return this.handleTickSize(quantity, AppUtils.toFixed(filter.stepSize));
  // }


  private hasInvalidParams(strategy: 'BBS' | 'BSS', crossRate: number, symbols: any[]) {
    if (symbols.some(i => !i.symbol || !i.price)) {
      const msg = `strategy: ${strategy} - crossRate: ${crossRate} = ${symbols.map(i => i.symbol + ' (' + i.price + ')').join(' > ')}`;
      logger.warn('Encontrada uma oportunidade, porém, a triangulação possui parâmetros inválidos. ' + msg);
      return true;
    }
    const qty3 = symbols[2].quantity * symbols[2].price;
    const profitability = (qty3 - settings.amount) / settings.amount;
    const hasProfit = profitability > 0;
    const valorInicial = `valorInicial: ${settings.amount} ${settings.quote}`;
    const valorFinal = `valorFinal: ${qty3} ${settings.quote}`;
    if (!hasProfit) {
      const msg = `strategy: ${strategy} - crossRate: ${crossRate} = ${symbols.map(i => i.symbol + ' (' + i.quantity + '/' + i.price + ')').join(' > ')}, ${valorInicial}, ${valorFinal}`;
      logger.warn('Encontrada uma oportunidade, porém, o resultado proposto não parece ser lucrativo. ' + msg);
      return true;
    }
    return false;
  }

  /**
   * Propósito: calcular a quantidade a ser negociada com base nos filtros do symbol.
   * Parâmetros: symbol, quantity.
   * Link: https://developers.binance.com/docs/binance-spot-api-docs/filters
   * Retorno: possibleQuantity.
   */
  private isFiltersValid(strategy: string, price: number, quantity: number, filters: any[]): boolean {
    try {
      for (const filter of filters) {
        switch (filter.filterType) {
          case "PRICE_FILTER":
            if (price < AppUtils.toFixed(filter.minPrice)) {
              this.runFilterError(filter.filterType, `price: ${price} < minPrice: ${filter.minPrice}`);
              return false;
            }
            if (price > AppUtils.toFixed(filter.maxPrice)) {
              this.runFilterError(filter.filterType, `price: ${price} > maxPrice: ${filter.maxPrice}`);
              return false;
            }
            // price = this.handleTickSize(price, AppUtils.toFixed(filter.tickSize));
          break;
          /* case "PERCENT_PRICE_BY_SIDE":
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
            break; */
          case "LOT_SIZE":
            if (quantity < AppUtils.toFixed(filter.minQty)) {
              this.runFilterError(filter.filterType, `quantity: ${quantity} < minQty: ${filter.minQty}`);
              return false;
            }
            if (quantity > AppUtils.toFixed(filter.maxQty)) {
              this.runFilterError(filter.filterType, `quantity: ${quantity} > maxQty: ${filter.maxQty}`);
              return false;
            }
            // quantity = this.handleTickSize(quantity, AppUtils.toFixed(filter.stepSize));
          break;
          case "NOTIONAL":
            const notional = price * quantity;
            if (notional < AppUtils.toFixed(filter.minNotional)) {
              this.runFilterError(filter.filterType, `price: ${price} * quantity: ${quantity} = notional: ${notional} < minNotional: ${filter.minNotional}`);
              return false;
            }
            if (notional > AppUtils.toFixed(filter.maxNotional)) {
              this.runFilterError(filter.filterType, `price: ${price} * quantity: ${quantity} = notional: ${notional} > maxNotional: ${filter.maxNotional}`);
              return false;
            }
          break;
        }
      }
      return true;
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
      // return { price, quantity };
    } catch(e) {
      logger.warn(`Ocorreu um erro ao processar a oportunidade. Estratégia: ${strategy}. ${AppUtils.extractErrorMessage(e)}`);
      // throw new Error(AppUtils.extractErrorMessage(e));
      // throw new Error();
      return false;
    }
  }

  private runFilterError(name: string, error: string) {
    const msg = `## ERRO! NÃO PASSOU NO FILTRO: ${name}. ERRO: ${error}`;
    logger.warn(msg);
    throw new Error(msg);
  }

  /**
   * Propósito: Trocar/remover casas decimais para obedecer ao step/tick size.
   * Exemplo: Se o ticksize for 0.0001, o valor dado for 25.21009, a correção deve transformar o número para: 25.21000.
   * @param value 
   * @param stepSize 
   * @returns newValue
   */
  private handleStepSize(value: number, stepSize: number) {
    const newValue = value - (value % stepSize);
    // console.log('value era: ' + value + ' e agora é: ' + newValue);
    return newValue;
  }

  /**
   * Propósito: Troca casas decimais por zero para obedecer ao tick size.
   * Exemplo: Se o ticksize for 0.0001, o valor dado for 25.21009, a correção deve transformar o número para: 25.21000.
   * @param quantity 
   * @param tickSize 
   * @returns quantity
   */
  private handleTickSize(quantity: number, tickSize: number) {
    // console.log(`>>>>>>>>>>>>>>>>>>>>>> handleTickSize() quantity: ${quantity}, tickSize: ${tickSize}`);
    const beforeDot = new String(quantity).split(".")[0];
    const afterDot = new String(quantity).split(".")[1];
    const qtyPositions = new String(AppUtils.toFixed(tickSize)).split(".")[1]?.length || 0;
    if (!afterDot) return quantity;
    const newNumber = AppUtils.toFixed(`${beforeDot}.${afterDot.substring(0, qtyPositions).padEnd(qtyPositions, '0')}`);
    // logger.debug(`# handleTickSize(quantity: ${quantity}, tickSize: ${tickSize}) -> result: ${newNumber}`);
    return newNumber;
  }

  /**
   * EXECUTE STRATEGY
   */
  async executeStrategy(oportunity: any) {
    const { strategy } = oportunity;
    const operations = oportunity.ordersRequest;
    try {
      logger.info('##################### INICÍO DA OPERAÇÃO #####################');
      logger.info(`# OPORTUNIDADE: ${oportunity.key}`);
      logger.info(`# VALOR INICIAL: ${settings.amount} ${settings.quote}`);
      // operations.forEach((symbol: any, index: number) => {
      //   let transactionType = (index === 0) ? OrderSideEnum.BUY : OrderSideEnum.SELL;
      //   transactionType = (index === 1 && strategy === 'BSS') ? OrderSideEnum.SELL : transactionType;
      //   logger.info(`# OPERAÇÃO ${index + 1}: ${transactionType} ${operations[index].quantity} ${operations[index].symbol} BY ${operations[index].price}`);
      // });
      if (!process.env.NODE_ENV?.includes('dev')) {
        logger.info('==================== EXECUTAR ORDEM 1 ====================');
        // logger.info(`# EXECUTANDO TRANSAÇÃO 1: BUY ${operations[0].quantity} ${operations[0].symbol} BY ${operations[0].price}`);
        const newOrder1 = {
          type: OrderTypeEnum.LIMIT,
          price: operations[0].price,
          symbol: operations[0].symbol,
          quantity: operations[0].quantity,
          side: OrderSideEnum.BUY
        };
        logger.info(`# EXECUTANDO TRANSAÇÃO 1 - Side: ${newOrder1.side} ${newOrder1.quantity} ${newOrder1.symbol} BY ${newOrder1.price}`);
        let order1: any = await orderService.newOrder(newOrder1);

        if (order1) {
          if ([OrderStatusEnum.NEW, OrderStatusEnum.PARTIALLY_FILLED].includes(order1.status)) {
            oportunity.ordersResponse.push(AppUtils.validateJson(order1));
            order1 = await orderService.getFinalStatus(order1);
          }
          if (order1.status === OrderStatusEnum.FILLED) {
            oportunity.ordersResponse = [];
            oportunity.ordersResponse.push(AppUtils.validateJson(order1));
            oportunity.initialValue = order1.cummulativeQuoteQty;
            await oportunityService.update(oportunity);
            // logger.info('ORDER 1', JSON.stringify(order1));

            logger.info('==================== EXECUTAR ORDEM 2 ====================');
            const secondTransactionType = (strategy === 'BBS') ? OrderSideEnum.BUY : OrderSideEnum.SELL
            // logger.info(`# EXECUTANDO TRANSAÇÃO 2: ${secondTransactionType} ${operations[1].quantity} ${operations[1].symbol} BY ${operations[1].price}`)
            const newOrder2 = {
              type: OrderTypeEnum.LIMIT,
              price: operations[1].price,
              symbol: operations[1].symbol,
              quantity: operations[1].quantity,
              side: secondTransactionType
            }
            logger.info(`# EXECUTANDO TRANSAÇÃO 2 - Side: ${newOrder2.side} ${newOrder2.quantity} ${newOrder2.symbol} BY ${newOrder2.price}`);
            let order2: any = await orderService.newOrder(newOrder2);

            if (order2) {
              if ([OrderStatusEnum.NEW, OrderStatusEnum.PARTIALLY_FILLED].includes(order2.status)) {
                oportunity.ordersResponse.push(AppUtils.validateJson(order2));
                order2 = await orderService.getFinalStatus(order2);
              }
              if (order2.status === OrderStatusEnum.FILLED) {
                oportunity.ordersResponse.push(AppUtils.validateJson(order2));
                await oportunityService.update(oportunity);
                // logger.info('ORDER 2', JSON.stringify(order2))
                logger.info('==================== EXECUTAR ORDEM 3 ====================');
                const newOrder3 = {
                  type: OrderTypeEnum.LIMIT,
                  price: operations[2].price,
                  symbol: operations[2].symbol,
                  quantity: operations[2].quantity,
                  side: OrderSideEnum.SELL
                };
                logger.info(`# EXECUTANDO TRANSAÇÃO 3 - Side: ${newOrder3.side} ${newOrder3.quantity} ${newOrder3.symbol} BY ${newOrder3.price}`);
                let order3: any = await orderService.newOrder(newOrder3);

                if (order3) {
                  if ([OrderStatusEnum.NEW, OrderStatusEnum.PARTIALLY_FILLED].includes(order3.status)) {
                    oportunity.ordersResponse.push(AppUtils.validateJson(order3));
                    order3 = await orderService.getFinalStatus(order3);
                  }
                  if (order3.status === OrderStatusEnum.FILLED) {
                    oportunity.ordersResponse.push(AppUtils.validateJson(order3));
                    oportunity.status = OportunityStatusEnum.SUCCESS;
                    let finalValue = 0;
                    try {
                      finalValue = AppUtils.toFixed(order3.cummulativeQuoteQty);
                    } catch (e) {
                      finalValue = newOrder3.price * newOrder3.quantity;
                    }
                    oportunity.finalValue = finalValue;
                    logger.info(`# VALOR FINAL: ${finalValue} ${settings.quote}`);
                    await oportunityService.update(oportunity);
                    NotificationService.playSound(NotificationSoundType.COMPLETED);
                    logger.info('################### OPERAÇÃO COMPLETADA ####################');
                    logger.warn(`################### ESPERAR ${settings.stopTimeAfterFinish} SEGUNDOS #####################`);
                    await AppUtils.sleep(settings.stopTimeAfterFinish);
                    await this.setRobotStatus(RobotStatusEnum.SEARCHING);
                  } else {
                    await this.runError(OportunityStatusEnum.ERROR_ORDER3, {}, oportunity);
                  }
                } else {
                  await this.runError(OportunityStatusEnum.ERROR_ORDER3_BLANK, {}, oportunity);
                }
              } else {
                await this.runError(OportunityStatusEnum.ERROR_ORDER2, {}, oportunity);
              }
            } else {
              await this.runError(OportunityStatusEnum.ERROR_ORDER2_BLANK, {}, oportunity);
            }
          } else {
            await this.runError(OportunityStatusEnum.ERROR_ORDER1, {}, oportunity);
          }
        } else {
          await this.runError(OportunityStatusEnum.ERROR_ORDER1_BLANK, {}, oportunity);
        }
      } else {
        logger.info('##################### FIM DA OPERAÇÃO #####################');
        logger.warn(`################### ESPERAR ${settings.stopTimeAfterFinish} SEGUNDOS #####################`);
        await AppUtils.sleep(settings.stopTimeAfterFinish);
        await this.setRobotStatus(RobotStatusEnum.SEARCHING);
      }
    } catch (e: any) {
      await this.runError(OportunityStatusEnum.ERROR_OTHER, e, oportunity);
    }
  }

  private async runError(status: string, error: any, oportunity: any) {
    const msg = `# Erro ao tentar executar ordem: ${status}. ${AppUtils.extractErrorMessage(error)}`;
    oportunity.status = status;
    oportunity.error = msg;
    await oportunityService.update(oportunity);
    await this.setRobotStatus(RobotStatusEnum.ERROR);
    NotificationService.playSound(NotificationSoundType.ERROR);
    logger.error(msg);
    logger.error('##################### PARAR ROBÔ #####################');
    AppUtils.sleep(settings.stopTimeAfterFinish);
  }

  public async addMoney() {
    const sellCoinToUSTD = {
      type: OrderTypeEnum.MARKET,
      symbol: 'BTCUSDT',
      quantity: 0.1,
      side: OrderSideEnum.SELL
    };
    return await orderService.newOrder(sellCoinToUSTD);
  }

  /*************
   * WEB SOCKET
   *************/

  private createWebSocket(callback: (event: any) => {}) {
    const ws = new WebSocket(AppConstants.URL_STREAM);
    ws.on('open', () => logger.info('Cliente WebSocket foi iniciado.'));
    ws.on('message', callback);
  }
  
  // private processBuyBuySellOld() {
  //   pairs?.buyBuySell?.combinations?.forEach((candidate: any) => {
  //     // buy1
  //     let priceBuy1 = book[candidate.buy1.symbol]
  //     priceBuy1 = priceBuy1.ask
  //     // buy2
  //     let priceBuy2 = book[candidate.buy2.symbol]
  //     priceBuy2 = priceBuy1.ask
  //     // buy1
  //     let priceSell = book[candidate.sell.symbol]
  //     priceSell = priceSell.bid
  //     // profitability strategy
  //     const crossRate = (1 / priceBuy1) * (1 / priceBuy2) * priceSell
  //     if (crossRate > settings.profitability && priceBuy1 && priceBuy2 && priceSell) {
  //       logger.info(`Oportunidade em ${candidate.buy1.symbol} > ${candidate.buy2.symbol} > ${candidate.sell.symbol}.`);
  //     }
  //   })
  // }
}








// ####################################################
// #################################################### END
// ####################################################





/**


// TODO move variables to database (maybe)
// let pairs: any = [];
// const book: any = {}

// let robotStatus: RobotStatusEnum = RobotStatusEnum.ACTIVE

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
    if (crossRate > settings.profitability && priceBuy1 && priceBuy2 && priceSell) {
      const qty1 = settings.amount / priceBuy1 // a primeira quantidade é do par com a moeda que eu já tenho
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
      logger.info(`Inicial: ${settings.quote} ${settings.amount}, Final ${settings.quote} ${((settings.amount / priceBuy1) / priceBuy2) * priceSell}`)
      await executeStrategy('BBS', symbols)
    }
  })
}

async function processBuySellSell(priceBuyParam: any, priceSell1Param: any, priceSell2Param: any) {
  logger.info('processBuySellSell() ' + new Date().toLocaleString())
  pairs?.buySellSell?.combinations?.forEach(async (candidate: any) => {
    const qty1 = settings.amount / priceBuyParam // a primeira quantidade é do par com a moeda que eu já tenho
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
    if (crossRate > settings.profitability && priceBuy && priceSell1 && priceSell2) {
      NotificationService.playSound(NotificationSoundType.FOUND)
      logger.info(`Oportunidade BSS em ${symbols.map(i => i.symbol).join(' > ')} = ${crossRate}.`)
      logger.info(`Inicial: ${settings.quote} ${settings.amount}, Final: ${settings.quote} ${(settings.amount / priceBuy) * priceSell1 * priceSell2}`)
      await executeStrategy('BSS', symbols)
    }
  })
}

*/