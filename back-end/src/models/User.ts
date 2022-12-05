import { globalInitAttributes } from '@config/database'
import { DataTypes, Model } from 'sequelize'

class User extends Model {
    declare id: string
    declare name: string
    declare email: string
    declare password: string
}

User.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  ...globalInitAttributes
})

export default User
