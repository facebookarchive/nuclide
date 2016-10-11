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

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _ActionType;

function _load_ActionType() {
  return _ActionType = _interopRequireWildcard(require('./ActionType'));
}

var _nuclideHgRepositoryClient;

function _load_nuclideHgRepositoryClient() {
  return _nuclideHgRepositoryClient = require('../../nuclide-hg-repository-client');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var Commands = (function () {
  function Commands(dispatch, getState) {
    _classCallCheck(this, Commands);

    this._dispatch = dispatch;
    this._getState = getState;

    // Bind to allow methods to be passed as callbacks.
    this.createBookmark = this.createBookmark.bind(this);
    this.deleteBookmark = this.deleteBookmark.bind(this);
    this.renameBookmark = this.renameBookmark.bind(this);
    this.updateToBookmark = this.updateToBookmark.bind(this);
  }

  _createClass(Commands, [{
    key: 'createBookmark',
    value: function createBookmark(name, repository) {
      if (repository.getType() !== 'hg') {
        return;
      }

      // Type was checked with `getType`. Downcast to safely access members with Flow.
      var hgRepository = repository;

      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-create-bookmark');
      hgRepository.createBookmark(name);
    }
  }, {
    key: 'deleteBookmark',
    value: function deleteBookmark(bookmark, repository) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-delete-bookmark');
      this._dispatch({
        payload: {
          bookmark: bookmark,
          repository: repository
        },
        type: (_ActionType || _load_ActionType()).DELETE_BOOKMARK
      });
    }
  }, {
    key: 'renameBookmark',
    value: function renameBookmark(bookmark, nextName, repository) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-rename-bookmark');
      this._dispatch({
        payload: {
          bookmark: bookmark,
          nextName: nextName,
          repository: repository
        },
        type: (_ActionType || _load_ActionType()).RENAME_BOOKMARK
      });
    }
  }, {
    key: 'fetchProjectDirectories',
    value: function fetchProjectDirectories() {
      this._dispatch({
        payload: {
          projectDirectories: atom.project.getDirectories()
        },
        type: (_ActionType || _load_ActionType()).SET_PROJECT_DIRECTORIES
      });

      this.fetchProjectRepositories();
    }
  }, {
    key: 'fetchProjectRepositories',
    value: function fetchProjectRepositories() {
      this._dispatch({
        type: (_ActionType || _load_ActionType()).FETCH_PROJECT_REPOSITORIES
      });
    }
  }, {
    key: 'updateToBookmark',
    value: function updateToBookmark(bookmark, repository) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-update-to-bookmark');
      this._dispatch({
        payload: {
          bookmark: bookmark,
          repository: repository
        },
        type: (_ActionType || _load_ActionType()).UPDATE_TO_BOOKMARK
      });
    }
  }]);

  return Commands;
})();

exports.default = Commands;
module.exports = exports.default;