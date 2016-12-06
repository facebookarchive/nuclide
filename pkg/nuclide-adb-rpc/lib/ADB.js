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
exports.getDeviceList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDeviceList = exports.getDeviceList = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (adbPath) {
    const devices = yield (0, (_process || _load_process()).runCommand)(adbPath, ['devices']).map(function (stdout) {
      return stdout.split(/\n+/g).slice(1).filter(function (s) {
        return s.length > 0;
      }).map(function (s) {
        return s.split(/\s+/g)[0];
      });
    }).toPromise();

    return Promise.all(devices.map((() => {
      var _ref2 = (0, _asyncToGenerator.default)(function* (s) {
        const arch = yield getDeviceArchitecture(adbPath, s);
        return { name: s, architecture: arch };
      });

      return function (_x2) {
        return _ref2.apply(this, arguments);
      };
    })()));
  });

  return function getDeviceList(_x) {
    return _ref.apply(this, arguments);
  };
})();

exports.startServer = startServer;
exports.getDeviceArchitecture = getDeviceArchitecture;

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function startServer(adbPath) {
  return (0, (_process || _load_process()).runCommand)(adbPath, ['start-server']).publish();
}

function getDeviceArchitecture(adbPath, device) {
  return (0, (_process || _load_process()).runCommand)(adbPath, ['-s', device, 'shell', 'getprop', 'ro.product.cpu.abi']).map(s => s.trim()).toPromise();
}