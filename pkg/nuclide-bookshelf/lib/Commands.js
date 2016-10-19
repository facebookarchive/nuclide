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

var Commands = (function () {
  function Commands(dispatch, getState) {
    _classCallCheck(this, Commands);

    this._dispatch = dispatch;
    this._getState = getState;

    this.addProjectRepository = this.addProjectRepository.bind(this);
    this.restorePaneItemState = this.restorePaneItemState.bind(this);
    this.updatePaneItemState = this.updatePaneItemState.bind(this);
  }

  _createClass(Commands, [{
    key: 'addProjectRepository',
    value: function addProjectRepository(repository) {
      this._dispatch({
        payload: {
          repository: repository
        },
        type: (_constants || _load_constants()).ActionType.ADD_PROJECT_REPOSITORY
      });
    }
  }, {
    key: 'updatePaneItemState',
    value: function updatePaneItemState() {
      this._dispatch({
        type: (_constants || _load_constants()).ActionType.UPDATE_PANE_ITEM_STATE,
        payload: {
          repositoryPathToEditors: (0, (_utils || _load_utils()).getRepoPathToEditors)()
        }
      });
    }
  }, {
    key: 'restorePaneItemState',
    value: function restorePaneItemState(repository, newShortHead) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('bookshelf-restore-files');
      this._dispatch({
        payload: {
          repository: repository,
          shortHead: newShortHead
        },
        type: (_constants || _load_constants()).ActionType.RESTORE_PANE_ITEM_STATE
      });
    }
  }]);

  return Commands;
})();

exports.Commands = Commands;