import nconf from 'nconf';
import { join }  from 'path';

/*
in production everything should run off environment variables - for local and testing we may use command line or a local
config file which is relative to the running process
 */
const localPath = join(process.cwd(), './config.json');

console.log('local path is ' + localPath);

export const configuration = nconf
  // 1. Command-line arguments
  .argv()
  // 2. Environment variables
  .env([
    'SITE',
    'PORT',
    'REDIS_HOST',
    'REDIS_KEY',
    'SESSION_SECRET',
    'MYSQL_PASSWORD',
    'INSTANCE_CONNECTION_NAME',
    'NODE_ENV',
    'OAUTH2_CLIENT_SECRET',
    'AZURE_CLIENT_SECRET',
  ])
  // 3. Config file
  .file({ file: localPath })
  // 4. Defaults
  .defaults({
    LOG_LEVEL: 'debug',
  });
