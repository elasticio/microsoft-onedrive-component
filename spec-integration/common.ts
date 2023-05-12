/* eslint-disable max-len */
/* eslint-disable import/first */
process.env.LOG_OUTPUT_MODE = 'short';
process.env.LOG_LEVEL = 'TRACE';
import getLogger from '@elastic.io/component-logger';
import sinon from 'sinon';
import { existsSync } from 'fs';
import { config } from 'dotenv';

if (existsSync('.env')) {
  config();
  const {
    SECRET_ID
  } = process.env;
  if (!SECRET_ID) {
    throw new Error('Please, provide all environment variables');
  }
} else {
  throw new Error('Please, provide environment variables to .env');
}
const { SECRET_ID, ACCESS_TOKEN, BASE_URL } = process.env;

export const baseUrl = BASE_URL;
export const creds = {
  secretId: SECRET_ID
};

export const verifyCreds = {
  oauth: {
    access_token: ACCESS_TOKEN,
    fields: {
      resourceServerUrl: BASE_URL
    },
  }
};

export const getContext = () => ({
  logger: getLogger(),
  emit: sinon.spy(),
});
