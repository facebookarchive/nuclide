'use strict';var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));var _debugger;














function _load_debugger() {return _debugger = require('../../../modules/nuclide-commons-atom/debugger');}var _createPackage;











function _load_createPackage() {return _createPackage = _interopRequireDefault(require('../../../modules/nuclide-commons-atom/createPackage'));}
var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');var _BuckTaskRunner;

function _load_BuckTaskRunner() {return _BuckTaskRunner = require('../../nuclide-buck/lib/BuckTaskRunner');}var _utils;



function _load_utils() {return _utils = _interopRequireDefault(require('./utils'));}var _utils2;function _load_utils2() {return _utils2 = require('./utils');}var _UniversalDisposable;

function _load_UniversalDisposable() {return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));}var _utils3;


function _load_utils3() {return _utils3 = require('../../nuclide-debugger-vsp/lib/utils');}var _nuclideDebuggerCommon;



function _load_nuclideDebuggerCommon() {return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');}var _nuclideUri;
function _load_nuclideUri() {return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));}var _nuclideRemoteConnection;
function _load_nuclideRemoteConnection() {return _nuclideRemoteConnection = require('../../nuclide-remote-connection');}var _log4js;

function _load_log4js() {return _log4js = require('log4js');}var _passesGK;
function _load_passesGK() {return _passesGK = _interopRequireDefault(require('../../commons-node/passesGK'));}function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };} /**
                                                                                                                                                                                                             * Copyright (c) 2015-present, Facebook, Inc.
                                                                                                                                                                                                             * All rights reserved.
                                                                                                                                                                                                             *
                                                                                                                                                                                                             * This source code is licensed under the license found in the LICENSE file in
                                                                                                                                                                                                             * the root directory of this source tree.
                                                                                                                                                                                                             *
                                                                                                                                                                                                             * 
                                                                                                                                                                                                             * @format
                                                                                                                                                                                                             */const SUPPORTED_RULE_TYPES = new Set(['cxx_binary', 'cxx_test']); // eslint-disable-next-line nuclide-internal/no-cross-atom-imports
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;
class Activation {


  constructor() {
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    (_utils || _load_utils()).default.setLevel((0, (_utils2 || _load_utils2()).getConfig)().clientLogLevel);
    this.createNativeDebuggerService = this.createNativeDebuggerService.bind(
    this);

    this.provideLLDBPlatformGroup = this.provideLLDBPlatformGroup.bind(
    this);

  }

  dispose() {
    this._disposables.dispose();
  }

  createNativeDebuggerService() {
    const callback = this._waitForBuckThenDebugNativeTarget.bind(this);
    return {
      debugTargetFromBuckOutput(
      buckRoot,
      processStream)
      {
        return callback(buckRoot, processStream);
      } };

  }

  consumePlatformService(service) {
    this._disposables.add(service.register(this.provideLLDBPlatformGroup));
  }

  provideLLDBPlatformGroup(
  buckRoot,
  ruleType,
  buildTarget)
  {
    const underlyingRuleType = this._getUnderlyingRuleType(
    ruleType,
    buildTarget);

    if (!SUPPORTED_RULE_TYPES.has(underlyingRuleType)) {
      return _rxjsBundlesRxMinJs.Observable.of(null);
    }

    const availableActions = new Set(['build', 'run', 'test', 'debug']);
    return _rxjsBundlesRxMinJs.Observable.of({
      name: 'Native',
      platforms: [
      {
        isMobile: false,
        name: 'LLDB',
        tasksForBuildRuleType: buildRuleType => {
          return availableActions;
        },
        runTask: (builder, taskType, target, settings, device) => {
          const subcommand = taskType === 'debug' ? 'build' : taskType;
          if ((0, (_BuckTaskRunner || _load_BuckTaskRunner()).isDebugTask)(taskType)) {
            return this._runDebugTask(
            builder,
            taskType,
            target,
            settings,
            device,
            buckRoot,
            underlyingRuleType);

          } else {
            return builder.runSubcommand(
            buckRoot,
            (0, (_BuckTaskRunner || _load_BuckTaskRunner()).getBuckSubcommandForTaskType)(subcommand),
            target,
            settings,
            false,
            null);

          }
        } }] });



  }

  _getUnderlyingRuleType(ruleType, buildTarget) {
    if (ruleType === 'apple_binary' && buildTarget.endsWith('AppleMac')) {
      return 'cxx_binary';
    } else {
      return ruleType;
    }
  }

  _waitForBuckThenDebugNativeTarget(
  buckRoot,
  processStream)
  {
    return processStream.
    flatMap(message => {
      if (message.kind !== 'stderr') {
        return _rxjsBundlesRxMinJs.Observable.empty();
      }

      const regMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
      if (regMatch != null) {
        return _rxjsBundlesRxMinJs.Observable.of(regMatch[1]);
      }

      return _rxjsBundlesRxMinJs.Observable.empty();
    }).
    switchMap(attachArg => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(
      this._debugPidWithLLDB(parseInt(attachArg, 10), buckRoot)).

      ignoreElements().
      startWith({
        type: 'log',
        message: `Attaching LLDB debugger to pid ${attachArg}...`,
        level: 'info' });

    });
  }

  _runDebugTask(
  builder,
  taskType,
  buildTarget,
  taskSettings,
  device,
  buckRoot,
  ruleType)
  {if (!(
    taskType === 'debug')) {throw new Error('Invariant violation: "taskType === \'debug\'"');}

    return this._addModeDbgIfNoModeInBuildArguments(
    buckRoot,
    taskSettings).
    switchMap(settings => {
      switch (ruleType) {
        case 'cxx_binary':
        case 'cxx_test':
          return builder.runSubcommand(
          buckRoot,
          'build',
          buildTarget,
          settings,
          false,
          null,
          processStream => {
            const buckService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getBuckServiceByNuclideUri)(buckRoot);if (!(
            buckService != null)) {throw new Error('Invariant violation: "buckService != null"');}

            const { qualifiedName, flavors } = buildTarget;
            const separator = flavors.length > 0 ? '#' : '';
            const targetString = `${qualifiedName}${separator}${flavors.join(
            ',')
            }`;
            const runArguments = settings.runArguments || [];
            const argString =
            runArguments.length === 0 ?
            '' :
            ` with arguments "${runArguments.join(' ')}"`;
            return _rxjsBundlesRxMinJs.Observable.concat(
            processStream.ignoreElements(),
            _rxjsBundlesRxMinJs.Observable.defer(() =>
            this._debugBuckTarget(
            buckService,
            buckRoot,
            targetString,
            runArguments)).


            ignoreElements().
            map(path => ({
              type: 'log',
              message: `Launched debugger with ${path}`,
              level: 'info' })).

            catch(err => {
              (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error(
              `Failed to launch debugger for ${targetString}`,
              err);

              return _rxjsBundlesRxMinJs.Observable.of({
                type: 'log',
                message: `Failed to launch debugger: ${err.message}`,
                level: 'error' });

            }).
            startWith(
            {
              type: 'log',
              message: `Launching debugger for ${targetString}${argString}...`,
              level: 'log' },

            {
              type: 'progress',
              progress: null }));



          });

        default:if (!
          false) {throw new Error('Invariant violation: "false"');}}

    });
  }

  _debugPidWithLLDB(pid, buckRoot) {return (0, _asyncToGenerator.default)(function* () {
      const attachInfo = yield (0, (_utils3 || _load_utils3()).getNativeVSPAttachProcessInfo)(
      (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_LLDB,
      buckRoot,
      {
        pid,
        sourcePath: (_nuclideUri || _load_nuclideUri()).default.getPath(buckRoot) });


      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      debuggerService.startDebugging(attachInfo);})();
  }

  _debugBuckTarget(
  buckService,
  buckRoot,
  buildTarget,
  runArguments)
  {return (0, _asyncToGenerator.default)(function* () {
      const output = yield buckService.showOutput(buckRoot, buildTarget);
      if (output.length === 0) {
        throw new Error(
        `Could not find build output path for target ${buildTarget}`);

      }
      if (output.length > 1) {
        throw new Error(
        `Target ${buildTarget} is ambiguous. Please specify a single test.`);

      }

      const targetOutput = output[0];
      const relativeOutputPath = targetOutput['buck.outputPath'];
      if (relativeOutputPath == null) {
        throw new Error(
        `Target ${buildTarget} does not have executable build output.`);

      }

      // LaunchProcessInfo's arguments should be local to the remote directory.
      const remoteBuckRoot = (_nuclideUri || _load_nuclideUri()).default.getPath(buckRoot);
      const remoteOutputPath = (_nuclideUri || _load_nuclideUri()).default.getPath(
      (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, relativeOutputPath));


      const env = [];
      if (targetOutput.env) {
        for (const key of Object.keys(targetOutput.env)) {
          // NOTE: no escaping is necessary here; LLDB passes these directly to the process.
          env.push(key + '=' + targetOutput.env[key]);
        }
      }

      let adapter = (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_LLDB;

      if (yield (0, (_passesGK || _load_passesGK()).default)('nuclide_buck_uses_gdb')) {
        adapter = (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.NATIVE_GDB;
      }

      const info = yield (0, (_utils3 || _load_utils3()).getNativeVSPLaunchProcessInfo)(
      adapter,
      (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, relativeOutputPath),
      {
        args: (runArguments.length ? runArguments : targetOutput.args) || [],
        cwd: remoteBuckRoot,
        env,
        sourcePath: remoteBuckRoot,
        debuggerRoot: remoteBuckRoot });


      const debuggerService = yield (0, (_debugger || _load_debugger()).getDebuggerService)();
      yield debuggerService.startDebugging(info);
      return remoteOutputPath;})();
  }

  _addModeDbgIfNoModeInBuildArguments(
  buckRoot,
  settings)
  {
    const buildArguments =
    settings.buildArguments != null ? settings.buildArguments : [];
    if (buildArguments.some(arg => arg.includes('@mode'))) {
      return _rxjsBundlesRxMinJs.Observable.of(settings);
    }

    const fileSystemService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getFileSystemServiceByNuclideUri)(buckRoot);
    return _rxjsBundlesRxMinJs.Observable.defer((0, _asyncToGenerator.default)(function* () {
      const modeDbgFile = (_nuclideUri || _load_nuclideUri()).default.join(buckRoot, 'mode', 'dbg');
      if (yield fileSystemService.exists(modeDbgFile)) {
        buildArguments.push('@mode/dbg');
        return {
          buildArguments,
          runArguments: settings.runArguments };

      } else {
        return settings;
      }
    }));
  }}


(0, (_createPackage || _load_createPackage()).default)(module.exports, Activation);