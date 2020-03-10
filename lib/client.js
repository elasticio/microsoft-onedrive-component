const { OAuth2RestClient } = require('@elastic.io/component-commons-library');

class Client {
  constructor(logger, cfg) {
    this.logger = logger;
    this.cfg = cfg;
    this.cfg.resourceServerUrl = 'https://graph.microsoft.com/v1.0';
    this.cfg.authorizationServerTokenEndpointUrl = cfg.oauth2.token_uri;
    this.cfg.oauth2_field_client_id = cfg.oauth2.client_id;
    this.cfg.oauth2_field_client_secret = cfg.oauth2.client_secret;
    this.restClient = new OAuth2RestClient({ logger: this.logger }, this.cfg);
  }

  async getMyDrives() {
    const response = await this.restClient.makeRequest({
      url: '/me/drives',
      method: 'GET',
    });

    return response.value;
  }

  async getChildrenFiles(path) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/root:/${path}:/children`,
      method: 'GET',
    });

    // eslint-disable-next-line no-prototype-builtins
    return response.value.filter((item) => !item.hasOwnProperty('folder'));
  }

  async uploadFile(path, content) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/root:/${path}:/content`,
      method: 'PUT',
      body: content,
    });

    return response;
  }

  async downloadFile(path) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/root:/${path}:/content`,
      method: 'GET',
    });

    return response;
  }

  async deleteItem(path) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/root:/${path}`,
      method: 'DELETE',
    });

    return response;
  }
}

module.exports.Client = Client;
