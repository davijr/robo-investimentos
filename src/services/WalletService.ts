import logger from '@config/logger';
import Account from '@schemas/Account';
import { AppUtils } from '@utils/AppUtils';
import { BinanceApi } from './BinanceApi';
import { SettingsService } from './SettingsService';

const binance = new BinanceApi();
const settingsService = new SettingsService();

// memory
let settings: any;

export class WalletService {
  accountUrl = '/v3/account';
  settings: any = {};

  setSettings(settingsParam: any) {
    settings = settingsParam;
  }

  async create (account: any) {
    const newAccount = new Account(account);
    await newAccount.save();
    return newAccount;
  }

  async update (account: any) {
    if (!account?._id) {
      return await this.create(account);
    }
    return await account.save();
  }

  async getAccountInfo () {
    let account: any = await Account.findOne();
    const updateInterval = AppUtils.diffSec(account?.updatedAt) || 999;
    if (!account || updateInterval > settings.balancesUpdateInterval) {
      logger.info('# Atualizando informações de saldos/balances (Binance).');
      if (!account) {
        account = new Account({});
      }
      account.account = await binance.get(this.accountUrl);
      await this.update(account);
      // await settingsService.updateField(settings, 'balancesUpdateInterval', new Date().getTime());
    }
    return account.account[0];
  }
}
