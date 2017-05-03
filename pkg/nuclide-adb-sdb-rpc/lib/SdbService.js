'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchApp = exports.getFileContentsAtPath = exports.getPidFromPackageName = exports.getDeviceList = exports.startServer = exports.getDeviceInfo = exports.registerSdbPath = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let registerSdbPath = exports.registerSdbPath = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (id, path, priority = -1) {
    (0, (_DebugBridgePathStore || _load_DebugBridgePathStore()).getStore)('sdb').registerPath(id, { path, priority });
  });

  return function registerSdbPath(_x, _x2) {
    return _ref.apply(this, arguments);
  };
})(); /**
       * Copyright (c) 2015-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the license found in the LICENSE file in
       * the root directory of this source tree.
       *
       * 
       * @format
       */

let getSdb = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    return new (_Sdb || _load_Sdb()).Sdb((yield (0, (_DebugBridgePathStore || _load_DebugBridgePathStore()).pathForDebugBridge)('sdb')));
  });

  return function getSdb() {
    return _ref2.apply(this, arguments);
  };
})();

let getDeviceInfo = exports.getDeviceInfo = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (name) {
    return (yield getSdb()).getCommonDeviceInfo(name);
  });

  return function getDeviceInfo(_x3) {
    return _ref3.apply(this, arguments);
  };
})();

let startServer = exports.startServer = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* () {
    return (yield getSdb()).startServer();
  });

  return function startServer() {
    return _ref4.apply(this, arguments);
  };
})();

let getDeviceList = exports.getDeviceList = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* () {
    return (yield getSdb()).getDeviceList();
  });

  return function getDeviceList() {
    return _ref5.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref6 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return (yield getSdb()).getPidFromPackageName(device, packageName);
  });

  return function getPidFromPackageName(_x4, _x5) {
    return _ref6.apply(this, arguments);
  };
})();

let getFileContentsAtPath = exports.getFileContentsAtPath = (() => {
  var _ref7 = (0, _asyncToGenerator.default)(function* (device, path) {
    return (yield getSdb()).getFileContentsAtPath(device, path);
  });

  return function getFileContentsAtPath(_x6, _x7) {
    return _ref7.apply(this, arguments);
  };
})();

let launchApp = exports.launchApp = (() => {
  var _ref8 = (0, _asyncToGenerator.default)(function* (device, identifier) {
    return (yield getSdb()).launchApp(device, identifier);
  });

  return function launchApp(_x8, _x9) {
    return _ref8.apply(this, arguments);
  };
})();

exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;

var _DebugBridgePathStore;

function _load_DebugBridgePathStore() {
  return _DebugBridgePathStore = require('./DebugBridgePathStore');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Sdb;

function _load_Sdb() {
  return _Sdb = require('./Sdb');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installPackage(device, packagePath) {
  // TODO(T17463635)
  return _rxjsBundlesRxMinJs.Observable.defer(() => getSdb()).switchMap(d => d.installPackage(device, packagePath)).publish();
}

function uninstallPackage(device, packageName) {
  // TODO(T17463635)
  return _rxjsBundlesRxMinJs.Observable.defer(() => getSdb()).switchMap(d => d.uninstallPackage(device, packageName)).publish();
}