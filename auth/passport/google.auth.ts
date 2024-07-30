import { Strategy as GoogleStrategy, Profile, StrategyOptionsWithRequest} from "passport-google-oauth20";
import { Request } from 'express';
import { configuration } from "../../initialize/config";
import { getLogging } from "../../initialize/logging";
import { Strategy, PassportStatic } from "passport";
import { secretService } from "../secrets";

const logger = getLogging();

export function authInitGoogle(passport: PassportStatic) {

    let clientSecretVersion = configuration.get('OAUTH2_CLIENT_SECRET');

    if (!clientSecretVersion || clientSecretVersion == "")
        clientSecretVersion = "projects/safecility-test/secrets/google-auth-secret/versions/1"

    const clientID = configuration.get('OAUTH2_CLIENT_ID');
    const callbackURL = configuration.get('OAUTH2_CALLBACK');

    const secret = configuration.get('GOOGLE_OAUTH2_SECRET');

    if (secret && secret != "") {
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
    )
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

            logger.info({profile}, "user profile");

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
    passport.use('google', <Strategy>strategy)
}