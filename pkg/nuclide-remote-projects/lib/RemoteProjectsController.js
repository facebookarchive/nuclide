"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._observeConnectionState = _observeConnectionState;
exports.default = void 0;

function _bindObservableAsProps() {
  const data = require("../../../modules/nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _renderReactRoot() {
  const data = require("../../../modules/nuclide-commons-ui/renderReactRoot");

  _renderReactRoot = function () {
    return data;
  };

  return data;
}

function _event() {
  const data = require("../../../modules/nuclide-commons/event");

  _event = function () {
    return data;
  };

  return data;
}

function _observable() {
  const data = require("../../../modules/nuclide-commons/observable");

  _observable = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var React = _interopRequireWildcard(require("react"));

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function _ConnectionState() {
  const data = _interopRequireDefault(require("./ConnectionState"));

  _ConnectionState = function () {
    return data;
  };

  return data;
}

function _StatusBarTile() {
  const data = _interopRequireDefault(require("./StatusBarTile"));

  _StatusBarTile = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const THROTTLE_TIME_MS = 500; // Exported for testing.

function _observeConnectionState(connectionStream) {
  return connectionStream.switchMap(connections => {
    if (connections.length === 0) {
      return _RxMin.Observable.of([]);
    } // Observe the connection states of all connections simultaneously.
    // $FlowFixMe: add array signature to combineLatest


    return _RxMin.Observable.combineLatest(connections.map(conn => {
      const heartbeat = conn.getHeartbeat();
      return _RxMin.Observable.of(heartbeat.isAway() ? _ConnectionState().default.DISCONNECTED : _ConnectionState().default.CONNECTED).concat(_RxMin.Observable.merge((0, _event().observableFromSubscribeFunction)(cb => heartbeat.onHeartbeat(cb)).mapTo(_ConnectionState().default.CONNECTED), (0, _event().observableFromSubscribeFunction)(cb => heartbeat.onHeartbeatError(cb)).mapTo(_ConnectionState().default.DISCONNECTED))).distinctUntilChanged() // Key the connection states by hostname.
      .map(state => [conn.getRemoteHostname(), state]);
    }));
  }).map(states => ({
    connectionStates: new Map(states)
  }));
}

class RemoteProjectsController {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
  }

  consumeStatusBar(statusBar) {
    const BoundStatusBarTile = (0, _bindObservableAsProps().bindObservableAsProps)(_observeConnectionState(_nuclideRemoteConnection().ServerConnection.observeRemoteConnections()).let((0, _observable().throttle)(THROTTLE_TIME_MS)), _StatusBarTile().default);
    const item = (0, _renderReactRoot().renderReactRoot)(React.createElement(BoundStatusBarTile, null));
    item.className = 'inline-block';
    const statusBarTile = statusBar.addLeftTile({
      item,
      priority: -99
    });
    const disposable = new (_UniversalDisposable().default)(() => statusBarTile.destroy());

    this._disposables.add(disposable);

    return new (_UniversalDisposable().default)(() => {
      this._disposables.remove(disposable);
    });
  }

  dispose() {
    this._disposables.dispose();
  }

}

exports.default = RemoteProjectsController;