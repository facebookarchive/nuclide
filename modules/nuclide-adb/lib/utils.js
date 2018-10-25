"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAdbServiceByNuclideUri = getAdbServiceByNuclideUri;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function AdbServiceLocal() {
  const data = _interopRequireWildcard(require("./AdbService"));

  AdbServiceLocal = function () {
    return data;
  };

  return data;
}

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 * @format
 */
let rpcService;
atom.packages.serviceHub.consume('nuclide-rpc-services', '0.0.0', provider => {
  rpcService = provider;
});

function getAdbServiceByNuclideUri(uri) {
  if (rpcService == null && !_nuclideUri().default.isRemote(uri)) {
    return AdbServiceLocal();
  } // nuclide-rpc-services should be available at this point.
  // If it isn't, throw an error.


  return (0, _nullthrows().default)(rpcService).getServiceByNuclideUri('AdbService', uri);
}