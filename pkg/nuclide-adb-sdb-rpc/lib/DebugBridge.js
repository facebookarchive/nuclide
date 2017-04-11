'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebugBridge = exports.pathForDebugBridge = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let pathForDebugBridge = exports.pathForDebugBridge = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (db) {
    return db;
  });

  return function pathForDebugBridge(_x) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       */

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _os = _interopRequireDefault(require('os'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DebugBridge {

  constructor(adbPath) {
    this._adbPath = adbPath;
  }

  runShortAdbCommand(device, command) {
    const deviceArg = device !== '' ? ['-s', device] : [];
    return (0, (_process || _load_process()).runCommand)(this._adbPath, deviceArg.concat(command));
  }

  runLongAdbCommand(device, command) {
    const deviceArg = device !== '' ? ['-s', device] : [];
    return (0, (_process || _load_process()).observeProcess)(this._adbPath, deviceArg.concat(command), { killTreeOnComplete: true });
  }

  getDeviceList() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const devices = yield (0, (_process || _load_process()).runCommand)(_this._adbPath, ['devices']).map(function (stdout) {
        return stdout.split(/\n+/g).slice(1).filter(function (s) {
          return s.length > 0 && !s.trim().startsWith('*');
        }).map(function (s) {
          return s.split(/\s+/g);
        }).filter(function (a) {
          return a[0] !== '';
        }).map(function (a) {
          return a[0];
        });
      }).toPromise();

      const deviceTable = yield Promise.all(devices.map((() => {
        var _ref2 = (0, _asyncToGenerator.default)(function* (name) {
          try {
            const architecture = yield _this.getDeviceArchitecture(name);
            const apiVersion = yield _this.getAPIVersion(name);
            const model = yield _this.getDeviceModel(name);
            return { name, architecture, apiVersion, model };
          } catch (error) {
            return null;
          }
        });

        return function (_x2) {
          return _ref2.apply(this, arguments);
        };
      })()));

      return (0, (_collection || _load_collection()).arrayCompact)(deviceTable);
    })();
  }

  getDeviceArchitecture(device) {
    throw new Error('not implemented');
  }

  getDeviceModel(device) {
    throw new Error('not implemented');
  }

  getAPIVersion(device) {
    throw new Error('not implemented');
  }

  installPackage(device, packagePath) {
    throw new Error('not implemented');
  }

  uninstallPackage(device, packageName) {
    throw new Error('not implemented');
  }

  getPidFromPackageName(device, packageName) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pidLine = (yield _this2.runShortAdbCommand(device, ['shell', 'ps', '|', 'grep', '-i', packageName]).toPromise()).split(_os.default.EOL)[0];
      if (pidLine == null) {
        throw new Error(`Can not find a running process with package name: ${packageName}`);
      }
      // First column is 'USER', second is 'PID'.
      return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */10);
    })();
  }
}
exports.DebugBridge = DebugBridge;