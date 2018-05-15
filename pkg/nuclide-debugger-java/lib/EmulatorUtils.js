'use strict';Object.defineProperty(exports, "__esModule", { value: true });exports.addAdbPorts = exports.getAdbPorts = exports.getAdbPath = undefined;var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));let getAdbPath = exports.getAdbPath = (() => {var _ref = (0, _asyncToGenerator.default)(
















  function* () {
    try {
      // $FlowFB
      return require('../../commons-node/fb-sitevar').fetchSitevarOnce(
      'NUCLIDE_ONE_WORLD_ADB_PATH');

    } catch (e) {
      return 'adb';
    }
  });return function getAdbPath() {return _ref.apply(this, arguments);};})(); /**
                                                                               * Copyright (c) 2015-present, Facebook, Inc.
                                                                               * All rights reserved.
                                                                               *
                                                                               * This source code is licensed under the license found in the LICENSE file in
                                                                               * the root directory of this source tree.
                                                                               *
                                                                               *  strict-local
                                                                               * @format
                                                                               */let getAdbPorts = exports.getAdbPorts = (() => {var _ref2 = (0, _asyncToGenerator.default)(function* (targetUri) {const adbService = (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(targetUri);const ports = yield adbService.getAdbPorts(); // Don't show the user the default adb port. This should always be included.
    return ports.filter(function (port) {return port !== (_AdbDeviceSelector || _load_AdbDeviceSelector()).DEFAULT_ADB_PORT;});});return function getAdbPorts(_x) {return _ref2.apply(this, arguments);};})();let addAdbPorts = exports.addAdbPorts = (() => {var _ref3 = (0, _asyncToGenerator.default)(

  function* (
  targetUri,
  ports)
  {
    const adbService = (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(targetUri);
    const existingPorts = yield adbService.getAdbPorts();

    // Remove any ports that are no longer in the list, but never remove
    // the default adb server port.
    // NOTE: the list of ports is expected to be very short here (like 5 items or less)
    for (const oldPort of existingPorts) {
      if (oldPort !== (_AdbDeviceSelector || _load_AdbDeviceSelector()).DEFAULT_ADB_PORT && !ports.includes(oldPort)) {
        adbService.removeAdbPort(oldPort);
      }
    }

    for (const newPort of ports) {if (!(
      newPort != null)) {throw new Error('Invariant violation: "newPort != null"');}
      if (!existingPorts.includes(newPort)) {
        adbService.addAdbPort(newPort);
      }
    }
  });return function addAdbPorts(_x2, _x3) {return _ref3.apply(this, arguments);};})();exports.

setAdbPath = setAdbPath;var _utils;function _load_utils() {return _utils = require('../../../modules/nuclide-adb/lib/utils');}var _AdbDeviceSelector;function _load_AdbDeviceSelector() {return _AdbDeviceSelector = require('./AdbDeviceSelector');}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function setAdbPath(targetUri, adbPath) {
  const adbService = (0, (_utils || _load_utils()).getAdbServiceByNuclideUri)(targetUri);
  if (adbPath != null) {
    adbService.registerCustomPath(adbPath);
  } else {
    // If the user-specified info is invalid, set empty strings to cause the ADB service
    // to fallback to its default configuration.
    adbService.registerCustomPath(null);
  }
}