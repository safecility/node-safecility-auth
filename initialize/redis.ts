import {createClient, RedisClientOptions, RedisDefaultModules} from 'redis';
import { configuration } from './config';
import { getLogging } from "./logging";
import {RedisClientType as _RedisClientType} from "@redis/client/dist/lib/client";

const logger = getLogging();

let redisClientOptions: RedisClientOptions = {
  socket: {
    host: configuration.get('REDIS_HOST'),
    port: configuration.get('REDIS_PORT'),
  }
};

let password = configuration.get('REDIS_KEY');

//if redis is in local secure network we don't need a password
if (password && password != ""){
  redisClientOptions.password = password;
}

export let redisClient: undefined | any;

export function GetRedisClient(): any {
  if (!redisClient) {
    redisClient = createClient(redisClientOptions);

    redisClient.connect().catch( (x: any) => {
      logger.warn("connection failed", x)
    })

    redisClient.on('error', (err: Error) => {
      logger.warn({redisErr: err}, "redis client error");
    });
  }

  return redisClient
}
