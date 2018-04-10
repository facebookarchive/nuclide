'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.javaDebugWaitForJdwpProcessExit = exports.javaDebugWaitForJdwpProcessStart = exports.prepareForTerminalLaunch = exports.getJavaVSAdapterExecutableInfo = exports.getPortForJavaDebugger = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getPortForJavaDebugger = exports.getPortForJavaDebugger = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return (0, (_serverPort || _load_serverPort()).getAvailableServerPort)();
  });

  return function getPortForJavaDebugger() {
    return _ref.apply(this, arguments);
  };
})();

let getJavaVSAdapterExecutableInfo = exports.getJavaVSAdapterExecutableInfo = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* (debug) {
    return {
      command: JAVA,
      args: yield _getJavaArgs(debug)
    };
  });

  return function getJavaVSAdapterExecutableInfo(_x) {
    return _ref2.apply(this, arguments);
  };
})();

let prepareForTerminalLaunch = exports.prepareForTerminalLaunch = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (launchInfo) {
    const { classPath, commandLine } = launchInfo;
    const launchPath = (_nuclideUri || _load_nuclideUri()).default.expandHomeDir(classPath);
    const attachPort = yield (0, (_serverPort || _load_serverPort()).getAvailableServerPort)();

    // Note: the attach host is passed to the Java debugger engine, which
    // runs on the RPC side of Nuclide, so it is fine to always pass localhost
    // as the host name, even if the Nuclide client is on a different machine.
    const attachHost = '127.0.0.1';
    return Promise.resolve({
      attachPort,
      attachHost,
      launchCommand: 'java',
      launchCwd: launchPath,
      targetExecutable: launchPath,
      launchArgs: ['-Xdebug', `-Xrunjdwp:transport=dt_socket,address=${attachHost}:${attachPort},server=y,suspend=y`, '-classpath', launchPath, commandLine, ...(launchInfo.runArgs || [])]
    });
  });

  return function prepareForTerminalLaunch(_x2) {
    return _ref3.apply(this, arguments);
  };
})();

let javaDebugWaitForJdwpProcessStart = exports.javaDebugWaitForJdwpProcessStart = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (jvmSuspendArgs) {
    return new Promise(function (resolve) {
      const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      disposable.add(_rxjsBundlesRxMinJs.Observable.interval(1000).mergeMap((0, _asyncToGenerator.default)(function* () {
        const line = yield _findJdwpProcess(jvmSuspendArgs);
        if (line != null) {
          disposable.dispose();
          resolve();
        }
      })).timeout(30000).subscribe());
    });
  });

  return function javaDebugWaitForJdwpProcessStart(_x3) {
    return _ref4.apply(this, arguments);
  };
})();

let javaDebugWaitForJdwpProcessExit = exports.javaDebugWaitForJdwpProcessExit = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (jvmSuspendArgs) {
    return new Promise(function (resolve) {
      const disposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      let pidLine = null;
      disposable.add(_rxjsBundlesRxMinJs.Observable.interval(1000).mergeMap((0, _asyncToGenerator.default)(function* () {
        const line = yield _findJdwpProcess(jvmSuspendArgs);
        if (line != null) {
          if (pidLine != null && pidLine !== line) {
            // The matching target process line has changed, so the process
            // we were watching is now gone.
            disposable.dispose();
            resolve();
          }
          pidLine = line;
        } else {
          disposable.dispose();
          resolve();
        }
      })).subscribe());
    });
  });

  return function javaDebugWaitForJdwpProcessExit(_x4) {
    return _ref6.apply(this, arguments);
  };
})();

let _getJavaArgs = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (debug) {
    const baseJavaArgs = ['-classpath', yield _getClassPath(), 'com.facebook.nuclide.debugger.JavaDbg', '--vsp'];
    const debugArgs = debug ? ['-Xdebug', '-Xrunjdwp:transport=dt_socket,address=127.0.0.1:' + (yield (0, (_serverPort || _load_serverPort()).getAvailableServerPort)()).toString() + ',server=y,suspend=n'] : [];
    return debugArgs.concat(baseJavaArgs);
  });

  return function _getJavaArgs(_x5) {
    return _ref8.apply(this, arguments);
  };
})();

let _getClassPath = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* () {
    const serverJarPath = (_nuclideUri || _load_nuclideUri()).default.join(__dirname, '..', 'Build', 'java_debugger_server.jar');

    if (!(yield (_fsPromise || _load_fsPromise()).default.exists(serverJarPath))) {
      throw new Error(`Could not locate the java debugger server jar: ${serverJarPath}. ` + 'Please check your Nuclide installation.');
    }

    // Determining JDK lib path varies by platform.
    let toolsJarPath;
    switch (_os.default.platform()) {
      case 'win32':
        toolsJarPath = (process.env.JAVA_HOME || '') + '\\lib\\tools.jar';

        break;
      case 'linux':
        {
          // Find java
          const java = (yield (0, (_process || _load_process()).runCommand)('which', ['java']).toPromise()).trim();
          const javaHome = yield (_fsPromise || _load_fsPromise()).default.realpath(java);

          const matches = /(.*)\/java/.exec(javaHome);
          toolsJarPath = matches.length > 1 ? matches[1] + '/../lib/tools.jar' : '';
          break;
        }
      case 'darwin':
      default:
        {
          const javaHome = (yield (0, (_process || _load_process()).runCommand)('/usr/libexec/java_home').toPromise()).trim();
          toolsJarPath = javaHome + '/lib/tools.jar';

          break;
        }
    }
    if (!(yield (_fsPromise || _load_fsPromise()).default.exists(toolsJarPath))) {
      throw new Error(`Could not locate required JDK tools jar: ${toolsJarPath}. Is the JDK installed?`);
    }
    return (_nuclideUri || _load_nuclideUri()).default.joinPathList([serverJarPath, toolsJarPath]);
  });

  return function _getClassPath() {
    return _ref9.apply(this, arguments);
  };
})();

let _findJdwpProcess = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (jvmSuspendArgs) {
    const commands = yield (0, (_process || _load_process()).runCommand)('ps', ['-eww', '-o', 'pid,args'], {}).toPromise();

    const procs = commands.toString().split('\n').filter(function (line) {
      return line.includes(jvmSuspendArgs);
    });
    const line = procs.length === 1 ? procs[0] : null;
    return line;
  });

  return function _findJdwpProcess(_x6) {
    return _ref10.apply(this, arguments);
  };
})();

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _os = _interopRequireDefault(require('os'));

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _serverPort;

function _load_serverPort() {
  return _serverPort = require('../../commons-node/serverPort');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const JAVA = 'java'; /**
                      * Copyright (c) 2015-present, Facebook, Inc.
                      * All rights reserved.
                      *
                      * This source code is licensed under the license found in the LICENSE file in
                      * the root directory of this source tree.
                      *
                      * 
                      * @format
                      */