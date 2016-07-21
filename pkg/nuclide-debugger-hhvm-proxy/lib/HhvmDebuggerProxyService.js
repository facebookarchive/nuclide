Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _utils2;

function _utils() {
  return _utils2 = _interopRequireDefault(require('./utils'));
}

var _helpers2;

function _helpers() {
  return _helpers2 = require('./helpers');
}

var _config2;

function _config() {
  return _config2 = require('./config');
}

var _ConnectionUtils2;

function _ConnectionUtils() {
  return _ConnectionUtils2 = require('./ConnectionUtils');
}

var _MessageTranslator2;

function _MessageTranslator() {
  return _MessageTranslator2 = require('./MessageTranslator');
}

var _eventKit2;

function _eventKit() {
  return _eventKit2 = require('event-kit');
}

// Connection states
var INITIAL = 'initial';
var CONNECTING = 'connecting';
var CONNECTED = 'connected';
var CLOSED = 'closed';

var lastServiceObjectDispose = null;

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

var _ClientCallback2;

function _ClientCallback() {
  return _ClientCallback2 = require('./ClientCallback');
}

var HhvmDebuggerProxyService = (function () {
  function HhvmDebuggerProxyService() {
    _classCallCheck(this, HhvmDebuggerProxyService);

    if (lastServiceObjectDispose != null) {
      lastServiceObjectDispose();
    }
    lastServiceObjectDispose = this.dispose.bind(this);
    this._state = INITIAL;
    this._translator = null;
    this._disposables = new (_eventKit2 || _eventKit()).CompositeDisposable();
    this._clientCallback = new (_ClientCallback2 || _ClientCallback()).ClientCallback();
    this._disposables.add(this._clientCallback);
  }

  _createClass(HhvmDebuggerProxyService, [{
    key: 'getNotificationObservable',
    value: function getNotificationObservable() {
      return this._clientCallback.getNotificationObservable();
    }
  }, {
    key: 'getServerMessageObservable',
    value: function getServerMessageObservable() {
      return this._clientCallback.getServerMessageObservable();
    }
  }, {
    key: 'getOutputWindowObservable',
    value: function getOutputWindowObservable() {
      return this._clientCallback.getOutputWindowObservable();
    }
  }, {
    key: 'debug',
    value: _asyncToGenerator(function* (config) {
      var _this = this;

      (_utils2 || _utils()).default.logInfo('Connecting config: ' + JSON.stringify(config));

      yield this._warnIfHphpdAttached();

      (0, (_config2 || _config()).setConfig)(config);
      yield (0, (_ConnectionUtils2 || _ConnectionUtils()).setRootDirectoryUri)(config.targetUri);
      (_utils2 || _utils()).default.setLogLevel(config.logLevel);
      this._setState(CONNECTING);

      var translator = new (_MessageTranslator2 || _MessageTranslator()).MessageTranslator(this._clientCallback);
      this._disposables.add(translator);
      translator.onSessionEnd(function () {
        _this._onEnd();
      });
      this._translator = translator;

      this._setState(CONNECTED);

      return 'HHVM connected';
    })
  }, {
    key: 'sendCommand',
    value: _asyncToGenerator(function* (message) {
      (_utils2 || _utils()).default.logInfo('Recieved command: ' + message);
      if (this._translator) {
        yield this._translator.handleCommand(message);
      }
    })
  }, {
    key: '_warnIfHphpdAttached',
    value: _asyncToGenerator(function* () {
      var mightBeAttached = yield (0, (_helpers2 || _helpers()).hphpdMightBeAttached)();
      if (mightBeAttached) {
        this._clientCallback.sendUserMessage('notification', {
          type: 'warning',
          message: 'You may have an hphpd instance currently attached to your server!' + '<br />Please kill it, or the Nuclide debugger may not work properly.'
        });
      }
    })
  }, {
    key: '_onEnd',
    value: function _onEnd() {
      this._setState(CLOSED);
    }
  }, {
    key: '_setState',
    value: function _setState(newState) {
      (_utils2 || _utils()).default.log('state change from ' + this._state + ' to ' + newState);
      // TODO: Consider logging socket info: remote ip, etc.
      this._state = newState;

      if (this._state === CLOSED) {
        this.dispose();
      }
    }
  }, {
    key: 'dispose',
    value: _asyncToGenerator(function* () {
      (_utils2 || _utils()).default.logInfo('Proxy: Ending session');
      (0, (_config2 || _config()).clearConfig)();
      this._disposables.dispose();
    })
  }]);

  return HhvmDebuggerProxyService;
})();

exports.HhvmDebuggerProxyService = HhvmDebuggerProxyService;