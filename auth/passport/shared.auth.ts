import { PassportStatic } from "passport";

import { getCompanyByUID, getUserByEmail } from "../../initialize/firestore";
import { getLogging } from "../../initialize/logging";
import {Company, User, UserViews} from "./auth.model";

const logger = getLogging();

export function passportSerializer(passport: PassportStatic) {
  /*
  The auth flow then calls serializeUser which looks up the email against the db
  This creates the user object used by the session
*/
  passport.serializeUser((user: any, cb: (err: any, result?: any) => void) => {

    getUserByEmail(user.email.toLowerCase()).subscribe({
      next: (userSnapshot) => {
        if (userSnapshot.docs.length==0) {
          cb(new Error("User not found"));
          return;
        }

        const fsUser = userSnapshot.docs[0].data() as User

        getCompanyByUID(fsUser.CompanyUID).subscribe({
          next: (companySnapshot) => {
            if (companySnapshot.docs.length==0) {
              cb(new Error("User's company not found"));
              return
            }

            const company = companySnapshot.docs[0].data() as Company;
            logger.debug(company, "getting user views");
            fsUser.AuthViews = UserViews(fsUser, company);
            //no need to pass any unauthorized views forward
            fsUser.Views = undefined;

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
