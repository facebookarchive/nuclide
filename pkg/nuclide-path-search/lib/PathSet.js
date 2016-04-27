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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _nuclideFuzzyNative = require('../../nuclide-fuzzy-native');

var PathSet = (function () {
  function PathSet(paths) {
    _classCallCheck(this, PathSet);

    this._matcher = new _nuclideFuzzyNative.Matcher(paths);
  }

  _createClass(PathSet, [{
    key: 'addPaths',
    value: function addPaths(paths) {
      this._matcher.addCandidates(paths);
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
        numThreads: _os2['default'].cpus().length,
        recordMatchIndexes: true
      });
    }
  }]);

  return PathSet;
})();

exports.PathSet = PathSet;