"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSimulatorPlatform = getSimulatorPlatform;
exports.getDevicePlatform = getDevicePlatform;

function _Tasks() {
  const data = require("./Tasks");

  _Tasks = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function fbsimctl() {
  const data = _interopRequireWildcard(require("../../nuclide-fbsimctl"));

  fbsimctl = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

    if (simulators.length === 0) {
      deviceGroups = BUILD_ONLY_SIMULATOR_GROUPS;
    } else {
      deviceGroups = Array.from(groupByOs(simulators).entries()).map(([os, simsForOs]) => ({
        name: os,
        devices: simsForOs.map(simulator => ({
          identifier: simulator.udid,
          name: simulator.name,
          udid: simulator.udid,
          arch: simulator.arch,
          type: 'simulator'
        }))
      }));
    }

    return {
      isMobile: true,
      name: 'Simulator',
      tasksForDevice: device => (0, _Tasks().getTasks)(buckRoot, ruleType, device, debuggerCallback != null),
      runTask: (builder, taskType, target, settings, device) => (0, _Tasks().runTask)(builder, taskType, ruleType, target, settings, device, buckRoot, debuggerCallback),
      deviceGroups
    };
  });
}

function getDevicePlatform(buckRoot, ruleType, debuggerCallback) {
  return fbsimctl().observeIosDevices().filter(expected => !expected.isPending).map(expected => {
    let deviceGroups = [];
    const devices = expected.getOrDefault([]);
    const physicalDevices = devices.filter(device => device.type === 'physical_device');

    if (physicalDevices.length > 0) {
      deviceGroups = Array.from(groupByOs(physicalDevices).entries()).map(([os, devicesForOs]) => ({
        name: os,
        devices: devicesForOs.map(device => ({
          identifier: device.udid,
          name: device.name,
          udid: device.udid,
          arch: device.arch,
          type: 'device'
        }))
      }));
    }

    deviceGroups.push(BUILD_ONLY_DEVICES_GROUP);
    return {
      isMobile: true,
      name: 'Device',
      tasksForDevice: device => (0, _Tasks().getTasks)(buckRoot, ruleType, device, debuggerCallback != null),
      runTask: (builder, taskType, target, settings, device) => (0, _Tasks().runTask)(builder, taskType, ruleType, target, settings, device, buckRoot, debuggerCallback),
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

    devicesForOs.push(device);
    return memo;
  }, new Map());

  for (const devicesForOs of devicesByOs.values()) {
    devicesForOs.sort((a, b) => {
      return b.name.localeCompare(a.name);
    });
  }

  return devicesByOs;
}

const BUILD_ONLY_SIMULATOR_GROUPS = [{
  name: 'Generic',
  devices: [{
    identifier: 'build-only-x86_64',
    name: '64-bit',
    udid: '',
    arch: 'x86_64',
    type: 'simulator',
    buildOnly: true
  }, {
    identifier: 'build-only-i386',
    name: '32-bit',
    udid: '',
    arch: 'i386',
    type: 'simulator',
    buildOnly: true
  }]
}];
const BUILD_ONLY_DEVICES_GROUP = {
  name: 'Generic',
  devices: [{
    identifier: 'build-only-arm64',
    name: '64-bit',
    udid: '',
    arch: 'arm64',
    type: 'device',
    buildOnly: true
  }, {
    identifier: 'build-only-armv7',
    name: '32-bit',
    udid: '',
    arch: 'armv7',
    type: 'device',
    buildOnly: true
  }]
};