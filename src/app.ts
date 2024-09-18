import '@config/environment';
import logger from '@config/logger';
import { ExchangeService } from '@services/ExchangeService';
import { RobotService } from '@services/RobotService';
import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';
import mongoose from 'mongoose';
import mountRoutes from './routes';

const app = express();

// TODO removi outras funções e foquei somente na conexão com o MongoDB e criação dos dados da Exchange

(async () => {
  serveStaticFiles();
  await setInterceptors();
  await initDatabase();
  initRobot();
})()

async function setInterceptors() {
  axios.interceptors.request.use(request => {
    logger.info(`### Starting Request: ${JSON.stringify(request.url, null, 2)}`);
    return request;
  });
  axios.interceptors.response.use(response => {
    logger.info(`### Response status: ${JSON.stringify(response.status, null, 2)}`);
    return response;
  });
}

async function initRobot() {
  const robotService = new RobotService()
  await robotService.init();
  // JobQueue.run();
}

async function initDatabase() {
  try {
    mongoose.connect(`${process.env.MONGODB_URL}`);
    const exchangeService = new ExchangeService();
    await exchangeService.getUpdateExchange();
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
