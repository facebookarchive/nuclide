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

let debugJavaTest = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (attachPort, buckRoot) {
    const javaDebuggerProvider = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-java-debugger');

    if (javaDebuggerProvider == null) {
      throw new Error('Could not debug java_test: the Java debugger is not available.');
    }

    // Buck is going to invoke the test twice - once with --dry-run to determine
    // what tests are being run, and once to actually run the test. We need to
    // attach the debugger and resume the first instance, and then wait for the
    // second instance and re-attach.

    const debuggerService = yield getDebuggerService();

    if (!(debuggerService != null)) {
      throw new Error('Invariant violation: "debuggerService != null"');
    }

    debuggerService.startDebugging(javaDebuggerProvider.createJavaTestAttachInfo(buckRoot, attachPort));
  });

  return function debugJavaTest(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
})();

let debugAndroidActivity = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (buckProjectPath, androidPackage, deviceName) {
    const service = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('JavaDebuggerService', buckProjectPath);
    if (service == null) {
      throw new Error('Java debugger service is not available.');
    }

    const debuggerService = yield getDebuggerService();
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('fb-java-debugger-start', {
      startType: 'buck-toolbar',
      target: buckProjectPath,
      targetType: 'android',
      targetClass: androidPackage
    });

    const javaDebugger = yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-java-debugger');

    if (javaDebugger != null) {
      const debugInfo = javaDebugger.createAndroidDebugInfo({
        targetUri: buckProjectPath,
        packageName: androidPackage,
        device: deviceName
      });
      debuggerService.startDebugging(debugInfo);
    }
  });

  return function debugAndroidActivity(_x9, _x10, _x11) {
    return _ref5.apply(this, arguments);
  };
})();

let _getAttachProcessInfoFromPid = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (pid, buckProjectPath) {
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

  return function _getAttachProcessInfoFromPid(_x12, _x13) {
    return _ref6.apply(this, arguments);
  };
})();

let _getBuckTargetType = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (buckService, buckRoot, buildTarget) {
    const output = yield buckService.showOutput(buckRoot, buildTarget);
    if (output.length === 1) {
      return output[0]['buck.type'] || '';
    }

    return '';
  });

  return function _getBuckTargetType(_x14, _x15, _x16) {
    return _ref7.apply(this, arguments);
  };
})();

exports.getDeployBuildEvents = getDeployBuildEvents;
exports.getDeployInstallEvents = getDeployInstallEvents;
exports.getDeployTestEvents = getDeployTestEvents;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
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

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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
 * @format
 */

const JDWP_PROCESS_PORT_REGEX = /.*Connect a JDWP debugger to port ([0-9]+).*/;
const ANDROID_ACTIVITY_REGEX = /Starting activity (.*)\/(.*)\.\.\./;
const ANDROID_DEVICE_REGEX = /Installing apk on ([^ ]+).*/;
const LLDB_TARGET_TYPE = 'LLDB';
const ANDROID_TARGET_TYPE = 'android';

function getDeployBuildEvents(processStream, // TODO(T17463635)
buckService, buckRoot, buildTarget, runArguments) {
  const argString = runArguments.length === 0 ? '' : ` with arguments "${runArguments.join(' ')}"`;
  return processStream.filter(message => message.kind === 'exit' && message.exitCode === 0).switchMap(() => {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(debugBuckTarget(buckService, buckRoot, buildTarget, runArguments)).map(path => ({
      type: 'log',
      message: `Launched debugger with ${path}`,
      level: 'info'
    })).catch(err => {
      (0, (_log4js || _load_log4js()).getLogger)('nuclide-buck').error(`Failed to launch debugger for ${buildTarget}`, err);
      return _rxjsBundlesRxMinJs.Observable.of({
        type: 'log',
        message: `Failed to launch debugger: ${err.message}`,
        level: 'error'
      });
    }).startWith({
      type: 'log',
      message: `Launching debugger for ${buildTarget}${argString}...`,
      level: 'log'
    }, {
      type: 'progress',
      progress: null
    });
  });
}

function getDeployInstallEvents(processStream, // TODO(T17463635)
buckRoot) {
  let targetType = LLDB_TARGET_TYPE;
  let deviceName = null;
  return (0, (_observable || _load_observable()).compact)(processStream.map(message => {
    if (message.kind === 'stdout' || message.kind === 'stderr') {
      const deviceMatch = message.data.match(ANDROID_DEVICE_REGEX);
      if (deviceMatch != null && deviceMatch.length > 0) {
        deviceName = deviceMatch[1];
      }

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
        return _rxjsBundlesRxMinJs.Observable.fromPromise(debugAndroidActivity(buckRoot, targetInfo.targetApp, deviceName)).ignoreElements().startWith({
          type: 'log',
          message: `Attaching Java debugger to pid ${targetInfo.targetApp}...`,
          level: 'info'
        });
      }

      return _rxjsBundlesRxMinJs.Observable.throw(new Error('Unexpected target type'));
    });
  });
}

function getDeployTestEvents(processStream, // TODO(T17463635)
buckService, buckRoot, buildTarget) {
  return _rxjsBundlesRxMinJs.Observable.fromPromise(_getBuckTargetType(buckService, buckRoot, buildTarget)).map(targetType => {
    switch (targetType) {
      case 'java_test':
        return JDWP_PROCESS_PORT_REGEX;
      default:
        return LLDB_PROCESS_ID_REGEX;
    }
  }).combineLatest(processStream).flatMap(([attachArgRegex, message]) => {
    if (message.kind !== 'stderr') {
      return _rxjsBundlesRxMinJs.Observable.empty();
    }

    const regMatch = message.data.match(attachArgRegex);
    if (regMatch != null) {
      return _rxjsBundlesRxMinJs.Observable.of([attachArgRegex, regMatch[1]]);
    }

    return _rxjsBundlesRxMinJs.Observable.empty();
  }).switchMap(([regex, attachArg]) => {
    let debugMsg;
    let debugObservable;
    switch (regex) {
      case JDWP_PROCESS_PORT_REGEX:
        debugMsg = `Attaching Java debugger to port ${attachArg}...`;
        debugObservable = _rxjsBundlesRxMinJs.Observable.fromPromise(debugJavaTest(parseInt(attachArg, 10), buckRoot));
        break;
      default:
        debugMsg = `Attaching LLDB debugger to pid ${attachArg}...`;
        debugObservable = _rxjsBundlesRxMinJs.Observable.fromPromise(debugPidWithLLDB(parseInt(attachArg, 10), buckRoot));
        break;
    }

    return debugObservable.ignoreElements().startWith({
      type: 'log',
      message: debugMsg,
      level: 'info'
    });
  });
}