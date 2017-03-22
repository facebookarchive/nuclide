'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDebuggerService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
    return (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
  });

  return function getDebuggerService() {
    return _ref.apply(this, arguments);
  };
})();

let debugBuckTarget = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (buckService, buckRoot, buildTarget, runArguments) {
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

    const debuggerService = yield getDebuggerService();
    yield debuggerService.startDebugging(info);
    return remoteOutputPath;
  });

  return function debugBuckTarget(_x, _x2, _x3, _x4) {
    return _ref2.apply(this, arguments);
  };
})();

let debugPidWithLLDB = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (pid, buckRoot) {
    const attachInfo = yield _getAttachProcessInfoFromPid(pid, buckRoot);

    if (!attachInfo) {
      throw new Error('Invariant violation: "attachInfo"');
    }

    const debuggerService = yield getDebuggerService();
    debuggerService.startDebugging(attachInfo);
  });

  return function debugPidWithLLDB(_x5, _x6) {
    return _ref3.apply(this, arguments);
  };
})();

let debugAndroidActivity = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (buckProjectPath, androidActivity) {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('JavaDebuggerService', buckProjectPath);
    if (service == null) {
      throw new Error('Java debugger service is not available.');
    }

    const debuggerService = yield getDebuggerService();
    try {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-java-debugger-start', {
        startType: 'buck-toolbar',
        target: buckProjectPath,
        targetType: 'android',
        targetClass: androidActivity
      });

      /* eslint-disable nuclide-internal/no-cross-atom-imports */
      // $FlowFB
      const procInfo = require('../../fb-debugger-java/lib/AdbProcessInfo');
      debuggerService.startDebugging(new procInfo.AdbProcessInfo(buckProjectPath, null, null, androidActivity));
      /* eslint-enable nuclide-internal/no-cross-atom-imports */
    } catch (e) {
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-java-debugger-unavailable', {
        error: e.toString()
      });
      throw new Error('Java debugger service is not available.');
    }
  });

  return function debugAndroidActivity(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
})();

let _getAttachProcessInfoFromPid = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (pid, buckProjectPath) {
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
  });

  return function _getAttachProcessInfoFromPid(_x9, _x10) {
    return _ref5.apply(this, arguments);
  };
})();

exports.getDeployBuildEvents = getDeployBuildEvents;
exports.getDeployInstallEvents = getDeployInstallEvents;
exports.getDeployTestEvents = getDeployTestEvents;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _observable;

function _load_observable() {
  return _observable = require('../../commons-node/observable');
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

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

const ANDROID_ACTIVITY_REGEX = /Starting activity (.*)\/(.*)\.\.\./;
const LLDB_TARGET_TYPE = 'LLDB';
const ANDROID_TARGET_TYPE = 'android';

function getDeployBuildEvents(processStream, buckService, buckRoot, buildTarget, runArguments) {
  return processStream.filter(message => message.kind === 'exit' && message.exitCode === 0).switchMap(() => {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(debugBuckTarget(buckService, buckRoot, buildTarget, runArguments)).map(path => ({
      type: 'log',
      message: `Launched debugger with ${path}`,
      level: 'info'
    })).catch(err => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Failed to launch debugger for ${buildTarget}`, err);
      return _rxjsBundlesRxMinJs.Observable.of({
        type: 'log',
        message: `Failed to launch debugger: ${err.message}`,
        level: 'error'
      });
    }).startWith({
      type: 'log',
      message: `Launching debugger for ${buildTarget}...`,
      level: 'log'
    }, {
      type: 'progress',
      progress: null
    });
  });
}

function getDeployInstallEvents(processStream, buckRoot) {
  let targetType = LLDB_TARGET_TYPE;
  return (0, (_observable || _load_observable()).compact)(processStream.map(message => {
    if (message.kind === 'stdout' || message.kind === 'stderr') {
      const activity = message.data.match(ANDROID_ACTIVITY_REGEX);
      if (activity != null) {
        targetType = ANDROID_TARGET_TYPE;
        return { targetType, targetApp: activity[1] };
      }

      const pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
      if (pidMatch != null) {
        return { targetType, targetApp: pidMatch[1] };
      }
    }
  })).take(1).switchMap(targetInfo => {
    return processStream.filter(message => message.kind === 'exit' && message.exitCode === 0).switchMap(() => {
      if (targetInfo.targetType === LLDB_TARGET_TYPE) {
        return _rxjsBundlesRxMinJs.Observable.fromPromise(debugPidWithLLDB(parseInt(targetInfo.targetApp, 10), buckRoot)).ignoreElements().startWith({
          type: 'log',
          message: `Attaching LLDB debugger to pid ${targetInfo.targetApp}...`,
          level: 'info'
        });
      } else if (targetInfo.targetType === ANDROID_TARGET_TYPE) {
        return _rxjsBundlesRxMinJs.Observable.fromPromise(debugAndroidActivity(buckRoot, targetInfo.targetApp)).ignoreElements().startWith({
          type: 'log',
          message: `Attaching Java debugger to pid ${targetInfo.targetApp}...`,
          level: 'info'
        });
      }

      return _rxjsBundlesRxMinJs.Observable.throw(new Error('Unexpected target type'));
    });
  });
}

function getDeployTestEvents(processStream, buckRoot) {
  return processStream.flatMap(message => {
    if (message.kind !== 'stderr') {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    const pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
    if (pidMatch == null) {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }
    return _rxjsBundlesRxMinJs.Observable.of(pidMatch[1]);
  }).switchMap(pid => {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(debugPidWithLLDB(parseInt(pid, 10), buckRoot)).ignoreElements().startWith({
      type: 'log',
      message: `Attaching LLDB debugger to pid ${pid}...`,
      level: 'info'
    });
  });
}