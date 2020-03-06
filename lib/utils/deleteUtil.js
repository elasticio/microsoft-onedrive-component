const { DeleteById } = require('@elastic.io/oih-standard-library/lib/actions/delete');

class OneDriveDelete extends DeleteById {
  constructor(logger, client) {
    super(logger);
    this.client = client;
  }

  // eslint-disable-next-line class-methods-use-this, no-unused-vars
  getId(msg, cfg) {
    return msg.body.path;
  }

  async deleteObject(path) {
    this.logger.info(`Deleting file by path: ${path}`);
    await this.client.deleteItem(path);
    return path;
  }
}

exports.OneDriveDelete = OneDriveDelete;
