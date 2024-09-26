import { Sequelize } from 'sequelize'
import SQLite from 'sqlite3'
import logger from '@config/logger'
import { AppUtils } from '@utils/AppUtils'

const connectionOptions: any = {
  dialect: 'sqlite',
  storage: './sqlite/sqlite.db',
  dialectOptions: {
    mode: SQLite.OPEN_READWRITE
  }
}

if (AppUtils.isDBShowSQL()) {
  connectionOptions.logging = (msg: any) => logger.info(msg)
} else {
  connectionOptions.logging = false
}

const database = new Sequelize(connectionOptions)

const globalInitAttributes = {
  sequelize: database,
  freezeTableName: true,
  underscored: true,
  timestamps: true,
  paranoid: true
}

globalInitAttributes.sequelize = database

export {
  database,
  globalInitAttributes
}
