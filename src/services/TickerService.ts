import logger from '@config/logger';
import { AppUtils } from '@utils/AppUtils';
import { BinanceApi } from './BinanceApi';
import axios from 'axios';

const binance = new BinanceApi();

export class TickerService {
  API_URL = process.env.API_URL;
  tickerUrl = '/v3/ticker/24hr';
  settings: any = {};

  async getAll(symbolsParam: any) {
    try {
      const allSymbols = AppUtils.chunk(symbolsParam, 500);
      const promises = allSymbols.map((symbolsToSearch: any) => this.get(symbolsToSearch));

      const results = await Promise.all(promises);
      const combinedResults = results.flatMap((result: any) => result.data);

      return combinedResults;
    } catch (e: any) {
      logger.error(`Erro ao efetuar chamada à API Binance. ${AppUtils.extractErrorMessage(e)}`);
      return null;
    }
  }

  async get(symbols: string[]) {
    return await axios.get(`${this.API_URL}${this.tickerUrl}?symbols=["${symbols.join('","')}"]`);
  }
}
