import logger from '@config/logger';
import Oportunity from '@schemas/Oportunity';
import { AppUtils } from '@utils/AppUtils';

export class OportunityService {
  API_URL = process.env.API_URL;

  async get (oportunity?: any) {
    if (!oportunity) {
      return await Oportunity.find();
    }
    return await Oportunity.find(oportunity);
  }

  async create (oportunity: any) {
    oportunity.key = oportunity.key || `${oportunity.strategy}_${oportunity.ordersRequest.map((i: any) => i.symbol).join('_')}_${oportunity.profitability}`;
    const newOportunity = new Oportunity(oportunity);
    await newOportunity.save();
    return newOportunity;
  }

  async update (oportunity: any) {
    if (!oportunity?._id) {
      return await this.create(oportunity);
    }
    return await oportunity.save();
  }

  public async saveUpdate(oportunity: any) {
    const { strategy, symbols, crossRate } = oportunity;
    const createOportunityKey = `${strategy}_${symbols.map((i: any) => i.symbol).join('_')}_${crossRate}`;
    const findOportunity = await Oportunity.findOne({id: oportunity._id});
    if (findOportunity) {
      const duration = AppUtils.diffSec(findOportunity?.timeFirstOffer);
      findOportunity.duration = duration;
      findOportunity.save(); // keep async
      logger.info(`### Oportunidade: strategy: ${strategy}, oportunityKey: ${createOportunityKey}, ` +
        `duration: ${duration} segundos. ###`);
    } else {
      const newOportunity = {
        strategy,
        ordersRequest: symbols,
        timeFirstOffer: new Date().getTime(),
        duration: 0,
        profitability: crossRate
      };
      await this.create(newOportunity);
    }

    // TODO ao criar a tabela Oportunity, criar um index pra a busca ficar mais rápida
  }

}
