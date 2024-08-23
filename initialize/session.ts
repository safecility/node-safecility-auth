import session, {SessionOptions} from 'express-session';
import cors from 'cors';
import { join } from "path";

import { configuration } from "./config";
import { GetRedisClient } from "./redis";

import { getLogging } from "./logging";
import RedisStore from "connect-redis";
import {FirestoreStore} from "@google-cloud/connect-firestore";
import express from "express";
import {firestoreDB} from "./firestore";

const logger = getLogging();

export function enableCors(app: express.Application) {
  app.use(cors());
}

/*
This doesn't seem all that obvious
 */
export function preflightCors(app: express.Application, allowlist: string | Array<string>) {

  if (allowlist.length) {
    // var corsOptionsDelegate = (req, callback) => {
    //   var corsOptions;
    //   if (allowlist.indexOf(req.header('Origin')) !== -1) {
    //     corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    //   } else {
    //     corsOptions = { origin: false } // disable CORS for this request
    //   }
    //   callback(null, corsOptions) // callback expects two parameters: error and options
    // }
  }

  const corsOptions = {
    origin: allowlist,
    optionsSuccessStatus: 200,
    credentials: true,
  };

  let corsAccess = cors(corsOptions);
  app.use(corsAccess);

  const preflight = {
    origin: allowlist,
  };

  app.options('*', cors(preflight))
}

export function newSession(app: express.Application) {
  logger.info("starting session and passport");

  const sessionSecret = configuration.get('SESSION_SECRET');

  // TODO this creates a basic 10 hour session - make it a config length
  let sessionConfig: SessionOptions = {
    resave: false,
    saveUninitialized: false,
    secret: sessionSecret,
    cookie: {
      maxAge: 10 * 60 * 60 * 1000,
      secure: false
    }
  };

  if (configuration.get() === 'production') {
    app.set('trust proxy', 1);
    if (sessionConfig.cookie)
      sessionConfig.cookie.secure = true;
  }

  //use redis in production - firestore is easy to work with when performance is not needed
  const redisHost = configuration.get('REDIS_HOST');

  if (redisHost) {
    logger.debug("setting session store", redisHost);
    const client = GetRedisClient();
    sessionConfig.store = new RedisStore({
      client: client,
      prefix: "session:"
    });
  } else {
    logger.debug("setting session firestore");
    sessionConfig.store = new FirestoreStore({
      dataset: firestoreDB,
      kind: 'express-sessions',
    });
  }

  app.use(session(sessionConfig));

}

export function getFrontend(): string {
  let frontend = configuration.get('FRONTEND_PATH');
  if (!frontend){
    frontend = "./frontend";
  } else {
    console.log('joining', frontend, '/frontend');
    frontend = join(frontend, `/frontend`);
  }
  logger.debug({frontend}, 'using frontend');
  return frontend;
}

export function getPublicPath(): string {
  let frontend = configuration.get('FRONTEND_PATH');
  if (!frontend){
    frontend = "./";
  } else {
    frontend = join(process.cwd(), `${frontend}/`);
  }
  return frontend;
}

export function getStaticPath(): string {
  return join(process.cwd(), 'public')
}
