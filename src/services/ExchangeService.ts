import logger from '@config/logger';
import Exchange from '@schemas/Exchange';
import { AppConstants } from '@utils/AppContants';
import { AppUtils } from '@utils/AppUtils';
import axios from 'axios';
import { SettingsService } from './SettingsService';

const settingsService = new SettingsService();

// memory
let settings: any;

export class ExchangeService {
  API_URL = process.env.API_URL;

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

  setSettings(settingsParam: any) {
    settings = settingsParam;
  }

  async getUpdateExchange() {
    let exchange: any = await Exchange.findOne();
    const diff = AppUtils.diffSec(exchange?.updatedAt) || 999;
    if (!exchange || diff > settings.exchangeUpdateInterval) {
      logger.info('Atualizando informações da exchange (Binance).');
      if (!exchange) {
        exchange = new Exchange({});
      }
      const exchangeInfo = await this.getExchangeInfoApi();
      exchange.symbols = this.filterSymbols(exchangeInfo);
      exchange.rateLimits = exchangeInfo.rateLimits;
      await this.update(exchange);
      await settingsService.updateField(settings, 'exchangeUpdateInterval', new Date().getTime());
    }
    return exchange;
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
