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

    return response.data.value;
  }

  async getChildren(itemId, params, isFullResponse) {
    const path = itemId ? `items/${itemId}` : 'root';
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/${path}/children${params || ''}`,
      method: 'GET',
    });

    return isFullResponse ? response : response.data.value;
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

  async downloadFileByItemId(itemId) {
    const response = await this.restClient.makeRequest({
      url: `/drives/${this.cfg.driveId}/items/${itemId}/content`,
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
    try {
      const response = await this.getFileMetadata(path);
      return response.id;
    } catch (e) {
      if (e.status === 404) {
        return false;
      }
      throw e;
    }
  }
}

module.exports.Client = Client;
