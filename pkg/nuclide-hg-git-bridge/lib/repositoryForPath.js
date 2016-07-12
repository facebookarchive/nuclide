var _commonsNodeCollection2;

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _commonsNodeCollection() {
  return _commonsNodeCollection2 = require('../../commons-node/collection');
}

/**
 * @param aPath The NuclideUri of a file or directory for which you want to find
 *   a Repository it belongs to.
 * @return A Git or Hg repository the path belongs to, if any.
 */
function repositoryForPath(aPath) {
  // Calling atom.project.repositoryForDirectory gets the real path of the directory,
  // which requires a round-trip to the server for remote paths.
  // Instead, this function keeps filtering local.
  var repositoryContainsPath = require('./repositoryContainsPath');
  var repositories = (0, (_commonsNodeCollection2 || _commonsNodeCollection()).arrayCompact)(atom.project.getRepositories());
  return repositories.find(function (repo) {
    try {
      return repositoryContainsPath(repo, aPath);
    } catch (e) {
      // The repo type is not supported.
      return false;
    }
  });
}

module.exports = repositoryForPath;