import pino from 'pino'

const logger = pino({
  enabled: !(process.env.LOG_DISABLED),
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      // ignore: 'pid,hostname',
      // singleLine: false
    }
  }
});

// const transport = pino.transport({
//   target: 'pino/file',
//   options: { destination: process.env.LOG_FILE }
// });

// pino.transport(transport);

export default logger
