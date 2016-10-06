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

exports.getArcanistServiceByNuclideUri = getArcanistServiceByNuclideUri;
exports.getBuckServiceByNuclideUri = getBuckServiceByNuclideUri;
exports.getClangServiceByNuclideUri = getClangServiceByNuclideUri;
exports.getCtagsServiceByNuclideUri = getCtagsServiceByNuclideUri;
exports.getFileSystemServiceByNuclideUri = getFileSystemServiceByNuclideUri;
exports.getFileWatcherServiceByNuclideUri = getFileWatcherServiceByNuclideUri;
exports.getFlowServiceByNuclideUri = getFlowServiceByNuclideUri;
exports.getFuzzyFileSearchServiceByNuclideUri = getFuzzyFileSearchServiceByNuclideUri;
exports.getGrepServiceByNuclideUri = getGrepServiceByNuclideUri;
exports.getHackServiceByNuclideUri = getHackServiceByNuclideUri;
exports.getHgServiceByNuclideUri = getHgServiceByNuclideUri;
exports.getInfoServiceByNuclideUri = getInfoServiceByNuclideUri;
exports.getMerlinServiceByNuclideUri = getMerlinServiceByNuclideUri;
exports.getNativeDebuggerServiceByNuclideUri = getNativeDebuggerServiceByNuclideUri;
exports.getNodeDebuggerServiceByNuclideUri = getNodeDebuggerServiceByNuclideUri;
exports.getOpenFilesServiceByNuclideUri = getOpenFilesServiceByNuclideUri;
exports.getPhpDebuggerServiceByNuclideUri = getPhpDebuggerServiceByNuclideUri;
exports.getPythonServiceByNuclideUri = getPythonServiceByNuclideUri;
exports.getRemoteCommandServiceByNuclideUri = getRemoteCommandServiceByNuclideUri;
exports.getSourceControlServiceByNuclideUri = getSourceControlServiceByNuclideUri;

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

var _ConnectionCache2;

function _ConnectionCache() {
  return _ConnectionCache2 = require('./ConnectionCache');
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
exports.ConnectionCache = (_ConnectionCache2 || _ConnectionCache()).ConnectionCache;
exports.SshHandshake = (_SshHandshake2 || _SshHandshake()).SshHandshake;
exports.NuclideTextBuffer = (_NuclideTextBuffer2 || _NuclideTextBuffer()).default;
exports.decorateSshConnectionDelegateWithTracking = (_SshHandshake2 || _SshHandshake()).decorateSshConnectionDelegateWithTracking;
exports.getService = (_serviceManager2 || _serviceManager()).getService;
exports.getServiceByConnection = (_serviceManager2 || _serviceManager()).getServiceByConnection;
exports.getServiceByNuclideUri = (_serviceManager2 || _serviceManager()).getServiceByNuclideUri;
exports.getlocalService = (_serviceManager2 || _serviceManager()).getlocalService;

function getArcanistServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('ArcanistService', uri));
}

function getBuckServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('BuckService', uri));
}

function getClangServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('ClangService', uri));
}

function getCtagsServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('CtagsService', uri));
}

function getFileSystemServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('FileSystemService', uri));
}

function getFileWatcherServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('FileWatcherService', uri));
}

function getFlowServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('FlowService', uri));
}

function getFuzzyFileSearchServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('FuzzyFileSearchService', uri));
}

function getGrepServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('GrepService', uri));
}

function getHackServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('HackService', uri));
}

function getHgServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('HgService', uri));
}

function getInfoServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('InfoService', uri));
}

function getMerlinServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('MerlinService', uri));
}

function getNativeDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('NativeDebuggerService', uri));
}

function getNodeDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('NodeDebuggerService', uri));
}

function getOpenFilesServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('OpenFilesService', uri));
}

function getPhpDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('PhpDebuggerService', uri));
}

function getPythonServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('PythonService', uri));
}

function getRemoteCommandServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('RemoteCommandService', uri));
}

function getSourceControlServiceByNuclideUri(uri) {
  return (0, (_nullthrows2 || _nullthrows()).default)((0, (_serviceManager2 || _serviceManager()).getServiceByNuclideUri)('SourceControlService', uri));
}