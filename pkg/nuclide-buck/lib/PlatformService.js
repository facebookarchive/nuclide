'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.platformsForRuleType = platformsForRuleType;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideIosCommon;

function _load_nuclideIosCommon() {
  return _nuclideIosCommon = _interopRequireWildcard(require('../../nuclide-ios-common'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function platformsForRuleType(ruleType) {
  // TODO: Fetch platforms from registered providers
  if (ruleType !== 'apple_bundle') {
    return _rxjsBundlesRxMinJs.Observable.of(null);
  }
  const iosDevices = (_nuclideIosCommon || _load_nuclideIosCommon()).getDevices().map(devices => ({
    name: 'iOS Simulators',
    devices: devices.map(device => ({
      name: device.name,
      udid: device.udid,
      flavor: 'iphonesimulator-x86_64'
    }))
  }));
  const allPlatforms = iosDevices.map(platform => [platform]);

  return allPlatforms.map(platforms => platforms.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase())));
}