'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _QuickSelectionDispatcher;

function _load_QuickSelectionDispatcher() {
  return _QuickSelectionDispatcher = require('./QuickSelectionDispatcher');
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

class QuickSelectionActions {

  constructor(dispatcher) {
    this._dispatcher = dispatcher;
  }

  query(query) {
    this._dispatcher.dispatch({
      actionType: (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).ActionTypes.QUERY,
      query
    });
  }

  changeActiveProvider(providerName) {
    this._dispatcher.dispatch({
      actionType: (_QuickSelectionDispatcher || _load_QuickSelectionDispatcher()).ActionTypes.ACTIVE_PROVIDER_CHANGED,
      providerName
    });
  }
}
exports.default = QuickSelectionActions;