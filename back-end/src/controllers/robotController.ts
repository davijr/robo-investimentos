import express from 'express'
import { RobotService } from '@services/RobotService'

const robotRoutes = express.Router()

const service = new RobotService()

robotRoutes.get('/prices', async (req: any, res: any) => {
  try {
    const items = await service.getPrices()
    if (!items) {
      return res.status(400).json({ message: 'No content.' })
    }
    return res.status(200).json(items)
  } catch (message) {
    return res.status(400).json({ message })
  }
})

export default robotRoutes
