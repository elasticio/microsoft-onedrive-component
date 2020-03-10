const { Client } = require('../client');

exports.getDisks = async function (cfg) {
  const client = new Client(this.logger, cfg);
  const drives = await client.getMyDrives();
  const drivesMeta = {};
  // eslint-disable-next-line no-return-assign
  drives.forEach((drive) => drivesMeta[drive.id] = drive.owner.user.displayName);
  return drivesMeta;
};
