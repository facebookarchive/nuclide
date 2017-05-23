'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _BridgeAdapter;

function _load_BridgeAdapter() {
  return _BridgeAdapter = _interopRequireDefault(require('./Protocol/BridgeAdapter'));
}

var _passesGK;

function _load_passesGK() {
  return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
  * Class that dispatches Nuclide commands to debugger engine.
  * This is used to abstract away the underlying implementation for command dispatching
  * and allows us to switch between chrome IPC and new non-chrome channel.
  */
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

class CommandDispatcher {

  constructor() {
    this._bridgeAdapter = new (_BridgeAdapter || _load_BridgeAdapter()).default();
    this._useNewChannel = false;
  }

  setupChromeChannel(webview) {
    this._webview = webview;
  }

  setupNuclideChannel(debuggerInstance) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._useNewChannel = yield (0, (_passesGK || _load_passesGK()).default)('nuclide_new_debugger_protocol_channel', 10 * 1000);
      if (!_this._useNewChannel) {
        // Do not bother enable the new channel if not enabled.
        return;
      }
      return _this._bridgeAdapter.start(debuggerInstance);
    })();
  }

  send(...args) {
    if (this._useNewChannel) {
      this._sendViaNuclideChannel(...args);
    } else {
      this._sendViaChromeChannel(...args);
    }
  }

  _sendViaNuclideChannel(...args) {
    switch (args[0]) {
      case 'Continue':
        this._bridgeAdapter.resume();
        break;
      case 'StepOver':
        this._bridgeAdapter.stepOver();
        break;
      case 'StepInto':
        this._bridgeAdapter.stepInto();
        break;
      case 'StepOut':
        this._bridgeAdapter.stepOut();
        break;
      case 'triggerDebuggerAction':
        this._triggerDebuggerAction(args[1]);
        break;
      default:
        // Forward any unimplemented commands to chrome channel.
        this._sendViaChromeChannel(...args);
        break;
    }
  }

  _triggerDebuggerAction(actionId) {
    switch (actionId) {
      case 'debugger.toggle-pause':
        // TODO[jetan]: 'debugger.toggle-pause' needs to implement state management which
        // I haven't think well yet so forward to chrome for now.
        this._sendViaChromeChannel('triggerDebuggerAction', 'debugger.toggle-pause');
        break;
      case 'debugger.step-over':
        this._bridgeAdapter.stepOver();
        break;
      case 'debugger.step-into':
        this._bridgeAdapter.stepInto();
        break;
      case 'debugger.step-out':
        this._bridgeAdapter.stepOut();
        break;
      case 'debugger.run-snippet':
        this._bridgeAdapter.resume();
        break;
      default:
        throw Error(`_triggerDebuggerAction: unrecognized actionId: ${actionId}`);
    }
  }

  _sendViaChromeChannel(...args) {
    const webview = this._webview;
    if (webview != null) {
      webview.send('command', ...args);
    } else {
      // TODO: log and throw error.
    }
  }
}
exports.default = CommandDispatcher;