import { Model } from 'sequelize'
import SearchOptions from './SearchOptions'

interface RequestModel {
    model: Model | any,
    searchOptions?: SearchOptions
    data?: any
}

export default RequestModel
