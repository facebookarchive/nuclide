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

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _constants;

function _load_constants() {
  return _constants = require('../../nuclide-debugger-common/lib/constants');
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../nuclide-debugger-common');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Connection states
const INITIAL = 'initial'; /**
                            * Copyright (c) 2015-present, Facebook, Inc.
                            * All rights reserved.
                            *
                            * This source code is licensed under the license found in the LICENSE file in
                            * the root directory of this source tree.
                            *
                            * 
                            * @format
                            */

const CONNECTING = 'connecting';
const CONNECTED = 'connected';
const CLOSED = 'closed';

/**
 * Proxy for converting between Nuclide debugger
 * and HHVM Dbgp debuggee.
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
    this._state = INITIAL;
    this._translator = null;
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._clientCallback = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).ClientCallback();
    this._disposables.add(this._clientCallback);
  }

  getNotificationObservable() {
    return this._clientCallback.getAtomNotificationObservable().publish();
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
      (_utils || _load_utils()).default.info('Connecting config: ' + JSON.stringify(config));

      yield _this._warnIfHphpdAttached();
      if (!(yield (0, (_passesGK || _load_passesGK()).default)(GK_PAUSE_ONE_PAUSE_ALL))) {
        config.stopOneStopAll = false;
      }

      (0, (_config || _load_config()).setConfig)(config);
      yield (0, (_ConnectionUtils || _load_ConnectionUtils()).setRootDirectoryUri)(config.targetUri);
      (_utils || _load_utils()).default.setLevel(config.logLevel);
      _this._setState(CONNECTING);

      const translator = new (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsDebugSessionTranslator((_constants || _load_constants()).VsAdapterTypes.HHVM, {
        command: _this._getNodePath(),
        args: [require.resolve('./vscode/vscode-debugger-entry')]
      }, 'launch', {
        config,
        trace: false
      }, _this._clientCallback, (_utils || _load_utils()).default);
      _this._disposables.add(translator, translator.observeSessionEnd().subscribe(_this._onEnd.bind(_this)), function () {
        return _this._translator = null;
      });
      _this._translator = translator;
      yield translator.initilize();
      _this._setState(CONNECTED);

      return 'HHVM connected';
    })();
  }

  _getNodePath() {
    try {
      // $FlowFB
      return require('../../nuclide-debugger-common/lib/fb-constants').DEVSERVER_NODE_PATH;
    } catch (error) {
      return 'node';
    }
  }

  sendCommand(message) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      (_utils || _load_utils()).default.info('Recieved command: ' + message);
      if (_this2._translator) {
        _this2._translator.processCommand(JSON.parse(message));
      }
    })();
  }

  _warnIfHphpdAttached() {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const mightBeAttached = yield (0, (_helpers || _load_helpers()).hphpdMightBeAttached)();
      if (mightBeAttached) {
        _this3._clientCallback.sendAtomNotification('warning', 'You may have an hphpd instance currently attached to your server!' + '<br />Please kill it, or the Nuclide debugger may not work properly.');
      }
    })();
  }

  _onEnd() {
    this._setState(CLOSED);
  }

  _setState(newState) {
    (_utils || _load_utils()).default.debug('state change from ' + this._state + ' to ' + newState);
    // TODO: Consider logging socket info: remote ip, etc.
    this._state = newState;

    if (this._state === CLOSED) {
      this.dispose();
    }
  }

  dispose() {
    (_utils || _load_utils()).default.info('Proxy: Ending session');
    (0, (_config || _load_config()).clearConfig)();
    this._disposables.dispose();
    return Promise.resolve();
  }
}
exports.PhpDebuggerService = PhpDebuggerService;