import logger from '@config/logger'
import RequestModel from '@models/utils/RequestModel'
import ResponseModel from '@models/utils/ResponseModel'

export class EditionService {
  async find (requestModel: RequestModel): Promise<ResponseModel> {
    try {
      if (!requestModel.data) {
        const searchOptions = {
          order: [[requestModel.searchOptions?.orderBy || requestModel.model?.idField, requestModel.searchOptions?.order || 'asc']],
          limit: requestModel.searchOptions?.limit,
          offset: requestModel.searchOptions?.page
        }
        return {
          data: await (requestModel.model as any)?.findAll(searchOptions),
          message: 'Search completed successfully'
        }
      }
      return {
        data: await (requestModel.model as any).findOne({ where: requestModel.data }),
        message: 'Search completed successfully'
      }
    } catch (e) {
      logger.error(e)
      return {
        message: 'Search was finished with error'
      }
    }
  }

  async create (requestModel: RequestModel): Promise<ResponseModel> {
    try {
      return {
        data: await (requestModel.model as any)?.create(requestModel.data),
        message: 'Insert completed successfully'
      }
    } catch (e) {
      logger.error(e)
      return {
        message: 'Insert was finished with error'
      }
    }
  }

  async update (requestModel: RequestModel): Promise<ResponseModel> {
    let message = 'Update was finished with error'
    try {
      const criteria: any = {}
      criteria[requestModel.model.idField] = requestModel.data[requestModel.model.idField]
      await (requestModel.model as any).update(requestModel.data, {
        where: criteria
      }).then(() => {
        message = 'Update completed successfully'
        logger.info(message)
      }, (err: any) => {
        logger.error(err)
      })
      return { message }
    } catch (e) {
      logger.error(e)
      return { message }
    }
  }

  async delete (requestModel: RequestModel): Promise<ResponseModel> {
    let message = 'Delete was ended with error'
    try {
      const criteria: any = {}
      criteria[requestModel.model.idField] = requestModel.data
      await (requestModel.model as any).destroy({ where: criteria }).then((rowDeleted: number) => { // rowDeleted will return number of rows deleted
        if (rowDeleted === 1) {
          message = 'Delete completed successfully'
          logger.info(message)
        }
      }, (err: any) => {
        logger.error(err)
      })
      return { message }
    } catch (e) {
      logger.error(e)
      return { message }
    }
  }
}
