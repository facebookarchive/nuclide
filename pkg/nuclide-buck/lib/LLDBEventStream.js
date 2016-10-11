Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var getDebuggerService = _asyncToGenerator(function* () {
  atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
  return yield (0, (_commonsAtomConsumeFirstProvider || _load_commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
});

var debugBuckTarget = _asyncToGenerator(function* (buckService, buckRoot, buildTarget, runArguments) {
  var output = yield buckService.showOutput(buckRoot, buildTarget);
  if (output.length === 0) {
    throw new Error('Could not find build output path for target ' + buildTarget);
  }
  if (output.length > 1) {
    throw new Error('Target ' + buildTarget + ' is ambiguous. Please specify a single test.');
  }

  var targetOutput = output[0];
  var relativeOutputPath = targetOutput['buck.outputPath'];
  if (relativeOutputPath == null) {
    throw new Error('Target ' + buildTarget + ' does not have executable build output.');
  }

  // LaunchProcessInfo's arguments should be local to the remote directory.
  var remoteBuckRoot = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(buckRoot);
  var remoteOutputPath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath((_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.join(buckRoot, relativeOutputPath));

  var env = [];
  if (targetOutput.env) {
    for (var key of Object.keys(targetOutput.env)) {
      // NOTE: no escaping is necessary here; LLDB passes these directly to the process.
      env.push(key + '=' + targetOutput.env[key]);
    }
  }

  var info = new (_nuclideDebuggerNativeLibLaunchProcessInfo || _load_nuclideDebuggerNativeLibLaunchProcessInfo()).LaunchProcessInfo(buckRoot, {
    executablePath: remoteOutputPath,
    // Allow overriding of a test's default arguments if provided.
    arguments: (runArguments.length ? runArguments : targetOutput.args) || [],
    environmentVariables: env,
    workingDirectory: '', // use the default
    basepath: remoteBuckRoot
  });

  var debuggerService = yield getDebuggerService();
  yield debuggerService.startDebugging(info);
  return remoteOutputPath;
});

var debugPidWithLLDB = _asyncToGenerator(function* (pid, buckRoot) {
  var attachInfo = yield _getAttachProcessInfoFromPid(pid, buckRoot);
  (0, (_assert || _load_assert()).default)(attachInfo);
  var debuggerService = yield getDebuggerService();
  debuggerService.startDebugging(attachInfo);
});

var _getAttachProcessInfoFromPid = _asyncToGenerator(function* (pid, buckProjectPath) {
  var rpcService = (0, (_nuclideRemoteConnection || _load_nuclideRemoteConnection()).getServiceByNuclideUri)('NativeDebuggerService', buckProjectPath);
  (0, (_assert || _load_assert()).default)(rpcService);
  var attachTargetList = yield rpcService.getAttachTargetInfoList(pid);
  if (attachTargetList.length === 0) {
    return null;
  }
  var attachTargetInfo = attachTargetList[0];
  attachTargetInfo.basepath = (_commonsNodeNuclideUri || _load_commonsNodeNuclideUri()).default.getPath(buckProjectPath);
  return new (_nuclideDebuggerNativeLibAttachProcessInfo || _load_nuclideDebuggerNativeLibAttachProcessInfo()).AttachProcessInfo(buckProjectPath, attachTargetInfo);
});

exports.getLLDBBuildEvents = getLLDBBuildEvents;
exports.getLLDBInstallEvents = getLLDBInstallEvents;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert;

function _load_assert() {
  return _assert = _interopRequireDefault(require('assert'));
}

var _rxjsBundlesRxMinJs;

function _load_rxjsBundlesRxMinJs() {
  return _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');
}

var _commonsNodeObservable;

function _load_commonsNodeObservable() {
  return _commonsNodeObservable = require('../../commons-node/observable');
}

var _commonsAtomConsumeFirstProvider;

function _load_commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerNativeLibAttachProcessInfo;

function _load_nuclideDebuggerNativeLibAttachProcessInfo() {
  return _nuclideDebuggerNativeLibAttachProcessInfo = require('../../nuclide-debugger-native/lib/AttachProcessInfo');
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerNativeLibLaunchProcessInfo;

function _load_nuclideDebuggerNativeLibLaunchProcessInfo() {
  return _nuclideDebuggerNativeLibLaunchProcessInfo = require('../../nuclide-debugger-native/lib/LaunchProcessInfo');
}

var _nuclideLogging;

function _load_nuclideLogging() {
  return _nuclideLogging = require('../../nuclide-logging');
}

var _commonsNodeNuclideUri;

function _load_commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection;

function _load_nuclideRemoteConnection() {
  return _nuclideRemoteConnection = require('../../nuclide-remote-connection');
}

var LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

function getLLDBBuildEvents(processStream, buckService, buckRoot, buildTarget, runArguments) {
  return processStream.filter(function (message) {
    return message.kind === 'exit' && message.exitCode === 0;
  }).switchMap(function () {
    return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(debugBuckTarget(buckService, buckRoot, buildTarget, runArguments)).map(function (path) {
      return {
        type: 'log',
        message: 'Launched LLDB debugger with ' + path,
        level: 'info'
      };
    }).catch(function (err) {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error('Failed to launch LLDB debugger for ' + buildTarget, err);
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.of({
        type: 'log',
        message: 'Failed to launch LLDB debugger: ' + err.message,
        level: 'error'
      });
    }).startWith({
      type: 'log',
      message: 'Launching LLDB debugger for ' + buildTarget + '...',
      level: 'log'
    }, {
      type: 'progress',
      progress: null
    });
  });
}

function getLLDBInstallEvents(processStream, buckRoot) {
  return (0, (_commonsNodeObservable || _load_commonsNodeObservable()).compact)(processStream.map(function (message) {
    if (message.kind === 'stdout' || message.kind === 'stderr') {
      var pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
      if (pidMatch != null) {
        return parseInt(pidMatch[1], 10);
      }
    }
  })).take(1).switchMap(function (lldbPid) {
    return processStream.filter(function (message) {
      return message.kind === 'exit' && message.exitCode === 0;
    }).switchMap(function () {
      return (_rxjsBundlesRxMinJs || _load_rxjsBundlesRxMinJs()).Observable.fromPromise(debugPidWithLLDB(lldbPid, buckRoot)).ignoreElements().startWith({
        type: 'log',
        message: 'Attaching LLDB debugger to pid ' + lldbPid + '...',
        level: 'info'
      });
    });
  });
}