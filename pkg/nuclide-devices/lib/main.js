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

var _AndroidFetcher;

function _load_AndroidFetcher() {
  return _AndroidFetcher = require('./fetchers/AndroidFetcher');
}

var _TizenFetcher;

function _load_TizenFetcher() {
  return _TizenFetcher = require('./fetchers/TizenFetcher');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._fetchers = new Set();

    this.registerDeviceFetcher(new (_AndroidFetcher || _load_AndroidFetcher()).AndroidFetcher());
    this.registerDeviceFetcher(new (_TizenFetcher || _load_TizenFetcher()).TizenFetcher());
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeWorkspaceViewsService(api) {
    this._disposables.add(api.addOpener(uri => {
      if (uri === (_DevicesPanelState || _load_DevicesPanelState()).WORKSPACE_VIEW_URI) {
        return new (_DevicesPanelState || _load_DevicesPanelState()).DevicesPanelState(this._fetchers);
      }
    }), () => api.destroyWhere(item => item instanceof (_DevicesPanelState || _load_DevicesPanelState()).DevicesPanelState), atom.commands.add('atom-workspace', 'nuclide-devices:toggle', event => {
      api.toggle((_DevicesPanelState || _load_DevicesPanelState()).WORKSPACE_VIEW_URI, event.detail);
    }));
  }

  deserializeDevicePanelState() {
    return new (_DevicesPanelState || _load_DevicesPanelState()).DevicesPanelState(this._fetchers);
  }

  registerDeviceFetcher(fetcher) {
    this._fetchers.add(fetcher);
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