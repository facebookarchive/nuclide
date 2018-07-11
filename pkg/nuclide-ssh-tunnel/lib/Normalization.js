"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveTunnel = resolveTunnel;
exports.getSharedHostUri = getSharedHostUri;
exports.getSocketServiceByHost = getSocketServiceByHost;

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _nuclideRemoteConnection() {
  const data = require("../../nuclide-remote-connection");

  _nuclideRemoteConnection = function () {
    return data;
  };

  return data;
}

function SocketServiceImpl() {
  const data = _interopRequireWildcard(require("../../nuclide-socket-rpc"));

  SocketServiceImpl = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
// Normalize host URIs
function resolveTunnel(tunnel) {
  const {
    from,
    to
  } = tunnel;
  return {
    from: {
      host: getSharedHostUri(from.host),
      port: from.port,
      family: from.family || 6
    },
    to: {
      host: getSharedHostUri(to.host),
      port: to.port,
      family: to.family || 6
    }
  };
} // From tunneling perspective, host is a "singleton", all roots can reuse the same socket service.


function getSharedHostUri(host) {
  if (host === 'localhost' || host === '') {
    return 'localhost';
  } else if (_nuclideUri().default.isRemote(host)) {
    return _nuclideUri().default.createRemoteUri(_nuclideUri().default.getHostname(host), '/');
  } else {
    // We assume that the passed string is a hostname.
    return _nuclideUri().default.createRemoteUri(host, '/');
  }
} // We assume `host`  has already been processed by getSharedHostUri


function getSocketServiceByHost(host) {
  if (host === 'localhost') {
    // Bypass the RPC framework to avoid extra marshal/unmarshaling.
    return SocketServiceImpl();
  } else {
    return (0, _nuclideRemoteConnection().getSocketServiceByNuclideUri)(host);
  }
}