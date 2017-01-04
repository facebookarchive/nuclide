'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PhpDebuggerService = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _helpers;

function _load_helpers() {
  return _helpers = require('./helpers');
}

var _config;

function _load_config() {
  return _config = require('./config');
}

var _ConnectionUtils;

function _load_ConnectionUtils() {
  return _ConnectionUtils = require('./ConnectionUtils');
}

var _MessageTranslator;

function _load_MessageTranslator() {
  return _MessageTranslator = require('./MessageTranslator');
}

var _eventKit;

function _load_eventKit() {
  return _eventKit = require('event-kit');
}

var _ClientCallback;

function _load_ClientCallback() {
  return _ClientCallback = require('./ClientCallback');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Connection states
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const INITIAL = 'initial';
const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const CLOSED = 'closed';

let lastServiceObjectDispose = null;

/**
 * Proxy for converting between Chrome dev tools debugger
 * and HHVM Dbgp debuggee.
 *
 * Chrome Debugging protocol spec is here:
 * https://developer.chrome.com/devtools/docs/protocol/1.1/index
 *
 * Dbgp spec is here:
 * http://xdebug.org/docs-dbgp.php
 *
 * Usage:
 *    Call debug(config) to attach to the dbgp debuggee, or launch a script specified in the config.
 *    After the promise returned by debug() is resolved, call sendCommand() to send Chrome Commands,
 *    and be prepared to receive notifications via the server notifications observable.
 */


const GK_PAUSE_ONE_PAUSE_ALL = 'nuclide_debugger_php_pause_one_pause_all';

class PhpDebuggerService {

  constructor() {
    if (lastServiceObjectDispose != null) {
      lastServiceObjectDispose();
    }
    lastServiceObjectDispose = this.dispose.bind(this);
    this._state = INITIAL;
    this._translator = null;
    this._disposables = new (_eventKit || _load_eventKit()).CompositeDisposable();
    this._clientCallback = new (_ClientCallback || _load_ClientCallback()).ClientCallback();
    this._disposables.add(this._clientCallback);
  }

  getNotificationObservable() {
    return this._clientCallback.getNotificationObservable().publish();
  }

  getServerMessageObservable() {
    return this._clientCallback.getServerMessageObservable().publish();
  }

  getOutputWindowObservable() {
    return this._clientCallback.getOutputWindowObservable().publish();
  }

  debug(config) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils || _load_utils()).default.logInfo('Connecting config: ' + JSON.stringify(config));

      yield _this._warnIfHphpdAttached();
      if (!(yield (0, (_passesGK || _load_passesGK()).default)(GK_PAUSE_ONE_PAUSE_ALL))) {
        config.stopOneStopAll = false;
      }

      (0, (_config || _load_config()).setConfig)(config);
      yield (0, (_ConnectionUtils || _load_ConnectionUtils()).setRootDirectoryUri)(config.targetUri);
      (_utils || _load_utils()).default.setLogLevel(config.logLevel);
      _this._setState(CONNECTING);

      const translator = new (_MessageTranslator || _load_MessageTranslator()).MessageTranslator(_this._clientCallback);
      _this._disposables.add(translator);
      translator.onSessionEnd(function () {
        _this._onEnd();
      });
      _this._translator = translator;

      _this._setState(CONNECTED);

      return 'HHVM connected';
    })();
  }

  sendCommand(message) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils || _load_utils()).default.logInfo('Recieved command: ' + message);
      if (_this2._translator) {
        yield _this2._translator.handleCommand(message);
      }
    })();
  }

  _warnIfHphpdAttached() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const mightBeAttached = yield (0, (_helpers || _load_helpers()).hphpdMightBeAttached)();
      if (mightBeAttached) {
        _this3._clientCallback.sendUserMessage('notification', {
          type: 'warning',
          message: 'You may have an hphpd instance currently attached to your server!' + '<br />Please kill it, or the Nuclide debugger may not work properly.'
        });
      }
    })();
  }

  _onEnd() {
    this._setState(CLOSED);
  }

  _setState(newState) {
    (_utils || _load_utils()).default.log('state change from ' + this._state + ' to ' + newState);
    // TODO: Consider logging socket info: remote ip, etc.
    this._state = newState;

    if (this._state === CLOSED) {
      this.dispose();
    }
  }

  dispose() {
    (_utils || _load_utils()).default.logInfo('Proxy: Ending session');
    (0, (_config || _load_config()).clearConfig)();
    this._disposables.dispose();
    return Promise.resolve();
  }
}
exports.PhpDebuggerService = PhpDebuggerService;