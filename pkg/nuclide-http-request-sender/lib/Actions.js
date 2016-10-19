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

exports.updateState = updateState;
exports.sendHttpRequest = sendHttpRequest;
var UPDATE_STATE = 'UPDATE_STATE';
exports.UPDATE_STATE = UPDATE_STATE;
var SEND_REQUEST = 'SEND_REQUEST';

exports.SEND_REQUEST = SEND_REQUEST;

function updateState(state) {
  return {
    type: UPDATE_STATE,
    payload: { state: state }
  };
}

function sendHttpRequest() {
  return {
    type: SEND_REQUEST
  };
}