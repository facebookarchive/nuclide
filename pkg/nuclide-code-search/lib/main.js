'use strict';

var _CodeSearchProvider;

function _load_CodeSearchProvider() {
  return _CodeSearchProvider = require('./CodeSearchProvider');
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
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
    // TODO(wallace): Add activation code here.
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  }

  dispose() {
    this._disposables.dispose();
  }

  registerProvider() {
    return (_CodeSearchProvider || _load_CodeSearchProvider()).CodeSearchProvider;
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);