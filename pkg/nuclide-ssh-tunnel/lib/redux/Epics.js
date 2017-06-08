'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.startTunnelEpic = startTunnelEpic;

var _Actions;

function _load_Actions() {
  return _Actions = _interopRequireWildcard(require('./Actions'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

function startTunnelEpic(actions, store) {
  return actions.ofType((_Actions || _load_Actions()).OPEN_TUNNEL).map(action => {
    if (!(action.type === (_Actions || _load_Actions()).OPEN_TUNNEL)) {
      throw new Error('Invariant violation: "action.type === Actions.OPEN_TUNNEL"');
    }

    const { tunnel } = action.payload;
    // TODO: Call autossh to open a reverse tunnel
    return (_Actions || _load_Actions()).addOpenTunnel(tunnel, () => {});
  });
}