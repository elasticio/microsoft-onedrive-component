/* eslint-disable no-restricted-syntax, no-param-reassign */
import { axiosReqWithRetryOnServerError } from '@elastic.io/component-commons-library/dist/src/externalApi';
import { version as commonsLibraryVersion, dependencies } from '@elastic.io/component-commons-library/package.json';
import compJson from '../component.json';
import packageJson from '../package.json';

const auth = {
  username: process.env.ELASTICIO_API_USERNAME,
  password: process.env.ELASTICIO_API_KEY,
};

const headers = { 'User-Agent': `${compJson.title}/${compJson.version} component-commons-library/${commonsLibraryVersion} axios/${dependencies.axios}` };
const secretsUrl = `${process.env.ELASTICIO_API_URI}/v2/workspaces/${process.env.ELASTICIO_WORKSPACE_ID}/secrets/`;

export async function getSecret(credentialId: string) {
  const response: any = await axiosReqWithRetryOnServerError.call(this, {
    method: 'GET',
    url: `${secretsUrl}${credentialId}`,
    auth,
    headers
  });
  const { attributes } = response.data.data;
  return { ...attributes };
}

export async function refreshSecret(credentialId: string) {
  const response: any = await axiosReqWithRetryOnServerError.call(this, {
    method: 'POST',
    url: `${secretsUrl}${credentialId}/refresh`,
    auth,
    headers
  });
  return response.data.data.attributes;
}

export const getUserAgent = () => {
  const { version: compVersion } = compJson;
  const libVersion = packageJson.dependencies['@elastic.io/component-commons-library'];
  return `${compJson.title}/${compVersion} component-commons-library/${libVersion}`;
};

export const isMaesterUrl = (url: string) => /=maester$/.test(url);

export const isNumberNaN = (num) => Number(num).toString() === 'NaN';

export const removeSubfolders = (arrayOfFolders) => {
  let paths = arrayOfFolders;
  for (const path of paths) {
    const regexp = new RegExp(`^${path}/`);
    paths = paths.filter((r) => !regexp.test(r));
  }
  return paths;
};
