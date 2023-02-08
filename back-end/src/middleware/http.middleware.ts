import logger from '@config/logger'
import ResponseModel from '@models/utils/ResponseModel'
import { AppUtils } from '@utils/AppUtils'
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

// Add headers before the routes are defined
function httpMiddleware (req: Request | any, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*')

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE')

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type')

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', 'true')

  // JWT validation
  // if (!authHeader) {
  //   logger.error('401 - No token provided.')
  //   return res.status(401).send(new ResponseModel('auth', 'No token provided.', null))
  // }

  // const parts = authHeader.split(' ')

  // if (parts.length !== 2) {
  //   logger.error('401 - Badly formatted token.')
  //   return res.status(401).send(new ResponseModel('auth', 'Badly formatted token.', null))
  // }

  // const [scheme, token] = parts

  // if (!/^Bearer$/i.test(scheme)) {
  //   logger.error('401 - Badly formatted token.')
  //   return res.status(401).send(new ResponseModel('auth', 'Badly formatted token.', null))
  // }

  // jwt.verify(token, AppUtils.getJwtSecret(), (error: any, decoded: any) => {
  //   if (error) {
  //     logger.error('401 - Invalid token.')
  //     return res.status(401).send(new ResponseModel('auth', 'Invalid token.', null))
  //   }

  //   req.userId = decoded.id
  //   return next()
  // })
}

export default httpMiddleware
