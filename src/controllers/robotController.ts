import express from 'express'
import { RobotService } from '@services/RobotService'

const robotRoutes = express.Router()

const robotService = new RobotService()

robotRoutes.get('/prices', async (req: any, res: any) => {
  try {
    const items = robotService.getPrices(req.query?.assets?.split(','))
    if (!items) {
      return res.status(400).json({ message: 'No content.' })
    }
    return res.status(200).json(items)
  } catch (message) {
    return res.status(400).json({ message })
  }
})

robotRoutes.get('/pairs', async (req: any, res: any) => {
  try {
    const items = robotService.getPairs()
    if (!items) {
      return res.status(400).json({ message: 'No content.' })
    }
    return res.status(200).json(items)
  } catch (message) {
    return res.status(400).json({ message })
  }
})

export default robotRoutes
