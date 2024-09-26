import { database } from '@config/database'
import logger from '@config/logger'
import { ModelUtils } from '@models/utils/ModelUtils'
import RequestModel from '@models/utils/RequestModel'
import ResponseModel from '@models/utils/ResponseModel'
import { AppUtils } from '@utils/AppUtils'
import { Op } from 'sequelize'

export class EditionService {
  async find (requestModel: RequestModel): Promise<ResponseModel> {
    try {
      requestModel.model = database.model(requestModel.model)
      if (!requestModel.model) {
        throw new ResponseModel(requestModel.model, 'Model can not be undefined.', null)
      }
      if (!requestModel.searchOptions) {
        return new ResponseModel(requestModel.model, 'Search completed successfully.',
          await (requestModel.model as any).findAll({}))
      }
      return new ResponseModel(requestModel.model, 'Search completed successfully.',
        await (requestModel.model as any).findAll({
          ...ModelUtils.buildSearchOptions(requestModel)
        }))
    } catch (error: any) {
      logger.error(error)
      throw new ResponseModel(requestModel.model, `Search was finished with error. (${error.message})`, null)
    }
  }

  async search (requestModel: RequestModel) {
    try {
      requestModel.model = database.model(requestModel.model)
      if (!requestModel.searchOptions) {
        return new ResponseModel(requestModel.model, 'Search completed successfully.',
          await (requestModel.model as any).findAll({
            where: {
              [Op.or]: [this.buildLikeSearch(requestModel.data)]
            }
          }))
      } else {
        return new ResponseModel(requestModel.model, 'Search completed successfully.',
          await (requestModel.model as any).findAll({
            where: {
              [Op.or]: this.buildLikeSearch(requestModel.data)
            },
            ...requestModel.searchOptions
          }))
      }
    } catch (error: any) {
      logger.error(error)
      throw new ResponseModel(requestModel.model, `Search was finished with error. (${error.message})`, null)
    }
  }

  async create (requestModel: RequestModel): Promise<ResponseModel> {
    try {
      requestModel.model = database.model(requestModel.model)
      if (requestModel.transaction) {
        return new ResponseModel(requestModel.model, 'Insert completed successfully.', await (requestModel.model as any).create(requestModel.data, {
          transaction: requestModel.transaction,
          userId: requestModel?.userId,
          individualHooks: true
        }))
      }
      return new ResponseModel(requestModel.model, 'Insert completed successfully.', await (requestModel.model as any)
        .create(requestModel.data, { userId: requestModel?.userId, individualHooks: true }))
    } catch (error: any) {
      logger.error(error)
      throw new ResponseModel(requestModel.model, `Insert was finished with error. (${error.message})`, null)
    }
  }

  async createTransaction (requestModel: RequestModel, transaction: any): Promise<ResponseModel> {
    try {
      requestModel.model = database.model(requestModel.model)
      return new ResponseModel(requestModel.model, 'Insert completed successfully.', await (requestModel.model as any).create(requestModel.data, {
        transaction: requestModel.transaction,
        userId: requestModel?.userId,
        individualHooks: true
      }))
    } catch (error: any) {
      logger.error(error)
      throw new ResponseModel(requestModel.model, `Insert was finished with error. (${error.message})`, null)
    }
  }

  async bulkCreateTransaction (requestModel: RequestModel, transaction: any): Promise<ResponseModel> {
    try {
      requestModel.model = database.model(requestModel.model)
      return new ResponseModel(requestModel.model, 'Insert completed successfully.', await (requestModel.model as any).bulkCreate(requestModel.data, {
        transaction: requestModel.transaction,
        userId: requestModel?.userId,
        individualHooks: true
      }))
    } catch (error: any) {
      logger.error(error)
      throw new ResponseModel(requestModel.model, `Insert was finished with error. (${error.message})`, null)
    }
  }

  async update (requestModel: RequestModel): Promise<ResponseModel> {
    let message = 'Update was finished with error'
    try {
      requestModel.model = database.model(requestModel.model)
      const criteria: any = {}
      criteria[requestModel.model.primaryKeyAttribute] = requestModel.data[requestModel.model.primaryKeyAttribute]
      const rows = await (requestModel.model as any).update(requestModel.data, {
        where: criteria,
        userId: requestModel?.userId,
        individualHooks: true
      })
      if (rows && rows[0] === 1) {
        message = 'Update completed successfully'
        logger.info(message)
      } else {
        logger.error(message)
        throw new ResponseModel(requestModel.model, `${message}`, null)
      }
      return new ResponseModel(requestModel.model, message, null)
    } catch (error: any) {
      logger.error(error)
      throw new ResponseModel(requestModel.model, `${message} (${error.message})`, null)
    }
  }

  async delete (requestModel: RequestModel): Promise<ResponseModel> {
    let message = 'Delete was ended with error'
    requestModel.model = database.model(requestModel.model)
    try {
      const criteria: any = {}
      criteria[requestModel.model.primaryKeyField] = requestModel.data
      await (requestModel.model as any).destroy({ where: criteria }, {
        userId: requestModel?.userId,
        individualHooks: true
      }).then((rowDeleted: number) => { // rowDeleted will return number of rows deleted
        if (rowDeleted === 1) {
          message = 'Delete completed successfully'
          logger.info(message)
        }
      }, (error: any) => {
        throw new ResponseModel(requestModel.model, `${message} (${error.message})`, null)
      })
      return new ResponseModel(requestModel.model, message, null)
    } catch (error: any) {
      logger.error(error)
      throw new ResponseModel(requestModel.model, `${message} (${error.message})`, null)
    }
  }

  /**
   * Purpose: To list menu options for EDITION module.
   * Filter: Just show items according to business rule given by client.
   * @returns menu items
   */
  async getMenuOptions () {
    const modelKeys = Object.keys(database.models)
    const groups: string[] = []
    const menuItems: any[] = []
    // create groups
    modelKeys.forEach(item => {
      const aux = item.replace(/([a-z])([A-Z])/g, '$1 $2')
      const groupName = aux.split(' ')[0]
      if (!groups.includes(groupName)) {
        groups.push(groupName)
      }
    })
    // assign items to group
    groups.forEach(group => {
      const newItem: any = {
        name: group,
        active: true,
        items: []
      }
      modelKeys.forEach(item => {
        if (item.startsWith(group)) {
          const itemName = ModelUtils.getMenuItemName(item)
          const menuItemsToFilter = AppUtils.menuItemsToFilter()
          let belongsFilterValidation = false
          menuItemsToFilter.forEach(i => {
            const itemNameFilter = i.replace(/_/g, '').replace(/ /g, '').toUpperCase()
            const itemNameCleared = item.replace(/ /g, '').toUpperCase()
            if (itemNameFilter === itemNameCleared) {
              belongsFilterValidation = true
              return true
            }
          })
          if (belongsFilterValidation) {
            newItem.items.push({
              name: itemName,
              route: 'edition',
              param: item,
              active: true
            })
          }
        }
      })
      ModelUtils.sort(newItem.items, 'name')
      if (newItem.items.length > 0) {
        menuItems.push(newItem)
      }
    })
    menuItems.push(...this.getFixedOptions())
    ModelUtils.sort(menuItems, 'name')
    // TODO finalizar RECON de forma dinâmica
    menuItems.forEach(group => {
      if (group.name === 'Recon') {
        group.items = [
          {
            active: true,
            name: 'Dimension Group',
            route: 'reconciliation'
          }
        ]
      }
    })
    return menuItems
  }

  async getAttributes (modelName: string) {
    try {
      const modelObject = database.model(modelName)
      return ModelUtils.transformModel(modelName, modelObject)
    } catch (e) {
      return new Error('Model "' + modelName + '" has not been defined.')
    }
  }

  private buildLikeSearch (searchOptions: any) {
    const queryVariables: any = {}
    Object.keys(searchOptions).forEach(key => {
      queryVariables[key] = { [Op.iLike]: `%${searchOptions[key]}%` }
    })
    return queryVariables
  }

  private getFixedOptions () {
    return [
      {
        name: 'Authorization',
        active: true,
        items: [
          {
            name: 'User Access Control',
            route: 'authorization',
            param: 'access-control',
            active: true
          }, {
            name: 'Roles',
            route: 'edition',
            param: 'Role',
            active: true
          }, {
            name: 'Permissions',
            route: 'edition',
            param: 'Permission',
            active: true
          }
        ]
      }, {
        name: 'Reconciliation',
        active: true,
        items: [
          {
            name: 'Dimension Group',
            route: 'reconciliation',
            param: '',
            active: true
          }
        ]
      }, {
        name: 'Settings',
        active: true,
        items: [
          {
            name: 'System Parameters',
            route: 'edition',
            param: 'SystemParam',
            active: true
          }
        ]
      }
    ]
  }
}
