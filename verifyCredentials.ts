import Client from './src/OneDriveClient';

export = async function verifyCredentials(cfg: any) {
  const client = new Client(this, cfg);
  try {
    await client.getMyDrives();
    this.logger.info('Verification completed successfully');
    return { verified: true };
  } catch (e) {
    this.logger.error('Verification failed');
    this.logger.error(JSON.stringify(e.response.data));
    throw new Error(e.response.data.message);
  }
}
