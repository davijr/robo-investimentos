import Exchange from '@schemas/Exchange';
import { AppConstants } from '@utils/AppContants';
import { AppUtils } from '@utils/AppUtils';
import axios from 'axios';

export class ExchangeService {
  API_URL = process.env.API_URL;
  EXCHANGE_UPDATE_INTERVAL = 60; // minutos

  async get (exchange?: any) {
    if (!exchange) {
      return await Exchange.findOne();
    }
    return await Exchange.find(exchange)
  }

  async create (exchange: any) {
    const newExchange = new Exchange(exchange);
    await newExchange.save();
    return newExchange;
  }

  async update (exchange: any) {
    if (!exchange?._id) {
      return await this.create(exchange);
    }
    return await exchange.save();
  }

  async getUpdateExchange() {
    let exchange: any = await Exchange.findOne();
    const diff = AppUtils.diffMinutes(new Date(exchange?.lastUpdate));
    if (!exchange || diff >= this.EXCHANGE_UPDATE_INTERVAL) {
      console.log('Atualizar informações da exchange (Binance).');
      exchange = await this.getExchangeInfoApi();
      exchange.lastUpdate = new Date().getTime();
      await this.update(exchange);
    }
    return this.filterSymbols(exchange);
  }

  async getExchangeInfoApi() {
    const response = await axios.get(`${this.API_URL}${AppConstants.URL_EXCHANGE_INFO}`);
    return response.data;
  }

  filterSymbols(exchange: any) {
    return exchange.symbols?.filter((symbol: any) => symbol.status === 'TRADING')
      .map((symbol: any) => {
        return {
          symbol: symbol.symbol,
          base: symbol.baseAsset,
          quote: symbol.quoteAsset,
          filters: symbol.filters
        }
      });
  }
}
