import express from 'express';
import passport from 'passport';
import bodyParser from 'body-parser';

import { Response } from 'express';
import { Session } from 'express-session';
import { hasPassport } from "./auth.guard";
import { getLogging } from "../initialize/logging";
import { init as authInit } from "../auth/passport/auth.init";

const logger = getLogging();

interface SessionUser extends Express.User {
    expires: string | undefined;
}

export const authRouter = express.Router();
authRouter.use(bodyParser.json());

interface RedirectSession extends Session {
  redirectUrl: string
}

authInit()

authRouter.get(
  '/',
  hasPassport,
  (_, res: Response) => {
    res.sendStatus(200);
  }
);

authRouter.get(
    '/user',
    (req, res: Response) => {
        if (!req.user) {
            res.sendStatus(401);
            return;
        }
        const session = req.session;
        const user = req.user as SessionUser;
        user.expires = session.cookie.expires?.toISOString();
        res.json(user)
    }
);
/*
 * GET /api/auth/google
 *
 * Here's where we can set AuthenticateOptionsGoogle for things like selecting an account to login with
 *
 */
authRouter.get('/google',
  passport.authenticate('google', { prompt: 'select_account', scope: ['email', 'profile']}),
  (req, res: Response, next: Function) => {
    res.getHeaders();
    if (req.query.return) {
      logger.debug({return: req.query.return}, 'google return');
    }
    const rSession = req.session as RedirectSession;
    if (rSession.redirectUrl) {
      logger.info({redirect: rSession.redirectUrl}, 'google redirecting');
      res.redirect(rSession.redirectUrl);
    }
    else {
      next();
    }
  }
);
/*
 * GET /api/auth/google/callback
 */
authRouter.get('/google/callback', function(req, res, next) {
    // err: any,
    //     user?: Express.User | false | null,
    //     info?: object | string | Array<string | undefined>,
    //     status?: number | Array<number | undefined>,
    passport.authenticate('google', function(err: any, user: Express.User, _info: object) {
    if (err) {
      logger.error(err, 'google auth err');
      return res.redirect('/login?err=google_err');
    }
    if (!user) {
      logger.error(new Error('no user'), 'google user error');
      return res.redirect('/login?err=google_no_user');
    }
    // user is the response from google. To get our user from db using passport serialize we call req login
    req.login(user, (err) => {
      if (err) {
          if (err.code) {
              return res.redirect('/login?err=timeout');
          }
          logger.error(err.code, 'google login err');
          logger.debug(err, 'google login err');
          return res.redirect('/login?err=unauthorized');
      }
      logger.debug(user, ' got google user login');
      const rSession = req.session as RedirectSession;
      if (rSession.redirectUrl) {
        logger.info({redirect: rSession.redirectUrl}, 'google callback redirecting');
        return res.redirect(rSession.redirectUrl);
      }
      else {
        return res.redirect('/');
      }
    })
  })(req, res, next);
});
