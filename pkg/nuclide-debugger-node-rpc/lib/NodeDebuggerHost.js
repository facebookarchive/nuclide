Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _rxjsBundlesRxMinJs2;

function _rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs2 = _interopRequireDefault(require('rxjs/bundles/Rx.min.js'));
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

var _nuclideDebuggerCommonLibWebSocketServer2;

function _nuclideDebuggerCommonLibWebSocketServer() {
  return _nuclideDebuggerCommonLibWebSocketServer2 = require('../../nuclide-debugger-common/lib/WebSocketServer');
}

var _Session2;

function _Session() {
  return _Session2 = require('./Session');
}

var _commonsNodeUniversalDisposable2;

function _commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable2 = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var log = (_utils2 || _utils()).default.log;

/**
 * Responsible for bootstrap and host node inspector backend.
 */

var NodeDebuggerHost = (function () {
  function NodeDebuggerHost() {
    var _this = this;

    _classCallCheck(this, NodeDebuggerHost);

    this._subscriptions = new (_eventKit2 || _eventKit()).CompositeDisposable();
    this._nodeSocketServer = new (_nuclideDebuggerCommonLibWebSocketServer2 || _nuclideDebuggerCommonLibWebSocketServer()).WebSocketServer();
    this._subscriptions.add(this._nodeSocketServer);
    this._close$ = new (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).default.Subject();
    this._close$.first().subscribe(function () {
      _this.dispose();
    });
  }

  _createClass(NodeDebuggerHost, [{
    key: 'start',
    value: function start() {
      var _this2 = this;

      // This is the port that the V8 debugger usually listens on.
      // TODO(natthu): Provide a way to override this in the UI.
      var debugPort = 5858;
      var wsPort = this._generateRandomInteger(2000, 65535);
      this._nodeSocketServer.start(wsPort).then(function (websocket) {
        log('Websocket server created for port: ' + wsPort);
        // TODO: do we need to add webSocket into CompositeDisposable?
        var config = {
          debugPort: debugPort,
          preload: false };
        // This makes the node inspector not load all the source files on startup.
        var session = new (_Session2 || _Session()).Session(config, debugPort, websocket);
        (_rxjsBundlesRxMinJs2 || _rxjsBundlesRxMinJs()).default.Observable.fromEvent(session, 'close').subscribe(_this2._close$);
      });
      return 'ws://127.0.0.1:' + wsPort + '/';
    }
  }, {
    key: '_generateRandomInteger',
    value: function _generateRandomInteger(min, max) {
      return Math.floor(Math.random() * (max - min) + min);
    }
  }, {
    key: 'onSessionEnd',
    value: function onSessionEnd(callback) {
      return new (_commonsNodeUniversalDisposable2 || _commonsNodeUniversalDisposable()).default(this._close$.first().subscribe(callback));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }]);

  return NodeDebuggerHost;
})();

exports.NodeDebuggerHost = NodeDebuggerHost;