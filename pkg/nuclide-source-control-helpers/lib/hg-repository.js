'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findHgRepository;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _ini;

function _load_ini() {
  return _ini = _interopRequireDefault(require('ini'));
}

var _fs = _interopRequireDefault(require('fs'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This function returns HgRepositoryDescription filled with a repoPath and
 * originURL iff it finds that the given directory is within an Hg repository.
 */
function findHgRepository(startDirectoryPath) {
  if (!(_nuclideUri || _load_nuclideUri()).default.isLocal(startDirectoryPath)) {
    return null;
  }
  let workingDirectoryPath = startDirectoryPath;
  for (;;) {
    const repoPath = (_nuclideUri || _load_nuclideUri()).default.join(workingDirectoryPath, '.hg');
    if (tryIsDirectorySync(repoPath)) {
      let originURL = null;
      // Note that .hg/hgrc will not exist in a local repo created via `hg init`, for example.
      const hgrc = tryReadFileSync((_nuclideUri || _load_nuclideUri()).default.join(repoPath, 'hgrc'));
      if (hgrc != null) {
        const config = (_ini || _load_ini()).default.parse(hgrc);
        if (typeof config.paths === 'object' && typeof config.paths.default === 'string') {
          originURL = config.paths.default;
        }
      }
      return { repoPath, originURL, workingDirectoryPath };
    }
    const parentDir = (_nuclideUri || _load_nuclideUri()).default.dirname(workingDirectoryPath);
    if (parentDir === workingDirectoryPath) {
      return null;
    } else {
      workingDirectoryPath = parentDir;
    }
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function tryIsDirectorySync(dirname) {
  try {
    const stat = _fs.default.statSync(dirname);
    return stat.isDirectory();
  } catch (err) {
    return false;
  }
}

function tryReadFileSync(filename) {
  try {
    return _fs.default.readFileSync(filename, 'utf8');
  } catch (err) {
    return null;
  }
}