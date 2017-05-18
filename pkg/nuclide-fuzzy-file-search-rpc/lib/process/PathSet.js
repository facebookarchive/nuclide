'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PathSet = undefined;

var _os = _interopRequireDefault(require('os'));

var _minimatch;

function _load_minimatch() {
  return _minimatch = require('minimatch');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideFuzzyNative;

function _load_nuclideFuzzyNative() {
  return _nuclideFuzzyNative = require('../../../nuclide-fuzzy-native');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PathSet {

  constructor(paths, ignoredNames, rootPath) {
    this._ignoredPatterns = ignoredNames.map(name => (0, (_minimatch || _load_minimatch()).makeRe)(name, { matchBase: true, dot: true }))
    // makeRe returns false for invalid patterns.
    .filter(x => x);
    this._rootPath = rootPath;
    this._basename = (_nuclideUri || _load_nuclideUri()).default.basename(rootPath);
    this._matcher = new (_nuclideFuzzyNative || _load_nuclideFuzzyNative()).Matcher(this._transformPaths(paths));
  }

  /**
   * To improve working with multiple active directories, include the basename
   * of the parent directory in the matched filenames.
   * This class will invisibly add/strip the basename as necessary.
   */


  addPaths(paths) {
    this._matcher.addCandidates(this._transformPaths(paths));
  }

  removePaths(paths) {
    this._matcher.removeCandidates(this._transformPaths(paths));
  }

  query(query) {
    // Attempt to relativize paths that people might e.g. copy + paste.
    let relQuery = query;
    // Remove the leading home directory qualifier.
    if (relQuery.startsWith('~/')) {
      relQuery = relQuery.substr(2);
    }
    // If a full path is pasted, make the path relative.
    const rootPath = (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator(this._rootPath);
    const basePath = (_nuclideUri || _load_nuclideUri()).default.ensureTrailingSeparator((_nuclideUri || _load_nuclideUri()).default.dirname(rootPath));
    if (relQuery.startsWith(rootPath)) {
      relQuery = relQuery.substr(rootPath.length);
    }

    return this._matcher.match(relQuery, {
      maxResults: 20,
      numThreads: _os.default.cpus().length,
      recordMatchIndexes: true
    })
    // Expand the search results to the full path.
    .map(result => {
      let { matchIndexes } = result;
      if (matchIndexes != null) {
        matchIndexes = matchIndexes.map(idx => idx + basePath.length)
        // Discard all matching characters in the basepath.
        // It can be a little confusing when the highlights don't match, but unless
        // the basename is explicitly used in the query this usually doesn't happen.
        .filter(idx => idx >= rootPath.length);
      }
      return {
        score: result.score,
        path: basePath + result.value,
        matchIndexes: matchIndexes || []
      };
    });
  }

  _isIgnored(path) {
    // This is 2x as fast as using Array.some...
    for (let i = 0; i < this._ignoredPatterns.length; i++) {
      if (this._ignoredPatterns[i].test(path)) {
        return true;
      }
    }
    return false;
  }

  // Append the basename to paths in the index.
  _transformPaths(paths) {
    return paths.filter(path => !this._isIgnored(path)).map(path => (_nuclideUri || _load_nuclideUri()).default.join(this._basename, path));
  }
}
exports.PathSet = PathSet; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */