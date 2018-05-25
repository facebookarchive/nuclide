'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports._observeConnectionState = _observeConnectionState;

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../../modules/nuclide-commons-ui/bindObservableAsProps');
}

var _renderReactRoot;

function _load_renderReactRoot() {
  return _renderReactRoot = require('../../../modules/nuclide-commons-ui/renderReactRoot');
}

var _event;

function _load_event() {
  return _event = require('../../../modules/nuclide-commons/event');
}

var _observable;

function _load_observable() {
  return _observable = require('../../../modules/nuclide-commons/observable');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _react = _interopRequireWildcard(require('react'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _ConnectionState;

function _load_ConnectionState() {
  return _ConnectionState = _interopRequireDefault(require('./ConnectionState'));
}

var _StatusBarTile;

function _load_StatusBarTile() {
  return _StatusBarTile = _interopRequireDefault(require('./StatusBarTile'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const THROTTLE_TIME_MS = 500;

// Exported for testing.
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

function _observeConnectionState(connectionStream) {
  return connectionStream.switchMap(connections => {
    if (connections.length === 0) {
      return _rxjsBundlesRxMinJs.Observable.of([]);
    }
    // Observe the connection states of all connections simultaneously.
    // $FlowFixMe: add array signature to combineLatest
    return _rxjsBundlesRxMinJs.Observable.combineLatest(connections.map(conn => {
      const heartbeat = conn.getHeartbeat();
      return _rxjsBundlesRxMinJs.Observable.of(heartbeat.isAway() ? (_ConnectionState || _load_ConnectionState()).default.DISCONNECTED : (_ConnectionState || _load_ConnectionState()).default.CONNECTED).concat(_rxjsBundlesRxMinJs.Observable.merge((0, (_event || _load_event()).observableFromSubscribeFunction)(cb => heartbeat.onHeartbeat(cb)).mapTo((_ConnectionState || _load_ConnectionState()).default.CONNECTED), (0, (_event || _load_event()).observableFromSubscribeFunction)(cb => heartbeat.onHeartbeatError(cb)).mapTo((_ConnectionState || _load_ConnectionState()).default.DISCONNECTED))).distinctUntilChanged()
      // Key the connection states by hostname.
      .map(state => [conn.getRemoteHostname(), state]);
    }));
  }).map(states => ({
    connectionStates: new Map(states)
  }));
}

class RemoteProjectsController {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  consumeStatusBar(statusBar) {
    const BoundStatusBarTile = (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(_observeConnectionState((_nuclideRemoteConnection || _load_nuclideRemoteConnection()).ServerConnection.observeRemoteConnections()).let((0, (_observable || _load_observable()).throttle)(THROTTLE_TIME_MS)), (_StatusBarTile || _load_StatusBarTile()).default);
    const item = (0, (_renderReactRoot || _load_renderReactRoot()).renderReactRoot)(_react.createElement(BoundStatusBarTile, null));
    item.className = 'inline-block';
    const statusBarTile = statusBar.addLeftTile({
      item,
      priority: -99
    });
    const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default(() => statusBarTile.destroy());
    this._disposables.add(disposable);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._disposables.remove(disposable);
    });
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.default = RemoteProjectsController;