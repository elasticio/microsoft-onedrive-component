const { OAuth2RestClient } = require('@elastic.io/component-commons-library');
const axios = require('axios');
const removeTrailingSlash = require('remove-trailing-slash');
const removeLeadingSlash = require('remove-leading-slash');

class OneDriveRestClient extends OAuth2RestClient {
  async makeRequest(options) {
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
  }

  handleRestResponse(response) {
    if (response.statusCode >= 400) {
      throw new Error(`Error in making request to ${response.request.uri.href} Status code: ${response.statusCode}, Body: ${JSON.stringify(response.body)}`);
    }

    this.emitter.logger.trace(`Response statusCode: ${response.statusCode}, body: %j`, response.data);
    return response.data;
  }
}

exports.OneDriveRestClient = OneDriveRestClient;
