const { Client } = require('../client');

exports.getDisks = async function getDisks(cfg) {
  /* eslint-disable-next-line no-param-reassign */
  cfg.oauth2.tokenExpiryTime = new Date(new Date().getTime() + 10000);
  const client = new Client(this.logger, cfg);
  const drives = await client.getMyDrives();
  const drivesMeta = {};
  // eslint-disable-next-line no-return-assign
  drives.forEach((drive) => drivesMeta[drive.id] = drive.owner.user.displayName);
  return drivesMeta;
};

async function getAllPath(client, folderPaths, itemId) {
  const currentFolderPaths = folderPaths;
  const children = await client.getChildren(itemId);
  const folders = children.filter((item) => Object.prototype.hasOwnProperty.call(item, 'folder'));
  // eslint-disable-next-line no-restricted-syntax
  for (const childFolder of folders) {
    const {
      id, name, folder, parentReference,
    } = childFolder;
    currentFolderPaths[id] = `${parentReference.path}/${name}`;
    if (folder.childCount > 0) {
      // eslint-disable-next-line no-await-in-loop
      await getAllPath(client, currentFolderPaths, id);
    }
  }
}

exports.getFolderPaths = async function getFolderPaths(cfg) {
  /* eslint-disable-next-line no-param-reassign */
  cfg.oauth2.tokenExpiryTime = new Date(new Date().getTime() + 10000);
  const client = new Client(this.logger, cfg);
  const folderPaths = { root: '/drive/root' };
  await getAllPath(client, folderPaths);
  return folderPaths;
};
