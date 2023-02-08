import { globalInitAttributes } from '@config/database'
import { DataTypes, Model } from 'sequelize'

class RobotParam extends Model {
    declare id: string
    declare name: string
    declare value: string
    declare metadata: string
}

RobotParam.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.STRING,
    allowNull: false
  },
  metadata: {
    type: DataTypes.STRING
  }
}, {
  ...globalInitAttributes/*,
  tableName: 'frontend_system_param' */
})

export default RobotParam
