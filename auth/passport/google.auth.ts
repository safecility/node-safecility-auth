import { Strategy as GoogleStrategy, Profile, StrategyOptionsWithRequest} from "passport-google-oauth20";
import { Request, Response, Router } from 'express';
import { configuration } from "../../initialize/config";
import { getLogging } from "../../initialize/logging";
import { Strategy, PassportStatic } from "passport";
import { secretService } from "../secrets";
import {Session} from "express-session";

const logger = getLogging();

interface RedirectSession extends Session {
    redirectUrl: string
}

export function authInitGoogle(passport: PassportStatic, router: Router) {

    let clientSecretVersion = configuration.get('OAUTH2_CLIENT_SECRET');

    if (!clientSecretVersion || clientSecretVersion == "")
        clientSecretVersion = "projects/safecility-test/secrets/google-auth-secret/versions/1"

    const clientID = configuration.get('OAUTH2_CLIENT_ID');
    const callbackURL = configuration.get('OAUTH2_CALLBACK');
    const secret = configuration.get('GOOGLE_OAUTH2_SECRET');

    if (secret && secret != "") {
        logger.info("calling strategy from local");
        useStrategy(clientID, secret, callbackURL, passport)
        return
    }

    secretService.accessSecretVersion({name: clientSecretVersion}).then(
        (s) => {
            const clientSecret = s[0].payload?.data?.toString();

            if (!clientSecret) {
                return;
            }
            useStrategy(clientID, clientSecret, callbackURL, passport)
        }
    ).catch(
        err => {
            logger.error("secret error ", err);
        }
    ).finally( () => {
        console.log("adding routes");
        addRoutes(router, passport);
    })
}

function addRoutes(authRouter: Router, passport: PassportStatic) {
    /*
 * GET /api/auth/google
 *
 * Here's where we can set AuthenticateOptionsGoogle for things like selecting an account to login with
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

}

function useStrategy(clientID: string, clientSecret: string, callbackURL: string, passport: PassportStatic) {

    const googleStrategyConfig: StrategyOptionsWithRequest = {
        userProfileURL: 'https://openidconnect.googleapis.com/v1/userinfo',
        clientID: clientID,
        clientSecret: clientSecret,
        callbackURL: callbackURL,
        passReqToCallback: true,
    };

    const strategy = new GoogleStrategy(googleStrategyConfig,
        ( _req: Request,
          _accessToken: string,
          _refreshToken: string,
          profile: Profile,
          done ) => {
            // Extract the minimal profile information we need from the profile object
            // provided by Google
            if (!profile) {
                done(new Error('could not login with google'));
                return;
            }

            let imageUrl = '';
            let email = '';
            if (profile.photos && profile.photos.length) {
                imageUrl = profile.photos[0].value;
            }
            if (profile.emails && profile.emails.length) {
                email = profile.emails[0].value;
            }

            let authUser = {
                name: profile.displayName,
                imageUrl: imageUrl,
                email: email
            };
            done(null, authUser);
        })

    logger.debug('setting passport strategy: google');
    passport.use('google', <Strategy>strategy);
}