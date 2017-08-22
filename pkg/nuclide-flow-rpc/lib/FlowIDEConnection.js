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
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
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
 * @format
 */

const SUBSCRIBE_METHOD_NAME = 'subscribeToDiagnostics';

const NOTIFICATION_METHOD_NAME = 'diagnosticsNotification';

const OPEN_EVENT_METHOD_NAME = 'didOpen';
const CLOSE_EVENT_METHOD_NAME = 'didClose';

const SUBSCRIBE_RETRY_INTERVAL = 5000;
const SUBSCRIBE_RETRIES = 10;

// Manages the connection to a single `flow ide` process. The lifecycle of an instance of this class
// is tied to the lifecycle of the `flow ide` process.
class FlowIDEConnection {

  constructor(process, fileCache) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._fileCache = fileCache;
    this._ideProcess = process;
    this._ideProcess.stderr.pipe((0, (_through || _load_through()).default)(msg => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc').info('Flow IDE process stderr: ', msg.toString());
    }));
    this._connection = (_vscodeJsonrpc || _load_vscodeJsonrpc()).createMessageConnection(new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageReader(this._ideProcess.stdout), new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(this._ideProcess.stdin));
    this._connection.listen();

    this._ideProcess.on('exit', () => this.dispose());
    this._ideProcess.on('close', () => this.dispose());

    const diagnostics = _rxjsBundlesRxMinJs.Observable.fromEventPattern(handler => {
      this._connection.onNotification(NOTIFICATION_METHOD_NAME, errors => {
        handler(errors);
      });
    },
    // no-op: vscode-jsonrpc offers no way to unsubscribe
    () => {});

    this._diagnostics = _rxjsBundlesRxMinJs.Observable.using(() => {
      const fileEventsObservable = this._fileCache.observeFileEvents()
      // $FlowFixMe (bufferTime isn't in the libdef for rxjs)
      .bufferTime(100 /* ms */).filter(fileEvents => fileEvents.length !== 0);

      const fileEventsHandler = fileEvents => {
        const openPaths = [];
        const closePaths = [];
        for (const fileEvent of fileEvents) {
          const filePath = fileEvent.fileVersion.filePath;
          switch (fileEvent.kind) {
            case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.OPEN:
              openPaths.push(filePath);
              break;
            case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.CLOSE:
              closePaths.push(filePath);
              break;
            case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.EDIT:
              // TODO: errors-as-you-type
              break;
            default:
              fileEvent.kind;
          }
        }
        if (openPaths.length !== 0) {
          this._connection.sendNotification(OPEN_EVENT_METHOD_NAME, openPaths);
        }
        if (closePaths.length !== 0) {
          this._connection.sendNotification(CLOSE_EVENT_METHOD_NAME, closePaths);
        }
      };

      return fileEventsObservable.subscribe(fileEventsHandler);
    }, () => diagnostics).publishReplay(1);
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

  // Because vscode-jsonrpc offers no mechanism to unsubscribe from notifications, we have to make
  // sure that we put a bound on the number of times we add subscriptions, otherwise we could have a
  // memory leak. The most sensible bound is to just allow a single subscription per message type.
  // Therefore, we must have singleton observables rather than returning new instances from method
  // calls.


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
    };

    const retrySubscription = _rxjsBundlesRxMinJs.Observable.interval(SUBSCRIBE_RETRY_INTERVAL).take(SUBSCRIBE_RETRIES).takeUntil(this._diagnostics).subscribe(() => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-flow-rpc').error('Did not receive diagnostics after subscribe request -- retrying...');
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

  getAutocompleteSuggestions(filePath, line, column, contents) {
    return this._connection.sendRequest('autocomplete', filePath, line, column, contents);
  }
}
exports.FlowIDEConnection = FlowIDEConnection;