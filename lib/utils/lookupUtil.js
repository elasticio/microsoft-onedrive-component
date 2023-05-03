const { LookupObject } = require('@elastic.io/oih-standard-library/lib/actions/lookupObject');
const { AttachmentProcessor } = require('@elastic.io/component-commons-library');
const { getUserAgent } = require('.');

// eslint-disable-next-line no-unused-vars
class OneDriveLookupFile extends LookupObject {
  constructor(logger, client) {
    super(logger);
    this.client = client;
  }

  async lookupObject(msg) {
    const { path } = msg.body;
    const msgId = msg.id;
    const metadata = await this.client.getFileMetadata(path);
    if (this.client.cfg.attachFile) {
      const getAttachmentAsStream = async () => this.client.downloadFile(path);
      const attachmentsProcessor = new AttachmentProcessor(getUserAgent(), msgId);
      const attachmentId = await attachmentsProcessor.uploadAttachment(getAttachmentAsStream);
      const attachmentUrl = attachmentsProcessor.getMaesterAttachmentUrlById(attachmentId);
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
