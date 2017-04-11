'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Sdb = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('./DebugBridge');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Sdb extends (_DebugBridge || _load_DebugBridge()).DebugBridge {
  getTizenModelConfigKey(device, key) {
    const modelConfigPath = '/etc/config/model-config.xml';

    return this.runShortAdbCommand(device, ['shell', 'cat', modelConfigPath]).map(stdout => stdout.split(/\n+/g).filter(s => s.indexOf(key) !== -1)[0]).map(s => {
      const regex = /.*<.*>(.*)<.*>/g;
      return regex.exec(s)[1];
    }).toPromise();
  }

  getDeviceArchitecture(device) {
    return this.runShortAdbCommand(device, ['shell', 'uname', '-m']).map(s => s.trim()).toPromise();
  }

  getDeviceModel(device) {
    return this.getTizenModelConfigKey(device, 'tizen.org/system/model_name');
  }

  getAPIVersion(device) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      let version;
      try {
        version = yield _this.getTizenModelConfigKey(device, 'tizen.org/feature/platform.core.api.version');
      } catch (e) {
        version = yield _this.getTizenModelConfigKey(device, 'tizen.org/feature/platform.native.api.version');
      }
      return version;
    })();
  }

  installPackage(device, packagePath) {
    if (!!(_nuclideUri || _load_nuclideUri()).default.isRemote(packagePath)) {
      throw new Error('Invariant violation: "!nuclideUri.isRemote(packagePath)"');
    }

    return this.runLongAdbCommand(device, ['install', packagePath]);
  }
}
exports.Sdb = Sdb; /**
                    * Copyright (c) 2015-present, Facebook, Inc.
                    * All rights reserved.
                    *
                    * This source code is licensed under the license found in the LICENSE file in
                    * the root directory of this source tree.
                    *
                    * 
                    */