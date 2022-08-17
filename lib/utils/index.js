const packageJson = require('../../package.json');
const compJson = require('../../component.json');

exports.getUserAgent = () => {
  const { name: compName } = packageJson;
  const { version: compVersion } = compJson;
  const libVersion = packageJson.dependencies['@elastic.io/component-commons-library'];
  return `${compName}/${compVersion} component-commons-library/${libVersion}`;
};
