'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NodeLaunchAttachProvider = undefined;

var _nuclideDebuggerBase;

function _load_nuclideDebuggerBase() {
  return _nuclideDebuggerBase = require('../../nuclide-debugger-base');
}

var _react = _interopRequireDefault(require('react'));

var _LaunchAttachDispatcher;

function _load_LaunchAttachDispatcher() {
  return _LaunchAttachDispatcher = _interopRequireDefault(require('./LaunchAttachDispatcher'));
}

var _LaunchAttachStore;

function _load_LaunchAttachStore() {
  return _LaunchAttachStore = require('./LaunchAttachStore');
}

var _AttachUIComponent;

function _load_AttachUIComponent() {
  return _AttachUIComponent = require('./AttachUIComponent');
}

var _LaunchAttachActions;

function _load_LaunchAttachActions() {
  return _LaunchAttachActions = require('./LaunchAttachActions');
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

class NodeLaunchAttachProvider extends (_nuclideDebuggerBase || _load_nuclideDebuggerBase()).DebuggerLaunchAttachProvider {

  constructor(debuggingTypeName, targetUri) {
    super(debuggingTypeName, targetUri);
    this._dispatcher = new (_LaunchAttachDispatcher || _load_LaunchAttachDispatcher()).default();
    this._actions = new (_LaunchAttachActions || _load_LaunchAttachActions()).LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new (_LaunchAttachStore || _load_LaunchAttachStore()).LaunchAttachStore(this._dispatcher);
  }

  getActions() {
    return Promise.resolve(['Attach']);
  }

  getComponent(action, parentEventEmitter) {
    if (action === 'Attach') {
      this._actions.updateAttachTargetList();
      return _react.default.createElement((_AttachUIComponent || _load_AttachUIComponent()).AttachUIComponent, {
        store: this._store,
        actions: this._actions,
        parentEmitter: parentEventEmitter
      });
    } else {
      return null;
    }
  }

  dispose() {
    this._store.dispose();
    this._actions.dispose();
  }
}
exports.NodeLaunchAttachProvider = NodeLaunchAttachProvider;