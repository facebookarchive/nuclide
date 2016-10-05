function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _QuickSelectionDispatcher2;

function _QuickSelectionDispatcher() {
  return _QuickSelectionDispatcher2 = _interopRequireDefault(require('./QuickSelectionDispatcher'));
}

var _QuickSelectionDispatcher4;

function _QuickSelectionDispatcher3() {
  return _QuickSelectionDispatcher4 = require('./QuickSelectionDispatcher');
}

var QuickSelectionActions = {

  query: function query(_query) {
    (_QuickSelectionDispatcher2 || _QuickSelectionDispatcher()).default.getInstance().dispatch({
      actionType: (_QuickSelectionDispatcher4 || _QuickSelectionDispatcher3()).ActionTypes.QUERY,
      query: _query
    });
  },

  changeActiveProvider: function changeActiveProvider(providerName) {
    setImmediate(function () {
      (_QuickSelectionDispatcher2 || _QuickSelectionDispatcher()).default.getInstance().dispatch({
        actionType: (_QuickSelectionDispatcher4 || _QuickSelectionDispatcher3()).ActionTypes.ACTIVE_PROVIDER_CHANGED,
        providerName: providerName
      });
    });
  }

};

module.exports = QuickSelectionActions;