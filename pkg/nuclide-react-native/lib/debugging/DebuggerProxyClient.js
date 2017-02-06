'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerProxyClient = undefined;

var _formatEnoentNotification;

function _load_formatEnoentNotification() {
  return _formatEnoentNotification = _interopRequireDefault(require('../../../commons-atom/format-enoent-notification'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../commons-node/UniversalDisposable'));
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../../nuclide-logging');
}

var _executeRequests;

function _load_executeRequests() {
  return _executeRequests = require('./executeRequests');
}

var _runApp;

function _load_runApp() {
  return _runApp = require('./runApp');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Debugging React Native involves running two processes in parallel: the React Native app, which
 * runs in a simulator or device, and the executor, which executes JavaScript in a separate
 * processes (and which is ultimately the process we debug). On the React Native App site,
 * instructions are sent and results received via websocket. The executor, on the other hand,
 * receives the instructions, executes them in a worker process, and emits the results. The whole
 * thing, then, is one big loop.
 *
 * In our code, this is  modeled as streams of messages, with two transformations: one for the the
 * React Native app and one for the executor. The input of each is the output of the other.
 *
 *                               rnMessages -> executorRequests
 *
 *                         +-----------------------------------------+
 *                         |                                         |
 *                         |                                         v
 *                +--------+----------+                     +--------+----------+
 *                |                   |                     |                   |
 *                |                   |                     |                   |
 *                | React Native App  |                     |     Executor      |
 *                |                   |                     |                   |
 *                |     (runApp)      |                     | (executeRequests) |
 *                |                   |                     |                   |
 *                |                   |                     |                   |
 *                +--------+----------+                     +----------+--------+
 *                         ^                                           |
 *                         |                                           |
 *                         +-------------------------------------------+
 *
 *                             executorResults <- executorResponses
 *
 */
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class DebuggerProxyClient {

  constructor() {
    const executorResults = new _rxjsBundlesRxMinJs.Subject();

    this._rnMessages = (0, (_runApp || _load_runApp()).runApp)(executorResults).catch(err => {
      atom.notifications.addError('There was an unexpected error with the React Native app', {
        stack: err.stack
      });
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).finally(() => {
      this.disconnect();
    }).publish();

    // Messages with `$close` are special instructions and messages with `replyID` are cross-talk
    // from another executor (probably Chrome), so filter both out. Otherwise, the messages from RN
    // are forwarded as-is to the executor.
    const executorRequests = this._rnMessages.filter(message => message.$close == null && message.replyID == null);

    this._executorResponses = (0, (_executeRequests || _load_executeRequests()).executeRequests)(executorRequests).catch(err => {
      if (err.code === 'ENOENT') {
        const { message, meta } = (0, (_formatEnoentNotification || _load_formatEnoentNotification()).default)({
          feature: 'React Native debugging',
          toolName: 'node',
          pathSetting: 'nuclide-react-native.pathToNode'
        });
        atom.notifications.addError(message, meta);
        return _rxjsBundlesRxMinJs.Observable.empty();
      }
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(err);
      return _rxjsBundlesRxMinJs.Observable.empty();
    }).finally(() => {
      this.disconnect();
    }).publish();

    this._pids = this._executorResponses.filter(response => response.kind === 'pid').map(response => {
      if (!(response.kind === 'pid')) {
        throw new Error('Invariant violation: "response.kind === \'pid\'"');
      }

      return response.pid;
    });

    // Send the executor results to the RN app. (Close the loop.)
    this._executorResponses.filter(response => response.kind === 'result').subscribe(executorResults);

    // Disconnect when the RN app tells us to (via a specially-formatted message).
    this._rnMessages.filter(message => Boolean(message.$close)).subscribe(() => {
      this.disconnect();
    });

    // Log executor errors.
    this._executorResponses.filter(response => response.kind === 'error').map(response => {
      if (!(response.kind === 'error')) {
        throw new Error('Invariant violation: "response.kind === \'error\'"');
      }

      return response.message;
    }).subscribe((0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error);
  }

  connect() {
    if (this._subscription != null) {
      // We're already connecting.
      return;
    }

    const sub = new _rxjsBundlesRxMinJs.Subscription();

    sub.add(this._rnMessages.connect());

    sub.add(this._executorResponses.connect());

    // Null our subscription reference when the observable completes/errors. We'll use this to know
    // if it's running.
    sub.add(() => {
      this._subscription = null;
    });

    this._subscription = sub;
  }

  disconnect() {
    if (this._subscription == null) {
      return;
    }
    this._subscription.unsubscribe();
  }

  /**
   * An API for subscribing to the next worker process pid.
   */
  onDidEvalApplicationScript(callback) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._pids.subscribe(callback));
  }
}
exports.DebuggerProxyClient = DebuggerProxyClient;