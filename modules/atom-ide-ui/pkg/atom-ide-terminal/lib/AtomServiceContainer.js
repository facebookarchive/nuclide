"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setRpcService = setRpcService;
exports.getPtyServiceByNuclideUri = getPtyServiceByNuclideUri;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../../nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

function PtyServiceLocal() {
  const data = _interopRequireWildcard(require("./pty-service/PtyService"));

  PtyServiceLocal = function () {
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
 *  strict-local
 * @format
 */
let _rpcService = null;

function setRpcService(rpcService) {
  _rpcService = rpcService;
  return new (_UniversalDisposable().default)(() => {
    _rpcService = null;
  });
}

function getPtyServiceByNuclideUri(uri) {
  const serviceUri = uri || '';

  if (_rpcService == null && !_nuclideUri().default.isRemote(serviceUri)) {
    return PtyServiceLocal();
  }

  return (0, _nullthrows().default)(_rpcService).getServiceByNuclideUri('PtyService', serviceUri);
}