'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getApkManifest = exports.getInstalledPackages = exports.removeFile = exports.touchFile = exports.dumpsysPackage = exports.activityExists = exports.launchService = exports.launchMainActivity = exports.launchActivity = exports.removeJdwpForwardSpec = exports.forwardJdwpPortToPid = exports.getPidFromPackageName = exports.stopProcess = exports.registerCustomPath = exports.getFullConfig = exports.registerAdbPath = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let registerAdbPath = exports.registerAdbPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (id, path, priority = -1) {
    (0, (_Store || _load_Store()).getStore)(ADB).registerPath(id, { path, priority });
  });

  return function registerAdbPath(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})();

let getFullConfig = exports.getFullConfig = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    return (0, (_Store || _load_Store()).getStore)(ADB).getFullConfig();
  });

  return function getFullConfig() {
    return _ref2.apply(this, arguments);
  };
})();

let registerCustomPath = exports.registerCustomPath = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (path) {
    (0, (_Store || _load_Store()).getStore)(ADB).registerCustomPath(path);
  });

  return function registerCustomPath(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let stopProcess = exports.stopProcess = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (device, packageName, pid) {
    return new (_Adb || _load_Adb()).Adb(device).stopProcess(packageName, pid);
  });

  return function stopProcess(_x4, _x5, _x6) {
    return _ref4.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return new (_Processes || _load_Processes()).Processes(new (_Adb || _load_Adb()).Adb(device)).getPidFromPackageName(packageName);
  });

  return function getPidFromPackageName(_x7, _x8) {
    return _ref5.apply(this, arguments);
  };
})();

let forwardJdwpPortToPid = exports.forwardJdwpPortToPid = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (device, tcpPort, pid) {
    return new (_Adb || _load_Adb()).Adb(device).forwardJdwpPortToPid(tcpPort, pid);
  });

  return function forwardJdwpPortToPid(_x9, _x10, _x11) {
    return _ref6.apply(this, arguments);
  };
})();

let removeJdwpForwardSpec = exports.removeJdwpForwardSpec = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (device, spec) {
    return new (_Adb || _load_Adb()).Adb(device).removeJdwpForwardSpec(spec);
  });

  return function removeJdwpForwardSpec(_x12, _x13) {
    return _ref7.apply(this, arguments);
  };
})();

let launchActivity = exports.launchActivity = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (device, packageName, activity, debug, action, parameters) {
    return new (_Adb || _load_Adb()).Adb(device).launchActivity(packageName, activity, debug, action, parameters);
  });

  return function launchActivity(_x14, _x15, _x16, _x17, _x18, _x19) {
    return _ref8.apply(this, arguments);
  };
})();

let launchMainActivity = exports.launchMainActivity = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (device, packageName, debug) {
    return new (_Adb || _load_Adb()).Adb(device).launchMainActivity(packageName, debug);
  });

  return function launchMainActivity(_x20, _x21, _x22) {
    return _ref9.apply(this, arguments);
  };
})();

let launchService = exports.launchService = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (device, packageName, serviceName, debug) {
    return new (_Adb || _load_Adb()).Adb(device).launchService(packageName, serviceName, debug);
  });

  return function launchService(_x23, _x24, _x25, _x26) {
    return _ref10.apply(this, arguments);
  };
})();

let activityExists = exports.activityExists = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (device, packageName, activity) {
    return new (_Adb || _load_Adb()).Adb(device).activityExists(packageName, activity);
  });

  return function activityExists(_x27, _x28, _x29) {
    return _ref11.apply(this, arguments);
  };
})();

let dumpsysPackage = exports.dumpsysPackage = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (device, identifier) {
    return new (_Adb || _load_Adb()).Adb(device).dumpsysPackage(identifier);
  });

  return function dumpsysPackage(_x30, _x31) {
    return _ref12.apply(this, arguments);
  };
})();

let touchFile = exports.touchFile = (() => {
  var _ref13 = (0, _asyncToGenerator.default)(function* (device, path) {
    return new (_Adb || _load_Adb()).Adb(device).touchFile(path);
  });

  return function touchFile(_x32, _x33) {
    return _ref13.apply(this, arguments);
  };
})();

let removeFile = exports.removeFile = (() => {
  var _ref14 = (0, _asyncToGenerator.default)(function* (device, path) {
    return new (_Adb || _load_Adb()).Adb(device).removeFile(path);
  });

  return function removeFile(_x34, _x35) {
    return _ref14.apply(this, arguments);
  };
})();

let getInstalledPackages = exports.getInstalledPackages = (() => {
  var _ref15 = (0, _asyncToGenerator.default)(function* (device) {
    return new (_Adb || _load_Adb()).Adb(device).getInstalledPackages();
  });

  return function getInstalledPackages(_x36) {
    return _ref15.apply(this, arguments);
  };
})();

let getAaptBinary = (() => {
  var _ref16 = (0, _asyncToGenerator.default)(function* (buildToolsVersion) {
    if (process.env.ANDROID_SDK == null || buildToolsVersion == null) {
      return 'aapt';
    } else {
      const allBuildToolsPath = (_nuclideUri || _load_nuclideUri()).default.join(process.env.ANDROID_SDK, 'build-tools');
      const exactBuildToolPath = (_nuclideUri || _load_nuclideUri()).default.join(allBuildToolsPath, buildToolsVersion);
      const aaptPath = (_nuclideUri || _load_nuclideUri()).default.join(exactBuildToolPath, 'aapt');
      if (yield (_fsPromise || _load_fsPromise()).default.exists(aaptPath)) {
        return aaptPath;
      } else {
        return 'aapt';
      }
    }
  });

  return function getAaptBinary(_x37) {
    return _ref16.apply(this, arguments);
  };
})();

let getApkManifest = exports.getApkManifest = (() => {
  var _ref17 = (0, _asyncToGenerator.default)(function* (apkPath, buildToolsVersion) {
    const aaptBinary = yield getAaptBinary(buildToolsVersion);
    return (0, (_process || _load_process()).runCommand)(aaptBinary, ['dump', 'badging', apkPath]).toPromise();
  });

  return function getApkManifest(_x38, _x39) {
    return _ref17.apply(this, arguments);
  };
})();

exports.getDeviceInfo = getDeviceInfo;
exports.getProcesses = getProcesses;
exports.getDeviceList = getDeviceList;
exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;
exports.getJavaProcesses = getJavaProcesses;
exports.addAdbPort = addAdbPort;
exports.removeAdbPort = removeAdbPort;
exports.getAdbPorts = getAdbPorts;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('nuclide-commons/fsPromise'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

var _Store;

function _load_Store() {
  return _Store = require('./common/Store');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Adb;

function _load_Adb() {
  return _Adb = require('./bridges/Adb');
}

var _Processes;

function _load_Processes() {
  return _Processes = require('./common/Processes');
}

var _Devices;

function _load_Devices() {
  return _Devices = require('./common/Devices');
}

var _process;

function _load_process() {
  return _process = require('nuclide-commons/process');
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

const ADB = 'adb';

function getDeviceInfo(device) {
  return new (_Adb || _load_Adb()).Adb(device).getDeviceInfo().publish();
}

function getProcesses(device, timeout) {
  return new (_Processes || _load_Processes()).Processes(new (_Adb || _load_Adb()).Adb(device)).fetch(timeout).publish();
}

function getDeviceList(options) {
  return new (_Devices || _load_Devices()).Devices((_Adb || _load_Adb()).Adb).getDeviceList(options).publish();
}

function installPackage(device, packagePath) {
  // TODO(T17463635)
  return new (_Adb || _load_Adb()).Adb(device).installPackage(packagePath).publish();
}

function uninstallPackage(device, packageName) {
  // TODO(T17463635)
  return new (_Adb || _load_Adb()).Adb(device).uninstallPackage(packageName).publish();
}

function getJavaProcesses(device) {
  return new (_Adb || _load_Adb()).Adb(device).getJavaProcesses().publish();
}

function addAdbPort(port) {
  (0, (_Store || _load_Store()).getStore)('adb').addPort(port);
}

function removeAdbPort(port) {
  (0, (_Store || _load_Store()).getStore)('adb').removePort(port);
}

function getAdbPorts() {
  return Promise.resolve((0, (_Store || _load_Store()).getStore)('adb').getPorts());
}