import logger from '@config/logger';
import Account from '@schemas/Account';
import { AppUtils } from '@utils/AppUtils';
import { BinanceApi } from './BinanceApi';

const binance = new BinanceApi();

// memory
let settings: any;

export class WalletService {
  accountUrl = '/v3/account';
  settings: any = {};

  setSettings(settingsParam: any) {
    settings = settingsParam;
  }

  async getAccountInfo () {
    const account: any = await Account.findOne();
    const updateInterval = AppUtils.diffMinutes(account?.lastUpdate);
    if (account && updateInterval < settings.myTradesUpdateInterval) {
      return account.account[0];
    } else if (account) {
      try {
        account.lastUpdate = new Date().getTime();
        account.account = await binance.get(this.accountUrl);
        await account.save();
        return account.account[0];
      } catch (e: any) {
        logger.error(`Erro ao efetuar chamada à API Binance. ${AppUtils.extractErrorMessage(e)}`);
        return null;
      }
    }
  }
}
