import '@config/environment'
import { database } from '@config/database'
import logger from '@config/logger'
import bodyParser from 'body-parser'
import express from 'express'
import { AppUtils } from '@utils/AppUtils'
import mountRoutes from './routes'
import JobQueue from './jobs/JobQueue'

(async () => {
  try {
    if (AppUtils.isDBSync()) {
      await database.sync()
    }
  } catch (error) {
    logger.error(error)
  }
  JobQueue.run()
})()

const app = express()
app.use(bodyParser.json())
app.use(express.static(`${process.cwd()}/robot-app/dist/app`))

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/robot-app/dist/app/index.html`)
})

mountRoutes(app)

export default app
