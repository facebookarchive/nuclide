"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPortForJavaDebugger = getPortForJavaDebugger;
exports.getJavaVSAdapterExecutableInfo = getJavaVSAdapterExecutableInfo;
exports.getSdkVersionSourcePath = getSdkVersionSourcePath;

function _analytics() {
  const data = require("../nuclide-commons/analytics");

  _analytics = function () {
    return data;
  };

  return data;
}

function _fsPromise() {
  const data = _interopRequireDefault(require("../nuclide-commons/fsPromise"));

  _fsPromise = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _os = _interopRequireDefault(require("os"));

function _process() {
  const data = require("../nuclide-commons/process");

  _process = function () {
    return data;
  };

  return data;
}

function _serverPort() {
  const data = require("../nuclide-commons/serverPort");

  _serverPort = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
const JAVA = 'java';

async function getPortForJavaDebugger() {
  return (0, _serverPort().getAvailableServerPort)();
}

async function getJavaVSAdapterExecutableInfo(debug) {
  return {
    command: JAVA,
    args: await _getJavaArgs(debug)
  };
}

async function _getJavaArgs(debug) {
  const baseJavaArgs = ['-classpath', await _getClassPath(), 'com.facebook.nuclide.debugger.JavaDbg'];
  const debugArgs = debug ? ['-Xdebug', '-Xrunjdwp:transport=dt_socket,address=127.0.0.1:' + (await (0, _serverPort().getAvailableServerPort)()).toString() + ',server=y,suspend=n'] : [];
  return debugArgs.concat(baseJavaArgs);
}

async function _getClassPath() {
  const serverJarPath = _nuclideUri().default.join(__dirname, 'Build', 'java_debugger_server.jar');

  if (!(await _fsPromise().default.exists(serverJarPath))) {
    throw new Error(`Could not locate the java debugger server jar: ${serverJarPath}. ` + 'Please check your Nuclide installation.');
  } // Determining JDK lib path varies by platform.


  let toolsJarPath;

  switch (_os.default.platform()) {
    case 'win32':
      toolsJarPath = (process.env.JAVA_HOME || '') + '\\lib\\tools.jar';
      break;

    case 'linux':
      {
        // Find java
        const java = (await (0, _process().runCommand)('which', ['java']).toPromise()).trim();
        const javaHome = await _fsPromise().default.realpath(java); // $FlowFixMe (>= v0.75.0)

        const matches = /(.*)\/java/.exec(javaHome);
        toolsJarPath = matches.length > 1 ? matches[1] + '/../lib/tools.jar' : '';
        break;
      }

    case 'darwin':
    default:
      {
        const javaHome = (await (0, _process().runCommand)('/usr/libexec/java_home').toPromise()).trim();
        toolsJarPath = javaHome + '/lib/tools.jar';
        break;
      }
  }

  if (!(await _fsPromise().default.exists(toolsJarPath))) {
    // Tools.jar is not expected on Java 10+ and is not required.
    return serverJarPath;
  }

  return _nuclideUri().default.joinPathList([serverJarPath, toolsJarPath]);
}

async function getSdkVersionSourcePath(sdkVersion, options) {
  if (Number.isNaN(parseInt(sdkVersion, 10))) {
    return null;
  } // First try process.env.ANDROID_HOME
  // Then try /opt/android/sdk_DXXXXXXX which is the remote case.
  // Then try /opt/android_sdk which is the local case


  let androidHomeDir = process.env.ANDROID_HOME;
  let sourcesDirectory = await _getSdkVersionSourcePath(androidHomeDir, sdkVersion, {
    useSdkManager: options.useSdkManager
  });

  if (sourcesDirectory != null) {
    return sourcesDirectory;
  }

  androidHomeDir = null;
  const remoteAndroidHomeDirDir = '/opt/android/';

  if (await _fsPromise().default.exists(remoteAndroidHomeDirDir)) {
    const children = await _fsPromise().default.readdir(remoteAndroidHomeDirDir);
    const sdkDirs = children.filter(c => c.startsWith('sdk_D'));
    const sdkDirStats = await Promise.all(sdkDirs.map(d => _fsPromise().default.stat(_nuclideUri().default.join(remoteAndroidHomeDirDir, d))));
    const sdkDirTimes = sdkDirStats.map(s => s.mtime.getTime());
    const sortedSdkDirs = sdkDirs.map((d, i) => [d, sdkDirTimes[i]]).sort((a, b) => b[1] - a[1]);

    if (sortedSdkDirs.length > 0) {
      androidHomeDir = _nuclideUri().default.join(remoteAndroidHomeDirDir, sortedSdkDirs[0][0]);
    }
  }

  sourcesDirectory = await _getSdkVersionSourcePath(androidHomeDir, sdkVersion, {
    useSdkManager: false
  });

  if (sourcesDirectory != null) {
    return sourcesDirectory;
  }

  androidHomeDir = '/opt/android_sdk';
  sourcesDirectory = await _getSdkVersionSourcePath(androidHomeDir, sdkVersion, {
    useSdkManager: options.useSdkManager
  });

  if (sourcesDirectory != null) {
    return sourcesDirectory;
  }

  return null;
}

async function _getSdkVersionSourcePath(androidHomeDir, sdkVersion, options) {
  if (androidHomeDir != null && androidHomeDir !== '') {
    const sourcesDirectory = _nuclideUri().default.join(androidHomeDir, 'sources', 'android-' + sdkVersion);

    if (await _fsPromise().default.exists(sourcesDirectory)) {
      return sourcesDirectory;
    }

    const sdkManagerPath = _nuclideUri().default.join(androidHomeDir, 'tools/bin/sdkmanager');

    if (options.useSdkManager && (await _fsPromise().default.exists(sdkManagerPath))) {
      try {
        await (0, _process().runCommand)(sdkManagerPath, ['sources;android-' + sdkVersion]).timeout(30000).toPromise(); // try again

        const sourcesDirectoryExists = await _fsPromise().default.exists(sourcesDirectory);
        (0, _analytics().track)('atom-ide-debugger-java-installSdkSourcesUsingSdkManager', {
          sourcesDirectoryExists,
          sourcesDirectory,
          sdkManagerPath
        });

        if (sourcesDirectoryExists) {
          return sourcesDirectory;
        }
      } catch (err) {
        (0, _analytics().track)('atom-ide-debugger-java-installSdkSourcesUsingSdkManager-error', {
          sourcesDirectoryExists: false,
          sourcesDirectory,
          sdkManagerPath,
          errMessage: err.toString()
        });
      }
    }
  }

  return null;
}