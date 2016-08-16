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
  return yield (0, (_commonsAtomConsumeFirstProvider2 || _commonsAtomConsumeFirstProvider()).default)('nuclide-debugger.remote');
});

var debugBuckTarget = _asyncToGenerator(function* (buckProject, buildTarget) {
  var output = yield buckProject.showOutput(buildTarget);
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
  var args = targetOutput.args;

  var buckRoot = yield buckProject.getPath();
  // LaunchProcessInfo's arguments should be local to the remote directory.
  var remoteBuckRoot = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.getPath(buckRoot);
  var remoteOutputPath = (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.getPath((_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.join(buckRoot, relativeOutputPath));

  var info = new (_nuclideDebuggerNativeLibLaunchProcessInfo2 || _nuclideDebuggerNativeLibLaunchProcessInfo()).LaunchProcessInfo(buckRoot, {
    executablePath: remoteOutputPath,
    // TODO(hansonw): Fix this when nuclide-debugger-native-rpc supports proper array args.
    // This will break for quoted arguments and the like.
    arguments: args == null ? '' : args.join(' '),
    // TODO(hansonw): Add this when nuclide-debugger-native supports environment vars.
    environmentVariables: [],
    workingDirectory: '', // use the default
    basepath: remoteBuckRoot
  });

  var debuggerService = yield getDebuggerService();
  yield debuggerService.startDebugging(info);
  return remoteOutputPath;
});

var debugPidWithLLDB = _asyncToGenerator(function* (pid, buckProject) {
  var debuggerService = yield getDebuggerService();
  var buckProjectPath = yield buckProject.getPath();
  debuggerService.debugLLDB(pid, buckProjectPath);
});

exports.getLLDBBuildEvents = getLLDBBuildEvents;
exports.getLLDBInstallEvents = getLLDBInstallEvents;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _rxjsBundlesRxUmdMinJs2;

function _rxjsBundlesRxUmdMinJs() {
  return _rxjsBundlesRxUmdMinJs2 = require('rxjs/bundles/Rx.umd.min.js');
}

var _commonsNodeStream2;

function _commonsNodeStream() {
  return _commonsNodeStream2 = require('../../commons-node/stream');
}

var _commonsAtomConsumeFirstProvider2;

function _commonsAtomConsumeFirstProvider() {
  return _commonsAtomConsumeFirstProvider2 = _interopRequireDefault(require('../../commons-atom/consumeFirstProvider'));
}

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports

var _nuclideDebuggerNativeLibLaunchProcessInfo2;

function _nuclideDebuggerNativeLibLaunchProcessInfo() {
  return _nuclideDebuggerNativeLibLaunchProcessInfo2 = require('../../nuclide-debugger-native/lib/LaunchProcessInfo');
}

var _nuclideLogging2;

function _nuclideLogging() {
  return _nuclideLogging2 = require('../../nuclide-logging');
}

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;

function getLLDBBuildEvents(processStream, buckProject, buildTarget) {
  return processStream.filter(function (message) {
    return message.kind === 'exit' && message.exitCode === 0;
  }).switchMap(function () {
    return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.fromPromise(debugBuckTarget(buckProject, buildTarget)).map(function (path) {
      return {
        type: 'log',
        message: 'Launched LLDB debugger with ' + path,
        level: 'info'
      };
    }).catch(function (err) {
      (0, (_nuclideLogging2 || _nuclideLogging()).getLogger)().error('Failed to launch LLDB debugger for ' + buildTarget, err);
      return (_rxjsBundlesRxUmdMinJs2 || _rxjsBundlesRxUmdMinJs()).Observable.of({
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

function getLLDBInstallEvents(processStream, buckProject) {
  return (0, (_commonsNodeStream2 || _commonsNodeStream()).compact)(processStream.map(function (message) {
    if (message.kind === 'stdout' || message.kind === 'stderr') {
      var pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
      if (pidMatch != null) {
        return parseInt(pidMatch[1], 10);
      }
    }
  })).take(1).switchMap(function (lldbPid) {
    return processStream.filter(function (message) {
      return message.kind === 'exit' && message.exitCode === 0;
    }).map(function () {
      debugPidWithLLDB(lldbPid, buckProject);
      return {
        type: 'log',
        message: 'Attaching LLDB debugger to pid ' + lldbPid + '...',
        level: 'info'
      };
    });
  });
}