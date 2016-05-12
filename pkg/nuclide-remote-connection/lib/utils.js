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

var _fs2;

function _fs() {
  return _fs2 = _interopRequireDefault(require('fs'));
}

/**
 * Returns if the `rootPath` directory contains the `checkPath` which could be:
 *  - A file or directory path that's a direct child of the root path.
 *  - A file or directory path that's a deep child of the root path.
 *  - The exact `rootPath` in an exact or symlinked form.
 *  - May end in a trailing slash if it's a directory path.
 * Follows symlinks to figure out if the real paths of the root and check paths matches.
 */
function containsPathSync(rootPath, checkPath) {
  var realRootPath = null;
  var realCheckPath = null;
  try {
    realRootPath = (_fs2 || _fs()).default.realpathSync(rootPath);
    realCheckPath = (_fs2 || _fs()).default.realpathSync(checkPath);
  } catch (e) {
    realRootPath = rootPath;
    realCheckPath = checkPath;
  }

  var normalizedRootPath = (_path2 || _path()).default.normalize(realRootPath);
  var normalizedCheckPath = (_path2 || _path()).default.normalize(realCheckPath);

  var rootPathNumberOfParts = normalizedRootPath.split((_path2 || _path()).default.sep).length;
  // Extract the matching piece of the normalized path to compare with the root path.
  var rootPathMatch = normalizedCheckPath.split((_path2 || _path()).default.sep).slice(0, rootPathNumberOfParts).join((_path2 || _path()).default.sep);
  return rootPathMatch === normalizedRootPath;
}

module.exports = {
  containsPathSync: containsPathSync
};