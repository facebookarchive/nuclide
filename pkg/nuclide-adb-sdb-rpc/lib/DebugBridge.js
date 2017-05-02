'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.DebugBridge = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _os = _interopRequireDefault(require('os'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

class DebugBridge {

  constructor(adbPath) {
    this._adbPath = adbPath;
  }

  runShortAdbCommand(device, command) {
    const deviceArg = device !== '' ? ['-s', device] : [];
    return (0, (_process || _load_process()).runCommand)(this._adbPath, deviceArg.concat(command));
  }

  runLongAdbCommand(device, command) {
    // TODO(T17463635)
    const deviceArg = device !== '' ? ['-s', device] : [];
    return (0, (_process || _load_process()).observeProcess)(this._adbPath, deviceArg.concat(command), {
      killTreeWhenDone: true,
      /* TODO(T17353599) */isExitError: () => false
    }).catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error })); // TODO(T17463635)
  }

  startServer() {
    return (0, (_process || _load_process()).runCommand)(this._adbPath, ['start-server']).toPromise().then(() => true, () => false);
  }

  getCommonDeviceInfo(device) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const unknownCB = function () {
        return null;
      };
      const architecture = yield _this.getDeviceArchitecture(device).catch(unknownCB);
      const apiVersion = yield _this.getAPIVersion(device).catch(unknownCB);
      const model = yield _this.getDeviceModel(device).catch(unknownCB);
      return new Map([['name', device], ['architecture', architecture], ['api_version', apiVersion], ['model', model]]);
    })();
  }

  getDeviceList() {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const devices = yield (0, (_process || _load_process()).runCommand)(_this2._adbPath, ['devices']).map(function (stdout) {
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
        var _ref = (0, _asyncToGenerator.default)(function* (name) {
          try {
            const architecture = yield _this2.getDeviceArchitecture(name);
            const apiVersion = yield _this2.getAPIVersion(name);
            const model = yield _this2.getDeviceModel(name);
            return { name, architecture, apiVersion, model };
          } catch (error) {
            return null;
          }
        });

        return function (_x) {
          return _ref.apply(this, arguments);
        };
      })()));

      return (0, (_collection || _load_collection()).arrayCompact)(deviceTable);
    })();
  }

  getFileContentsAtPath(device, path) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this3.runShortAdbCommand(device, ['shell', 'cat', path]).toPromise();
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
    // TODO(T17463635)
    throw new Error('not implemented');
  }

  uninstallPackage(device, packageName) {
    // TODO(T17463635)
    throw new Error('not implemented');
  }

  getPidFromPackageName(device, packageName) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pidLine = (yield _this4.runShortAdbCommand(device, ['shell', 'ps', '|', 'grep', '-i', packageName]).toPromise()).split(_os.default.EOL)[0];
      if (pidLine == null) {
        throw new Error(`Can not find a running process with package name: ${packageName}`);
      }
      // First column is 'USER', second is 'PID'.
      return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */10);
    })();
  }
}
exports.DebugBridge = DebugBridge;