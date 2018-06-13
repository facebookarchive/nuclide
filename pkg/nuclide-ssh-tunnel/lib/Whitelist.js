'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _memoize2;

function _load_memoize() {
  return _memoize2 = _interopRequireDefault(require('lodash/memoize'));
}

exports.validateTunnel = validateTunnel;

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

async function validateTunnel(tunnel) {
  if (tunnel.to.host === 'localhost') {
    return true;
  }
  const allowedPorts = await getAllowedPorts();
  if (allowedPorts == null) {
    return true;
  }

  return allowedPorts.includes(tunnel.to.port);
}

// require fb-sitevar module lazily
const requireFetchSitevarOnce = (0, (_memoize2 || _load_memoize()).default)(() => {
  try {
    // $FlowFB
    return require('../../commons-node/fb-sitevar').fetchSitevarOnce;
  } catch (e) {
    return null;
  }
});

// returns either a list of allowed ports, or null if not restricted
async function getAllowedPorts() {
  const fetchSitevarOnce = requireFetchSitevarOnce();
  if (fetchSitevarOnce == null) {
    return null;
  }
  const allowedPorts = await fetchSitevarOnce('NUCLIDE_TUNNEL_ALLOWED_PORTS');
  if (allowedPorts == null) {
    return [];
  }
  return allowedPorts;
}