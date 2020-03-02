/* eslint-disable-next-line no-unused-vars */
module.exports = function verifyCredentials(credentials, cb) {
  if (credentials) {
    return { verified: true };
  }
  return { verified: false };
};
