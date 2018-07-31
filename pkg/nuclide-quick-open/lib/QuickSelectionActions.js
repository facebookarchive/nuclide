"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _QuickSelectionDispatcher() {
  const data = require("./QuickSelectionDispatcher");

  _QuickSelectionDispatcher = function () {
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
 *  strict
 * @format
 */
class QuickSelectionActions {
  constructor(dispatcher) {
    this._dispatcher = dispatcher;
  }

  query(query) {
    this._dispatcher.dispatch({
      actionType: _QuickSelectionDispatcher().ActionTypes.QUERY,
      query
    });
  }

  changeActiveProvider(providerName) {
    this._dispatcher.dispatch({
      actionType: _QuickSelectionDispatcher().ActionTypes.ACTIVE_PROVIDER_CHANGED,
      providerName
    });
  }

}

exports.default = QuickSelectionActions;