function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _QuickSelectionDispatcher;

function _load_QuickSelectionDispatcher() {
  return _QuickSelectionDispatcher = _interopRequireDefault(require('./QuickSelectionDispatcher'));
}

var _QuickSelectionDispatcher2;

function _load_QuickSelectionDispatcher2() {
  return _QuickSelectionDispatcher2 = require('./QuickSelectionDispatcher');
}

var QuickSelectionActions = {

  query: function query(_query) {
    (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).default.getInstance().dispatch({
      actionType: (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.QUERY,
      query: _query
    });
  },

  changeActiveProvider: function changeActiveProvider(providerName) {
    setImmediate(function () {
      (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).default.getInstance().dispatch({
        actionType: (_QuickSelectionDispatcher2 || _load_QuickSelectionDispatcher2()).ActionTypes.ACTIVE_PROVIDER_CHANGED,
        providerName: providerName
      });
    });
  }

};

module.exports = QuickSelectionActions;