function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _QuickSelectionDispatcher = require('./QuickSelectionDispatcher');

var _QuickSelectionDispatcher2 = _interopRequireDefault(_QuickSelectionDispatcher);

var QuickSelectionActions = {

  query: function query(_query) {
    _QuickSelectionDispatcher2.default.getInstance().dispatch({
      actionType: _QuickSelectionDispatcher2.default.ActionType.QUERY,
      query: _query
    });
  },

  changeActiveProvider: function changeActiveProvider(providerName) {
    setImmediate(function () {
      _QuickSelectionDispatcher2.default.getInstance().dispatch({
        actionType: _QuickSelectionDispatcher2.default.ActionType.ACTIVE_PROVIDER_CHANGED,
        providerName: providerName
      });
    });
  }

};

module.exports = QuickSelectionActions;