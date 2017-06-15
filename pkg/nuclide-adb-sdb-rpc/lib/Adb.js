'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Adb = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.parsePsTableOutput = parsePsTableOutput;

var _os = _interopRequireDefault(require('os'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('./DebugBridge');
}

var _Store;

function _load_Store() {
  return _Store = require('./Store');
}

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

const VALID_PROCESS_REGEX = new RegExp(/\d+\s()/);

const bridge = new (_DebugBridge || _load_DebugBridge()).DebugBridge((0, (_Store || _load_Store()).createConfigObs)('adb'));

class Adb {

  constructor(device) {
    this._device = device;
  }

  runShortCommand(...command) {
    return bridge.runShortCommand(this._device, command);
  }

  runLongCommand(...command) {
    return bridge.runLongCommand(this._device, command);
  }

  static getDeviceList() {
    return bridge.getDevices().switchMap(devices => {
      return _rxjsBundlesRxMinJs.Observable.concat(...devices.map(name => {
        const adb = new Adb(name);
        return _rxjsBundlesRxMinJs.Observable.forkJoin(adb.getDeviceArchitecture().catch(() => _rxjsBundlesRxMinJs.Observable.of('')), adb.getAPIVersion().catch(() => _rxjsBundlesRxMinJs.Observable.of('')), adb.getDeviceModel().catch(() => _rxjsBundlesRxMinJs.Observable.of(''))).map(([architecture, apiVersion, model]) => ({
          name,
          architecture,
          apiVersion,
          model
        }));
      })).toArray();
    });
  }

  getAndroidProp(key) {
    return this.runShortCommand('shell', 'getprop', key).map(s => s.trim());
  }

  getDeviceArchitecture() {
    return this.getAndroidProp('ro.product.cpu.abi');
  }

  getInstalledPackages() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const prefix = 'package:';
      const stdout = yield _this.runShortCommand('shell', 'pm', 'list', 'packages').toPromise();
      return stdout.trim().split(/\s+/).map(function (s) {
        return s.substring(prefix.length);
      });
    })();
  }

  isPackageInstalled(pkg) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const packages = yield _this2.getInstalledPackages();
      return packages.includes(pkg);
    })();
  }

  getDeviceModel() {
    return this.getAndroidProp('ro.product.model').map(s => s === 'sdk' ? 'emulator' : s);
  }

  getAPIVersion() {
    return this.getAndroidProp('ro.build.version.sdk');
  }

  getBrand() {
    return this.getAndroidProp('ro.product.brand');
  }

  getManufacturer() {
    return this.getAndroidProp('ro.product.manufacturer');
  }

  getCommonDeviceInfo() {
    const unknownCB = () => _rxjsBundlesRxMinJs.Observable.of('');
    return _rxjsBundlesRxMinJs.Observable.forkJoin(this.getDeviceArchitecture().catch(unknownCB), this.getAPIVersion().catch(unknownCB), this.getDeviceModel().catch(unknownCB)).map(([architecture, apiVersion, model]) => {
      return new Map([['name', this._device], ['architecture', architecture], ['api_version', apiVersion], ['model', model]]);
    });
  }

  getDeviceInfo() {
    return this.getCommonDeviceInfo().switchMap(infoTable => {
      const unknownCB = () => _rxjsBundlesRxMinJs.Observable.of('');
      return _rxjsBundlesRxMinJs.Observable.forkJoin(this.getOSVersion().catch(unknownCB), this.getManufacturer().catch(unknownCB), this.getBrand().catch(unknownCB), this.getWifiIp().catch(unknownCB)).map(([android_version, manufacturer, brand, wifi_ip]) => {
        infoTable.set('android_version', android_version);
        infoTable.set('manufacturer', manufacturer);
        infoTable.set('brand', brand);
        infoTable.set('wifi_ip', wifi_ip);
        return infoTable;
      });
    });
  }

  getWifiIp() {
    return this.runShortCommand('shell', 'ip', 'addr', 'show', 'wlan0').map(lines => {
      const line = lines.split(/\n/).filter(l => l.includes('inet'))[0];
      if (line == null) {
        return '';
      }
      const rawIp = line.trim().split(/\s+/)[1];
      return rawIp.substring(0, rawIp.indexOf('/'));
    });
  }

  // Can't use kill, the only option is to use the package name
  // http://stackoverflow.com/questions/17154961/adb-shell-operation-not-permitted
  stopPackage(packageName) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this3.runShortCommand('shell', 'am', 'force-stop', packageName).toPromise();
    })();
  }

  getOSVersion() {
    return this.getAndroidProp('ro.build.version.release');
  }

  installPackage(packagePath) {
    // TODO(T17463635)
    if (!!(_nuclideUri || _load_nuclideUri()).default.isRemote(packagePath)) {
      throw new Error('Invariant violation: "!nuclideUri.isRemote(packagePath)"');
    }

    return this.runLongCommand('install', '-r', packagePath);
  }

  uninstallPackage(packageName) {
    // TODO(T17463635)
    return this.runLongCommand('uninstall', packageName);
  }

  forwardJdwpPortToPid(tcpPort, pid) {
    return this.runShortCommand('forward', `tcp:${tcpPort}`, `jdwp:${pid}`).toPromise();
  }

  launchActivity(packageName, activity, debug, action) {
    const args = ['shell', 'am', 'start', '-W', '-n'];
    if (action != null) {
      args.push('-a', action);
    }
    if (debug) {
      args.push('-N', '-D');
    }
    args.push(`${packageName}/${activity}`);
    return this.runShortCommand(...args).toPromise();
  }

  activityExists(packageName, activity) {
    const packageActivityString = `${packageName}/${activity}`;
    return this.runShortCommand('shell', 'dumpsys', 'package').map(stdout => stdout.includes(packageActivityString)).toPromise();
  }

  touchFile(path) {
    return this.runShortCommand('shell', 'touch', path).toPromise();
  }

  removeFile(path) {
    return this.runShortCommand('shell', 'rm', path).toPromise();
  }

  getProcesses() {
    return this.runShortCommand('shell', 'ps').map(stdout => stdout.split(/\n/));
  }

  getGlobalProcessStat() {
    return this.runShortCommand('shell', 'cat', '/proc/stat').map(stdout => stdout.split(/\n/)[0].trim());
  }

  getProcStats() {
    return this.runShortCommand('shell', 'for file in /proc/[0-9]*/stat; do cat "$file" 2>/dev/null || true; done').map(stdout => {
      return stdout.split(/\n/).filter(line => VALID_PROCESS_REGEX.test(line));
    });
  }

  getJavaProcesses() {
    return this.runShortCommand('shell', 'ps').map(stdout => {
      const psOutput = stdout.trim();
      return parsePsTableOutput(psOutput, ['user', 'pid', 'name']);
    }).switchMap(allProcesses => {
      return this.runLongCommand('jdwp').catch(error => _rxjsBundlesRxMinJs.Observable.of({ kind: 'error', error })) // TODO(T17463635)
      .take(1).timeout(1000).map(output => {
        const jdwpPids = new Set();
        if (output.kind === 'stdout') {
          const block = output.data;
          block.split(/\s+/).forEach(pid => {
            jdwpPids.add(pid.trim());
          });
        }
        return allProcesses.filter(row => jdwpPids.has(row.pid));
      });
    });
  }

  dumpsysPackage(pkg) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!(yield _this4.isPackageInstalled(pkg))) {
        return null;
      }
      return _this4.runShortCommand('shell', 'dumpsys', 'package', pkg).toPromise();
    })();
  }

  getPidFromPackageName(packageName) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const pidLine = (yield _this5.runShortCommand('shell', 'ps', '|', 'grep', '-i', packageName).toPromise()).split(_os.default.EOL)[0];
      if (pidLine == null) {
        throw new Error(`Can not find a running process with package name: ${packageName}`);
      }
      // First column is 'USER', second is 'PID'.
      return parseInt(pidLine.trim().split(/\s+/)[1], /* radix */10);
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