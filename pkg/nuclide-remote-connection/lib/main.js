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
exports.getArcanistServiceByNuclideUri = getArcanistServiceByNuclideUri;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nullthrows2;

function _nullthrows() {
  return _nullthrows2 = _interopRequireDefault(require('nullthrows'));
}

var _RemoteConnection2;

function _RemoteConnection() {
  return _RemoteConnection2 = require('./RemoteConnection');
}

var _RemoteDirectory2;

function _RemoteDirectory() {
  return _RemoteDirectory2 = require('./RemoteDirectory');
}

var _RemoteFile2;

function _RemoteFile() {
  return _RemoteFile2 = require('./RemoteFile');
}

var _ServerConnection2;

function _ServerConnection() {
  return _ServerConnection2 = require('./ServerConnection');
}

var _NuclideTextBuffer2;

function _NuclideTextBuffer() {
  return _NuclideTextBuffer2 = _interopRequireDefault(require('./NuclideTextBuffer'));
}

var _SshHandshake2;

function _SshHandshake() {
  return _SshHandshake2 = require('./SshHandshake');
}

var _serviceManager2;

function _serviceManager() {
  return _serviceManager2 = require('./service-manager');
}

exports.RemoteConnection = (_RemoteConnection2 || _RemoteConnection()).RemoteConnection;
exports.RemoteDirectory = (_RemoteDirectory2 || _RemoteDirectory()).RemoteDirectory;
exports.RemoteFile = (_RemoteFile2 || _RemoteFile()).RemoteFile;
exports.ServerConnection = (_ServerConnection2 || _ServerConnection()).ServerConnection;
exports.SshHandshake = (_SshHandshake2 || _SshHandshake()).SshHandshake;
exports.NuclideTextBuffer = (_NuclideTextBuffer2 || _NuclideTextBuffer()).default;
exports.decorateSshConnectionDelegateWithTracking = (_SshHandshake2 || _SshHandshake()).decorateSshConnectionDelegateWithTracking;
exports.getService = (_serviceManager2 || _serviceManager()).getService;
exports.getServiceByNuclideUri = (_serviceManager2 || _serviceManager()).getServiceByNuclideUri;

function getFileSystemServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('FileSystemService', uri));
}

function getArcanistServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('ArcanistService', uri));
}