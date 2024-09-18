import Settings from "@schemas/Settings";
import { AppConstants } from "@utils/AppContants";
import { RobotStatusEnum } from "src/enum/RobotStatusEnum";

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
        includeSymbols: AppConstants.INCLUDE_SYMBOLS,
        excludeSymbols: AppConstants.EXCLUDE_SYMBOLS,
        lastUpdate: new Date().getTime()
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
    settings.lastUpdate = new Date().getTime();
    return await settings.save();
  }

  async setRobotStatus(status: string) {
    const settings: any = await Settings.findOne();
    settings.status = status;
    settings.lastUpdate = new Date().getTime();
    return await settings.save().status;
  }

}