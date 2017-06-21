'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _DeepLinkService;

function _load_DeepLinkService() {
  return _DeepLinkService = _interopRequireDefault(require('./DeepLinkService'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {

  constructor(state) {
    this._service = new (_DeepLinkService || _load_DeepLinkService()).default();
  }

  dispose() {
    this._service.dispose();
  }

  provideDeepLinkService() {
    // Only expose the public methods of the service.
    return {
      subscribeToPath: this._service.subscribeToPath.bind(this._service),
      sendDeepLink: this._service.sendDeepLink.bind(this._service)
    };
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