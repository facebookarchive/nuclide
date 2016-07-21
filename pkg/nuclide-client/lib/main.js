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

exports.getFileSystemServiceByNuclideUri = getFileSystemServiceByNuclideUri;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

// TODO: Remove this once all services have been moved to framework v3.

var _nuclideRemoteConnection2;

function _nuclideRemoteConnection() {
  return _nuclideRemoteConnection2 = require('../../nuclide-remote-connection');
}

exports.getFileForPath = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getFileForPath;
exports.getService = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getService;
exports.getServiceLogger = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceLogger;
exports.getServiceByNuclideUri = (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri;

function getFileSystemServiceByNuclideUri(uri) {
  var service = (0, (_nuclideRemoteConnection2 || _nuclideRemoteConnection()).getServiceByNuclideUri)('FileSystemService', uri);
  (0, (_assert2 || _assert()).default)(service);
  return service;
}