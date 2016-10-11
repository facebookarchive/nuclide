Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.default = findHgRepository;

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

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _ini;

function _load_ini() {
  return _ini = _interopRequireDefault(require('ini'));
}

var _fs;

function _load_fs() {
  return _fs = _interopRequireDefault(require('fs'));
}

function findHgRepository(startDirectoryPath) {
  if (!(_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.isLocal(startDirectoryPath)) {
    return null;
  }
  var workingDirectoryPath = startDirectoryPath;
  for (;;) {
    var repoPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(workingDirectoryPath, '.hg');
    if (tryIsDirectorySync(repoPath)) {
      var originURL = null;
      // Note that .hg/hgrc will not exist in a local repo created via `hg init`, for example.
      var hgrc = tryReadFileSync((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(repoPath, 'hgrc'));
      if (hgrc != null) {
        var config = (_ini || _load_ini()).default.parse(hgrc);
        if (typeof config.paths === 'object' && typeof config.paths.default === 'string') {
          originURL = config.paths.default;
        }
      }
      return { repoPath: repoPath, originURL: originURL, workingDirectoryPath: workingDirectoryPath };
    }
    var parentDir = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.dirname(workingDirectoryPath);
    if (parentDir === workingDirectoryPath) {
      return null;
    } else {
      workingDirectoryPath = parentDir;
    }
  }
}

function tryIsDirectorySync(dirname) {
  try {
    var stat = (_fs || _load_fs()).default.statSync(dirname);
    return stat.isDirectory();
  } catch (err) {
    return false;
  }
}

function tryReadFileSync(filename) {
  try {
    return (_fs || _load_fs()).default.readFileSync(filename, 'utf8');
  } catch (err) {
    return null;
  }
}
module.exports = exports.default;