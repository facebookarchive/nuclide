'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LLDBLaunchAttachProvider = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _promise;

function _load_promise() {
  return _promise = require('../../commons-node/promise');
}

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _react = _interopRequireDefault(require('react'));

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

var _LaunchActionUIProvider;

function _load_LaunchActionUIProvider() {
  return _LaunchActionUIProvider = _interopRequireWildcard(require('./actions/LaunchActionUIProvider'));
}

var _AttachActionUIProvider;

function _load_AttachActionUIProvider() {
  return _AttachActionUIProvider = _interopRequireWildcard(require('./actions/AttachActionUIProvider'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class LLDBLaunchAttachProvider extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider {

  constructor(debuggingTypeName, targetUri) {
    super(debuggingTypeName, targetUri);
    this._dispatcher = new (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).default();
    this._actions = new (_LaunchAttachActions || _load_LaunchAttachActions()).LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new (_LaunchAttachStore || _load_LaunchAttachStore()).LaunchAttachStore(this._dispatcher);

    this._uiProviderMap = new Map();
    this._loadAction(_AttachActionUIProvider || _load_AttachActionUIProvider());
    this._loadAction(_LaunchActionUIProvider || _load_LaunchActionUIProvider());
    try {
      // $FlowFB
      this._loadAction(require('./actions/fb-omActionUIProvider'));
    } catch (_) {}
  }

  _loadAction(actionProvider) {
    if (actionProvider != null) {
      this._uiProviderMap.set(actionProvider.name, actionProvider);
    }
  }

  getActions() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const providers = yield (0, (_promise || _load_promise()).asyncFilter)(Array.from(_this._uiProviderMap.values()), function (provider) {
        return provider.isEnabled();
      });
      return providers.map(function (provider) {
        return provider.name;
      });
    })();
  }

  getComponent(actionName, parentEventEmitter) {
    const action = this._uiProviderMap.get(actionName);
    if (action) {
      return action.getComponent(this._store, this._actions, parentEventEmitter);
    }
    return null;
  }

  dispose() {
    this._store.dispose();
    this._actions.dispose();
  }
}
exports.LLDBLaunchAttachProvider = LLDBLaunchAttachProvider;