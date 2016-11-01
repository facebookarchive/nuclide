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
exports.getDevices = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
      var _device = _slicedToArray(device, 4);

      const name = _device[1],
            udid = _device[2],
            state = _device[3];

      devices.push({
        name: name,
        udid: udid,
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

const getDevices = exports.getDevices = (0, (_lodash || _load_lodash()).default)(() => (0, (_process || _load_process()).observeProcess)(() => (0, (_process || _load_process()).safeSpawn)('xcrun', ['simctl', 'list', 'devices'])).map(event => {
  // Throw errors.
  if (event.kind === 'error') {
    const error = new Error();
    error.name = 'XcrunError';
    throw error;
  }
  return event;
}).reduce((acc, event) => event.kind === 'stdout' ? acc + event.data : acc, '').map(parseDevicesFromSimctlOutput).catch(error =>
// Users may not have xcrun installed, particularly if they are using Buck for non-iOS
// projects. If the command failed, just return an empty list.
error.name === 'XcrunError' ? _rxjsBundlesRxMinJs.Observable.of([]) : _rxjsBundlesRxMinJs.Observable.throw(error)).share());

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