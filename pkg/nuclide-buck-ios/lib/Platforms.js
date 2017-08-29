'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSimulatorPlatform = getSimulatorPlatform;
exports.getDevicePlatform = getDevicePlatform;

var _Tasks;

function _load_Tasks() {
  return _Tasks = require('./Tasks');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideFbsimctl;

function _load_nuclideFbsimctl() {
  return _nuclideFbsimctl = _interopRequireWildcard(require('../../nuclide-fbsimctl'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function getSimulatorPlatform(buckRoot, ruleType, debuggerCallback) {
  return (_nuclideFbsimctl || _load_nuclideFbsimctl()).getDevices().map(devices => {
    const simulators = devices.filter(device => device.type === 'simulator');
    let deviceGroups;
    if (simulators.length === 0) {
      deviceGroups = NO_SIMULATORS_FOUND_GROUPS;
    } else {
      const simulatorsByOs = simulators.reduce((memo, sim) => {
        let simsForOs = memo.get(sim.os);
        if (simsForOs == null) {
          simsForOs = [];
          memo.set(sim.os, simsForOs);
        }
        simsForOs.push(sim);
        return memo;
      }, new Map());

      for (const simsForOs of simulatorsByOs.values()) {
        simsForOs.sort((a, b) => {
          return b.name.localeCompare(a.name);
        });
      }

      deviceGroups = Array.from(simulatorsByOs.entries()).map(([os, simsForOs]) => ({
        name: os,
        devices: simsForOs.map(simulator => ({
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
      tasksForDevice: device => (0, (_Tasks || _load_Tasks()).getTasks)(buckRoot, ruleType, device, debuggerCallback != null),
      runTask: (builder, taskType, target, settings, device) => (0, (_Tasks || _load_Tasks()).runTask)(builder, taskType, ruleType, target, settings, device, buckRoot, debuggerCallback),
      deviceGroups
    };
  });
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function getDevicePlatform(buckRoot, ruleType, debuggerCallback) {
  return (_nuclideFbsimctl || _load_nuclideFbsimctl()).getDevices().map(devices => {
    const physicalDevices = devices.filter(device => device.type === 'physical_device');
    const deviceGroups = [];

    if (physicalDevices.length > 0) {
      deviceGroups.push({
        name: 'Connected',
        devices: physicalDevices.map(device => ({
          name: device.name,
          udid: device.udid,
          arch: device.arch,
          type: 'device'
        }))
      });
    }

    deviceGroups.push(BUILD_ONLY_DEVICES_GROUP);

    return {
      isMobile: true,
      name: 'Device',
      tasksForDevice: device => (0, (_Tasks || _load_Tasks()).getTasks)(buckRoot, ruleType, device, debuggerCallback != null),
      runTask: (builder, taskType, target, settings, device) => (0, (_Tasks || _load_Tasks()).runTask)(builder, taskType, ruleType, target, settings, device, buckRoot, debuggerCallback),
      deviceGroups
    };
  });
}

const NO_SIMULATORS_FOUND_GROUPS = [{
  name: '(none installed)',
  devices: [{
    name: '64-bit',
    udid: '',
    arch: 'x86_64',
    type: 'simulator',
    buildOnly: true
  }, {
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
    name: '64-bit',
    udid: '',
    arch: 'arm64',
    type: 'device',
    buildOnly: true
  }, {
    name: '32-bit',
    udid: '',
    arch: 'armv7',
    type: 'device',
    buildOnly: true
  }]
};