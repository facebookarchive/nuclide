function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path2;

function _path() {
  return _path2 = _interopRequireDefault(require('path'));
}

/**
 * @param filePath A file path.
 * @return The file path with a trailing separator, if it doesn't already have one.
 */
function ensureTrailingSeparator(filePath) {
  if (filePath.endsWith((_path2 || _path()).default.sep)) {
    return filePath;
  } else {
    return filePath + (_path2 || _path()).default.sep;
  }
}

module.exports = {
  ensureTrailingSeparator: ensureTrailingSeparator
};