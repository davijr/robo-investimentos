import express from 'express'
import { SettingsService } from '@services/SettingsService'

const settingsRoutes = express.Router()

const settingsService = new SettingsService()

settingsRoutes.get('/', async (req: any, res: any) => {
  try {
    const result = settingsService.initSettings();
    if (!result) {
      return res.status(400).json({ message: 'No content.' })
    }
    return res.status(200).json(result);
  } catch (message) {
    return res.status(400).json({ message })
  }
})

settingsRoutes.post('/', async (req: any, res: any) => {
  try {
    const settings = req.params.status;
    await settingsService.setSettings(settings);
    if (!settings) {
      return res.status(400).json({ message: 'No content.' });
    }
    return res.status(200).json(settings);
  } catch (message) {
    return res.status(400).json({ message });
  }
})

export default settingsRoutes;
