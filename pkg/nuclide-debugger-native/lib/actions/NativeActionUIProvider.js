'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.name = undefined;
exports.getComponent = getComponent;
exports.isEnabled = isEnabled;

var _react = _interopRequireDefault(require('react'));

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getComponent(targetUri, store, actions, debuggerTypeName, action, configIsValidChanged) {
  actions.updateAttachTargetList();
  if (action === 'attach') {
    return _react.default.createElement((_AttachUIComponent || _load_AttachUIComponent()).AttachUIComponent, {
      store: store,
      actions: actions,
      configIsValidChanged: configIsValidChanged,
      targetUri: targetUri
    });
  } else {
    if (!(action === 'launch')) {
      throw new Error('Invariant violation: "action === \'launch\'"');
    }

    return _react.default.createElement((_LaunchUIComponent || _load_LaunchUIComponent()).LaunchUIComponent, {
      store: store,
      actions: actions,
      configIsValidChanged: configIsValidChanged,
      targetUri: targetUri
    });
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function isEnabled(action) {
  return Promise.resolve(true);
}

const name = exports.name = 'Native';