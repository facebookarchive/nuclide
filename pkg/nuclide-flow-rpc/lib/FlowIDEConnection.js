"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FlowIDEConnection = void 0;

var _RxMin = require("rxjs/bundles/Rx.min.js");

function rpc() {
  const data = _interopRequireWildcard(require("vscode-jsonrpc"));

  rpc = function () {
    return data;
  };

  return data;
}

function _through() {
  const data = _interopRequireDefault(require("through"));

  _through = function () {
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

function _SafeStreamMessageReader() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/SafeStreamMessageReader"));

  _SafeStreamMessageReader = function () {
    return data;
  };

  return data;
}

function _nuclideAnalytics() {
  const data = require("../../nuclide-analytics");

  _nuclideAnalytics = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideOpenFilesRpc() {
  const data = require("../../nuclide-open-files-rpc");

  _nuclideOpenFilesRpc = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
const SUBSCRIBE_RETRIES = 10; // Manages the connection to a single `flow ide` process. The lifecycle of an instance of this class
// is tied to the lifecycle of the `flow ide` process.

class FlowIDEConnection {
  // Because vscode-jsonrpc offers no mechanism to unsubscribe from notifications, we have to make
  // sure that we put a bound on the number of times we add subscriptions, otherwise we could have a
  // memory leak. The most sensible bound is to just allow a single subscription per message type.
  // Therefore, we must have singleton observables rather than returning new instances from method
  // calls.
  constructor(process, fileCache) {
    this._disposables = new (_UniversalDisposable().default)();
    this._fileCache = fileCache;
    this._ideProcess = process;

    this._ideProcess.stderr.pipe((0, _through().default)(msg => {
      (0, _log4js().getLogger)('nuclide-flow-rpc').info('Flow IDE process stderr: ', msg.toString());
    }));

    this._connection = rpc().createMessageConnection(new (_SafeStreamMessageReader().default)(this._ideProcess.stdout), new (rpc().StreamMessageWriter)(this._ideProcess.stdin), (0, _log4js().getLogger)('FlowIDEConnection-jsonrpc'));

    this._connection.listen();

    this._ideProcess.on('exit', () => this.dispose());

    this._ideProcess.on('close', () => this.dispose());

    const diagnostics = _RxMin.Observable.fromEventPattern(handler => {
      this._connection.onNotification(NOTIFICATION_METHOD_NAME, errors => {
        handler(errors);
      });
    }, // no-op: vscode-jsonrpc offers no way to unsubscribe
    () => {});

    this._diagnostics = _RxMin.Observable.using(() => {
      const fileEventsObservable = this._fileCache.observeFileEvents().bufferTime(100
      /* ms */
      ).filter(fileEvents => fileEvents.length !== 0);

      const fileEventsHandler = fileEvents => {
        const openPaths = [];
        const closePaths = [];

        for (const fileEvent of fileEvents) {
          const filePath = fileEvent.fileVersion.filePath;

          switch (fileEvent.kind) {
            case _nuclideOpenFilesRpc().FileEventKind.OPEN:
              openPaths.push(filePath);
              break;

            case _nuclideOpenFilesRpc().FileEventKind.CLOSE:
              closePaths.push(filePath);
              break;

            case _nuclideOpenFilesRpc().FileEventKind.EDIT:
              // TODO: errors-as-you-type
              break;

            case _nuclideOpenFilesRpc().FileEventKind.SAVE:
              // TODO: handle saves correctly
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

    this._recheckBookends = _RxMin.Observable.fromEventPattern(handler => {
      this._connection.onNotification('startRecheck', () => {
        handler({
          kind: 'start-recheck'
        });
      });

      this._connection.onNotification('endRecheck', () => {
        handler({
          kind: 'end-recheck'
        });
      });
    }, // no-op
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

    return new (_UniversalDisposable().default)(() => {
      this._disposables.remove(callback);
    });
  }

  observeDiagnostics() {
    const subscribe = () => {
      this._connection.sendNotification(SUBSCRIBE_METHOD_NAME);
    };

    const retrySubscription = _RxMin.Observable.interval(SUBSCRIBE_RETRY_INTERVAL).take(SUBSCRIBE_RETRIES).takeUntil(this._diagnostics).subscribe(() => {
      (0, _log4js().getLogger)('nuclide-flow-rpc').error('Did not receive diagnostics after subscribe request -- retrying...');
      (0, _nuclideAnalytics().track)('nuclide-flow.missing-push-diagnostics');
      subscribe();
    });

    subscribe();
    return _RxMin.Observable.using(() => retrySubscription, () => {
      return _RxMin.Observable.merge(this._diagnostics.map(errors => ({
        kind: 'errors',
        errors
      })), this._recheckBookends);
    });
  } // Flow will not send these messages unless we have subscribed to diagnostics. So, this observable
  // will never emit any items unless observeDiagnostics() is called.


  observeRecheckBookends() {
    return this._recheckBookends;
  }

  getAutocompleteSuggestions(filePath, line, column, contents) {
    return this._connection.sendRequest('autocomplete', filePath, line, column, contents);
  }

}

exports.FlowIDEConnection = FlowIDEConnection;