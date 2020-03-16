const { LookupObject } = require('@elastic.io/oih-standard-library/lib/actions/lookupObject');
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');

// eslint-disable-next-line no-unused-vars
class OneDriveLookupFile extends LookupObject {
  constructor(logger, client) {
    super(logger);
    this.client = client;
    this.attachmentsProcessor = new AttachmentProcessor();
  }

  async lookupObject(path) {
    const metadata = await this.client.getFileMetadata(path);
    const file = await this.client.downloadFile(path);
    await this.attachmentsProcessor.uploadAttachment(file);
    return metadata;
  }
}
