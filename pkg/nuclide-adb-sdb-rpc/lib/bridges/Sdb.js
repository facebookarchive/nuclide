'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sdb = undefined;

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('../../../../modules/nuclide-adb/lib/common/DebugBridge');
}

var _Store;

function _load_Store() {
  return _Store = require('../../../../modules/nuclide-adb/lib/common/Store');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
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

class Sdb extends (_DebugBridge || _load_DebugBridge()).DebugBridge {

  async getFileContentsAtPath(path) {
    return this.runShortCommand('shell', 'cat', path).toPromise();
  }

  getDeviceInfo() {
    const unknownCB = () => _rxjsBundlesRxMinJs.Observable.of('');
    return _rxjsBundlesRxMinJs.Observable.forkJoin(this.getDeviceArchitecture().catch(unknownCB), this.getAPIVersion().catch(unknownCB), this.getDeviceModel().catch(unknownCB)).map(([architecture, apiVersion, model]) => {
      return new Map([['name', this._device.name], ['sdb_port', String(this._device.port)], ['architecture', architecture], ['api_version', apiVersion], ['model', model]]);
    });
  }

  getTizenModelConfigKey(key) {
    const modelConfigPath = '/etc/config/model-config.xml';

    return this.runShortCommand('shell', 'cat', modelConfigPath).map(stdout => stdout.split(/\n+/g).filter(s => s.indexOf(key) !== -1)[0]).map(s => {
      const regex = /.*<.*>(.*)<.*>/g;
      return regex.exec(s)[1];
    });
  }

  async stopProcess(packageName, pid) {
    await this.runShortCommand('shell', 'kill', '-9', `${pid}`).toPromise();
  }

  getDeviceArchitecture() {
    return this.runShortCommand('shell', 'uname', '-m').map(s => s.trim());
  }

  getDeviceModel() {
    return this.getTizenModelConfigKey('tizen.org/system/model_name');
  }

  getDebuggableProcesses() {
    return _rxjsBundlesRxMinJs.Observable.of([]);
  }

  getAPIVersion() {
    return this.getTizenModelConfigKey('tizen.org/feature/platform.core.api.version').catch(() => this.getTizenModelConfigKey('tizen.org/feature/platform.native.api.version'));
  }

  installPackage(packagePath) {
    // TODO(T17463635)
    if (!!(_nuclideUri || _load_nuclideUri()).default.isRemote(packagePath)) {
      throw new Error('Invariant violation: "!nuclideUri.isRemote(packagePath)"');
    }

    return this.runLongCommand('install', packagePath);
  }

  launchApp(identifier) {
    return this.runShortCommand('shell', 'launch_app', identifier).toPromise();
  }

  uninstallPackage(packageName) {
    // TODO(T17463635)
    return this.runLongCommand('uninstall', packageName);
  }

  getDeviceArgs() {
    return this._device.name !== '' ? ['-s', this._device.name] : [];
  }

  getProcesses() {
    return this.runShortCommand('shell', 'for file in /proc/[0-9]*/stat; do cat "$file" 2>/dev/null || true; done').map(stdout => stdout.split(/\n/).map(line => {
      const info = line.trim().split(/\s+/);
      return { user: 'n/a', pid: info[0], name: info[1] };
    }));
  }
}
exports.Sdb = Sdb;
Sdb.configObs = (0, (_Store || _load_Store()).createConfigObs)('sdb');