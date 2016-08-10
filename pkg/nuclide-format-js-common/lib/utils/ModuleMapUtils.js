function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _StringUtils2;

function _StringUtils() {
  return _StringUtils2 = _interopRequireDefault(require('./StringUtils'));
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../../commons-node/nuclideUri'));
}

function getIdentifiersFromPath(filePath) {
  var ids = new Set();

  var baseName = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(filePath);

  // Get rid of extensions like, '.js', '.jsx', '.react.js', etc.
  var noExtensions = baseName.split('.')[0];

  // These are not valid tokens in an identifier so we have to remove them.
  var splits = noExtensions.split(/[^\w]/);

  // Just a standard identifier.
  ids.add(splits.join(''));

  // Then a camel case identifier (or possibly title case based on file name).
  var camelCaseSplits = [splits[0]];
  for (var i = 1; i < splits.length; i++) {
    camelCaseSplits.push((_StringUtils2 || _StringUtils()).default.capitalize(splits[i]));
  }
  ids.add(camelCaseSplits.join(''));

  return ids;
}

function getLiteralFromPath(filePath) {
  var baseName = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(filePath);
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.stripExtension(baseName);
}

function relativizeForRequire(sourcePath, destPath) {
  var relativePath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.relative((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.dirname(sourcePath), destPath);
  var noFileType = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.stripExtension(relativePath);
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.ensureLocalPrefix(noFileType);
}

var ModuleMapUtils = {
  getIdentifiersFromPath: getIdentifiersFromPath,
  getLiteralFromPath: getLiteralFromPath,
  relativizeForRequire: relativizeForRequire
};

module.exports = ModuleMapUtils;