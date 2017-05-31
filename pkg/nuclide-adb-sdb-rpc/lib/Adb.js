'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Adb = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.parsePsTableOutput = parsePsTableOutput;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _process;

function _load_process() {
  return _process = require('../../commons-node/process');
}

var _AdbSdbBase;

function _load_AdbSdbBase() {
  return _AdbSdbBase = require('./AdbSdbBase');
}

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

class Adb extends (_AdbSdbBase || _load_AdbSdbBase()).AdbSdbBase {
  getAndroidProp(device, key) {
    return this.runShortCommand(device, ['shell', 'getprop', key]).map(s => s.trim());
  }

  getDeviceArchitecture(device) {
    return this.getAndroidProp(device, 'ro.product.cpu.abi').toPromise();
  }

  getInstalledPackages(device) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const prefix = 'package:';
      const stdout = yield _this.runShortCommand(device, ['shell', 'pm', 'list', 'packages']).toPromise();
      return stdout.trim().split(/\s+/).map(function (s) {
        return s.substring(prefix.length);
      });
    })();
  }

  isPackageInstalled(device, pkg) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const packages = yield _this2.getInstalledPackages(device);
      return packages.includes(pkg);
    })();
  }

  getDeviceModel(device) {
    return this.getAndroidProp(device, 'ro.product.model').map(s => s === 'sdk' ? 'emulator' : s).toPromise();
  }

  getAPIVersion(device) {
    return this.getAndroidProp(device, 'ro.build.version.sdk').toPromise();
  }

  getBrand(device) {
    return this.getAndroidProp(device, 'ro.product.brand').toPromise();
  }

  getManufacturer(device) {
    return this.getAndroidProp(device, 'ro.product.manufacturer').toPromise();
  }

  getDeviceInfo(device) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const infoTable = yield _this3.getCommonDeviceInfo(device);
      const unknownCB = function () {
        return '';
      };
      infoTable.set('android_version', (yield _this3.getOSVersion(device).catch(unknownCB)));
      infoTable.set('manufacturer', (yield _this3.getManufacturer(device).catch(unknownCB)));
      infoTable.set('brand', (yield _this3.getBrand(device).catch(unknownCB)));
      infoTable.set('wifi_ip', (yield _this3.getWifiIp(device).catch(unknownCB)));
      return infoTable;
    })();
  }

  getWifiIp(device) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const lines = yield _this4.runShortCommand(device, ['shell', 'ip', 'addr', 'show', 'wlan0']).toPromise();
      const line = lines.split(/\n/).filter(function (l) {
        return l.includes('inet');
      })[0];
      if (line == null) {
        return '';
      }
      const rawIp = line.trim().split(/\s+/)[1];
      return rawIp.substring(0, rawIp.indexOf('/'));
    })();
  }

  // Can't use kill, the only option is to use the package name
  // http://stackoverflow.com/questions/17154961/adb-shell-operation-not-permitted
  stopPackage(device, packageName) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this5.runShortCommand(device, ['shell', 'am', 'force-stop', packageName]).toPromise();
    })();
  }

  getOSVersion(device) {
    return this.getAndroidProp(device, 'ro.build.version.release').toPromise();
  }

  installPackage(device, packagePath) {
    // TODO(T17463635)
    if (!!(_nuclideUri || _load_nuclideUri()).default.isRemote(packagePath)) {
      throw new Error('Invariant violation: "!nuclideUri.isRemote(packagePath)"');
    }

    return this.runLongCommand(device, ['install', '-r', packagePath]);
  }

  uninstallPackage(device, packageName) {
    // TODO(T17463635)
    return this.runLongCommand(device, ['uninstall', packageName]);
  }

  forwardJdwpPortToPid(device, tcpPort, pid) {
    return this.runShortCommand(device, ['forward', `tcp:${tcpPort}`, `jdwp:${pid}`]).toPromise();
  }

  launchActivity(device, packageName, activity, debug, action) {
    const args = ['shell', 'am', 'start', '-W', '-n'];
    if (action != null) {
      args.push('-a', action);
    }
    if (debug) {
      args.push('-N', '-D');
    }
    args.push(`${packageName}/${activity}`);
    return this.runShortCommand(device, args).toPromise();
  }

  activityExists(device, packageName, activity) {
    const packageActivityString = `${packageName}/${activity}`;
    const deviceArg = device !== '' ? ['-s', device] : [];
    const command = deviceArg.concat(['shell', 'dumpsys', 'package']);
    return (0, (_process || _load_process()).runCommand)(this._dbPath, command).map(stdout => stdout.includes(packageActivityString)).toPromise();
  }

  getJavaProcesses(device) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const allProcesses = yield _this6.runShortCommand(device, ['shell', 'ps']).map(function (stdout) {
        const psOutput = stdout.trim();
        return parsePsTableOutput(psOutput, ['user', 'pid', 'name']);
      }).toPromise();

      return _this6.runLongCommand(device, ['jdwp']).catch(function (error) {
        return _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error });
      }) // TODO(T17463635)
      .take(1).timeout(1000).map(function (output) {
        const jdwpPids = new Set();
        if (output.kind === 'stdout') {
          const block = output.data;
          block.split(/\s+/).forEach(function (pid) {
            jdwpPids.add(pid.trim());
          });
        }

        return allProcesses.filter(function (row) {
          return jdwpPids.has(row.pid);
        });
      }).toPromise();
    })();
  }

  dumpsysPackage(device, pkg) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(yield _this7.isPackageInstalled(device, pkg))) {
        return null;
      }
      return _this7.runShortCommand(device, ['shell', 'dumpsys', 'package', pkg]).toPromise();
    })();
  }
}

exports.Adb = Adb;
function parsePsTableOutput(output, desiredFields) {
  const lines = output.split(/\n/);
  const header = lines[0];
  const cols = header.split(/\s+/);
  const colMapping = {};

  for (let i = 0; i < cols.length; i++) {
    const columnName = cols[i].toLowerCase();
    if (desiredFields.includes(columnName)) {
      colMapping[i] = columnName;
    }
  }

  const formattedData = [];
  const data = lines.slice(1);
  data.filter(row => row.trim() !== '').forEach(row => {
    const rowData = row.split(/\s+/);
    const rowObj = {};
    for (let i = 0; i < rowData.length; i++) {
      // Android's ps output has an extra column "S" in the data that doesn't appear
      // in the header. Skip that column's value.
      const effectiveColumn = i;
      if (rowData[i] === 'S' && i < rowData.length - 1) {
        i++;
      }

      if (colMapping[effectiveColumn] !== undefined) {
        rowObj[colMapping[effectiveColumn]] = rowData[i];
      }
    }

    formattedData.push(rowObj);
  });

  return formattedData;
}