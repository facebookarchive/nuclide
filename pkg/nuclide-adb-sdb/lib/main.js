'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../commons-node/UniversalDisposable'));
}

var _AndroidFetcher;

function _load_AndroidFetcher() {
  return _AndroidFetcher = require('./AndroidFetcher');
}

var _TizenFetcher;

function _load_TizenFetcher() {
  return _TizenFetcher = require('./TizenFetcher');
}

var _AndroidInfoProvider;

function _load_AndroidInfoProvider() {
  return _AndroidInfoProvider = require('./AndroidInfoProvider');
}

var _TizenInfoProvider;

function _load_TizenInfoProvider() {
  return _TizenInfoProvider = require('./TizenInfoProvider');
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

class Activation {

  constructor(state) {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeDevicePanelServiceApi(api) {
    this._disposables.add(api.registerDeviceFetcher(new (_AndroidFetcher || _load_AndroidFetcher()).AndroidFetcher()));
    this._disposables.add(api.registerDeviceFetcher(new (_TizenFetcher || _load_TizenFetcher()).TizenFetcher()));
    this._disposables.add(api.registerInfoProvider((0, (_AndroidInfoProvider || _load_AndroidInfoProvider()).createAndroidInfoProvider)()));
    this._disposables.add(api.registerInfoProvider((0, (_TizenInfoProvider || _load_TizenInfoProvider()).createTizenInfoProvider)()));
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);