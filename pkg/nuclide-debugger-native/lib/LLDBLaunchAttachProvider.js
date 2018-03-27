'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LLDBLaunchAttachProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _LaunchAttachStore;

function _load_LaunchAttachStore() {
  return _LaunchAttachStore = require('./LaunchAttachStore');
}

var _LaunchAttachDispatcher;

function _load_LaunchAttachDispatcher() {
  return _LaunchAttachDispatcher = _interopRequireDefault(require('./LaunchAttachDispatcher'));
}

var _LaunchAttachActions;

function _load_LaunchAttachActions() {
  return _LaunchAttachActions = require('./LaunchAttachActions');
}

var _NativeActionUIProvider;

function _load_NativeActionUIProvider() {
  return _NativeActionUIProvider = require('./actions/NativeActionUIProvider');
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
 * @format
 */

function isNativeDebuggerEnabled(targetUri) {
  if ((_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri)) {
    return true;
  } else {
    // Local native debugger is not supported on Windows.
    return process.platform !== 'win32';
  }
}

class LLDBLaunchAttachProvider extends (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).DebuggerLaunchAttachProvider {

  constructor(debuggingTypeName, targetUri) {
    super(debuggingTypeName, targetUri);
    this._dispatcher = new (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).default();
    this._actions = new (_LaunchAttachActions || _load_LaunchAttachActions()).LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new (_LaunchAttachStore || _load_LaunchAttachStore()).LaunchAttachStore(this._dispatcher);
    this._actionProvider = new (_NativeActionUIProvider || _load_NativeActionUIProvider()).NativeActionUIProvider(targetUri);
  }

  getCallbacksForAction(action) {
    var _this = this;

    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: (() => {
        var _ref = (0, _asyncToGenerator.default)(function* () {
          return isNativeDebuggerEnabled(_this.getTargetUri());
        });

        return function isEnabled() {
          return _ref.apply(this, arguments);
        };
      })(),

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: () => {
        return isNativeDebuggerEnabled(this.getTargetUri()) ? [this._actionProvider.getName()] : [];
      },

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        return this._actionProvider.getComponent(this._store, this._actions, debuggerTypeName, action, configIsValidChanged);
      }
    };
  }

  dispose() {
    this._store.dispose();
    this._actions.dispose();
  }
}
exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;