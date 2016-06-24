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

/**
 * Cached, service-aware version of BuckProject.getRootForPath.
 */

var getBuckProjectRoot = _asyncToGenerator(function* (filePath) {
  var directory = buckProjectDirectoryByPath.get(filePath);
  if (!directory) {
    var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('BuckProject', filePath);
    (0, (_assert2 || _assert()).default)(service != null);
    directory = yield service.BuckProject.getRootForPath(filePath);
    if (directory == null) {
      return null;
    } else {
      buckProjectDirectoryByPath.set(filePath, directory);
    }
  }
  return directory;
}

/**
 * Given a file path, returns the BuckProject for its project root (if it exists).
 */
);

exports.getBuckProjectRoot = getBuckProjectRoot;

var getBuckProject = _asyncToGenerator(function* (filePath) {
  var rootPath = yield getBuckProjectRoot(filePath);
  if (rootPath == null) {
    return null;
  }

  var buckProject = buckProjectForBuckProjectDirectory.get(rootPath);
  if (buckProject != null) {
    return buckProject;
  }

  var buckService = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('BuckProject', filePath);
  if (buckService) {
    buckProject = new buckService.BuckProject({ rootPath: rootPath });
    buckProjectForBuckProjectDirectory.set(rootPath, buckProject);
  }
  return buckProject;
});

exports.getBuckProject = getBuckProject;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

var _BuckProject = require('./BuckProject');

Object.defineProperty(exports, 'BuckProject', {
  enumerable: true,
  get: function get() {
    return _BuckProject.BuckProject;
  }
});

var buckProjectDirectoryByPath = new Map();
var buckProjectForBuckProjectDirectory = new Map();

function isBuckFile(filePath) {
  // TODO(mbolin): Buck does have an option where the user can customize the
  // name of the build file: https://github.com/facebook/buck/issues/238.
  // This function will not work for those who use that option.
  return (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.basename(filePath) === 'BUCK';
}