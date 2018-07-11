"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _DatatipManager() {
  const data = require("./DatatipManager");

  _DatatipManager = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
class Activation {
  constructor() {
    this._datatipManager = new (_DatatipManager().DatatipManager)();
  }

  provideDatatipService() {
    return this._datatipManager;
  }

  dispose() {
    this._datatipManager.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);