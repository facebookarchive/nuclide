'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.openTunnels = openTunnels;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _immutable;

function _load_immutable() {
  return _immutable = _interopRequireDefault(require('immutable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function openTunnels(state = new (_immutable || _load_immutable()).default.Map(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).ADD_OPEN_TUNNEL:
      const { tunnel, close } = action.payload;
      return state.set(tunnel, close);
    case (_Actions || _load_Actions()).CLOSE_TUNNEL:
      const toClose = action.payload.tunnel;
      const closeTunnel = state.get(toClose);
      closeTunnel();
      return state.delete(toClose);
    default:
      return state;
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */