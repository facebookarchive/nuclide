'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LLDBLaunchAttachProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _promise;

function _load_promise() {
  return _promise = require('nuclide-commons/promise');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
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

class LLDBLaunchAttachProvider extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider {

  constructor(debuggingTypeName, targetUri) {
    super(debuggingTypeName, targetUri);
    this._dispatcher = new (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).default();
    this._actions = new (_LaunchAttachActions || _load_LaunchAttachActions()).LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new (_LaunchAttachStore || _load_LaunchAttachStore()).LaunchAttachStore(this._dispatcher);

    this._uiProviderMap = new Map();
    this._enabledProviderNames = new Map();
    this._loadAction(new (_NativeActionUIProvider || _load_NativeActionUIProvider()).NativeActionUIProvider(targetUri));
    try {
      // $FlowFB
      const module = require('./actions/fb-omActionUIProvider');
      if (module != null) {
        this._loadAction(new module.omActionUIProvider(targetUri));
      }
    } catch (_) {}
  }

  _loadAction(actionProvider) {
    if (actionProvider != null) {
      this._uiProviderMap.set(actionProvider.getName(), actionProvider);
    }
  }

  getCallbacksForAction(action) {
    var _this = this;

    return {
      /**
       * Whether this provider is enabled or not.
       */
      isEnabled: (() => {
        var _ref = (0, _asyncToGenerator.default)(function* () {
          if (_this._enabledProviderNames.get(action) == null) {
            _this._enabledProviderNames.set(action, []);
          }

          const providers = yield (0, (_promise || _load_promise()).asyncFilter)(Array.from(_this._uiProviderMap.values()), function (provider) {
            return provider.isEnabled(action);
          });

          const list = _this._enabledProviderNames.get(action);

          if (!(list != null)) {
            throw new Error('Invariant violation: "list != null"');
          }

          for (const provider of providers) {
            list.push(provider.getName());
          }

          return providers.length > 0;
        });

        return function isEnabled() {
          return _ref.apply(this, arguments);
        };
      })(),

      /**
       * Returns a list of supported debugger types + environments for the specified action.
       */
      getDebuggerTypeNames: () => {
        return this._enabledProviderNames.get(action) || [];
      },

      /**
       * Returns the UI component for configuring the specified debugger type and action.
       */
      getComponent: (debuggerTypeName, configIsValidChanged) => {
        const provider = this._uiProviderMap.get(debuggerTypeName);
        if (provider) {
          return provider.getComponent(this._store, this._actions, debuggerTypeName, action, configIsValidChanged);
        }
        return null;
      }
    };
  }

  dispose() {
    this._store.dispose();
    this._actions.dispose();
  }
}
exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;