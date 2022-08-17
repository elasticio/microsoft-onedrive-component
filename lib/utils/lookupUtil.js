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
    if (this.client.cfg.attachFile) {
      const getAttachment = async () => this.client.downloadFile(path);
      const attachmentId = await this.attachmentsProcessor.uploadAttachment(getAttachment);
      const attachmentUrl = this.attachmentsProcessor.getMaesterAttachmentUrlById(attachmentId);
      metadata.attachment = {
        url: attachmentUrl,
        size: metadata.size,
        'content-type': metadata.file.mimeType,
      };
    }
    return metadata;
  }
}

exports.OneDriveLookupFile = OneDriveLookupFile;
