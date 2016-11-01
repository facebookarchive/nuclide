'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createProcessStream = createProcessStream;
exports._findAvailableDevice = _findAvailableDevice;

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _featureConfig;

function _load_featureConfig() {
  return _featureConfig = _interopRequireDefault(require('../../commons-atom/featureConfig'));
}

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createProcessStream() {
  // Get a list of devices and their states from `xcrun simctl`.
  const simctlOutput$ = (0, (_process || _load_process()).observeProcess)(spawnSimctlList).map(event => {
    if (event.kind === 'error') {
      throw event.error;
    }
    return event;
  }).filter(event => event.kind === 'stdout').map(event => {
    if (!(typeof event.data === 'string')) {
      throw new Error('Invariant violation: "typeof event.data === \'string\'"');
    }

    return event.data;
  }).reduce((acc, next) => acc + next, '').map(rawJson => {
    if (!(typeof rawJson === 'string')) {
      throw new Error('Invariant violation: "typeof rawJson === \'string\'"');
    }

    return JSON.parse(rawJson);
  });

  const udid$ = simctlOutput$.map(json => {
    const devices = json.devices;

    const device = _findAvailableDevice(devices);
    if (device == null) {
      throw new Error('No active iOS simulator found');
    }
    return device.udid;
  })
  // Retry every second until we find an active device.
  .retryWhen(error$ => error$.delay(1000));

  return udid$.first().flatMap(udid => (0, (_process || _load_process()).observeProcess)(() => tailDeviceLogs(udid)).map(event => {
    if (event.kind === 'error') {
      throw event.error;
    }
    return event;
  }).filter(event => event.kind === 'stdout').map(event => {
    if (!(typeof event.data === 'string')) {
      throw new Error('Invariant violation: "typeof event.data === \'string\'"');
    }

    return event.data;
  }));
}

/**
 * Finds the first booted available device in a list of devices (formatted in the output style of
 * `simctl`.). Exported for testing only.
 */
function _findAvailableDevice(devices) {
  for (const key of Object.keys(devices)) {
    for (const device of devices[key]) {
      if (device.availability === '(available)' && device.state === 'Booted') {
        return device;
      }
    }
  }
}

function spawnSimctlList() {
  return (0, (_process || _load_process()).safeSpawn)('xcrun', ['simctl', 'list', '--json']);
}

function tailDeviceLogs(udid) {
  const logDir = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.homedir(), 'Library', 'Logs', 'CoreSimulator', udid, 'asl');
  return (0, (_process || _load_process()).safeSpawn)((_featureConfig || _load_featureConfig()).default.get('nuclide-ios-simulator-logs.pathToSyslog'), ['-w', '-F', 'xml', '-d', logDir]);
}