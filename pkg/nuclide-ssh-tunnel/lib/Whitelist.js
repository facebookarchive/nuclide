'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.validateTunnel = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _memoize2;function _load_memoize() {return _memoize2 = _interopRequireDefault(require('lodash/memoize'));} /**
                                                                                                                                                                                                                                                                                                            * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                                                                                                                            * All rights reserved.
                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                            * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                                                                                                                            * the root directory of this source tree.
                                                                                                                                                                                                                                                                                                            *
                                                                                                                                                                                                                                                                                                            * 
                                                                                                                                                                                                                                                                                                            * @format
                                                                                                                                                                                                                                                                                                            */let validateTunnel = exports.validateTunnel = (() => {var _ref = (0, _asyncToGenerator.default)(





  function* (tunnel) {
    if (tunnel.to.host === 'localhost') {
      return true;
    }
    const allowedPorts = yield getAllowedPorts();
    if (allowedPorts == null) {
      return true;
    }

    return allowedPorts.includes(tunnel.to.port);
  });return function validateTunnel(_x) {return _ref.apply(this, arguments);};})();

// require fb-sitevar module lazily









// returns either a list of allowed ports, or null if not restricted
let getAllowedPorts = (() => {var _ref2 = (0, _asyncToGenerator.default)(function* () {
    const fetchSitevarOnce = requireFetchSitevarOnce();
    if (fetchSitevarOnce == null) {
      return null;
    }
    const allowedPorts = yield fetchSitevarOnce('NUCLIDE_TUNNEL_ALLOWED_PORTS');
    if (allowedPorts == null) {
      return [];
    }
    return allowedPorts;
  });return function getAllowedPorts() {return _ref2.apply(this, arguments);};})();function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}const requireFetchSitevarOnce = (0, (_memoize2 || _load_memoize()).default)(() => {try {// $FlowFB
    return require('../../commons-node/fb-sitevar').fetchSitevarOnce;} catch (e) {return null;}});