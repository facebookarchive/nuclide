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

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

// TODO: Remove this once all services have been moved to framework v3.

var _nuclideRemoteConnection = require('../../nuclide-remote-connection');

exports.getFileForPath = _nuclideRemoteConnection.getFileForPath;
exports.getService = _nuclideRemoteConnection.getService;
exports.getServiceLogger = _nuclideRemoteConnection.getServiceLogger;
exports.getServiceByNuclideUri = _nuclideRemoteConnection.getServiceByNuclideUri;

function getFileSystemServiceByNuclideUri(uri) {
  var service = (0, _nuclideRemoteConnection.getServiceByNuclideUri)('FileSystemService', uri);
  (0, _assert2['default'])(service);
  return service;
}