import { PassportStatic } from "passport";

import { getCompanyByUID, getUserByEmail } from "../../initialize/firestore";
import { getLogging } from "../../initialize/logging";
import {User, UserViews} from "./auth.model";

const logger = getLogging();

export function passportSerializer(passport: PassportStatic) {
  /*
  The auth flow then calls serializeUser which looks up the email against the db
  This creates the user object used by the session
*/
  passport.serializeUser((user: any, cb: (err: any, result?: any) => void) => {

    getUserByEmail(user.email.toLowerCase()).subscribe({
      next: (fsUser: User | undefined) => {

        getCompanyByUID(fsUser.companyUID).subscribe({
          next: (company) => {
            logger.debug(company, "getting user views");
            fsUser.authViews = UserViews(fsUser, company);
            //no need to pass any unauthorized views forward
            fsUser.views = undefined;

            cb(null, fsUser);
          },
          error: err => {
            logger.error(err);
            cb(err);
          }
        })
      },
      error: err => {
        logger.error(err);
        cb(err);
      }
    });
  });

  passport.deserializeUser((obj: any, cb) => {
    cb(null, obj);
  });



}
