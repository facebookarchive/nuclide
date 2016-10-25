'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = repositoryForPath;

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _repositoryContainsPath;

function _load_repositoryContainsPath() {
  return _repositoryContainsPath = _interopRequireDefault(require('./repositoryContainsPath'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param aPath The NuclideUri of a file or directory for which you want to find
 *   a Repository it belongs to.
 * @return A Git or Hg repository the path belongs to, if any.
 */
function repositoryForPath(aPath) {
  // Calling atom.project.repositoryForDirectory gets the real path of the directory,
  // which requires a round-trip to the server for remote paths.
  // Instead, this function keeps filtering local.
  const repositories = (0, (_collection || _load_collection()).arrayCompact)(atom.project.getRepositories());
  return repositories.find(repo => {
    try {
      return (0, (_repositoryContainsPath || _load_repositoryContainsPath()).default)(repo, aPath);
    } catch (e) {
      // The repo type is not supported.
      return false;
    }
  });
}module.exports = exports['default'];