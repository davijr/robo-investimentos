import editionController from 'src/controllers/editionController'
import pricesController from 'src/controllers/robotController'

const BASE_URL = '/api'

export default (app: any) => {
  app.use(`${BASE_URL}/edition`, editionController)
  app.use(`${BASE_URL}/robot`, pricesController)
}
