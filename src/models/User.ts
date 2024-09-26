import * as Sequelize from 'sequelize'
import { Model } from 'sequelize'
import { globalInitAttributes } from '@config/database'
import bcrypt from 'bcryptjs'

class User extends Model {
  declare id: number
  declare username: string
  declare password: string
  declare email: string
  declare name: string
}

User.init({
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
    primaryKey: true
  },
  username: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false
  },
  email: {
    type: Sequelize.STRING,
    unique: true
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  }
}, {
  ...globalInitAttributes
})

User.beforeCreate(async (user, options) => {
  user.password = await bcrypt.hash(user.password, 10)
})

export default User
