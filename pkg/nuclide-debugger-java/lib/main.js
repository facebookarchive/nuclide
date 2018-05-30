'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createJavaDebuggerProvider = createJavaDebuggerProvider;
exports.createJavaAdditionalLogFilesProvider = createJavaAdditionalLogFilesProvider;
exports.consumeDevicePanelServiceApi = consumeDevicePanelServiceApi;

var _AndroidJavaDebuggerHelpers;

function _load_AndroidJavaDebuggerHelpers() {
  return _AndroidJavaDebuggerHelpers = require('../../../modules/atom-ide-debugger-java-android/AndroidJavaDebuggerHelpers');
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('../../../modules/nuclide-commons/UniversalDisposable'));
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('../../../modules/nuclide-debugger-common');
}

var _os = _interopRequireDefault(require('os'));

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _JavaDebuggerDevicePanelProvider;

function _load_JavaDebuggerDevicePanelProvider() {
  return _JavaDebuggerDevicePanelProvider = require('./JavaDebuggerDevicePanelProvider');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function createJavaDebuggerProvider() {
  return {
    createAndroidDebugLaunchConfig: async parameters => {
      const { targetUri, packageName, device } = parameters;

      const adbServiceUri = parameters.adbServiceUri != null ? parameters.adbServiceUri : parameters.targetUri;

      const debuggerConfig = {
        deviceAndPackage: {
          device,
          selectedPackage: packageName
        },
        adbServiceUri
      };
      const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      const processConfig = {
        targetUri,
        debugMode: 'launch',
        adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.JAVA_ANDROID,
        adapterExecutable: null,
        config: debuggerConfig,
        capabilities: { threads: true },
        properties: {
          customControlButtons: [],
          threadsComponentTitle: 'Threads'
        },
        customDisposable: subscriptions
      };
      return {
        config: processConfig,
        subscriptions
      };
    },
    createAndroidDebugAttachConfig: async parameters => {
      const { targetUri, packageName, pid, device } = parameters;
      const adbServiceUri = parameters.adbServiceUri != null ? parameters.adbServiceUri : parameters.targetUri;
      const config = {
        deviceAndProcess: {
          device,
          selectedProcess: {
            pid,
            name: packageName
          }
        },
        adbServiceUri
      };
      return {
        targetUri,
        debugMode: 'attach',
        adapterType: (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).VsAdapterTypes.JAVA_ANDROID,
        adapterExecutable: null,
        config,
        capabilities: { threads: true },
        properties: {
          customControlButtons: [],
          threadsComponentTitle: 'Threads'
        },
        customDisposable: new (_UniversalDisposable || _load_UniversalDisposable()).default()
      };
    },
    createJavaTestAttachInfo: async (targetUri, attachPort) => {
      const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      const clickEvents = new _rxjsBundlesRxMinJs.Subject();
      const processInfo = await (0, (_AndroidJavaDebuggerHelpers || _load_AndroidJavaDebuggerHelpers()).createJavaVspProcessInfo)(targetUri, {
        debugMode: 'attach',
        machineName: (_nuclideUri || _load_nuclideUri()).default.isRemote(targetUri) ? (_nuclideUri || _load_nuclideUri()).default.getHostname(targetUri) : 'localhost',
        port: attachPort
      }, clickEvents);
      subscriptions.add(clickEvents);
      processInfo.addCustomDisposable(subscriptions);
      return {
        subscriptions,
        processInfo
      };
    },
    createJavaLaunchInfo: async (targetUri, mainClass, classPath, runArgs) => {
      const subscriptions = new (_UniversalDisposable || _load_UniversalDisposable()).default();
      const clickEvents = new _rxjsBundlesRxMinJs.Subject();
      const processInfo = await (0, (_AndroidJavaDebuggerHelpers || _load_AndroidJavaDebuggerHelpers()).createJavaVspProcessInfo)(targetUri, {
        debugMode: 'launch',
        entryPointClass: mainClass,
        classPath,
        runArgs
      }, clickEvents);
      subscriptions.add(clickEvents);
      processInfo.addCustomDisposable(subscriptions);
      return {
        subscriptions,
        processInfo
      };
    }
  };
}

async function getAdditionalLogFilesOnLocalServer(deadline) {
  // The DebuggerLogger.java file is hard-coded to write logs to certain
  // filepaths (<tmp>/nuclide-<user>-logs/JavaDebuggerServer.log). We have to
  // make sure this function reads from the exact same name.

  // TODO(ljw): It looks like the Java code is writing to JavaDebuggerServer.log
  // but the Nuclide code was reading from .log.0? I don't understand why, so
  try {
    const results = [];
    const files = ['JavaDebuggerServer.log.0', 'JavaDebuggerServer.log'];
    await Promise.all(files.map(async file => {
      const filepath = (_nuclideUri || _load_nuclideUri()).default.join(_os.default.tmpdir(), `nuclide-${_os.default.userInfo().username}-logs`, file);
      let data = null;
      try {
        const stat = await (_fsPromise || _load_fsPromise()).default.stat(filepath);
        if (stat.size > 10 * 1024 * 1024) {
          data = 'file too big!'; // TODO(ljw): at least get the first 10Mb of it
        } else {
          data = await (_fsPromise || _load_fsPromise()).default.readFile(filepath, 'utf8');
        }
      } catch (e) {
        if (!e.message.includes('ENOENT')) {
          data = e.toString();
        }
      }
      if (data != null) {
        results.push({ title: filepath + '.txt', data });
      }
    }));
    return results;
  } catch (e) {
    return [];
  }
}

function createJavaAdditionalLogFilesProvider() {
  return {
    id: 'java-debugger',
    getAdditionalLogFiles: getAdditionalLogFilesOnLocalServer
  };
}

function consumeDevicePanelServiceApi(api) {
  api.registerProcessTaskProvider(new (_JavaDebuggerDevicePanelProvider || _load_JavaDebuggerDevicePanelProvider()).JavaDebuggerDevicePanelProvider(createJavaDebuggerProvider()));
}