Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

exports.parseDevicesFromSimctlOutput = parseDevicesFromSimctlOutput;
exports.getActiveDeviceIndex = getActiveDeviceIndex;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _commonsNodeProcess2;

function _commonsNodeProcess() {
  return _commonsNodeProcess2 = require('../../commons-node/process');
}

var _lodashMemoize2;

function _lodashMemoize() {
  return _lodashMemoize2 = _interopRequireDefault(require('lodash.memoize'));
}

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var DeviceState = {
  Creating: 'Creating',
  Booting: 'Booting',
  ShuttingDown: 'Shutting Down',
  Shutdown: 'Shutdown',
  Booted: 'Booted'
};

function parseDevicesFromSimctlOutput(output) {
  var devices = [];
  var currentOS = null;

  output.split('\n').forEach(function (line) {
    var section = line.match(/^-- (.+) --$/);
    if (section) {
      var header = section[1].match(/^iOS (.+)$/);
      if (header) {
        currentOS = header[1];
      } else {
        currentOS = null;
      }
      return;
    }

    var device = line.match(/^[ ]*([^()]+) \(([^()]+)\) \((Creating|Booting|Shutting Down|Shutdown|Booted)\)/);
    if (device && currentOS) {
      var _device = _slicedToArray(device, 4);

      var _name = _device[1];
      var _udid = _device[2];
      var _state = _device[3];

      devices.push({ name: _name, udid: _udid, state: _state, os: currentOS });
    }
  });

  return devices;
}

var getDevices = (0, (_lodashMemoize2 || _lodashMemoize()).default)(function () {
  return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).observeProcess)(function () {
    return (0, (_commonsNodeProcess2 || _commonsNodeProcess()).safeSpawn)('xcrun', ['simctl', 'list', 'devices']);
  }).map(function (event) {
    // Throw errors.
    if (event.kind === 'error') {
      var error = new Error();
      error.name = 'XcrunError';
      throw error;
    }
    return event;
  }).reduce(function (acc, event) {
    return event.kind === 'stdout' ? acc + event.data : acc;
  }, '').map(parseDevicesFromSimctlOutput).catch(function (error) {
    return(
      // Users may not have xcrun installed, particularly if they are using Buck for non-iOS
      // projects. If the command failed, just return an empty list.
      error.name === 'XcrunError' ? (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of([]) : (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.throw(error)
    );
  }).share();
});

exports.getDevices = getDevices;

function getActiveDeviceIndex(devices) {
  var bootedDeviceIndex = devices.findIndex(function (device) {
    return device.state === DeviceState.Booted;
  });
  if (bootedDeviceIndex > -1) {
    return bootedDeviceIndex;
  }

  var defaultDeviceIndex = 0;
  var lastOS = '';
  devices.forEach(function (device, index) {
    if (device.name === 'iPhone 5s') {
      if (device.os > lastOS) {
        defaultDeviceIndex = index;
        lastOS = device.os;
      }
    }
  });
  return defaultDeviceIndex;
}