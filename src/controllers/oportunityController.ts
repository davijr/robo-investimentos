import { OportunityService } from '@services/OportunityService';
import express from 'express';

const oportunityRoutes = express.Router();
const oportunityService = new OportunityService();

oportunityRoutes.get('/', async (req: any, res: any) => {
  try {
    const oportunities = await oportunityService.get();
    if (!oportunities) {
      return res.status(400).json({ message: 'No content.' });
    }
    return res.status(200).json(oportunities);
  } catch (message) {
    return res.status(400).json({ message });
  }
})

export default oportunityRoutes;
