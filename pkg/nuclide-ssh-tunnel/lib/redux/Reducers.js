'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tunnels = tunnels;
exports.currentWorkingDirectory = currentWorkingDirectory;
exports.consoleOutput = consoleOutput;

var _ActiveTunnels;

function _load_ActiveTunnels() {
  return _ActiveTunnels = require('../ActiveTunnels');
}

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _immutable;

function _load_immutable() {
  return _immutable = require('immutable');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function tunnels(state = new (_ActiveTunnels || _load_ActiveTunnels()).ActiveTunnels(), action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SUBSCRIBE_TO_TUNNEL:
      let existing = state.get(action.payload.tunnel);
      if (existing == null) {
        existing = {
          tunnel: action.payload.tunnel,
          subscriptions: (0, (_immutable || _load_immutable()).Set)(),
          state: 'initializing'
        };
      }

      return state.set(action.payload.tunnel, Object.assign({}, existing, {
        subscriptions: existing.subscriptions.add(action.payload.subscription)
      }));

    case (_Actions || _load_Actions()).UNSUBSCRIBE_FROM_TUNNEL:
      return state.update(action.payload.tunnel, value => Object.assign({}, value, {
        subscriptions: value.subscriptions.remove(action.payload.subscription)
      }));

    case (_Actions || _load_Actions()).OPEN_TUNNEL:
      const toOpen = state.get(action.payload.tunnel);
      return state.set(action.payload.tunnel, Object.assign({}, toOpen, {
        close: action.payload.close
      }));

    case (_Actions || _load_Actions()).SET_TUNNEL_STATE:
      return state.update(action.payload.tunnel, value => Object.assign({}, value, {
        state: action.payload.state
      }));

    case (_Actions || _load_Actions()).CLOSE_TUNNEL:
      if (state.get(action.payload.tunnel) === undefined) {
        return state;
      }
      return state.update(action.payload.tunnel, value => Object.assign({}, value, {
        error: action.payload.error,
        state: 'closing'
      }));

    case (_Actions || _load_Actions()).DELETE_TUNNEL:
      return state.delete(action.payload.tunnel);

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
   *  strict-local
   * @format
   */

function currentWorkingDirectory(state = null, action) {
  switch (action.type) {
    case (_Actions || _load_Actions()).SET_CURRENT_WORKING_DIRECTORY:
      return action.payload.directory;
    default:
      return state;
  }
}

function consoleOutput(state = new _rxjsBundlesRxMinJs.Subject(), action) {
  return state;
}