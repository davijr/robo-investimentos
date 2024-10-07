import Settings from "@schemas/Settings";
import { AppConstants } from "@utils/AppContants";
import { RobotStatusEnum } from "@enum/RobotStatusEnum";

export class SettingsService {

  async initSettings() {
    const settings: any = await Settings.findOne();
    if (!settings) {
      const newSettings = new Settings({
        status: RobotStatusEnum.STOPPED,
        quote: AppConstants.QUOTE,
        profitability: AppConstants.PROFITABILITY,
        amount: AppConstants.AMOUNT,
        myTradesUpdateInterval: AppConstants.MYTRADES_UPDATE_INTERVAL,
        accountUpdateInterval: AppConstants.ACCOUNT_UPDATE_INTERVAL,
        exchangeUpdateInterval: AppConstants.EXCHANGE_UPDATE_INTERVAL,
        balancesUpdateInterval: AppConstants.BALANCES_UPDATE_INTERVAL,
        stopTimeAfterFinish: AppConstants.STOP_TIME_AFTER_FINISH,
        includeSymbols: AppConstants.INCLUDE_SYMBOLS,
        excludeSymbols: AppConstants.EXCLUDE_SYMBOLS,
        attemptIntervals: AppConstants.ATTEMPT_INTERVALS
      });
      return await newSettings.save();
    };
    // TODO carregar variáveis que não estão no banco ainda
    settings.includeSymbols = AppConstants.INCLUDE_SYMBOLS;
    settings.excludeSymbols = AppConstants.EXCLUDE_SYMBOLS;
    return settings;
  }

  async setSettings(newSettings: any) {
    const settings: any = await Settings.findOne();
    Object.keys(newSettings).forEach(key => {
      settings[key] = newSettings[key]
    });
    return await settings.save();
  }

  async setRobotStatus(status: string) {
    const settings: any = await Settings.findOne();
    settings.status = status;
    settings.lastUpdate = new Date().getTime();
    return await settings.save().status;
  }

  async updateField(settings: any, field: string, value: any) {
    return await settings.save();
  }

}