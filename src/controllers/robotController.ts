import express from 'express'
import { RobotService } from '@services/RobotService'
import { RobotStatusEnum } from '@enum/RobotStatusEnum'

const robotRoutes = express.Router()

const robotService = new RobotService()

robotRoutes.get('/status', async (req: any, res: any) => {
  try {
    const result = await robotService.getRobotStatus()
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
    const status = req.params.status;
    await robotService.setRobotStatus(status);
    if (!status) {
      return res.status(400).json({ message: 'No content.' });
    }
    if (status === RobotStatusEnum.ACTIVE) {
      await robotService.run();
    }
    return res.status(200).json(status);
  } catch (message) {
    return res.status(400).json({ message });
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

robotRoutes.post('/add-money', async (req: any, res: any) => {
  try {
    return res.status(200).json(await robotService.addMoney());
  } catch (message) {
    return res.status(400).json({ message });
  }
});

export default robotRoutes
