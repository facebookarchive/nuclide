'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebuggerActionUIProvider = undefined;

var _react = _interopRequireWildcard(require('react'));

var _LaunchAttachActions;

function _load_LaunchAttachActions() {
  return _LaunchAttachActions = require('../LaunchAttachActions');
}

var _LaunchAttachStore;

function _load_LaunchAttachStore() {
  return _LaunchAttachStore = require('../LaunchAttachStore');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

class DebuggerActionUIProvider {

  constructor(name, targetUri) {
    this._name = name;
    this._targetUri = targetUri;
  }

  getComponent(store, actions, debuggerTypeName, action, configIsValidChanged) {
    throw new Error('Abstract method.');
  }

  getName() {
    return this._name;
  }

  isEnabled(action) {
    throw new Error('Abstract method.');
  }
}
exports.DebuggerActionUIProvider = DebuggerActionUIProvider; /**
                                                              * Copyright (c) 2015-present, Facebook, Inc.
                                                              * All rights reserved.
                                                              *
                                                              * This source code is licensed under the license found in the LICENSE file in
                                                              * the root directory of this source tree.
                                                              *
                                                              * 
                                                              * @format
                                                              */