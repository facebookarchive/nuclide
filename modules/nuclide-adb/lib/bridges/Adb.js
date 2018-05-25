'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Adb = undefined;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../nuclide-commons/nuclideUri'));
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

  async getInstalledPackages() {
    const prefix = 'package:';
    const stdout = await this.runShortCommand('shell', 'pm', 'list', 'packages').toPromise();
    return stdout.trim().split(/\s+/).map(s => s.substring(prefix.length));
  }

  async isPackageInstalled(pkg) {
    const packages = await this.getInstalledPackages();
    return packages.includes(pkg);
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
      return new Map([['name', this._device.name], ['adb_port', String(this._device.port)], ['architecture', architecture], ['api_version', apiVersion], ['model', model], ['android_version', android_version], ['manufacturer', manufacturer], ['brand', brand], ['wifi_ip', wifi_ip]]);
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

  // In some android devices, we have to kill the package, not the process.
  // http://stackoverflow.com/questions/17154961/adb-shell-operation-not-permitted
  async stopProcess(packageName, pid) {
    await Promise.all([this.runShortCommand('shell', 'am', 'force-stop', packageName).toPromise(), this.runShortCommand('shell', 'kill', '-9', `${pid}`).toPromise(), this.runShortCommand('shell', 'run-as', packageName, 'kill', '-9', `${pid}`).toPromise()]);
  }

  getOSVersion() {
    return this.getAndroidProp('ro.build.version.release');
  }

  installPackage(packagePath) {
    // TODO(T17463635)
    if (!!(_nuclideUri || _load_nuclideUri()).default.isRemote(packagePath)) {
      throw new Error('Invariant violation: "!nuclideUri.isRemote(packagePath)"');
    }
    // The -d option allows downgrades, which happen frequently during development.


    return this.getAPIVersion().map(version => parseInt(version, 10) >= 17).catch(() => _rxjsBundlesRxMinJs.Observable.of(false)).switchMap(canUseDowngradeOption => this.runLongCommand(...['install', '-r', ...(canUseDowngradeOption ? ['-d'] : []), packagePath]));
  }

  uninstallPackage(packageName) {
    // TODO(T17463635)
    return this.runLongCommand('uninstall', packageName);
  }

  async getForwardSpec(pid) {
    const specLines = await this.runShortCommand('forward', '--list').toPromise();
    const specs = specLines.split(/\n/).map(line => {
      const cols = line.split(/\s+/);
      return {
        spec: cols[1],
        target: cols[2]
      };
    });
    const matchingSpec = specs.find(spec => spec.target === `jdwp:${pid}`);
    if (matchingSpec != null) {
      return matchingSpec.spec;
    }
    return null;
  }

  async forwardJdwpPortToPid(tcpPort, pid) {
    await this.runShortCommand('forward', `tcp:${tcpPort}`, `jdwp:${pid}`).toPromise();
    return this.getForwardSpec(pid);
  }

  async removeJdwpForwardSpec(spec) {
    let output;
    let result = '';
    if (spec != null) {
      output = this.runLongCommand('forward', '--remove', spec);
    } else {
      output = this.runLongCommand('forward', '--remove-all');
    }

    const subscription = output.subscribe(processMessage => {
      switch (processMessage.kind) {
        case 'stdout':
        case 'stderr':
          result += processMessage.data + '\n';
          break;
      }
    });
    await output.toPromise();
    subscription.unsubscribe();
    return result;
  }

  async launchActivity(packageName, activity, debug, action, parameters) {
    if (debug) {
      // Enable "wait for debugger" semantics for the next launch of
      // the specified package.
      await this.setDebugApp(packageName, false);
    }

    const args = ['shell', 'am', 'start'];
    if (action != null) {
      args.push('-a', action);
    }
    if (parameters != null) {
      for (const [key, parameter] of parameters) {
        args.push('-e', key, parameter);
      }
    }
    args.push('-W', '-n');
    args.push(`${packageName}/${activity}`);
    return this.runShortCommand(...args).toPromise();
  }

  async launchMainActivity(packageName, debug) {
    if (debug) {
      // Enable "wait for debugger" semantics for the next launch of
      // the specified package.
      await this.setDebugApp(packageName, false);
    }

    const args = ['shell', 'monkey', '-p', `${packageName}`, '-c', 'android.intent.category.LAUNCHER', '1'];
    return this.runShortCommand(...args).toPromise();
  }

  async launchService(packageName, serviceName, debug) {
    if (debug) {
      // Enable "wait for debugger" semantics for the next launch of
      // the specified package.
      await this.setDebugApp(packageName, false);
    }

    const args = ['shell', 'am', 'startservice', `${packageName}/${serviceName}`];
    return this.runShortCommand(...args).toPromise();
  }

  setDebugApp(packageName, persist) {
    const args = ['shell', 'am', 'set-debug-app', '-w'];

    if (persist) {
      args.push('--persistent');
    }
    args.push(`${packageName}`);
    return this.runShortCommand(...args).toPromise();
  }

  _dumpsysPackage() {
    return this.runShortCommand('shell', 'dumpsys', 'package');
  }

  activityExists(packageName, activity) {
    const packageActivityString = `${packageName}/${activity}`;
    return this._dumpsysPackage().map(stdout => stdout.includes(packageActivityString)).toPromise();
  }

  getAllAvailablePackages() {
    return this._dumpsysPackage().map(stdout => stdout.split('\n').map(line => line.trim())).toPromise();
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
      return this.runLongCommand('jdwp').map(output => {
        if (output.kind === 'stdout') {
          const block = output.data;
          block.split(/\s+/).forEach(pid => {
            const proc = allProcessesMap.get(pid);
            if (proc != null) {
              jdwpProcesses.add(proc);
            }
          });
        }
      });
    }).timeout(1000).catch(error => _rxjsBundlesRxMinJs.Observable.of([])).switchMap(() => {
      return Promise.resolve(Array.from(jdwpProcesses));
    });
  }

  async dumpsysPackage(pkg) {
    if (!(await this.isPackageInstalled(pkg))) {
      return null;
    }
    return this.runShortCommand('shell', 'dumpsys', 'package', pkg).toPromise();
  }

  getDeviceArgs() {
    const portArg = this._device.port != null ? ['-P', String(this._device.port)] : [];
    const deviceArg = this._device.name !== '' ? ['-s', this._device.name] : [];
    return deviceArg.concat(portArg);
  }

  getProcesses() {
    return this.runShortCommand('shell', 'ps').map(stdout => stdout.split(/\n/).map(line => {
      const info = line.trim().split(/\s+/);
      return { user: info[0], pid: info[1], name: info[info.length - 1] };
    }));
  }
}
exports.Adb = Adb; /**
                    * Copyright (c) 2017-present, Facebook, Inc.
                    * All rights reserved.
                    *
                    * This source code is licensed under the BSD-style license found in the
                    * LICENSE file in the root directory of this source tree. An additional grant
                    * of patent rights can be found in the PATENTS file in the same directory.
                    *
                    *  strict-local
                    * @format
                    */

Adb.configObs = (0, (_Store || _load_Store()).createConfigObs)('adb');