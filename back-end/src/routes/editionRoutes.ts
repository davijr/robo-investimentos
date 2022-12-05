import logger from '@config/logger'
import { InitModel } from '@models/InitModel'
import { EditionService } from '@services/EditionService'
import express from 'express'

const editionRoutes = express.Router()
const editionService = new EditionService()

editionRoutes.get('/:model', async (req: any, res: any) => {
  const modelName = req.params.model
  const model = InitModel.getInstance(modelName)
  logger.info('GET /' + req.params?.model)
  res.status(200).json(await editionService.find({ model, searchOptions: req.query }))
})

editionRoutes.get('/:model/:param', async (req: any, res: any) => {
  const modelName = req.params.model
  const model = InitModel.getInstance(modelName)
  logger.info('GET /:model/:param')
  const underlyingType = req.params
  res.status(200).json(await editionService.find({ model, data: underlyingType }))
})

editionRoutes.post('/:model/search', async (req: any, res: any) => {
  const modelName = req.params.model
  const searchOptions = req.params.searchOptions
  const model = InitModel.getInstance(modelName)
  logger.info('POST /:model/search')
  res.status(200).json(await editionService.find({ model, data: searchOptions }))
})

editionRoutes.post('/:model', async (req: any, res: any) => {
  const modelName = req.params.model
  const model = InitModel.getInstance(modelName)
  logger.info('POST /:model')
  res.status(200).json(await editionService.create({ model, data: req.body }))
})

editionRoutes.put('/:model', async (req, res) => {
  const modelName = req.params.model
  const model = InitModel.getInstance(modelName)
  logger.info('PUT /:model')
  res.status(200).json(await editionService.update({ model, data: req.body }))
})

editionRoutes.delete('/:model/:param', async (req, res) => {
  const modelName = req.params.model
  const param = req.params.param
  const model = InitModel.getInstance(modelName)
  logger.info('DELETE /:model/:param')
  res.status(200).json(await editionService.delete({ model, data: param }))
})

export default editionRoutes
