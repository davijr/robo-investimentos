import '@config/environment';
import logger from '@config/logger';
import { RobotService } from '@services/RobotService';
import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import mountRoutes from './routes';

const app = express();
let exchangeInfo: { rateLimits: any; };

// TODO removi outras funções e foquei somente na conexão com o MongoDB e criação dos dados da Exchange

(async () => {
  serveStaticFiles();
  await initDatabase();
  await setInterceptors();
  await initRobot();
})()

async function setInterceptors() {
  axios.interceptors.request.use(request => {
    logger.info(`# REQUEST: ${request.method?.toUpperCase()} ${request.url}`);
    return request;
  });
  axios.interceptors.response.use(response => {
    /**
      interval = 'MINUTE'
      intervalNum = 5
      limit = 61000
      rateLimitType = 'RAW_REQUESTS'
     */
    const rateLimits = response?.data?.rateLimits || exchangeInfo?.rateLimits;
    const limit = rateLimits?.find((l: any) => l.rateLimitType === 'REQUEST_WEIGHT');
    logger.info(`# RESPONSE STATUS: ${response.status}. ` + `Used weight: ${response.headers['x-mbx-used-weight']}/${limit.limit}`);
    logger.debug(response?.data);
    return response;
  });
}

async function initRobot() {
  const robotService = new RobotService()
  await robotService.init();
  exchangeInfo = robotService.getExchangeInfo();
  // JobQueue.run();
}

async function initDatabase() {
  try {
    mongoose.connect(`${process.env.MONGODB_URL}`);
    mongoose.set('debug', process.env.NODE_ENV?.includes('dev'));
    // const exchangeService = new ExchangeService();
    // await exchangeService.getUpdateExchange();
  } catch (error) {
    logger.error(error)
  }

  // sequelize - sqlite
  // try {
  //   await database.sync({ force: true })
  // } catch (error) {
  //   logger.error(error)
  // }
}

function serveStaticFiles() {
  app.use(bodyParser.json())
  app.use(express.static(`${process.cwd()}/robot-app/dist/app`))

  app.get('/', (req, res) => {
    res.sendFile(`${process.cwd()}/robot-app/dist/app/index.html`)
  })

  mountRoutes(app)
}

export default app
