'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getDebuggerService = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
    return yield (0, (_consumeFirstProvider || _load_consumeFirstProvider()).default)('nuclide-debugger.remote');
  });

  return function getDebuggerService() {
    return _ref.apply(this, arguments);
  };
})();

let debugBuckTarget = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (buckService, buckRoot, buildTarget, runArguments) {
    const output = yield buckService.showOutput(buckRoot, buildTarget);
    if (output.length === 0) {
      throw new Error(`Could not find build output path for target ${ buildTarget }`);
    }
    if (output.length > 1) {
      throw new Error(`Target ${ buildTarget } is ambiguous. Please specify a single test.`);
    }

    const targetOutput = output[0];
    const relativeOutputPath = targetOutput['buck.outputPath'];
    if (relativeOutputPath == null) {
      throw new Error(`Target ${ buildTarget } does not have executable build output.`);
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
      workingDirectory: '', // use the default
      basepath: remoteBuckRoot
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

let _getAttachProcessInfoFromPid = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (pid, buckProjectPath) {
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

  return function _getAttachProcessInfoFromPid(_x7, _x8) {
    return _ref4.apply(this, arguments);
  };
})();

exports.getLLDBBuildEvents = getLLDBBuildEvents;
exports.getLLDBInstallEvents = getLLDBInstallEvents;

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
const LLDB_PROCESS_ID_REGEX = /lldb -p ([0-9]+)/;
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
function getLLDBBuildEvents(processStream, buckService, buckRoot, buildTarget, runArguments) {
  return processStream.filter(message => message.kind === 'exit' && message.exitCode === 0).switchMap(() => {
    return _rxjsBundlesRxMinJs.Observable.fromPromise(debugBuckTarget(buckService, buckRoot, buildTarget, runArguments)).map(path => ({
      type: 'log',
      message: `Launched LLDB debugger with ${ path }`,
      level: 'info'
    })).catch(err => {
      (0, (_nuclideLogging || _load_nuclideLogging()).getLogger)().error(`Failed to launch LLDB debugger for ${ buildTarget }`, err);
      return _rxjsBundlesRxMinJs.Observable.of({
        type: 'log',
        message: `Failed to launch LLDB debugger: ${ err.message }`,
        level: 'error'
      });
    }).startWith({
      type: 'log',
      message: `Launching LLDB debugger for ${ buildTarget }...`,
      level: 'log'
    }, {
      type: 'progress',
      progress: null
    });
  });
}

function getLLDBInstallEvents(processStream, buckRoot) {
  return (0, (_observable || _load_observable()).compact)(processStream.map(message => {
    if (message.kind === 'stdout' || message.kind === 'stderr') {
      const pidMatch = message.data.match(LLDB_PROCESS_ID_REGEX);
      if (pidMatch != null) {
        return parseInt(pidMatch[1], 10);
      }
    }
  })).take(1).switchMap(lldbPid => {
    return processStream.filter(message => message.kind === 'exit' && message.exitCode === 0).switchMap(() => {
      return _rxjsBundlesRxMinJs.Observable.fromPromise(debugPidWithLLDB(lldbPid, buckRoot)).ignoreElements().startWith({
        type: 'log',
        message: `Attaching LLDB debugger to pid ${ lldbPid }...`,
        level: 'info'
      });
    });
  });
}