'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NUCLIDE_ONE_WORLD_ADB_PATH_NAME = undefined;
exports.getAdbPath = getAdbPath;
exports.getAdbPorts = getAdbPorts;
exports.addAdbPorts = addAdbPorts;
exports.setAdbPath = setAdbPath;

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('../nuclide-adb/lib/common/DebugBridge');
}

var _nuclideAdb;

function _load_nuclideAdb() {
  return _nuclideAdb = require('../nuclide-adb');
}

const NUCLIDE_ONE_WORLD_ADB_PATH_NAME = exports.NUCLIDE_ONE_WORLD_ADB_PATH_NAME = 'NUCLIDE_ONE_WORLD_ADB_PATH'; /**
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

function getAdbPath() {
  const atomConfigAdbPathName = atom.config.get(NUCLIDE_ONE_WORLD_ADB_PATH_NAME);
  if (atomConfigAdbPathName != null && typeof atomConfigAdbPathName === 'string') {
    return atomConfigAdbPathName;
  }
  return 'adb';
}

async function getAdbPorts(targetUri) {
  const adbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(targetUri);
  const ports = await adbService.getAdbPorts();

  // Don't show the user the default adb port. This should always be included.
  return ports.filter(port => port !== (_DebugBridge || _load_DebugBridge()).DEFAULT_ADB_PORT);
}

async function addAdbPorts(targetUri, ports) {
  const adbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(targetUri);
  const existingPorts = await adbService.getAdbPorts();

  // Remove any ports that are no longer in the list, but never remove
  // the default adb server port.
  // NOTE: the list of ports is expected to be very short here (like 5 items or less)
  for (const oldPort of existingPorts) {
    if (oldPort !== (_DebugBridge || _load_DebugBridge()).DEFAULT_ADB_PORT && !ports.includes(oldPort)) {
      adbService.removeAdbPort(oldPort);
    }
  }

  for (const newPort of ports) {
    if (!(newPort != null)) {
      throw new Error('Invariant violation: "newPort != null"');
    }

    if (!existingPorts.includes(newPort)) {
      adbService.addAdbPort(newPort);
    }
  }
}

function setAdbPath(targetUri, adbPath) {
  const adbService = (0, (_nuclideAdb || _load_nuclideAdb()).getAdbServiceByNuclideUri)(targetUri);
  if (adbPath != null) {
    adbService.registerCustomPath(adbPath);
  } else {
    // If the user-specified info is invalid, set empty strings to cause the ADB service
    // to fallback to its default configuration.
    adbService.registerCustomPath(null);
  }
}