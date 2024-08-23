import { PassportStatic } from "passport";

import { getCompanyViews, getUserByEmail } from "../../initialize/firestore";
import { getLogging } from "../../initialize/logging";
import { User, UserViews } from "./auth.model";

const logger = getLogging();

export function passportSerializer(passport: PassportStatic) {
  /*
  The auth flow then calls serializeUser which looks up the email against the db
  This creates the user object used by the session
*/
  passport.serializeUser((user: any, cb: (err: any, result?: any) => void) => {

    getUserByEmail(user.email.toLowerCase()).subscribe({
      next: (fsUser: User | undefined) => {

        getCompanyViews(fsUser.companyUID).subscribe({
          next: (companyViews) => {
            if (!companyViews) {
              logger.warn(fsUser.companyUID, "could not get company")
              cb("could not get company");
              return;
            }
            fsUser.authViews = UserViews(fsUser, companyViews);
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
