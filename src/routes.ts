import editionController from './controllers/editionController'
import robotController from './controllers/robotController'
import walletController from './controllers/walletController'
import orderController from './controllers/orderController'

const BASE_URL = '/api'

export default (app: any) => {
  app.use(`${BASE_URL}/edition`, editionController)
  app.use(`${BASE_URL}/robot`, robotController)
  app.use(`${BASE_URL}/wallet`, walletController)
  app.use(`${BASE_URL}/order`, orderController)
}
