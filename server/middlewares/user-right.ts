import * as express from 'express'
import 'express-validator'
import { UserRight } from '../../shared'
import { logger } from '../helpers/logger'
import { UserModel } from '../models/account/user'

function ensureUserHasRight (userRight: UserRight) {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = res.locals.oauth.token.user as UserModel
    if (user.hasRight(userRight) === false) {
      const message = `User ${user.username} does not have right ${UserRight[userRight]} to access to ${req.path}.`
      logger.info(message)

      return res.status(403)
        .json({
          error: message
        })
        .end()
    }

    return next()
  }
}

function userHasPermission (userRight: UserRight) {
  return function (req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = res.locals.oauth.token.user as UserModel
    if (user.hasRight(userRight) === false) {
       return false
    }

    return true
  }
}

// ---------------------------------------------------------------------------

export {
  ensureUserHasRight,
  userHasPermission
}
