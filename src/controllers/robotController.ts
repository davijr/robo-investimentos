import express from 'express'
import { RobotService } from '@services/RobotService'

const robotRoutes = express.Router()

const robotService = new RobotService()

robotRoutes.get('/status', async (req: any, res: any) => {
  try {
    const result = robotService.getRobotStatus()
    if (!result) {
      return res.status(400).json({ message: 'No content.' })
    }
    return res.status(200).json(result)
  } catch (message) {
    return res.status(400).json({ message })
  }
})

robotRoutes.post('/status/:status', async (req: any, res: any) => {
  try {
    robotService.setRobotStatus(req.params.status)
    const result = robotService.getRobotStatus()
    if (!result) {
      return res.status(400).json({ message: 'No content.' })
    }
    return res.status(200).json(result)
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
