"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function _Registration() {
  const data = require("./Registration");

  _Registration = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class Activation {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
  }

  dispose() {
    this._disposables.dispose();
  }

  consumeDevicePanelServiceApi(api) {
    this._disposables.add((0, _Registration().registerDevicePanelProviders)(api));
  }

}

(0, _createPackage().default)(module.exports, Activation);