import dotenv from 'dotenv'
import logger from './logger'

(() => {
  const env = ''.concat(process.env.NODE_ENV as string).trim()
  if (env && env !== 'prod') {
    logger.info(`NODE_ENV=${env}`)
    dotenv.config({ path: `.env-${env}` })
  } else if (env === 'prod' || !env) {
    dotenv.config()
  }
})()

export default {}
