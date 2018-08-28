"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _RecentFilesService() {
  const data = _interopRequireDefault(require("./RecentFilesService"));

  _RecentFilesService = function () {
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
 * 
 * @format
 */
class Activation {
  constructor() {
    this._service = new (_RecentFilesService().default)();
  }

  provideRecentFilesService() {
    return this._service;
  }

  dispose() {
    this._service.dispose();
  }

}

(0, _createPackage().default)(module.exports, Activation);