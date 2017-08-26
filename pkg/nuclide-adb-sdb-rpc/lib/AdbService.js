'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInstalledPackages = exports.removeFile = exports.touchFile = exports.dumpsysPackage = exports.activityExists = exports.launchMainActivity = exports.launchActivity = exports.removeJdwpForwardSpec = exports.forwardJdwpPortToPid = exports.getPidFromPackageName = exports.stopPackage = exports.registerCustomPath = exports.getFullConfig = exports.registerAdbPath = undefined;

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

let stopPackage = exports.stopPackage = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return new (_Adb || _load_Adb()).Adb(device).stopPackage(packageName);
  });

  return function stopPackage(_x4, _x5) {
    return _ref4.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return new (_Processes || _load_Processes()).Processes(new (_Adb || _load_Adb()).Adb(device)).getPidFromPackageName(packageName);
  });

  return function getPidFromPackageName(_x6, _x7) {
    return _ref5.apply(this, arguments);
  };
})();

let forwardJdwpPortToPid = exports.forwardJdwpPortToPid = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (device, tcpPort, pid) {
    return new (_Adb || _load_Adb()).Adb(device).forwardJdwpPortToPid(tcpPort, pid);
  });

  return function forwardJdwpPortToPid(_x8, _x9, _x10) {
    return _ref6.apply(this, arguments);
  };
})();

let removeJdwpForwardSpec = exports.removeJdwpForwardSpec = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (device, spec) {
    return new (_Adb || _load_Adb()).Adb(device).removeJdwpForwardSpec(spec);
  });

  return function removeJdwpForwardSpec(_x11, _x12) {
    return _ref7.apply(this, arguments);
  };
})();

let launchActivity = exports.launchActivity = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (device, packageName, activity, debug, action, parameters) {
    return new (_Adb || _load_Adb()).Adb(device).launchActivity(packageName, activity, debug, action, parameters);
  });

  return function launchActivity(_x13, _x14, _x15, _x16, _x17, _x18) {
    return _ref8.apply(this, arguments);
  };
})();

let launchMainActivity = exports.launchMainActivity = (() => {
  var _ref9 = (0, _asyncToGenerator.default)(function* (device, packageName, debug) {
    return new (_Adb || _load_Adb()).Adb(device).launchMainActivity(packageName, debug);
  });

  return function launchMainActivity(_x19, _x20, _x21) {
    return _ref9.apply(this, arguments);
  };
})();

let activityExists = exports.activityExists = (() => {
  var _ref10 = (0, _asyncToGenerator.default)(function* (device, packageName, activity) {
    return new (_Adb || _load_Adb()).Adb(device).activityExists(packageName, activity);
  });

  return function activityExists(_x22, _x23, _x24) {
    return _ref10.apply(this, arguments);
  };
})();

let dumpsysPackage = exports.dumpsysPackage = (() => {
  var _ref11 = (0, _asyncToGenerator.default)(function* (device, identifier) {
    return new (_Adb || _load_Adb()).Adb(device).dumpsysPackage(identifier);
  });

  return function dumpsysPackage(_x25, _x26) {
    return _ref11.apply(this, arguments);
  };
})();

let touchFile = exports.touchFile = (() => {
  var _ref12 = (0, _asyncToGenerator.default)(function* (device, path) {
    return new (_Adb || _load_Adb()).Adb(device).touchFile(path);
  });

  return function touchFile(_x27, _x28) {
    return _ref12.apply(this, arguments);
  };
})();

let removeFile = exports.removeFile = (() => {
  var _ref13 = (0, _asyncToGenerator.default)(function* (device, path) {
    return new (_Adb || _load_Adb()).Adb(device).removeFile(path);
  });

  return function removeFile(_x29, _x30) {
    return _ref13.apply(this, arguments);
  };
})();

let getInstalledPackages = exports.getInstalledPackages = (() => {
  var _ref14 = (0, _asyncToGenerator.default)(function* (device) {
    return new (_Adb || _load_Adb()).Adb(device).getInstalledPackages();
  });

  return function getInstalledPackages(_x31) {
    return _ref14.apply(this, arguments);
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
exports.getApkManifest = getApkManifest;

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

const ADB = 'adb'; /**
                    * Copyright (c) 2015-present, Facebook, Inc.
                    * All rights reserved.
                    *
                    * This source code is licensed under the license found in the LICENSE file in
                    * the root directory of this source tree.
                    *
                    * 
                    * @format
                    */

function getDeviceInfo(device) {
  return new (_Adb || _load_Adb()).Adb(device).getDeviceInfo().publish();
}

function getProcesses(device) {
  return new (_Processes || _load_Processes()).Processes(new (_Adb || _load_Adb()).Adb(device)).fetch().publish();
}

function getDeviceList() {
  return new (_Devices || _load_Devices()).Devices((_Adb || _load_Adb()).Adb).getDeviceList().publish();
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

function getApkManifest(apkPath) {
  return (0, (_process || _load_process()).runCommand)('aapt', ['dump', 'badging', apkPath]).toPromise();
}