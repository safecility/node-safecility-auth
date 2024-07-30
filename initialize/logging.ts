import { configuration } from "./config";
import Logger from "bunyan";
import bunyan from "bunyan";
import { LoggingBunyan } from '@google-cloud/logging-bunyan';

export interface GeneralLogger {
  info(json: any, message?: string): void;
  debug(json: any, message?: string): void;
  error(json: any, message?: string): void;
}

export class ConsoleLogger implements GeneralLogger {
  debug(json: any, message?: string): void {
    console.debug(json, message);
  }

  error(json: any, message?: string): void {
    console.error(json, message);
  }

  info(json: any, message?: string): void {
    console.log(json, message);
  }

}

let logger = new ConsoleLogger();

let logLevel = configuration.get('LOG_LEVEL');
if (!logLevel) {
  logLevel = 'debug';
}

// TODO why the hell is a Logger crashing my server!!!!! fatal grpc timeout errors on log!!!!
if (configuration.get('BUNYAN_LOGGING')) {

// Creates a Bunyan Cloud Logging client
  const loggingBunyan = new LoggingBunyan();

  const streams: Array<any> = [
    // And log to Cloud Logging, logging at given log level and above
    loggingBunyan.stream(logLevel),
  ];

  if ( configuration.get('LOG_STDOUT') ) {
    streams.push({stream: process.stdout, level: logLevel});
  }

  logger = bunyan.createLogger({
    // The JSON payload of the log as it appears in Cloud Logging
    // will contain "name": "my-service"
    name: 'safecility-main',
    streams
  });
}

logger.info({logLevel}, "created logger");

export function getLogging(): GeneralLogger {
  return logger;
}
