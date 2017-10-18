'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NativeActionUIProvider = undefined;

var _react = _interopRequireWildcard(require('react'));

var _AttachUIComponent;

function _load_AttachUIComponent() {
  return _AttachUIComponent = require('../AttachUIComponent');
}

var _LaunchAttachActions;

function _load_LaunchAttachActions() {
  return _LaunchAttachActions = require('../LaunchAttachActions');
}

var _LaunchAttachStore;

function _load_LaunchAttachStore() {
  return _LaunchAttachStore = require('../LaunchAttachStore');
}

var _LaunchUIComponent;

function _load_LaunchUIComponent() {
  return _LaunchUIComponent = require('../LaunchUIComponent');
}

var _DebuggerActionUIProvider;

function _load_DebuggerActionUIProvider() {
  return _DebuggerActionUIProvider = require('./DebuggerActionUIProvider');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

class NativeActionUIProvider extends (_DebuggerActionUIProvider || _load_DebuggerActionUIProvider()).DebuggerActionUIProvider {
  constructor(targetUri) {
    super('Native', targetUri);
  }

  getComponent(store, actions, debuggerTypeName, action, configIsValidChanged) {
    actions.updateAttachTargetList();
    if (action === 'attach') {
      return _react.createElement((_AttachUIComponent || _load_AttachUIComponent()).AttachUIComponent, {
        store: store,
        actions: actions,
        configIsValidChanged: configIsValidChanged,
        targetUri: this._targetUri
      });
    } else {
      if (!(action === 'launch')) {
        throw new Error('Invariant violation: "action === \'launch\'"');
      }

      return _react.createElement((_LaunchUIComponent || _load_LaunchUIComponent()).LaunchUIComponent, {
        store: store,
        actions: actions,
        configIsValidChanged: configIsValidChanged,
        targetUri: this._targetUri
      });
    }
  }
}
exports.NativeActionUIProvider = NativeActionUIProvider;