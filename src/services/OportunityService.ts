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

  public async saveUpdate(strategy: String, symbols: any, crossRate: any) {
    const createOportunityKey = `${strategy}_${symbols.map((i: any) => i.symbol).join('_')}_${crossRate}`;
    const findOportunity = await Oportunity.findOne({key: createOportunityKey});
    logger.info(`Oportunidade BBS em ${createOportunityKey}. ` +
      `Tempo: ${AppUtils.diff(findOportunity?.firstOffer, findOportunity?.lastOffer, 'seconds')} segundos.`);

    if (findOportunity) {
      findOportunity.lastOffer = new Date().getTime();
      await findOportunity.save();
    } else {
      const oportunitySchema = new Oportunity({
        key: createOportunityKey,
        strategy,
        pair1: symbols[0].symbol,
        pair2: symbols[1].symbol,
        pair3: symbols[2].symbol,
        firstOffer: new Date().getTime(),
        lastOffer: new Date().getTime()
      });
      await oportunitySchema.save();
    }
  }

}
