import editionRoutes from '@routes/editionRoutes'

const BASE_URL = '/api'

export default (app: any) => {
  app.use(`${BASE_URL}/edition`, editionRoutes)
}
