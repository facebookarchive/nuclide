Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomFormatEnoentNotification2;

function _commonsAtomFormatEnoentNotification() {
  return _commonsAtomFormatEnoentNotification2 = _interopRequireDefault(require('../../../commons-atom/format-enoent-notification'));
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../../commons-node/stream');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../../nuclide-logging');
}

var _executeRequests2;

function _executeRequests() {
  return _executeRequests2 = require('./executeRequests');
}

var _runApp2;

function _runApp() {
  return _runApp2 = require('./runApp');
}

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

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

var DebuggerProxyClient = (function () {
  function DebuggerProxyClient() {
    var _this = this;

    _classCallCheck(this, DebuggerProxyClient);

    var executorResults = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subject();

    this._rnMessages = (0, (_runApp2 || _runApp()).runApp)(executorResults).catch(function (err) {
      atom.notifications.addError('There was an unexpected error with the React Native app', {
        stack: err.stack
      });
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }).finally(function () {
      _this.disconnect();
    }).publish();

    // Messages with `$close` are special instructions and messages with `replyID` are cross-talk
    // from another executor (probably Chrome), so filter both out. Otherwise, the messages from RN
    // are forwarded as-is to the executor.
    var executorRequests = this._rnMessages.filter(function (message) {
      return message.$close == null && message.replyID == null;
    });

    this._executorResponses = (0, (_executeRequests2 || _executeRequests()).executeRequests)(executorRequests).catch(function (err) {
      if (err.code === 'ENOENT') {
        var _ref = (0, (_commonsAtomFormatEnoentNotification2 || _commonsAtomFormatEnoentNotification()).default)({
          feature: 'React Native debugging',
          toolName: 'node',
          pathSetting: 'nuclide-react-native.pathToNode'
        });

        var message = _ref.message;
        var meta = _ref.meta;

        atom.notifications.addError(message, meta);
        return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
      }
      (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error(err);
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.empty();
    }).finally(function () {
      _this.disconnect();
    }).publish();

    this._pids = this._executorResponses.filter(function (response) {
      return response.kind === 'pid';
    }).map(function (response) {
      return (0, (_assert2 || _assert()).default)(response.kind === 'pid'), response.pid;
    });

    // Send the executor results to the RN app. (Close the loop.)
    this._executorResponses.filter(function (response) {
      return response.kind === 'result';
    }).subscribe(executorResults);

    // Disconnect when the RN app tells us to (via a specially-formatted message).
    this._rnMessages.filter(function (message) {
      return Boolean(message.$close);
    }).subscribe(function () {
      _this.disconnect();
    });

    // Log executor errors.
    this._executorResponses.filter(function (response) {
      return response.kind === 'error';
    }).map(function (response) {
      return (0, (_assert2 || _assert()).default)(response.kind === 'error'), response.message;
    }).subscribe((0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error);
  }

  _createClass(DebuggerProxyClient, [{
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      if (this._subscription != null) {
        // We're already connecting.
        return;
      }

      var sub = new (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Subscription();

      sub.add(this._rnMessages.connect());

      sub.add(this._executorResponses.connect());

      // Null our subscription reference when the observable completes/errors. We'll use this to know
      // if it's running.
      sub.add(function () {
        _this2._subscription = null;
      });

      this._subscription = sub;
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      if (this._subscription == null) {
        return;
      }
      this._subscription.unsubscribe();
    }

    /**
     * An API for subscribing to the next worker process pid.
     */
  }, {
    key: 'onDidEvalApplicationScript',
    value: function onDidEvalApplicationScript(callback) {
      return new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(this._pids.subscribe(callback));
    }
  }]);

  return DebuggerProxyClient;
})();

exports.DebuggerProxyClient = DebuggerProxyClient;