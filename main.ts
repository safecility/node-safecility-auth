import express from "express";
import { newSession } from "./initialize/session";
import { getLogging } from "./initialize/logging";
import { authRouter } from "./api/auth.api";
import { configuration } from "./initialize/config";
import { passportSerializer } from "./auth/passport/shared.auth";
import passport from "passport";

const logger = getLogging();

/**
 * this is effectively a demo server for auth though it can be run as a minimal auth service
 */
async function startServer() {

    const app: express.Application = express();

    newSession(app);
    passportSerializer(passport);

    app.use('/auth', authRouter);

    const PORT = configuration.get('PORT') || 8080;
    app.listen(PORT, () => {
        logger.info({port: PORT}, `App listening on port`);
        logger.debug('Press Ctrl+C to quit.');
    });
}

startServer().catch(r => console.error(r)).then(_ => {});