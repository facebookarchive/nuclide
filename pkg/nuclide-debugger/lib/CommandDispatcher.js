'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _NuclideProtocolParser;

function _load_NuclideProtocolParser() {
  return _NuclideProtocolParser = _interopRequireDefault(require('./Protocol/NuclideProtocolParser'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _BridgeAdapter;

function _load_BridgeAdapter() {
  return _BridgeAdapter = _interopRequireDefault(require('./Protocol/BridgeAdapter'));
}

var _NewProtocolChannelChecker;

function _load_NewProtocolChannelChecker() {
  return _NewProtocolChannelChecker = require('../../nuclide-debugger-common/lib/NewProtocolChannelChecker');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _EventReporter;

function _load_EventReporter() {
  return _EventReporter = require('./Protocol/EventReporter');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-commonjs
require('./Protocol/Object'); /**
                               * Copyright (c) 2015-present, Facebook, Inc.
                               * All rights reserved.
                               *
                               * This source code is licensed under the license found in the LICENSE file in
                               * the root directory of this source tree.
                               *
                               * 
                               * @format
                               */

/**
  * Class that dispatches Nuclide commands to debugger engine.
  * This is used to abstract away the underlying implementation for command dispatching
  * and allows us to switch between chrome IPC and new non-chrome channel.
  */
class CommandDispatcher {

  constructor(getIsReadonlyTarget) {
    this._useNewChannel = false;
    this._getIsReadonlyTarget = getIsReadonlyTarget;
  }

  isNewChannel() {
    return this._useNewChannel;
  }

  setupChromeChannel(url) {
    this._ensureSessionCreated();
    // Do not bother setup load if new channel is enabled.
    if (this._useNewChannel) {
      if (!(this._bridgeAdapter != null)) {
        throw new Error('Invariant violation: "this._bridgeAdapter != null"');
      }

      this._bridgeAdapter.enable();
      return;
    }
    if (this._webview == null) {
      // Cast from HTMLElement down to WebviewElement without instanceof
      // checking, as WebviewElement constructor is not exposed.
      const webview = document.createElement('webview');
      webview.src = url;
      webview.nodeintegration = true;
      webview.disablewebsecurity = true;
      webview.classList.add('native-key-bindings'); // required to pass through certain key events
      webview.classList.add('nuclide-debugger-webview');

      // The webview is actually only used for its state; it's really more of a model that just has
      // to live in the DOM. We render it into the body to keep it separate from our view, which may
      // be detached. If the webview were a child, it would cause the webview to reload when
      // reattached, and we'd lose our state.

      if (!(document.body != null)) {
        throw new Error('Invariant violation: "document.body != null"');
      }

      document.body.appendChild(webview);

      this._webview = webview;

      if (!(this._sessionSubscriptions != null)) {
        throw new Error('Invariant violation: "this._sessionSubscriptions != null"');
      }

      this._sessionSubscriptions.add(() => {
        webview.remove();
        this._webview = null;
        this._webviewUrl = null;
      });
    } else if (url !== this._webviewUrl) {
      this._webview.src = url;
    }
    this._webviewUrl = url;
  }

  setupNuclideChannel(debuggerInstance) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      _this._ensureSessionCreated();
      _this._useNewChannel = yield (0, (_NewProtocolChannelChecker || _load_NewProtocolChannelChecker()).isNewProtocolChannelEnabled)(debuggerInstance.getProviderName());
      if (_this._useNewChannel) {
        const dispatchers = yield (_NuclideProtocolParser || _load_NuclideProtocolParser()).default.bootstrap(debuggerInstance);
        _this._bridgeAdapter = new (_BridgeAdapter || _load_BridgeAdapter()).default(dispatchers, _this._getIsReadonlyTarget);

        if (!(_this._sessionSubscriptions != null)) {
          throw new Error('Invariant violation: "this._sessionSubscriptions != null"');
        }

        _this._sessionSubscriptions.add(function () {
          if (_this._bridgeAdapter != null) {
            _this._bridgeAdapter.dispose();
            _this._bridgeAdapter = null;
          }
        });
      }
    })();
  }

  _ensureSessionCreated() {
    if (this._sessionSubscriptions == null) {
      this._sessionSubscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    }
  }

  cleanupSessionState() {
    if (this._sessionSubscriptions != null) {
      this._sessionSubscriptions.dispose();
      this._sessionSubscriptions = null;
    }
  }

  send(...args) {
    if (this._useNewChannel) {
      this._sendViaNuclideChannel(...args);
    } else {
      this._sendViaChromeChannel(...args);
    }
  }

  openDevTools() {
    if (this._webview == null) {
      return;
    }
    this._webview.openDevTools();
  }

  getEventObservable() {
    if (this._useNewChannel) {
      if (!(this._bridgeAdapter != null)) {
        throw new Error('Invariant violation: "this._bridgeAdapter != null"');
      }

      return this._bridgeAdapter.getEventObservable();
    } else {
      if (!(this._webview != null)) {
        throw new Error('Invariant violation: "this._webview != null"');
      }

      return _rxjsBundlesRxMinJs.Observable.fromEvent(this._webview, 'ipc-message');
    }
  }

  _sendViaNuclideChannel(...args) {
    if (this._bridgeAdapter == null) {
      return;
    }
    switch (args[0]) {
      case 'Continue':
        this._bridgeAdapter.resume();
        break;
      case 'Pause':
        this._bridgeAdapter.pause();
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
      case 'RunToLocation':
        this._bridgeAdapter.runToLocation(args[1], args[2]);
        break;
      case 'triggerDebuggerAction':
        this._triggerDebuggerAction(args[1]);
        break;
      case 'SyncBreakpoints':
        this._bridgeAdapter.setInitialBreakpoints(args[1]);
        break;
      case 'AddBreakpoint':
        this._bridgeAdapter.setFilelineBreakpoint(args[1]);
        break;
      case 'DeleteBreakpoint':
        this._bridgeAdapter.removeBreakpoint(args[1]);
        break;
      case 'UpdateBreakpoint':
        this._bridgeAdapter.updateBreakpoint(args[1]);
        break;
      case 'setSelectedCallFrameIndex':
        this._bridgeAdapter.setSelectedCallFrameIndex(args[1]);
        break;
      case 'evaluateOnSelectedCallFrame':
        this._bridgeAdapter.evaluateExpression(args[1], args[2], args[3]);
        break;
      case 'runtimeEvaluate':
        this._bridgeAdapter.evaluateExpression(args[1], args[2], 'console');
        break;
      case 'getProperties':
        this._bridgeAdapter.getProperties(args[1], args[2]);
        break;
      case 'selectThread':
        this._bridgeAdapter.selectThread(args[1]);
        break;
      case 'setPauseOnException':
        this._bridgeAdapter.setPauseOnException(args[1]);
        break;
      case 'setPauseOnCaughtException':
        this._bridgeAdapter.setPauseOnCaughtException(args[1]);
        break;
      case 'setSingleThreadStepping':
        this._bridgeAdapter.setSingleThreadStepping(args[1]);
        break;
      default:
        (0, (_EventReporter || _load_EventReporter()).reportError)(`Command ${args[0]} is not implemented yet.`);
        break;
    }
  }

  _triggerDebuggerAction(actionId) {
    if (!(this._bridgeAdapter != null)) {
      throw new Error('Invariant violation: "this._bridgeAdapter != null"');
    }

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