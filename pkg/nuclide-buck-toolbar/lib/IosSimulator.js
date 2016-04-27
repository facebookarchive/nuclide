Object.defineProperty(exports, '__esModule', {
  value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var getDevices = _asyncToGenerator(function* () {
  var xcrunOutput = undefined;
  try {
    var _ref = yield asyncExecute('xcrun', ['simctl', 'list', 'devices']);

    var stdout = _ref.stdout;

    xcrunOutput = stdout;
  } catch (e) {
    // Users may not have xcrun installed, particularly if they are using Buck for non-iOS projects.
    return [];
  }
  return parseDevicesFromSimctlOutput(xcrunOutput);
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _require = require('../../nuclide-commons');

var asyncExecute = _require.asyncExecute;

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

function selectDevice(devices) {
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

module.exports = {
  DeviceState: DeviceState,
  getDevices: getDevices,
  parseDevicesFromSimctlOutput: parseDevicesFromSimctlOutput,
  selectDevice: selectDevice
};