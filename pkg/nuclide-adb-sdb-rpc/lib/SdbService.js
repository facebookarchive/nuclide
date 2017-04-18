'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.launchApp = exports.getManifestForPackageName = exports.getPidFromPackageName = exports.getDeviceList = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let getSdb = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* () {
    return new (_Sdb || _load_Sdb()).Sdb((yield (0, (_DebugBridge || _load_DebugBridge()).pathForDebugBridge)('sdb')));
  });

  return function getSdb() {
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
       */

let getDeviceList = exports.getDeviceList = (() => {
  var _ref2 = (0, _asyncToGenerator.default)(function* () {
    return (yield getSdb()).getDeviceList();
  });

  return function getDeviceList() {
    return _ref2.apply(this, arguments);
  };
})();

let getPidFromPackageName = exports.getPidFromPackageName = (() => {
  var _ref3 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return (yield getSdb()).getPidFromPackageName(device, packageName);
  });

  return function getPidFromPackageName(_x, _x2) {
    return _ref3.apply(this, arguments);
  };
})();

let getManifestForPackageName = exports.getManifestForPackageName = (() => {
  var _ref4 = (0, _asyncToGenerator.default)(function* (device, packageName) {
    return (yield getSdb()).getManifestForPackageName(device, packageName);
  });

  return function getManifestForPackageName(_x3, _x4) {
    return _ref4.apply(this, arguments);
  };
})();

let launchApp = exports.launchApp = (() => {
  var _ref5 = (0, _asyncToGenerator.default)(function* (device, identifier) {
    return (yield getSdb()).launchApp(device, identifier);
  });

  return function launchApp(_x5, _x6) {
    return _ref5.apply(this, arguments);
  };
})();

exports.installPackage = installPackage;
exports.uninstallPackage = uninstallPackage;

var _DebugBridge;

function _load_DebugBridge() {
  return _DebugBridge = require('./DebugBridge');
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _Sdb;

function _load_Sdb() {
  return _Sdb = require('./Sdb');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function installPackage(device, packagePath) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => getSdb()).switchMap(d => d.installPackage(device, packagePath)).publish();
}

function uninstallPackage(device, packageName) {
  return _rxjsBundlesRxMinJs.Observable.defer(() => getSdb()).switchMap(d => d.uninstallPackage(device, packageName)).publish();
}