function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _ini = require('ini');

var _ini2 = _interopRequireDefault(_ini);

var _nuclideCommons = require('../../nuclide-commons');

/**
 * This function returns HgRepositoryDescription filled with a repoPath and
 * originURL iff it finds that the given directory is within an Hg repository.
 */
function findHgRepository(directoryPath) {
  var fs = require('fs-plus');
  var workingDirectoryPath = directoryPath;
  var repoPath = _path2['default'].join(workingDirectoryPath, '.hg');
  var originURL = null;
  /*eslint-disable no-constant-condition */
  while (true) {
    var dirToTest = _path2['default'].join(workingDirectoryPath, '.hg');
    if (fs.isDirectorySync(dirToTest)) {
      repoPath = dirToTest;
      if (fs.isFileSync(_path2['default'].join(dirToTest, 'hgrc'))) {
        var config = _ini2['default'].parse(fs.readFileSync(_path2['default'].join(dirToTest, 'hgrc'), 'utf8'));
        if (typeof config.paths === 'object' && typeof config.paths['default'] === 'string') {
          originURL = config.paths['default'];
        }
      }
      break;
    }
    if (isRootDir(workingDirectoryPath)) {
      return null;
    } else {
      workingDirectoryPath = getParentDir(workingDirectoryPath);
    }
  }
  /*eslint-enable no-constant-condition */
  return { repoPath: repoPath, originURL: originURL, workingDirectoryPath: workingDirectoryPath };
}

function isRootDir(directoryPath) {
  return _nuclideCommons.fsPromise.isRoot(directoryPath);
}

function getParentDir(directoryPath) {
  return _path2['default'].resolve(directoryPath, '..');
}

module.exports = findHgRepository;