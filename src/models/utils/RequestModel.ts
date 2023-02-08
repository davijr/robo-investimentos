import { Model } from 'sequelize'
import SearchOptions from './SearchOptions'

interface RequestModel {
    userId?: string,
    model?: Model | any,
    searchOptions?: SearchOptions
    data?: any
    transaction?: any
}

export default RequestModel
