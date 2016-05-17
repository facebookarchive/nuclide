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

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

function getIdentifiersFromPath(filePath) {
  var ids = new Set();

  var baseName = (_path2 || _path()).default.basename(filePath);

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
  var baseName = (_path2 || _path()).default.basename(filePath);
  return removeFileType(baseName);
}

function relativizeForRequire(sourcePath, destPath) {
  var relativePath = (_path2 || _path()).default.relative((_path2 || _path()).default.dirname(sourcePath), destPath);
  var noFileType = removeFileType(relativePath);
  return !noFileType.startsWith('.') ? '.' + (_path2 || _path()).default.sep + noFileType : noFileType;
}

function removeFileType(str) {
  var splits = str.split('.');
  if (splits.length <= 1) {
    return str;
  } else {
    return splits.slice(0, -1).join('.');
  }
}

var ModuleMapUtils = {
  getIdentifiersFromPath: getIdentifiersFromPath,
  getLiteralFromPath: getLiteralFromPath,
  relativizeForRequire: relativizeForRequire
};

module.exports = ModuleMapUtils;