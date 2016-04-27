Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createProcessStream = createProcessStream;
exports._findAvailableDevice = _findAvailableDevice;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideFeatureConfig = require('../../nuclide-feature-config');

var _nuclideFeatureConfig2 = _interopRequireDefault(_nuclideFeatureConfig);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _rxjs = require('rxjs');

var _rxjs2 = _interopRequireDefault(_rxjs);

function createProcessStream() {
  // Get a list of devices and their states from `xcrun simctl`.
  var simctlOutput$ = (0, _nuclideCommons.observeProcess)(spawnSimctlList).map(function (event) {
    if (event.kind === 'error') {
      throw event.error;
    }
    return event;
  }).filter(function (event) {
    return event.kind === 'stdout';
  }).map(function (event) {
    return (0, _assert2['default'])(event.data != null), event.data;
  }).reduce(function (acc, next) {
    return acc + next;
  }, '').map(function (rawJson) {
    return JSON.parse(rawJson);
  });

  var udid$ = simctlOutput$.map(function (json) {
    var devices = json.devices;

    var device = _findAvailableDevice(devices);
    if (device == null) {
      throw new Error('No active iOS simulator found');
    }
    return device.udid;
  })
  // Retry every second until we find an active device.
  .retryWhen(function (error$) {
    return error$.delay(1000);
  });

  return udid$.first().flatMap(function (udid) {
    return (0, _nuclideCommons.observeProcess)(function () {
      return tailDeviceLogs(udid);
    }).map(function (event) {
      if (event.kind === 'error') {
        throw event.error;
      }
      return event;
    }).filter(function (event) {
      return event.kind === 'stdout';
    }).map(function (event) {
      return (0, _assert2['default'])(event.data != null), event.data;
    });
  });
}

/**
 * Finds the first booted available device in a list of devices (formatted in the output style of
 * `simctl`.). Exported for testing only.
 */

function _findAvailableDevice(devices) {
  for (var key of Object.keys(devices)) {
    for (var device of devices[key]) {
      if (device.availability === '(available)' && device.state === 'Booted') {
        return device;
      }
    }
  }
}

function spawnSimctlList() {
  return (0, _nuclideCommons.safeSpawn)('xcrun', ['simctl', 'list', '--json']);
}

function tailDeviceLogs(udid) {
  var logDir = _path2['default'].join(_os2['default'].homedir(), 'Library', 'Logs', 'CoreSimulator', udid, 'asl');
  return (0, _nuclideCommons.safeSpawn)(_nuclideFeatureConfig2['default'].get('nuclide-ios-simulator-logs.pathToSyslog'), ['-w', '-F', 'xml', '-d', logDir]);
}