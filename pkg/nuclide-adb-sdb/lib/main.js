'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _android_providers;

function _load_android_providers() {
  return _android_providers = require('./android_providers');
}

var _tizen_providers;

function _load_tizen_providers() {
  return _tizen_providers = require('./tizen_providers');
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

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeDevicePanelServiceApi(api) {
    this._disposables.add(api.registerListProvider((0, (_android_providers || _load_android_providers()).createAndroidDeviceListProvider)()));
    this._disposables.add(api.registerListProvider((0, (_tizen_providers || _load_tizen_providers()).createTizenDeviceListProvider)()));
    this._disposables.add(api.registerInfoProvider((0, (_android_providers || _load_android_providers()).createAndroidInfoProvider)()));
    this._disposables.add(api.registerInfoProvider((0, (_tizen_providers || _load_tizen_providers()).createTizenInfoProvider)()));
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);