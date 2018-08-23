"use strict";

function _createPackage() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/createPackage"));

  _createPackage = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _RxMin = require("rxjs/bundles/Rx.min.js");

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _expected() {
  const data = require("../../../modules/nuclide-commons/expected");

  _expected = function () {
    return data;
  };

  return data;
}

function _nuclideFbsimctl() {
  const data = require("../../nuclide-fbsimctl");

  _nuclideFbsimctl = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
class Activation {
  constructor() {
    this._disposables = new (_UniversalDisposable().default)();
    this._type = 'iOS';
  }

  consumeDevicePanelServiceApi(api) {
    this._disposables.add(this.registerDeviceList(api));
  }

  registerDeviceList(api) {
    return api.registerListProvider({
      observe: host => {
        if (_nuclideUri().default.isRemote(host)) {
          return _RxMin.Observable.of(_expected().Expect.error(new Error('iOS devices on remote hosts are not currently supported.')));
        } else {
          return (0, _nuclideFbsimctl().observeIosDevices)().map(expected => expected.map(devices => devices.map(device => ({
            identifier: device.udid,
            displayName: device.name,
            ignoresSelection: true
          }))));
        }
      },
      getType: () => this._type
    });
  }

}

(0, _createPackage().default)(module.exports, Activation);