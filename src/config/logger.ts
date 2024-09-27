import { AppUtils } from '@utils/AppUtils'
import pino from 'pino'

// const LOGTAIL_SOURCE_TOKEN = `${process.env.LOGTAIL_SOURCE_TOKEN}`.trim()
const env = `${process.env.NODE_ENV}`.trim()
const logFilePath = process.env.LOG_FILE_PATH
  ? `${process.env.LOG_FILE_PATH}/logs/${env}-${AppUtils.getHourTimestamp()}.log`
  : `./logs/${env}-${AppUtils.getHourTimestamp()}.log`

const transport = pino.transport({
  targets: [
    {
      level: 'debug',
      target: 'pino-pretty',
      options: {
        destination: process.stdout.fd,
        colorize: true,
        translateTime: 'SYS:standard'
        // ignore: 'pid,hostname',
        // singleLine: false
      }
    }, {
      level: 'debug',
      target: 'pino-pretty',
      options: { destination: logFilePath, mkdir: true }
    }
  ]
})

const logger = pino({
  enabled: !(process.env.LOG_DISABLED)
}, transport)

export default logger
