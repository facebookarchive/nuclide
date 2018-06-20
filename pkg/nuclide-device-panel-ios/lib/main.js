'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _expected;

function _load_expected() {
  return _expected = require('../../../modules/nuclide-commons/expected');
}

var _nuclideFbsimctl;

function _load_nuclideFbsimctl() {
  return _nuclideFbsimctl = require('../../nuclide-fbsimctl');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Activation {
  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._type = 'iOS';
  }

  consumeDevicePanelServiceApi(api) {
    this._disposables.add(this.registerDeviceList(api));
  }

  registerDeviceList(api) {
    return api.registerListProvider({
      observe: host => {
        if ((_nuclideUri || _load_nuclideUri()).default.isRemote(host)) {
          return _rxjsBundlesRxMinJs.Observable.of((_expected || _load_expected()).Expect.error(new Error('iOS devices on remote hosts are not currently supported.')));
        } else {
          return (0, (_nuclideFbsimctl || _load_nuclideFbsimctl()).getDevices)().map(devices => {
            if (devices instanceof Error) {
              return (_expected || _load_expected()).Expect.error(devices);
            } else {
              return (_expected || _load_expected()).Expect.value(devices.map(device => ({
                name: device.udid,
                displayName: device.name,
                architecture: devicePanelArchitecture(device.arch),
                rawArchitecture: device.arch,
                ignoresSelection: true
              })));
            }
          });
        }
      },
      getType: () => this._type
    });
  }
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   *  strict-local
   * @format
   */

function devicePanelArchitecture(arch) {
  switch (arch) {
    case 'x86_64':
      return 'x86_64';
    case 'i386':
      return 'x86';
    case 'arm64':
      return 'arm64';
    case 'armv7':
    case 'armv7s':
      return 'arm';
    default:
      return '';
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);