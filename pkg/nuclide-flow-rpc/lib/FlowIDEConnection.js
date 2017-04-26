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

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
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

const SUBSCRIBE_RETRY_INTERVAL = 5000;
const SUBSCRIBE_RETRIES = 10;

// Manages the connection to a single `flow ide` process. The lifecycle of an instance of this class
// is tied to the lifecycle of a the `flow ide` process.
class FlowIDEConnection {

  // Because vscode-jsonrpc offers no mechanism to unsubscribe from notifications, we have to make
  // sure that we put a bound on the number of times we add subscriptions, otherwise we could have a
  // memory leak. The most sensible bound is to just allow a single subscription per message type.
  // Therefore, we must have singleton observables rather than returning new instances from method
  // calls.
  constructor(process) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._ideProcess = process;
    this._ideProcess.stderr.pipe((0, (_through || _load_through()).default)(msg => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().info('Flow IDE process stderr: ', msg.toString());
    }));
    this._connection = (_vscodeJsonrpc || _load_vscodeJsonrpc()).createMessageConnection(new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageReader(this._ideProcess.stdout), new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(this._ideProcess.stdin));
    this._connection.listen();

    this._ideProcess.on('exit', () => this.dispose());
    this._ideProcess.on('close', () => this.dispose());

    this._diagnostics = _rxjsBundlesRxMinJs.Observable.fromEventPattern(handler => {
      this._connection.onNotification(NOTIFICATION_METHOD_NAME, errors => {
        handler(errors);
      });
    },
    // no-op: vscode-jsonrpc offers no way to unsubscribe
    () => {}).publishReplay(1);
    this._disposables.add(this._diagnostics.connect());

    this._recheckBookends = _rxjsBundlesRxMinJs.Observable.fromEventPattern(handler => {
      this._connection.onNotification('startRecheck', () => {
        handler({ kind: 'start-recheck' });
      });
      this._connection.onNotification('endRecheck', () => {
        handler({ kind: 'end-recheck' });
      });
    },
    // no-op
    () => {}).publish();
    this._disposables.add(this._recheckBookends.connect());

    this._disposables.add(() => {
      this._ideProcess.stdin.end();
      this._ideProcess.kill();

      this._connection.dispose();
    });
  }

  dispose() {
    this._disposables.dispose();
  }

  onWillDispose(callback) {
    this._disposables.add(callback);
    return new (_eventKit || _load_eventKit()).Disposable(() => {
      this._disposables.remove(callback);
    });
  }

  observeDiagnostics() {
    const subscribe = () => {
      this._connection.sendNotification(SUBSCRIBE_METHOD_NAME);
      // This is a temporary hack used to simplify the temporary vscode-jsonrpc implementation in
      // Flow: D4659335
      // TODO remove this hack sometime after Flow v0.44 is released (D4798007)
      this._ideProcess.stdin.write('\r\n');
    };

    const retrySubscription = _rxjsBundlesRxMinJs.Observable.interval(SUBSCRIBE_RETRY_INTERVAL).take(SUBSCRIBE_RETRIES).takeUntil(this._diagnostics).subscribe(() => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Did not receive diagnostics after subscribe request -- retrying...');
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('nuclide-flow.missing-push-diagnostics');
      subscribe();
    });

    subscribe();
    return _rxjsBundlesRxMinJs.Observable.using(() => retrySubscription, () => {
      return _rxjsBundlesRxMinJs.Observable.merge(this._diagnostics.map(errors => ({ kind: 'errors', errors })), this._recheckBookends);
    });
  }

  // Flow will not send these messages unless we have subscribed to diagnostics. So, this observable
  // will never emit any items unless observeDiagnostics() is called.
  observeRecheckBookends() {
    return this._recheckBookends;
  }
}
exports.FlowIDEConnection = FlowIDEConnection;