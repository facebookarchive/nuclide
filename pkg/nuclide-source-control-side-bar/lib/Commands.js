'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ActionType;

function _load_ActionType() {
  return _ActionType = _interopRequireWildcard(require('./ActionType'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class Commands {

  constructor(dispatch, getState) {
    this._dispatch = dispatch;
    this._getState = getState;

    // Bind to allow methods to be passed as callbacks.
    this.createBookmark = this.createBookmark.bind(this);
    this.deleteBookmark = this.deleteBookmark.bind(this);
    this.renameBookmark = this.renameBookmark.bind(this);
    this.updateToBookmark = this.updateToBookmark.bind(this);
  }

  createBookmark(name, repository) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-create-bookmark');
    this._dispatch({
      payload: {
        name,
        repository
      },
      type: (_ActionType || _load_ActionType()).CREATE_BOOKMARK
    });
  }

  deleteBookmark(bookmark, repository) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-delete-bookmark');
    this._dispatch({
      payload: {
        bookmark,
        repository
      },
      type: (_ActionType || _load_ActionType()).DELETE_BOOKMARK
    });
  }

  renameBookmark(bookmark, nextName, repository) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-rename-bookmark');
    this._dispatch({
      payload: {
        bookmark,
        nextName,
        repository
      },
      type: (_ActionType || _load_ActionType()).RENAME_BOOKMARK
    });
  }

  fetchProjectDirectories() {
    this._dispatch({
      payload: {
        projectDirectories: atom.project.getDirectories()
      },
      type: (_ActionType || _load_ActionType()).SET_PROJECT_DIRECTORIES
    });

    this.fetchProjectRepositories();
  }

  fetchProjectRepositories() {
    this._dispatch({
      type: (_ActionType || _load_ActionType()).FETCH_PROJECT_REPOSITORIES
    });
  }

  updateToBookmark(bookmark, repository) {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('scsidebar-update-to-bookmark');
    this._dispatch({
      payload: {
        bookmark,
        repository
      },
      type: (_ActionType || _load_ActionType()).UPDATE_TO_BOOKMARK
    });
  }
}
exports.default = Commands; /**
                             * Copyright (c) 2015-present, Facebook, Inc.
                             * All rights reserved.
                             *
                             * This source code is licensed under the license found in the LICENSE file in
                             * the root directory of this source tree.
                             *
                             * 
                             */