'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerConnection = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _logger;

function _load_logger() {
  return _logger = require('./logger');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _Socket;

function _load_Socket() {
  return _Socket = require('./Socket');
}

var _FileCache;

function _load_FileCache() {
  return _FileCache = require('./FileCache');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const { log } = (_logger || _load_logger()).logger;

/**
 * A connection to a JSContext on the device (or simulator/emulator).  There are 2 channels of
 * Communication provided by this class.
 *
 * 1. Bi-directional communcation for Chrome Protocol (CP) requests and responses.  This is via the
 * `sendCommand` API, which sends a CP request to the target, and returns a promise which resolves
 * with the response when it's received.
 *
 * 2. One-way communication for CP events that are emitted by the target, for example
 * `Debugger.paused` events.  Interested parties can subscribe to these events via the
 * `subscribeToEvents` API, which accepts a callback called when events are emitted from the target.
 */
class DebuggerConnection {

  constructor(connectionId, deviceInfo) {
    this._deviceInfo = deviceInfo;
    this._connectionId = connectionId;
    this._events = new _rxjsBundlesRxMinJs.Subject();
    this._status = new _rxjsBundlesRxMinJs.BehaviorSubject((_constants || _load_constants()).RUNNING);
    this._fileCache = new (_FileCache || _load_FileCache()).FileCache(this._getScriptSource.bind(this));
    const { webSocketDebuggerUrl } = deviceInfo;
    this._socket = new (_Socket || _load_Socket()).Socket(webSocketDebuggerUrl, this._handleChromeEvent.bind(this), () => this._status.next((_constants || _load_constants()).ENDED));
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._socket);
    log(`DebuggerConnection created with device info: ${JSON.stringify(deviceInfo)}`);
  }

  sendCommand(message) {
    switch (message.method) {
      case 'Debugger.setBreakpointByUrl':
        {
          const { params } = message;
          const translatedMessage = {
            method: 'Debugger.setBreakpointByUrl',
            params: Object.assign({}, params, {
              url: this._fileCache.getUrlFromFilePath(params.url)
            })
          };
          return this._socket.sendCommand(translatedMessage);
        }
      default:
        {
          return this._socket.sendCommand(message);
        }
    }
  }

  _getScriptSource(scriptId) {
    return this.sendCommand({
      method: 'Debugger.getScriptSource',
      params: {
        scriptId
      }
    });
  }

  _handleChromeEvent(message) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      switch (message.method) {
        case 'Debugger.paused':
          {
            _this._status.next((_constants || _load_constants()).PAUSED);
            break;
          }
        case 'Debugger.resumed':
          {
            _this._status.next((_constants || _load_constants()).RUNNING);
            break;
          }
        case 'Debugger.scriptParsed':
          {
            const clientMessage = yield _this._fileCache.scriptParsed(message);
            _this._events.next(clientMessage);
            return;
          }
      }
      _this._events.next(message);
    })();
  }

  subscribeToEvents(toFrontend) {
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(this._events.subscribe(toFrontend));
  }

  isPaused() {
    return this._status.getValue() === (_constants || _load_constants()).PAUSED;
  }

  getName() {
    return this._deviceInfo.title;
  }

  getStatus() {
    return this._status.getValue();
  }

  getStatusChanges() {
    return this._status.asObservable();
  }

  getId() {
    return this._connectionId;
  }

  onDispose(...teardowns) {
    for (const teardown of teardowns) {
      this._disposables.add(teardown);
    }
  }

  dispose() {
    this._disposables.dispose();
  }
}
exports.DebuggerConnection = DebuggerConnection;