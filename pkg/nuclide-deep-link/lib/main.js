"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _DeepLinkService() {
  const data = _interopRequireDefault(require("./DeepLinkService"));

  _DeepLinkService = function () {
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
  constructor(state) {
    this._service = new (_DeepLinkService().default)();
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

}

(0, _createPackage().default)(module.exports, Activation);