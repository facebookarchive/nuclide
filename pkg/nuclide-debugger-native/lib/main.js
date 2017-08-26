'use strict';

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

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

var _consumeFirstProvider;

function _load_consumeFirstProvider() {
  return _consumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

var _AttachProcessInfo;

function _load_AttachProcessInfo() {
  return _AttachProcessInfo = require('../../nuclide-debugger-native/lib/AttachProcessInfo');
}

var _LaunchProcessInfo;

function _load_LaunchProcessInfo() {
  return _LaunchProcessInfo = require('../../nuclide-debugger-native/lib/LaunchProcessInfo');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const SUPPORTED_RULE_TYPES = new Set(['cxx_binary', 'cxx_test']);
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
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

const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

class Activation {

  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    (_utils || _load_utils()).default.setLevel((0, (_utils2 || _load_utils2()).getConfig)().clientLogLevel);
    this.createNativeDebuggerService = this.createNativeDebuggerService.bind(this);
    this.provideLLDBPlatformGroup = this.provideLLDBPlatformGroup.bind(this);
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

  createNativeDebuggerService() {
    const callback = this._waitForBuckThenDebugNativeTarget.bind(this);
    return {
      debugTargetFromBuckOutput(buckRoot, processStream) {
        return callback(buckRoot, processStream);
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
          if (taskType === 'debug') {
            return this._runDebugTask(builder, taskType, target, settings, device, buckRoot, ruleType);
          } else {
            return builder.runSubcommand(buckRoot, subcommand, target, settings, false, null);
          }
        }
      }]
    });
  }

  _waitForBuckThenDebugNativeTarget(buckRoot, processStream) {
    return processStream.flatMap(message => {
      if (message.kind !== 'stderr') {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const regMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
      if (regMatch != null) {
        return _rxjsBundlesRxMinJs.Observable.of(regMatch[1]);
      }

      return _rxjsBundlesRxMinJs.Observable.empty();
    }).switchMap(attachArg => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(this._debugPidWithLLDB(parseInt(attachArg, 10), buckRoot)).ignoreElements().startWith({
        type: 'log',
        message: `Attaching LLDB debugger to pid ${attachArg}...`,
        level: 'info'
      });
    });
  }

  _runDebugTask(builder, taskType, buildTarget, settings, device, buckRoot, ruleType) {
    if (!(taskType === 'debug')) {
      throw new Error('Invariant violation: "taskType === \'debug\'"');
    }

    switch (ruleType) {
      case 'cxx_binary':
      case 'cxx_test':
        return builder.runSubcommand(buckRoot, 'build', buildTarget, settings, false, null, processStream => {
          const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(buckRoot);

          if (!(buckService != null)) {
            throw new Error('Invariant violation: "buckService != null"');
          }

          const { qualifiedName, flavors } = buildTarget;
          const separator = flavors.length > 0 ? '#' : '';
          const targetString = `${qualifiedName}${separator}${flavors.join(',')}`;
          const runArguments = settings.runArguments || [];
          const argString = runArguments.length === 0 ? '' : ` with arguments "${runArguments.join(' ')}"`;
          return _rxjsBundlesRxMinJs.Observable.concat(processStream.ignoreElements(), _rxjsBundlesRxMinJs.Observable.defer(() => this._debugBuckTarget(buckService, buckRoot, targetString, runArguments)).ignoreElements().map(path => ({
            type: 'log',
            message: `Launched debugger with ${path}`,
            level: 'info'
          })).catch(err => {
            (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error(`Failed to launch debugger for ${targetString}`, err);
            return _rxjsBundlesRxMinJs.Observable.of({
              type: 'log',
              message: `Failed to launch debugger: ${err.message}`,
              level: 'error'
            });
          }).startWith({
            type: 'log',
            message: `Launching debugger for ${targetString}${argString}...`,
            level: 'log'
          }, {
            type: 'progress',
            progress: null
          }));
        });
      default:
        if (!false) {
          throw new Error('Invariant violation: "false"');
        }

    }
  }

  _getDebuggerService() {
    return (0, _asyncToGenerator.default)(function* () {
      return (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
    })();
  }

  _debugPidWithLLDB(pid, buckRoot) {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const attachInfo = yield _this._getAttachProcessInfoFromPid(pid, buckRoot);

      if (!attachInfo) {
        throw new Error('Invariant violation: "attachInfo"');
      }

      const debuggerService = yield _this._getDebuggerService();
      debuggerService.startDebugging(attachInfo);
    })();
  }

  _getAttachProcessInfoFromPid(pid, buckProjectPath) {
    return (0, _asyncToGenerator.default)(function* () {
      const rpcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('NativeDebuggerService', buckProjectPath);

      if (!rpcService) {
        throw new Error('Invariant violation: "rpcService"');
      }

      const attachTargetList = yield rpcService.getAttachTargetInfoList(pid);
      if (attachTargetList.length === 0) {
        return null;
      }
      const attachTargetInfo = attachTargetList[0];
      attachTargetInfo.basepath = (_nuclideUri || _load_nuclideUri()).default.getPath(buckProjectPath);
      return new (_AttachProcessInfo || _load_AttachProcessInfo()).AttachProcessInfo(buckProjectPath, attachTargetInfo);
    })();
  }

  _debugBuckTarget(buckService, buckRoot, buildTarget, runArguments) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const output = yield buckService.showOutput(buckRoot, buildTarget);
      if (output.length === 0) {
        throw new Error(`Could not find build output path for target ${buildTarget}`);
      }
      if (output.length > 1) {
        throw new Error(`Target ${buildTarget} is ambiguous. Please specify a single test.`);
      }

      const targetOutput = output[0];
      const relativeOutputPath = targetOutput['buck.outputPath'];
      if (relativeOutputPath == null) {
        throw new Error(`Target ${buildTarget} does not have executable build output.`);
      }

      // LaunchProcessInfo's arguments should be local to the remote directory.
      const remoteBuckRoot = (_nuclideUri || _load_nuclideUri()).default.getPath(buckRoot);
      const remoteOutputPath = (_nuclideUri || _load_nuclideUri()).default.getPath((_nuclideUri || _load_nuclideUri()).default.join(buckRoot, relativeOutputPath));

      const env = [];
      if (targetOutput.env) {
        for (const key of Object.keys(targetOutput.env)) {
          // NOTE: no escaping is necessary here; LLDB passes these directly to the process.
          env.push(key + '=' + targetOutput.env[key]);
        }
      }

      const info = new (_LaunchProcessInfo || _load_LaunchProcessInfo()).LaunchProcessInfo(buckRoot, {
        executablePath: remoteOutputPath,
        // Allow overriding of a test's default arguments if provided.
        arguments: (runArguments.length ? runArguments : targetOutput.args) || [],
        environmentVariables: env,
        workingDirectory: remoteBuckRoot,
        basepath: remoteBuckRoot,
        lldbPythonPath: null
      });

      const debuggerService = yield _this2._getDebuggerService();
      yield debuggerService.startDebugging(info);
      return remoteOutputPath;
    })();
  }
}

(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);