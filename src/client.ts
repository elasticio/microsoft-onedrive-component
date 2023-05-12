/* eslint-disable no-restricted-syntax, class-methods-use-this, no-param-reassign */
import { AxiosRequestConfig, AxiosResponse } from 'axios';
import * as commons from '@elastic.io/component-commons-library';
import { getSecret, refreshSecret, isNumberNaN } from './utils';

export default class Client {
  logger: any;

  cfg: any;

  accessToken: string;

  retries: number;

  cloudId: number;

  constructor(context, cfg) {
    this.logger = context.logger;
    this.cfg = cfg;
    this.retries = 5;
    this.cloudId = cfg.cloudId;
  }

  setLogger(logger) { this.logger = logger; }

  async apiRequest(opts: AxiosRequestConfig): Promise<AxiosResponse> {
    if (!this.accessToken) {
      this.logger.debug('Token not found, going to fetch new one');
      await this.getNewAccessToken();
      this.logger.debug('Token created successfully');
    }

    const baseURL = 'https://graph.microsoft.com/v1.0/';

    opts = {
      ...opts,
      baseURL,
      headers: {
        ...opts.headers || {},
        Authorization: `Bearer ${this.accessToken}`
      }
    };

    let response;
    let error;
    let currentRetry = 0;

    while (currentRetry < this.retries) {
      try {
        response = await commons.axiosReqWithRetryOnServerError.call(this, opts);
        return response;
      } catch (err) {
        error = err;
        if (err.response) this.logger.error(commons.getErrMsg(err.response));
        if (err.response?.status === 401) {
          this.logger.debug('Token invalid, going to fetch new one');
          const currentToken = this.accessToken;
          await this.getNewAccessToken();
          if (currentToken === this.accessToken) {
            this.logger.debug('Token not changed, going to force refresh');
            await this.refreshAndGetNewAccessToken();
          }
          this.logger.debug('Trying to use new token');
          opts.headers.Authorization = `Bearer ${this.accessToken}`;
        } else if (err.response?.status === 429) {
          const retryAfter = 2 ** (currentRetry + 1);
          this.logger.error(`Going to retry after ${retryAfter}sec (${currentRetry + 1} of ${this.retries})`);
          await commons.sleep(retryAfter * 1000);
        } else {
          throw err;
        }
      }
      currentRetry++;
    }
    throw error;
  }

  async getNewAccessToken() {
    let fields;
    if (this.cfg.secretId) {
      this.logger.debug('Fetching credentials by secretId');
      const response = await getSecret.call(this, this.cfg.secretId);
      this.accessToken = response.credentials.access_token;
      fields = response.credentials.fields;
    } else if (this.cfg.oauth) {
      this.logger.debug('Fetching credentials from this.cfg');
      this.accessToken = this.cfg.oauth.access_token;
      fields = this.cfg;
    } else {
      throw new Error('Can\'t find credentials in incoming configuration');
    }

    const { retries = this.retries } = fields || {};
    if (!isNumberNaN(retries) && Number(retries) <= 10) this.retries = Number(retries);
  }

  async refreshAndGetNewAccessToken() {
    const response = await refreshSecret.call(this, this.cfg.secretId);
    this.accessToken = response.credentials.access_token;
  }
}
