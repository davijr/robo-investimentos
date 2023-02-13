import { WalletService } from '@services/WalletService'
import express from 'express'

const walletRoutes = express.Router()

const walletService = new WalletService()

walletRoutes.get('/account', async (req: any, res: any) => {
  try {
    const accountInfo = await walletService.getAccountInfo()
    if (!accountInfo) {
      return res.status(400).json({ message: 'No content.' })
    }
    return res.status(200).json(accountInfo)
  } catch (message) {
    return res.status(400).json({ message })
  }
})

export default walletRoutes
