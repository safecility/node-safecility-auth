import express from "express";
import {newSession} from "./initialize/session";
import {getLogging} from "./initialize/logging";
import {authRouter} from "./api/auth.api";
import {configuration} from "./initialize/config";

const logger = getLogging();

async function startServer() {

    const app: express.Application = express();

    newSession(app);

    const frontend = "./dist/frontend/browser";

    app.use('/', express.static(frontend));
    app.use('/login', express.static(frontend));

    app.use('/auth', authRouter);

    const PORT = configuration.get('PORT') || 8080;
    app.listen(PORT, () => {
        logger.info({port: PORT}, `App listening on port`);
        logger.debug('Press Ctrl+C to quit.');
    });
}

startServer().catch(r => console.error(r)).then(_ => {});