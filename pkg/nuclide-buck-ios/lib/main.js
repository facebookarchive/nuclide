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

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

let disposable = null;

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
  return (_nuclideIosCommon || _load_nuclideIosCommon()).getFbsimctlSimulators().map(simulators => {
    if (!simulators.length) {
      return null;
    }

    return {
      name: 'iOS Simulators',
      platforms: [{
        name: 'iOS Simulators',
        tasks: new Set(['build', 'run', 'test', 'debug']),
        runTask,
        deviceGroups: [{
          name: 'iOS Simulators',
          devices: simulators.map(simulator => ({
            name: `${simulator.name} (${simulator.os})`,
            udid: simulator.udid,
            arch: simulator.arch
          }))
        }]
      }]
    };
  });
}

function runTask(builder, taskType, buildTarget, device) {
  let subcommand = taskType;

  if (!device) {
    throw new Error('Invariant violation: "device"');
  }

  if (!device.arch) {
    throw new Error('Invariant violation: "device.arch"');
  }

  if (!device.udid) {
    throw new Error('Invariant violation: "device.udid"');
  }

  const udid = device.udid;
  const arch = device.arch;

  if (!(typeof arch === 'string')) {
    throw new Error('Invariant violation: "typeof arch === \'string\'"');
  }

  if (!(typeof udid === 'string')) {
    throw new Error('Invariant violation: "typeof udid === \'string\'"');
  }

  const flavor = `iphonesimulator-${arch}`;
  const newTarget = Object.assign({}, buildTarget, { flavors: buildTarget.flavors.concat([flavor]) });

  if (subcommand === 'run' || subcommand === 'debug') {
    subcommand = 'install';
  }

  return builder.runSubcommand(subcommand, newTarget, {}, taskType === 'debug', udid);
}