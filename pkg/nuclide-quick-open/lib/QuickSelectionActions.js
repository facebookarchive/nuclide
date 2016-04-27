

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var QuickSelectionDispatcher = require('./QuickSelectionDispatcher');
var ActionType = QuickSelectionDispatcher.ActionType;

var QuickSelectionActions = {

  query: function query(_query) {
    QuickSelectionDispatcher.getInstance().dispatch({
      actionType: ActionType.QUERY,
      query: _query
    });
  },

  changeActiveProvider: function changeActiveProvider(providerName) {
    setImmediate(function () {
      QuickSelectionDispatcher.getInstance().dispatch({
        actionType: ActionType.ACTIVE_PROVIDER_CHANGED,
        providerName: providerName
      });
    });
  }

};

module.exports = QuickSelectionActions;