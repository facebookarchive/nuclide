'use strict';

var _createPackage;

function _load_createPackage() {
  return _createPackage = _interopRequireDefault(require('nuclide-commons-atom/createPackage'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _utils;

function _load_utils() {
  return _utils = _interopRequireDefault(require('./utils'));
}

var _utils2;

function _load_utils2() {
  return _utils2 = require('./utils');
}

var _LLDBLaunchAttachProvider;

function _load_LLDBLaunchAttachProvider() {
  return _LLDBLaunchAttachProvider = require('./LLDBLaunchAttachProvider');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SUPPORTED_RULE_TYPES = new Set(['cxx_binary', 'cxx_test']); /**
                                                                   * Copyright (c) 2015-present, Facebook, Inc.
                                                                   * All rights reserved.
                                                                   *
                                                                   * This source code is licensed under the license found in the LICENSE file in
                                                                   * the root directory of this source tree.
                                                                   *
                                                                   * 
                                                                   * @format
                                                                   */

class Activation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    (_utils || _load_utils()).default.setLevel((0, (_utils2 || _load_utils2()).getConfig)().clientLogLevel);
  }

  dispose() {
    this._disposables.dispose();
  }

  createDebuggerProvider() {
    return {
      name: 'lldb',
      getLaunchAttachProvider(connection) {
        return new (_LLDBLaunchAttachProvider || _load_LLDBLaunchAttachProvider()).LLDBLaunchAttachProvider('Native', connection);
      }
    };
  }

  consumePlatformService(service) {
    this._disposables.add(service.register(this.provideLLDBPlatformGroup));
  }

  provideLLDBPlatformGroup(buckRoot, ruleType, buildTarget) {
    if (!SUPPORTED_RULE_TYPES.has(ruleType)) {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    }

    const availableActions = new Set(['build', 'run', 'test', 'debug']);
    return _rxjsBundlesRxMinJs.Observable.of({
      name: 'Native',
      platforms: [{
        isMobile: false,
        name: 'LLDB',
        tasksForBuildRuleType: buildRuleType => {
          return availableActions;
        },
        runTask: (builder, taskType, target, settings, device) => {
          const subcommand = taskType === 'debug' ? 'build' : taskType;
          return builder.runSubcommand(buckRoot, subcommand, target, settings, taskType === 'debug', null);
        }
      }]
    });
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);