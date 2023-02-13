import '@config/environment'
import { database } from '@config/database'
import logger from '@config/logger'
import bodyParser from 'body-parser'
import express from 'express'
import mountRoutes from './routes'
import { RobotService } from '@services/RobotService'

(async () => {
  const robotService = new RobotService()

  try {
    await database.sync({ force: true })
  } catch (error) {
    logger.error(error)
  }
  // JobQueue.run()

  // get process pairs
  robotService.processPairs()
  robotService.processBuyBuySell()

})()

const app = express()
app.use(bodyParser.json())
app.use(express.static(`${process.cwd()}/robot-app/dist/app`))

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/robot-app/dist/app/index.html`)
})

mountRoutes(app)

export default app
