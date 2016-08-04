

/**
 * This function returns HgRepositoryDescription filled with a repoPath and
 * originURL iff it finds that the given directory is within an Hg repository.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _ini2;

function _ini() {
  return _ini2 = _interopRequireDefault(require('ini'));
}

function findHgRepository(directoryPath) {
  var fs = require('fs-plus');
  var workingDirectoryPath = directoryPath;
  var repoPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(workingDirectoryPath, '.hg');
  var originURL = null;
  for (;;) {
    var dirToTest = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(workingDirectoryPath, '.hg');
    if (fs.isDirectorySync(dirToTest)) {
      repoPath = dirToTest;
      var hgrc = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(dirToTest, 'hgrc');
      // Note that .hg/hgrc will not exist in a local repo created via `hg init`, for example.
      if (fs.isFileSync(hgrc)) {
        var config = (_ini2 || _ini()).default.parse(fs.readFileSync(hgrc, 'utf8'));
        if (typeof config.paths === 'object' && typeof config.paths.default === 'string') {
          originURL = config.paths.default;
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
  return { repoPath: repoPath, originURL: originURL, workingDirectoryPath: workingDirectoryPath };
}

function isRootDir(directoryPath) {
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.isRoot(directoryPath);
}

function getParentDir(directoryPath) {
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.resolve(directoryPath, '..');
}

module.exports = findHgRepository;