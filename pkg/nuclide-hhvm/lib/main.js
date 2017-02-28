'use strict';

var _atom = require('atom');

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../commons-atom/createPackage'));
}

var _HhvmBuildSystem;

function _load_HhvmBuildSystem() {
  return _HhvmBuildSystem = _interopRequireDefault(require('./HhvmBuildSystem'));
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
    this._disposables = new _atom.CompositeDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeTaskRunnerServiceApi(api) {
    this._disposables.add(api.register(this._getBuildSystem()));
  }

  _getBuildSystem() {
    if (this._buildSystem == null) {
      const buildSystem = new (_HhvmBuildSystem || _load_HhvmBuildSystem()).default();
      this._disposables.add(buildSystem);
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);