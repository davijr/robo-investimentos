import pino from 'pino'

const logger = pino({
  enabled: !(process.env.LOG_DISABLED),
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'yyyy-dd-mm, h:MM:ss TT'
    }
  }
})

export default logger
