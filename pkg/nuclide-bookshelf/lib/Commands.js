'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Commands = undefined;

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _utils;

function _load_utils() {
  return _utils = require('./utils');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class Commands {

  constructor(dispatch, getState) {
    this.addProjectRepository = repository => {
      this._dispatch({
        payload: {
          repository
        },
        type: (_constants || _load_constants()).ActionType.ADD_PROJECT_REPOSITORY
      });
    };

    this.updatePaneItemState = () => {
      this._dispatch({
        type: (_constants || _load_constants()).ActionType.UPDATE_PANE_ITEM_STATE,
        payload: {
          repositoryPathToEditors: (0, (_utils || _load_utils()).getRepoPathToEditors)()
        }
      });
    };

    this.restorePaneItemState = (repository, newShortHead) => {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-restore-files');
      this._dispatch({
        payload: {
          repository,
          shortHead: newShortHead
        },
        type: (_constants || _load_constants()).ActionType.RESTORE_PANE_ITEM_STATE
      });
    };

    this._dispatch = dispatch;
    this._getState = getState;
  }

}
exports.Commands = Commands;