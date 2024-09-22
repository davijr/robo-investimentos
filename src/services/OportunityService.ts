import logger from '@config/logger';
import Oportunity from '@schemas/Oportunity';
import { AppUtils } from '@utils/AppUtils';

export class OportunityService {
  API_URL = process.env.API_URL;

  async get (oportunity?: any) {
    if (!oportunity) {
      return await Oportunity.find();
    }
    return await Oportunity.find(oportunity)
  }

  async create (oportunity: any) {
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
    const findOportunity = await Oportunity.findOne({key: createOportunityKey});
    if (findOportunity) {
      const duration = AppUtils.diffSec(findOportunity?.timeFirstOffer);
      findOportunity.duration = duration;
      findOportunity.save(); // keep async
      logger.info(`### Oportunidade: strategy: ${strategy}, oportunityKey: ${createOportunityKey}, ` +
        `duration: ${duration} segundos. ###`);
    } else {
      const oportunitySchema = new Oportunity({
        key: createOportunityKey,
        strategy,
        ordersRequest: symbols,
        timeFirstOffer: new Date().getTime(),
        duration: 0,
        profitability: crossRate
      });
      await oportunitySchema.save();
    }

    // TODO ao criar a tabela Oportunity, criar um index pra a busca ficar mais rápida
  }

}
