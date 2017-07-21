'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Adb = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('../common/DebugBridge');
}

var _Store;

function _load_Store() {
  return _Store = require('../common/Store');
}

var _ps;

function _load_ps() {
  return _ps = require('../common/ps');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Adb extends (_DebugBridge || _load_DebugBridge()).DebugBridge {

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

  getDeviceInfo() {
    const unknownCB = () => _rxjsBundlesRxMinJs.Observable.of('');
    return _rxjsBundlesRxMinJs.Observable.forkJoin(this.getDeviceArchitecture().catch(unknownCB), this.getAPIVersion().catch(unknownCB), this.getDeviceModel().catch(unknownCB), this.getOSVersion().catch(unknownCB), this.getManufacturer().catch(unknownCB), this.getBrand().catch(unknownCB), this.getWifiIp().catch(unknownCB)).map(([architecture, apiVersion, model, android_version, manufacturer, brand, wifi_ip]) => {
      return new Map([['name', this._device], ['architecture', architecture], ['api_version', apiVersion], ['model', model], ['android_version', android_version], ['manufacturer', manufacturer], ['brand', brand], ['wifi_ip', wifi_ip]]);
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

  launchActivity(packageName, activity, debug, action, parameters) {
    const args = ['shell', 'am', 'start'];
    if (action != null) {
      args.push('-a', action);
    }
    if (parameters != null) {
      for (const [key, parameter] of parameters) {
        args.push('-e', key, parameter);
      }
    }
    if (debug) {
      args.push('-N', '-D');
    }
    args.push('-W', '-n');
    args.push(`${packageName}/${activity}`);
    return this.runShortCommand(...args).toPromise();
  }

  launchMainActivity(packageName, debug, parameters) {
    const args = ['shell', 'am', 'start'];
    args.push('-W', '-n');
    if (parameters != null) {
      for (const [key, parameter] of parameters) {
        args.push('-e', key, parameter);
      }
    }
    if (debug) {
      args.push('-N', '-D');
    }
    args.push('-a', 'android.intent.action.MAIN');
    args.push('-c', 'android.intent.category.LAUNCHER');
    args.push(`${packageName}`);
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

  getDebuggableProcesses() {
    return this.getJavaProcesses();
  }

  getJavaProcesses() {
    const jdwpProcesses = new Set();
    return this.runShortCommand('shell', 'ps').map(stdout => {
      const psOutput = stdout.trim();
      return (0, (_ps || _load_ps()).parsePsTableOutput)(psOutput, ['user', 'pid', 'name']);
    }).switchMap(allProcesses => {
      const map = new Map();
      allProcesses.filter(row => row != null).forEach(proc => map.set(proc.pid, proc));
      return Promise.resolve(map);
    }).switchMap(allProcessesMap => {
      return this.runLongCommand('jdwp').timeout(1000).map(output => {
        if (output.kind === 'stdout') {
          const block = output.data;
          block.split(/\s+/).forEach(pid => {
            const proc = allProcessesMap.get(pid);
            if (proc != null) {
              jdwpProcesses.add(proc);
            }
          });
        }
      }).catch(error => _rxjsBundlesRxMinJs.Observable.empty());
    }).switchMap(() => {
      return Promise.resolve(Array.from(jdwpProcesses));
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
}
exports.Adb = Adb; /**
                    * Copyright (c) 2015-present, Facebook, Inc.
                    * All rights reserved.
                    *
                    * This source code is licensed under the license found in the LICENSE file in
                    * the root directory of this source tree.
                    *
                    * 
                    * @format
                    */

Adb.configObs = (0, (_Store || _load_Store()).createConfigObs)('adb');