'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resolveTunnel = resolveTunnel;
exports.getSharedHostUri = getSharedHostUri;
exports.getSocketServiceByHost = getSocketServiceByHost;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideSocketRpc;

function _load_nuclideSocketRpc() {
  return _nuclideSocketRpc = _interopRequireWildcard(require('../../nuclide-socket-rpc'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Normalize host URIs
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

function resolveTunnel(tunnel) {
  const { from, to } = tunnel;
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
}

// From tunneling perspective, host is a "singleton", all roots can reuse the same socket service.
function getSharedHostUri(host) {
  if (host === 'localhost' || host === '') {
    return 'localhost';
  } else if ((_nuclideUri || _load_nuclideUri()).default.isRemote(host)) {
    return (_nuclideUri || _load_nuclideUri()).default.createRemoteUri((_nuclideUri || _load_nuclideUri()).default.getHostname(host), '/');
  } else {
    // We assume that the passed string is a hostname.
    return (_nuclideUri || _load_nuclideUri()).default.createRemoteUri(host, '/');
  }
}

// We assume `host`  has already been processed by getSharedHostUri
function getSocketServiceByHost(host) {
  if (host === 'localhost') {
    // Bypass the RPC framework to avoid extra marshal/unmarshaling.
    return _nuclideSocketRpc || _load_nuclideSocketRpc();
  } else {
    return (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getSocketServiceByNuclideUri)(host);
  }
}