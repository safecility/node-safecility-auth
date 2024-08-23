import express from 'express';
import bodyParser from 'body-parser';

import { Response } from 'express';
import { hasPassport } from "./auth.guard";

interface SessionUser extends Express.User {
    expires: string | undefined;
}

export const authRouter = express.Router();
authRouter.use(bodyParser.json());

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
        if (req.isUnauthenticated()) {
            res.sendStatus(401);
            return;
        }
        const session = req.session;
        const user = req.user as SessionUser;
        user.expires = session.cookie.expires?.toISOString();
        res.json(user)
    }
);