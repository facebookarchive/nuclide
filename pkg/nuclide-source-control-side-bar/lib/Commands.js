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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionType2;

function _ActionType() {
  return _ActionType2 = _interopRequireWildcard(require('./ActionType'));
}

var _nuclideHgRepositoryClient2;

function _nuclideHgRepositoryClient() {
  return _nuclideHgRepositoryClient2 = require('../../nuclide-hg-repository-client');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var Commands = (function () {
  function Commands(dispatch, getState) {
    _classCallCheck(this, Commands);

    this._dispatch = dispatch;
    this._getState = getState;

    // Bind to allow methods to be passed as callbacks.
    this.createBookmark = this.createBookmark.bind(this);
    this.deleteBookmark = this.deleteBookmark.bind(this);
    this.updateToBookmark = this.updateToBookmark.bind(this);
  }

  _createClass(Commands, [{
    key: 'createBookmark',
    value: function createBookmark(name, repository) {
      var repositoryAsync = repository.async;
      if (repositoryAsync.getType() !== 'hg') {
        return;
      }

      // Type was checked with `getType`. Downcast to safely access members with Flow.
      (0, (_assert2 || _assert()).default)(repositoryAsync instanceof (_nuclideHgRepositoryClient2 || _nuclideHgRepositoryClient()).HgRepositoryClientAsync);

      repositoryAsync.createBookmark(name);
    }
  }, {
    key: 'deleteBookmark',
    value: function deleteBookmark(bookmark, repository) {
      var repositoryAsync = repository.async;
      if (repositoryAsync.getType() !== 'hg') {
        return;
      }

      // Type was checked with `getType`. Downcast to safely access members with Flow.
      (0, (_assert2 || _assert()).default)(repositoryAsync instanceof (_nuclideHgRepositoryClient2 || _nuclideHgRepositoryClient()).HgRepositoryClientAsync);

      repositoryAsync.deleteBookmark(bookmark.bookmark);
    }
  }, {
    key: 'fetchProjectDirectories',
    value: function fetchProjectDirectories() {
      this._dispatch({
        payload: {
          projectDirectories: atom.project.getDirectories()
        },
        type: (_ActionType2 || _ActionType()).SET_PROJECT_DIRECTORIES
      });

      this.fetchProjectRepositories();
    }
  }, {
    key: 'fetchProjectRepositories',
    value: function fetchProjectRepositories() {
      this._dispatch({
        type: (_ActionType2 || _ActionType()).FETCH_PROJECT_REPOSITORIES
      });
    }
  }, {
    key: 'updateToBookmark',
    value: function updateToBookmark(bookmark, repository) {
      this._dispatch({
        payload: {
          bookmark: bookmark,
          repository: repository
        },
        type: (_ActionType2 || _ActionType()).UPDATE_TO_BOOKMARK
      });
    }
  }]);

  return Commands;
})();

exports.default = Commands;
module.exports = exports.default;