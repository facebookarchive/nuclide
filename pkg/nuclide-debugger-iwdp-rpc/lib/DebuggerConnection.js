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

var _commonsNodeUniversalDisposable;

function _load_commonsNodeUniversalDisposable() {
  return _commonsNodeUniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _ws;

function _load_ws() {
  return _ws = _interopRequireDefault(require('ws'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _createWebSocketListener;

function _load_createWebSocketListener() {
  return _createWebSocketListener = require('./createWebSocketListener');
}

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
}

var log = (_logger || _load_logger()).logger.log;

var DebuggerConnection = (function () {
  function DebuggerConnection(iosDeviceInfo, sendMessageToClient) {
    _classCallCheck(this, DebuggerConnection);

    this._sendMessageToClient = sendMessageToClient;
    this._fileCache = new (_FileCache || _load_FileCache()).FileCache();
    var webSocketDebuggerUrl = iosDeviceInfo.webSocketDebuggerUrl;

    var webSocket = new (_ws || _load_ws()).default(webSocketDebuggerUrl);
    this._webSocket = webSocket;
    var socketMessages = (0, (_createWebSocketListener || _load_createWebSocketListener()).createWebSocketListener)(webSocket);
    var translatedMessages = this._translateMessagesForClient(socketMessages);
    this._disposables = new (_commonsNodeUniversalDisposable || _load_commonsNodeUniversalDisposable()).default(translatedMessages.subscribe(sendMessageToClient), function () {
      return webSocket.close();
    }, this._fileCache);
    log('DebuggerConnection created with device info: ' + JSON.stringify(iosDeviceInfo));
  }

  _createClass(DebuggerConnection, [{
    key: 'sendCommand',
    value: function sendCommand(message) {
      this._webSocket.send(this._translateMessageForServer(message));
    }
  }, {
    key: '_translateMessagesForClient',
    value: function _translateMessagesForClient(socketMessages) {
      var _this = this;

      return socketMessages.map(JSON.parse).mergeMap(function (message) {
        if (message.method === 'Debugger.scriptParsed') {
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(_this._fileCache.handleScriptParsed(message));
        } else {
          return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of(message);
        }
      }).map(JSON.stringify);
    }
  }, {
    key: '_translateMessageForServer',
    value: function _translateMessageForServer(message) {
      var obj = JSON.parse(message);
      switch (obj.method) {
        case 'Debugger.setBreakpointByUrl':
          {
            var updatedObj = this._fileCache.handleSetBreakpointByUrl(obj);
            var updatedMessage = JSON.stringify(updatedObj);
            log('Sending message to proxy: ' + updatedMessage);
            return updatedMessage;
          }
        case 'Debugger.enable':
          {
            // Nuclide's debugger will auto-resume the first pause event, so we send a dummy pause
            // when the debugger initially attaches.
            this._sendFakeLoaderBreakpointPause();
            return message;
          }
        default:
          {
            return message;
          }
      }
    }
  }, {
    key: '_sendFakeLoaderBreakpointPause',
    value: function _sendFakeLoaderBreakpointPause() {
      var debuggerPausedMessage = {
        method: 'Debugger.paused',
        params: {
          callFrames: [],
          reason: 'breakpoint',
          data: {}
        }
      };
      this._sendMessageToClient(JSON.stringify(debuggerPausedMessage));
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._disposables.dispose();
    }
  }]);

  return DebuggerConnection;
})();

exports.DebuggerConnection = DebuggerConnection;