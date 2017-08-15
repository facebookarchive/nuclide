'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSimulators = undefined;
exports.getFbsimctlDevices = getFbsimctlDevices;
exports.getFbsimctlSimulators = getFbsimctlSimulators;
exports.parseSimulatorsFromSimctlOutput = parseSimulatorsFromSimctlOutput;

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _lodash;

function _load_lodash() {
  return _lodash = _interopRequireDefault(require('lodash.memoize'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getFbsimctlDevices() {
  return _rxjsBundlesRxMinJs.Observable.interval(5000).startWith(0).switchMap(() => (0, (_process || _load_process()).runCommand)('fbsimctl', ['--json', '--devices', '--format=%n%u%a', 'list']).map(parseDevicesFromFbsimctlOutput)
  // Users may not have fbsimctl installed. If the command failed, just return an empty list.
  .catch(error => _rxjsBundlesRxMinJs.Observable.of([])).share());
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

function getFbsimctlSimulators() {
  return _rxjsBundlesRxMinJs.Observable.interval(5000).startWith(0).switchMap(() => (0, (_process || _load_process()).runCommand)('fbsimctl', ['--json', '--simulators', '--format=%n%u%s%o%a', 'list']).map(parseSimulatorsFromFbsimctlOutput).catch(error => getSimulators())
  // Users may not have fbsimctl installed. Fall back to xcrun simctl in that case.
  .share());
}

const getSimulators = exports.getSimulators = (0, (_lodash || _load_lodash()).default)(() => (0, (_process || _load_process()).runCommand)('xcrun', ['simctl', 'list', 'devices']).map(parseSimulatorsFromSimctlOutput).catch(error =>
// Users may not have xcrun installed. If the command failed, just return an empty list.
_rxjsBundlesRxMinJs.Observable.of([])).share());

function parseSimulatorsFromFbsimctlOutput(output) {
  const simulators = [];

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
    const { state, os, name, udid, arch } = simulator;
    if (!state || !os || !name || !udid || !arch) {
      return;
    }

    if (!simulator.os.match(/^iOS (.+)$/)) {
      return;
    }

    simulators.push({
      name,
      udid,
      state: validateState(state),
      os,
      arch
    });
  });

  return simulators;
}

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
    const device = event.subject;
    const { name, udid, arch } = device;
    if (!name || !udid || !arch) {
      return;
    }

    devices.push({ name, udid, arch });
  });

  return devices;
}

function parseSimulatorsFromSimctlOutput(output) {
  const simulators = [];
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

    const simulator = line.match(/^[ ]*([^()]+) \(([^()]+)\) \((Creating|Booting|Shutting Down|Shutdown|Booted)\)/);
    if (simulator && currentOS) {
      const [, name, udid, state] = simulator;
      const arch = name.match(/^(iPhone (5$|5C|4)|iPad Retina)/) ? 'i386' : 'x86_64';
      simulators.push({
        name,
        udid,
        state: validateState(state),
        os: currentOS,
        arch
      });
    }
  });

  return simulators;
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