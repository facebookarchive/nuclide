'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowIDEConnection = undefined;

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _vscodeJsonrpc;

function _load_vscodeJsonrpc() {
  return _vscodeJsonrpc = _interopRequireWildcard(require('vscode-jsonrpc'));
}

var _through;

function _load_through() {
  return _through = _interopRequireDefault(require('through'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

// TODO put these in flow-typed when they are fleshed out better

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const SUBSCRIBE_METHOD_NAME = 'subscribeToDiagnostics';

const NOTIFICATION_METHOD_NAME = 'diagnosticsNotification';

// Manages the connection to a single `flow ide` process. The lifecycle of an instance of this class
// is tied to the lifecycle of a the `flow ide` process.
class FlowIDEConnection {

  constructor(process) {
    this._isDisposed = false;
    this._onWillDisposeCallbacks = new Set();
    this._ideProcess = process;
    this._ideProcess.stderr.pipe((0, (_through || _load_through()).default)(msg => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Flow IDE process stderr: ', msg.toString());
    }));
    this._connection = (_vscodeJsonrpc || _load_vscodeJsonrpc()).createMessageConnection(new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageReader(this._ideProcess.stdout), new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(this._ideProcess.stdin));
    this._connection.listen();

    this._ideProcess.on('exit', () => this.dispose());
    this._ideProcess.on('close', () => this.dispose());
  }

  dispose() {
    if (!this._isDisposed) {
      for (const callback of this._onWillDisposeCallbacks) {
        callback();
      }

      this._ideProcess.stdin.end();
      this._ideProcess.kill();

      this._connection.dispose();
      this._isDisposed = true;
    }
  }

  onWillDispose(callback) {
    this._onWillDisposeCallbacks.add(callback);
    return new (_eventKit || _load_eventKit()).Disposable(() => {
      this._onWillDisposeCallbacks.delete(callback);
    });
  }

  observeDiagnostics() {
    const s = new _rxjsBundlesRxMinJs.Subject();
    this._connection.onNotification(NOTIFICATION_METHOD_NAME, arg => {
      s.next(arg);
    });
    this._connection.sendNotification(SUBSCRIBE_METHOD_NAME);
    // This is a temporary hack used to simplify the temporary vscode-jsonrpc implementation in
    // Flow: D4659335
    this._ideProcess.stdin.write('\r\n');
    return s.publishReplay(1).refCount();
  }
}
exports.FlowIDEConnection = FlowIDEConnection;