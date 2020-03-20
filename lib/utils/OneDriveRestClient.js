const { OAuth2RestClient } = require('@elastic.io/component-commons-library');
const axios = require('axios');
const removeTrailingSlash = require('remove-trailing-slash');
const removeLeadingSlash = require('remove-leading-slash');

class OneDriveRestClient extends OAuth2RestClient {
  async makeRequest(options) {
    try {
      const {
        url,
        method,
        body,
        headers = {},
        urlIsSegment = true,
        isJson = true,
      } = options;

      const urlToCall = urlIsSegment
        ? `${removeTrailingSlash(this.cfg.resourceServerUrl.trim())}/${removeLeadingSlash(url.trim())}` // Trim trailing or leading '/'
        : url.trim();

      this.emitter.logger.trace(`Making ${method} request to ${urlToCall} with body: %j ...`, body);

      const requestOptions = {
        method,
        data: body,
        headers,
        responseType: isJson ? 'json' : 'stream',
        url: urlToCall,
      };

      const ax = axios.create();

      // eslint-disable-next-line no-underscore-dangle
      await this.addAuthenticationToRequestOptions(requestOptions);

      const response = await ax(requestOptions);

      return this.handleRestResponse(response);
    } catch (e) {
      if (e.isAxiosError) {
        return this.handleRestResponse(e.response);
      }
      throw e;
    }
  }

  handleRestResponse(response) {
    if (response.status >= 400) {
      const e = new Error(`Error in making request to ${response.config.url} Status code: ${response.status}, Body: ${JSON.stringify(response.data)}`);
      e.status = response.status;
      e.data = response.data;
      throw e;
    }

    this.emitter.logger.trace(`Response statusCode: ${response.status}, body: %j`, response.data);
    return response;
  }
}

exports.OneDriveRestClient = OneDriveRestClient;
