import logger from '@config/logger'
import { scheduleJob } from 'node-schedule'

async function robotJob () {
  // const TIME_TO_DEACTIVATE_INACTIVE_USER: any = await robotParamService.get({ name: 'ROBOT_STATUS' })
  logger.info(new Date().toLocaleDateString() + ': RobotJob rodando')
}

export default scheduleJob('* * * * *', robotJob)
