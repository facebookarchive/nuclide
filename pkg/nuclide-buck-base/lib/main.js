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

exports.isBuckFile = isBuckFile;
exports.getBuckService = getBuckService;

/**
 * Cached, service-aware version of BuckProject.getRootForPath.
 */

var getBuckProjectRoot = _asyncToGenerator(function* (filePath) {
  var directory = buckProjectDirectoryByPath.get(filePath);
  if (!directory) {
    var service = getBuckService(filePath);
    if (service == null) {
      return null;
    }
    directory = yield service.getRootForPath(filePath);
    if (directory == null) {
      return null;
    } else {
      buckProjectDirectoryByPath.set(filePath, directory);
    }
  }
  return directory;
});

exports.getBuckProjectRoot = getBuckProjectRoot;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsNodeNuclideUri2;

function _commonsNodeNuclideUri() {
  return _commonsNodeNuclideUri2 = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var buckProjectDirectoryByPath = new Map();

function isBuckFile(filePath) {
  // TODO(mbolin): Buck does have an option where the user can customize the
  // name of the build file: https://github.com/facebook/buck/issues/238.
  // This function will not work for those who use that option.
  return (_commonsNodeNuclideUri2 || _commonsNodeNuclideUri()).default.basename(filePath) === 'BUCK';
}

function getBuckService(filePath) {
  return (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('BuckService', filePath);
}