'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _DevicesPanelState;

function _load_DevicesPanelState() {
  return _DevicesPanelState = require('./DevicesPanelState');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api) {
    this._disposables.add(api.addOpener(uri => {
      if (uri === (_DevicesPanelState || _load_DevicesPanelState()).WORKSPACE_VIEW_URI) {
        return new (_DevicesPanelState || _load_DevicesPanelState()).DevicesPanelState();
      }
    }), () => api.destroyWhere(item => item instanceof (_DevicesPanelState || _load_DevicesPanelState()).DevicesPanelState), atom.commands.add('atom-workspace', 'nuclide-devices:toggle', event => {
      api.toggle((_DevicesPanelState || _load_DevicesPanelState()).WORKSPACE_VIEW_URI, event.detail);
    }));
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);