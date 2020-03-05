const { OAuth2RestClient } = require('@elastic.io/component-commons-library');

class Client {
  constructor(logger, cfg) {
    this.logger = logger;
    this.cfg = cfg;
    this.cfg.resourceServerUrl = 'https://graph.microsoft.com/v1.0';
    this.restClient = new OAuth2RestClient({ logger: this.logger }, cfg);
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