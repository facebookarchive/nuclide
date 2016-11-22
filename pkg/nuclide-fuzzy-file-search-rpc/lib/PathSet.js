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
exports.PathSet = undefined;

var _os = _interopRequireDefault(require('os'));

var _minimatch;

function _load_minimatch() {
  return _minimatch = require('minimatch');
}

var _nuclideFuzzyNative;

function _load_nuclideFuzzyNative() {
  return _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let PathSet = exports.PathSet = class PathSet {

  constructor(paths, ignoredNames) {
    this._ignoredPatterns = ignoredNames.map(name => (0, (_minimatch || _load_minimatch()).makeRe)(name, { matchBase: true, dot: true }))
    // makeRe returns false for invalid patterns.
    .filter(x => x);
    this._matcher = new (_nuclideFuzzyNative || _load_nuclideFuzzyNative()).Matcher(paths.filter(path => !this._isIgnored(path)));
  }

  addPaths(paths) {
    this._matcher.addCandidates(paths.filter(path => !this._isIgnored(path)));
  }

  removePaths(paths) {
    this._matcher.removeCandidates(paths);
  }

  match(query) {
    return this._matcher.match(query, {
      maxResults: 20,
      numThreads: _os.default.cpus().length,
      recordMatchIndexes: true
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
};