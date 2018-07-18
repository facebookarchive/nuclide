"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Commands = void 0;

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class Commands {
  constructor(dispatch, getState) {
    this.addProjectRepository = repository => {
      this._dispatch({
        payload: {
          repository
        },
        type: _constants().ActionType.ADD_PROJECT_REPOSITORY
      });
    };

    this.updatePaneItemState = () => {
      this._dispatch({
        type: _constants().ActionType.UPDATE_PANE_ITEM_STATE,
        payload: {
          repositoryPathToEditors: (0, _utils().getRepoPathToEditors)()
        }
      });
    };

    this.restorePaneItemState = (repository, newShortHead) => {
      (0, _nuclideAnalytics().track)('bookshelf-restore-files');

      this._dispatch({
        payload: {
          repository,
          shortHead: newShortHead
        },
        type: _constants().ActionType.RESTORE_PANE_ITEM_STATE
      });
    };

    this._dispatch = dispatch;
    this._getState = getState;
  }

}

exports.Commands = Commands;