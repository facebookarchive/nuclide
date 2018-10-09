"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.ActionTypes = void 0;

function _Dispatcher() {
  const data = _interopRequireDefault(require("../../commons-node/Dispatcher"));

  _Dispatcher = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const ActionTypes = Object.freeze({
  ACTIVE_PROVIDER_CHANGED: 'ACTIVE_PROVIDER_CHANGED',
  QUERY: 'QUERY'
}); // Flow hack: Every QuickSelectionAction actionType must be in ActionTypes.
// $FlowFixMe(>=0.55.0) Flow suppress

exports.ActionTypes = ActionTypes;
'';

class QuickSelectionDispatcher extends _Dispatcher().default {}

exports.default = QuickSelectionDispatcher;