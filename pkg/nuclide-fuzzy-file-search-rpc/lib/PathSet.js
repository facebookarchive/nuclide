Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _os2;

function _os() {
  return _os2 = _interopRequireDefault(require('os'));
}

var _minimatch2;

function _minimatch() {
  return _minimatch2 = require('minimatch');
}

var _nuclideFuzzyNative2;

function _nuclideFuzzyNative() {
  return _nuclideFuzzyNative2 = require('../../nuclide-fuzzy-native');
}

var PathSet = (function () {
  function PathSet(paths, ignoredNames) {
    var _this = this;

    _classCallCheck(this, PathSet);

    this._ignoredPatterns = ignoredNames.map(function (name) {
      return (0, (_minimatch2 || _minimatch()).makeRe)(name, { matchBase: true, dot: true });
    })
    // makeRe returns false for invalid patterns.
    .filter(function (x) {
      return x;
    });
    this._matcher = new (_nuclideFuzzyNative2 || _nuclideFuzzyNative()).Matcher(paths.filter(function (path) {
      return !_this._isIgnored(path);
    }));
  }

  _createClass(PathSet, [{
    key: 'addPaths',
    value: function addPaths(paths) {
      var _this2 = this;

      this._matcher.addCandidates(paths.filter(function (path) {
        return !_this2._isIgnored(path);
      }));
    }
  }, {
    key: 'removePaths',
    value: function removePaths(paths) {
      this._matcher.removeCandidates(paths);
    }
  }, {
    key: 'match',
    value: function match(query) {
      return this._matcher.match(query, {
        maxResults: 20,
        numThreads: (_os2 || _os()).default.cpus().length,
        recordMatchIndexes: true
      });
    }
  }, {
    key: '_isIgnored',
    value: function _isIgnored(path) {
      // This is 2x as fast as using Array.some...
      for (var i = 0; i < this._ignoredPatterns.length; i++) {
        if (this._ignoredPatterns[i].test(path)) {
          return true;
        }
      }
      return false;
    }
  }]);

  return PathSet;
})();

exports.PathSet = PathSet;