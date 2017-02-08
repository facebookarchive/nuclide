'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.deactivate = deactivate;
exports.consumePlatformService = consumePlatformService;

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideIosCommon;

function _load_nuclideIosCommon() {
  return _nuclideIosCommon = _interopRequireWildcard(require('../../nuclide-ios-common'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

let disposable = null; /**
                        * Copyright (c) 2015-present, Facebook, Inc.
                        * All rights reserved.
                        *
                        * This source code is licensed under the license found in the LICENSE file in
                        * the root directory of this source tree.
                        *
                        * 
                        */

function deactivate() {
  if (disposable != null) {
    disposable.dispose();
    disposable = null;
  }
}

function consumePlatformService(service) {
  disposable = service.register(provideIosDevices);
}

function provideIosDevices(buckRoot, ruleType, buildTarget) {
  if (ruleType !== 'apple_bundle') {
    return _rxjsBundlesRxMinJs.Observable.of(null);
  }
  return (_nuclideIosCommon || _load_nuclideIosCommon()).getDevices().map(devices => {
    if (!devices.length) {
      return null;
    }

    return {
      name: 'iOS Simulators',
      platforms: [{
        name: 'iOS Simulators',
        flavor: 'iphonesimulator-x86_64',
        devices: devices.map(device => ({
          name: `${device.name} (${device.os})`,
          udid: device.udid
        }))
      }]
    };
  });
}