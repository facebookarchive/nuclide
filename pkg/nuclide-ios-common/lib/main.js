'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getDevices = exports.getFbsimctlDevices = undefined;
exports.parseDevicesFromFbsimctlOutput = parseDevicesFromFbsimctlOutput;
exports.parseDevicesFromSimctlOutput = parseDevicesFromSimctlOutput;
exports.getActiveDeviceIndex = getActiveDeviceIndex;

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _lodash;

function _load_lodash() {
  return _lodash = _interopRequireDefault(require('lodash.memoize'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseDevicesFromFbsimctlOutput(output) {
  const devices = [];

  output.split('\n').forEach(line => {
    let event;
    try {
      event = JSON.parse(line);
    } catch (e) {
      return;
    }
    if (!event || !event.event_name || event.event_name !== 'list' || !event.subject) {
      return;
    }
    const simulator = event.subject;
    if (!simulator.state || !simulator.os || !simulator.name || !simulator.udid) {
      return;
    }

    if (!simulator.os.match(/^iOS (.+)$/)) {
      return;
    }

    devices.push({
      name: simulator.name,
      udid: simulator.udid,
      state: validateState(simulator.state),
      os: simulator.os
    });
  });

  return devices;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function parseDevicesFromSimctlOutput(output) {
  const devices = [];
  let currentOS = null;

  output.split('\n').forEach(line => {
    const section = line.match(/^-- (.+) --$/);
    if (section) {
      const header = section[1].match(/^iOS (.+)$/);
      if (header) {
        currentOS = header[1];
      } else {
        currentOS = null;
      }
      return;
    }

    const device = line.match(/^[ ]*([^()]+) \(([^()]+)\) \((Creating|Booting|Shutting Down|Shutdown|Booted)\)/);
    if (device && currentOS) {
      const [, name, udid, state] = device;
      devices.push({
        name,
        udid,
        state: validateState(state),
        os: currentOS
      });
    }
  });

  return devices;
}

function validateState(rawState) {
  switch (rawState) {
    case 'Creating':
      return 'CREATING';
    case 'Booting':
      return 'BOOTING';
    case 'Shutting Down':
      return 'SHUTTING_DOWN';
    case 'Shutdown':
      return 'SHUT_DOWN';
    case 'Booted':
      return 'BOOTED';
    default:
      return null;
  }
}

const getFbsimctlDevices = exports.getFbsimctlDevices = (0, (_lodash || _load_lodash()).default)(() => (0, (_process || _load_process()).runCommand)('fbsimctl', ['--json', '--simulators', 'list']).map(parseDevicesFromFbsimctlOutput).catch(error =>
// Users may not have fbsimctl installed. If the command failed, just return an empty list.
_rxjsBundlesRxMinJs.Observable.of([])).share());

const getDevices = exports.getDevices = (0, (_lodash || _load_lodash()).default)(() => (0, (_process || _load_process()).runCommand)('xcrun', ['simctl', 'list', 'devices']).map(parseDevicesFromSimctlOutput).catch(error =>
// Users may not have xcrun installed, particularly if they are using Buck for non-iOS
// projects. If the command failed, just return an empty list.
_rxjsBundlesRxMinJs.Observable.of([])).share());

function getActiveDeviceIndex(devices) {
  const bootedDeviceIndex = devices.findIndex(device => device.state === 'BOOTED');
  if (bootedDeviceIndex > -1) {
    return bootedDeviceIndex;
  }

  let defaultDeviceIndex = 0;
  let lastOS = '';
  devices.forEach((device, index) => {
    if (device.name === 'iPhone 5s') {
      if (device.os > lastOS) {
        defaultDeviceIndex = index;
        lastOS = device.os;
      }
    }
  });
  return defaultDeviceIndex;
}