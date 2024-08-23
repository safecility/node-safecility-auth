import { NextFunction, Response, Request } from "express";
import { getLogging } from "../initialize/logging";

const logger = getLogging();

export function hasPassport(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    logger.info({redirect: req.url}, 'req url');
    const redirectIndex = req.url.indexOf('?redirect=');
    if (redirectIndex !== -1) {
      const redirect = req.url.substring(redirectIndex + 10)
      logger.info({redirect: redirect},'setting user redirect');
      res.redirect(redirect);
    }
    res.sendStatus(401);
    return;
  }
  next();
}
