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

const RUNNABLE_RULE_TYPES = new Set(['apple_bundle']);

const SUPPORTED_RULE_TYPES = new Set([...RUNNABLE_RULE_TYPES, 'apple_test']);

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
  if (!SUPPORTED_RULE_TYPES.has(ruleType)) {
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
        tasks: getTasks(ruleType),
        runTask: (builder, taskType, target, device) => _runTask(builder, taskType, ruleType, target, device),
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

function getTasks(ruleType) {
  const tasks = new Set(['build', 'test', 'debug']);
  if (RUNNABLE_RULE_TYPES.has(ruleType)) {
    tasks.add('run');
  }
  return tasks;
}

function _runTask(builder, taskType, ruleType, buildTarget, device) {
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

  const subcommand = _getSubcommand(taskType, ruleType);
  const flavor = `iphonesimulator-${arch}`;
  const newTarget = Object.assign({}, buildTarget, { flavors: buildTarget.flavors.concat([flavor]) });

  return builder.runSubcommand(subcommand, newTarget, {}, taskType === 'debug', udid);
}

function _getSubcommand(taskType, ruleType) {
  if (taskType !== 'run' && taskType !== 'debug') {
    return taskType;
  }
  switch (ruleType) {
    case 'apple_bundle':
      return 'install';
    case 'apple_test':
      return 'test';
    default:
      throw new Error('Unsupported rule type');
  }
}