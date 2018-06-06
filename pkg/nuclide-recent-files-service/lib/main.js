'use strict';

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _RecentFilesService;

function _load_RecentFilesService() {
  return _RecentFilesService = _interopRequireDefault(require('./RecentFilesService'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._service = new (_RecentFilesService || _load_RecentFilesService()).default(state);
    this._subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default(this._service);
  }

  provideRecentFilesService() {
    return this._service;
  }

  serialize() {
    return {
      filelist: this._service.getRecentFiles()
    };
  }

  dispose() {
    this._subscriptions.dispose();
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