'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getTasks = getTasks;
exports.runTask = runTask;

var _types;

function _load_types() {
  return _types = require('./types');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getTasks(buckRoot, ruleType, device, debuggerAvailable) {
  // $FlowIgnore typecast
  const iosDeployable = device;
  const tasks = new Set(['build']);
  if (iosDeployable.buildOnly !== true) {
    if ((_types || _load_types()).RUNNABLE_RULE_TYPES.has(ruleType)) {
      tasks.add('run');
    }
    if (!(_nuclideUri || _load_nuclideUri()).default.isRemote(buckRoot)) {
      tasks.add('test');
      if (debuggerAvailable) {
        tasks.add('debug');
      }
    }
  }
  return tasks;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function runTask(builder, taskType, ruleType, buildTarget, settings, device, buckRoot, debuggerCallback) {
  // $FlowIgnore typecast
  const iosDeployable = device;
  const { arch, udid, type } = iosDeployable;
  const iosPlatform = type === 'simulator' ? 'iphonesimulator' : 'iphoneos';
  const flavor = `${iosPlatform}-${arch}`;
  const newTarget = Object.assign({}, buildTarget, {
    flavors: buildTarget.flavors.concat([flavor])
  });

  if ((_nuclideUri || _load_nuclideUri()).default.isRemote(buckRoot)) {
    let runRemoteTask;
    try {
      // $FlowFB
      const remoteWorkflow = require('./fb-RemoteWorkflow');
      runRemoteTask = () => {
        return remoteWorkflow.runRemoteTask(buckRoot, builder, taskType, ruleType, buildTarget, settings, iosDeployable, flavor);
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
      startLogger(iosDeployable);
    }

    const debug = taskType === 'debug';

    return builder.runSubcommand(buckRoot, subcommand, newTarget, settings, debug, udid, debug ? debuggerCallback : null);
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

function startLogger(iosDeployable) {
  return _rxjsBundlesRxMinJs.Observable.create(observer => {
    if (iosDeployable.type === 'simulator') {
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-ios-simulator-logs:start');
    }
    observer.complete();
  });
}