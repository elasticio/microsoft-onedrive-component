const { OneDriveRestClient } = require('../lib/utils/OneDriveRestClient');

class Client {
  constructor(logger, cfg) {
    this.logger = logger;
    this.cfg = cfg;
    this.cfg.resourceServerUrl = 'https://graph.microsoft.com/v1.0';
    this.cfg.authorizationServerTokenEndpointUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    this.cfg.oauth2_field_client_id = process.env.OAUTH_CLIENT_ID;
    this.cfg.oauth2_field_client_secret = process.env.OAUTH_CLIENT_SECRET;
    this.restClient = new OneDriveRestClient({ logger: this.logger }, this.cfg);
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
    return response.data.value.filter((item) => !item.hasOwnProperty('folder'));
  }

  async getFileMetadata(path) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/root:/${path}`,
      method: 'GET',
    });
    return response.data;
  }

  async uploadFile(path, content) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/root:/${path}:/content`,
      method: 'PUT',
      body: content,
    });
    return response.data;
  }

  // TODO Support streams in the future
  async downloadFile(path) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/root:/${path}:/content`,
      method: 'GET',
      isJson: false,
    });

    return response.data;
  }

  async deleteItem(path) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/root:/${path}`,
      method: 'DELETE',
    });

    return response.data;
  }

  async isExist(path) {
    const response = await this.restClient.makeReturn({
      url: `/dirves/${this.cfg.driveId}/root:/${path}`,
      method: 'GET',
    });
    if (response.statusCode === 200) {
      return response.data.id;
    }
    if (response.statusCode === 404) {
      return false;
    }
    throw new Error(`Unexpected response from One Drive: ${JSON.stringify(response)}`);
  }

  async replaceFile(id, content) {
    const response = await this.restClient.makeReturn({
      url: `/dirves/${this.cfg.driveId}/items:/${id}/content`,
      body: content,
      method: 'PUT',
    });
    if (response.statusCode === 201) {
      return response.data;
    }
    throw new Error(`Unexpected response from One Drive: ${JSON.stringify(response)}`);
  }

}

module.exports.Client = Client;
