"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSimulatorPlatform = getSimulatorPlatform;
exports.getDevicePlatform = getDevicePlatform;

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _Tasks() {
  const data = require("./Tasks");

  _Tasks = function () {
    return data;
  };

  return data;
}

var _rxjsCompatUmdMin = require("rxjs-compat/bundles/rxjs-compat.umd.min.js");

function fbsimctl() {
  const data = _interopRequireWildcard(require("../../nuclide-fbsimctl"));

  fbsimctl = function () {
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
 *  strict-local
 * @format
 */
function getSimulatorPlatform(buckRoot, ruleType, debuggerCallback) {
  return fbsimctl().observeIosDevices().filter(expected => !expected.isPending).map(expected => {
    // TODO: Come up with a way to surface the error in UI
    const simulators = expected.getOrDefault([]).filter(device => device.type === 'simulator');
    let deviceGroups;
    let devicesForIdentifiers;

    if (simulators.length === 0) {
      // No simulators installed, at least give user a chance to build.
      deviceGroups = [BUILD_ONLY_SIMULATORS.deviceGroup];
      devicesForIdentifiers = BUILD_ONLY_SIMULATORS.devicesForIdentifiers;
    } else {
      deviceGroups = groupByOs(simulators);
      devicesForIdentifiers = new Map(simulators.map(s => [s.udid, s]));
    }

    return {
      isMobile: true,
      name: 'Simulator',
      tasksForDevice: device => (0, _Tasks().getTasks)(buckRoot, ruleType, BUILD_ONLY_SIMULATORS.devicesForIdentifiers.has((0, _nullthrows().default)(device).identifier), debuggerCallback != null),
      runTask: (builder, taskType, target, settings, device) => (0, _Tasks().runTask)(builder, taskType, ruleType, target, settings, (0, _nullthrows().default)(devicesForIdentifiers.get((0, _nullthrows().default)(device).identifier)), buckRoot, debuggerCallback),
      deviceGroups
    };
  });
}

function getDevicePlatform(buckRoot, ruleType, debuggerCallback) {
  return fbsimctl().observeIosDevices().filter(expected => !expected.isPending).map(expected => {
    let deviceGroups = [];
    const devices = expected.getOrDefault([]);
    const physicalDevices = devices.filter(device => device.type === 'physical_device');
    const devicesForIdentifiers = new Map();

    if (physicalDevices.length > 0) {
      physicalDevices.forEach(d => {
        devicesForIdentifiers.set(d.udid, d);
      });
      deviceGroups = groupByOs(physicalDevices);
    } // Always give user a chance to build for all architectures.


    deviceGroups.push(BUILD_ONLY_DEVICES.deviceGroup);
    BUILD_ONLY_DEVICES.devicesForIdentifiers.forEach(d => {
      devicesForIdentifiers.set(d.udid, d);
    });
    return {
      isMobile: true,
      name: 'Device',
      tasksForDevice: device => (0, _Tasks().getTasks)(buckRoot, ruleType, BUILD_ONLY_DEVICES.devicesForIdentifiers.has((0, _nullthrows().default)(device).identifier), debuggerCallback != null),
      runTask: (builder, taskType, target, settings, device) => {
        return (0, _Tasks().runTask)(builder, taskType, ruleType, target, settings, (0, _nullthrows().default)(devicesForIdentifiers.get((0, _nullthrows().default)(device).identifier)), buckRoot, debuggerCallback);
      },
      deviceGroups
    };
  });
}

function groupByOs(devices) {
  const devicesByOs = devices.reduce((memo, device) => {
    let devicesForOs = memo.get(device.os);

    if (devicesForOs == null) {
      devicesForOs = [];
      memo.set(device.os, devicesForOs);
    }

    devicesForOs.push({
      identifier: device.udid,
      name: device.name
    });
    return memo;
  }, new Map());

  for (const devicesForOs of devicesByOs.values()) {
    devicesForOs.sort((a, b) => {
      return b.name.localeCompare(a.name);
    });
  }

  return Array.from(devicesByOs.entries()).map(([os, devicesForOs]) => ({
    name: os,
    devices: devicesForOs
  }));
}

const BUILD_ONLY_SIMULATORS = {
  deviceGroup: {
    name: 'Generic',
    devices: [{
      identifier: 'build-only-x86_64',
      name: '64-bit'
    }, {
      identifier: 'build-only-i386',
      name: '32-bit'
    }]
  },
  devicesForIdentifiers: new Map([['build-only-x86_64', {
    name: '64-bit',
    udid: 'build-only-x86_64',
    arch: 'x86_64',
    type: 'simulator',
    os: '',
    state: 'Booted'
  }], ['build-only-i386', {
    name: '32-bit',
    udid: 'build-only-i386',
    arch: 'i386',
    type: 'simulator',
    os: '',
    state: 'Booted'
  }]])
};
const BUILD_ONLY_DEVICES = {
  deviceGroup: {
    name: 'Generic',
    devices: [{
      identifier: 'build-only-arm64',
      name: '64-bit'
    }, {
      identifier: 'build-only-armv7',
      name: '32-bit'
    }]
  },
  devicesForIdentifiers: new Map([['build-only-arm64', {
    name: '64-bit',
    udid: 'build-only-arm64',
    arch: 'arm64',
    type: 'physical_device',
    os: '',
    state: 'Booted'
  }], ['build-only-armv7', {
    name: '32-bit',
    udid: 'build-only-armv7',
    arch: 'armv7',
    type: 'physical_device',
    os: '',
    state: 'Booted'
  }]])
};