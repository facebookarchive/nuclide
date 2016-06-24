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

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _ChildManager2;

function _ChildManager() {
  return _ChildManager2 = _interopRequireDefault(require('./ChildManager'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _events2;

function _events() {
  return _events2 = require('events');
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.umd.min.js'));
}

var _ws2;

function _ws() {
  return _ws2 = _interopRequireDefault(require('ws'));
}

var EXECUTOR_PORT = 8081;
var WS_URL = 'ws://localhost:' + EXECUTOR_PORT + '/debugger-proxy?role=debugger&name=Nuclide';

var DebuggerProxyClient = (function () {
  function DebuggerProxyClient() {
    _classCallCheck(this, DebuggerProxyClient);

    this._children = new Set();
    this._shouldConnect = false;
    this._emitter = new (_events2 || _events()).EventEmitter();
  }

  _createClass(DebuggerProxyClient, [{
    key: 'connect',
    value: function connect() {
      if (this._shouldConnect) {
        return;
      }
      this._shouldConnect = true;
      this._tryToConnect();
    }
  }, {
    key: 'disconnect',
    value: function disconnect() {
      this._shouldConnect = false;
      this._killConnection();
    }
  }, {
    key: 'onDidEvalApplicationScript',
    value: function onDidEvalApplicationScript(callback) {
      var _this = this;

      this._emitter.on('eval_application_script', callback);
      return new (_atom2 || _atom()).Disposable(function () {
        _this._emitter.removeListener('eval_application_script', callback);
      });
    }
  }, {
    key: '_tryToConnect',
    value: function _tryToConnect() {
      var _this2 = this;

      this._killConnection();

      if (!this._shouldConnect) {
        return;
      }

      var ws = new (_ws2 || _ws()).default(WS_URL);
      var onReply = function onReply(replyID, result) {
        ws.send(JSON.stringify({ replyID: replyID, result: result }));
      };

      // TODO(matthewwithanm): Don't share an emitter; add API for subscribing to what we want to
      //   ChildManager.
      var childManager = new (_ChildManager2 || _ChildManager()).default(onReply, this._emitter);
      this._children.add(childManager);

      var rnMessages = (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEvent(ws, 'message').map(JSON.parse);

      this._wsDisposable = new (_atom2 || _atom()).CompositeDisposable(new (_atom2 || _atom()).Disposable(function () {
        childManager.killChild();
        _this2._children.delete(childManager);
      }), new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription(rnMessages.subscribe(function (message) {
        if (message.$close) {
          _this2.disconnect();
          return;
        }
        childManager.handleMessage(message);
      })),
      // TODO: Add timeout
      // If we can't connect, or get disconnected, keep trying to connect.
      new (_commonsNodeStream2 || _commonsNodeStream()).DisposableSubscription((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.merge((_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEvent(ws, 'error').filter(function (err) {
        return err.code === 'ECONNREFUSED';
      }), (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).default.Observable.fromEvent(ws, 'close')).subscribe(function () {
        _this2._killConnection();

        // Keep attempting to connect.
        setTimeout(_this2._tryToConnect.bind(_this2), 500);
      })), new (_atom2 || _atom()).Disposable(function () {
        ws.close();
      }));
    }
  }, {
    key: '_killConnection',
    value: function _killConnection() {
      if (this._wsDisposable) {
        this._wsDisposable.dispose();
        this._wsDisposable = null;
      }
    }
  }]);

  return DebuggerProxyClient;
})();

exports.DebuggerProxyClient = DebuggerProxyClient;