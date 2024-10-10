import { AppUtils } from '@utils/AppUtils'
import pino from 'pino'

const LOGTAIL_SOURCE_TOKEN = `${process.env.LOGTAIL_SOURCE_TOKEN}`.trim();
if (!LOGTAIL_SOURCE_TOKEN) {
  throw new Error('LOGTAIL_SOURCE_TOKEN is required');
}

const env = `${process.env.NODE_ENV}`.trim();
const logFilePath = process.env.LOG_FILE_PATH
  ? `${process.env.LOG_FILE_PATH}/logs/${env}-${AppUtils.getHourTimestamp()}.log`
  : `./logs/${env}-${AppUtils.getHourTimestamp()}.log`;

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
    }, {
      target: '@logtail/pino',
      options: { sourceToken: LOGTAIL_SOURCE_TOKEN },
      level: 'debug'
    }
  ]
})

const logger = pino({
  enabled: !(process.env.LOG_DISABLED)
}, transport);

export default logger;
