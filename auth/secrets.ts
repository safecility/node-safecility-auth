import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

// use fallback? - seems to be issues with the client but hard to analyse
// const gax = require('google-gax/ build/ src/ fallback'); // avoids loading google-gax with gRPC
export const secretService = new SecretManagerServiceClient();
