'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.deactivate = deactivate;
exports.consumePlatformService = consumePlatformService;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _atom = require('atom');

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideIosCommon;

function _load_nuclideIosCommon() {
  return _nuclideIosCommon = _interopRequireWildcard(require('../../nuclide-ios-common'));
}

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

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

  return _rxjsBundlesRxMinJs.Observable.fromPromise((_fsPromise || _load_fsPromise()).default.exists((_nuclideUri || _load_nuclideUri()).default.join(buckRoot, 'mode', 'oculus-mobile'))).switchMap(result => {
    if (result) {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    } else {
      return _rxjsBundlesRxMinJs.Observable.fromPromise((0, _asyncToGenerator.default)(function* () {
        const nativeDebuggerService = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.native-debugger-service');

        if (nativeDebuggerService != null) {
          return function (processStream) {
            return nativeDebuggerService.debugTargetFromBuckOutput(buckRoot, processStream);
          };
        } else {
          return null;
        }
      })()).startWith(null).switchMap(debuggerCallback => {
        return (_nuclideIosCommon || _load_nuclideIosCommon()).getFbsimctlSimulators().map(simulators => {
          if (!simulators.length) {
            return null;
          }

          return {
            name: 'iOS Simulators',
            platforms: [{
              isMobile: true,
              name: 'iOS Simulators',
              tasksForDevice: device => getTasks(buckRoot, ruleType, debuggerCallback != null),
              runTask: (builder, taskType, target, settings, device) => _runTask(builder, taskType, ruleType, target, settings, device, buckRoot, debuggerCallback),
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
      });
    }
  });
}

function getTasks(buckRoot, ruleType, debuggerAvailable) {
  const tasks = new Set(['build']);
  if (RUNNABLE_RULE_TYPES.has(ruleType)) {
    tasks.add('run');
  }
  if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(buckRoot)) {
    tasks.add('test');
    if (debuggerAvailable) {
      tasks.add('debug');
    }
  }
  return tasks;
}

function _runTask(builder, taskType, ruleType, buildTarget, settings, device, buckRoot, debuggerCallback) {
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
  const newTarget = Object.assign({}, buildTarget, {
    flavors: buildTarget.flavors.concat([flavor])
  });

  if ((_nuclideUri || _load_nuclideUri()).default.isRemote(buckRoot)) {
    let runRemoteTask;
    try {
      // $FlowFB
      const remoteWorkflow = require('./fb-RemoteWorkflow');
      runRemoteTask = () => {
        return remoteWorkflow.runRemoteTask(buckRoot, builder, taskType, ruleType, buildTarget, settings, udid, flavor);
      };
    } catch (_) {
      runRemoteTask = () => {
        throw new Error('Remote workflow currently unsupported for this target.');
      };
    }

    return runRemoteTask();
  } else {
    const subcommand = _getLocalSubcommand(taskType, ruleType);
    if (subcommand === 'install' || subcommand === 'test') {
      startLogger();
    }

    return builder.runSubcommand(buckRoot, subcommand, newTarget, settings, taskType === 'debug', udid, debuggerCallback);
  }
}

function _getLocalSubcommand(taskType, ruleType) {
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

function startLogger() {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-ios-simulator-logs:start');
}