'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _CodeFormatManager;

function _load_CodeFormatManager() {
  return _CodeFormatManager = _interopRequireDefault(require('./CodeFormatManager'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor() {
    this.codeFormatManager = new (_CodeFormatManager || _load_CodeFormatManager()).default();
  }

  consumeProvider(provider) {
    return this.codeFormatManager.addProvider(provider);
  }

  dispose() {
    this.codeFormatManager.dispose();
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

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);