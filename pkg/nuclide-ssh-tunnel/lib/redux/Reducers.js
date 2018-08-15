"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.tunnels = tunnels;
exports.currentWorkingDirectory = currentWorkingDirectory;
exports.consoleOutput = consoleOutput;

function _ActiveTunnels() {
  const data = require("../ActiveTunnels");

  _ActiveTunnels = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _immutable() {
  const data = require("immutable");

  _immutable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function tunnels(state = new (_ActiveTunnels().ActiveTunnels)(), action) {
  switch (action.type) {
    case Actions().SUBSCRIBE_TO_TUNNEL:
      let existing = state.get(action.payload.tunnel);

      if (existing == null) {
        existing = {
          tunnel: action.payload.tunnel,
          subscriptions: (0, _immutable().Set)(),
          state: 'initializing'
        };
      }

      return state.set(action.payload.tunnel, Object.assign({}, existing, {
        subscriptions: existing.subscriptions.add(action.payload.subscription)
      }));

    case Actions().UNSUBSCRIBE_FROM_TUNNEL:
      return state.update(action.payload.tunnel, value => Object.assign({}, value, {
        subscriptions: value.subscriptions.remove(action.payload.subscription)
      }));

    case Actions().OPEN_TUNNEL:
      const toOpen = state.get(action.payload.tunnel);
      return state.set(action.payload.tunnel, Object.assign({}, toOpen, {
        close: action.payload.close
      }));

    case Actions().SET_TUNNEL_STATE:
      return state.update(action.payload.tunnel, value => Object.assign({}, value, {
        state: action.payload.state
      }));

    case Actions().CLOSE_TUNNEL:
      if (state.get(action.payload.tunnel) === undefined) {
        return state;
      }

      return state.update(action.payload.tunnel, value => Object.assign({}, value, {
        error: action.payload.error,
        state: 'closing'
      }));

    case Actions().DELETE_TUNNEL:
      return state.delete(action.payload.tunnel);

    default:
      return state;
  }
}

function currentWorkingDirectory(state = null, action) {
  switch (action.type) {
    case Actions().SET_CURRENT_WORKING_DIRECTORY:
      return action.payload.directory;

    default:
      return state;
  }
}

function consoleOutput(state = new _RxMin.Subject(), action) {
  return state;
}