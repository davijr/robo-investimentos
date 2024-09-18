import { OrderService } from '@services/OrderService'
import express from 'express'

const orderRoutes = express.Router()

const orderService = new OrderService()

orderRoutes.get('/history', async (req: any, res: any) => {
  try {
    const history = await orderService.getHistory();
    if (!history) {
      return res.status(400).json({ message: 'No content.' });
    }
    return res.status(200).json(history);
  } catch (message) {
    return res.status(400).json({ message });
  }
})

export default orderRoutes
