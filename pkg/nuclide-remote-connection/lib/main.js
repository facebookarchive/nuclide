'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RemoteDirectoryPlaceholder = exports.loadBufferForUri = exports.existingBufferForUri = exports.bufferForUri = exports.getlocalService = exports.getServiceByNuclideUri = exports.getServiceByConnection = exports.getService = exports.decorateSshConnectionDelegateWithTracking = exports.SshHandshake = exports.ConnectionCache = exports.ServerConnection = exports.RemoteFile = exports.RemoteDirectory = exports.RemoteConnection = undefined;

var _remoteTextBuffer;

function _load_remoteTextBuffer() {
  return _remoteTextBuffer = require('./remote-text-buffer');
}

Object.defineProperty(exports, 'bufferForUri', {
  enumerable: true,
  get: function () {
    return (_remoteTextBuffer || _load_remoteTextBuffer()).bufferForUri;
  }
});
Object.defineProperty(exports, 'existingBufferForUri', {
  enumerable: true,
  get: function () {
    return (_remoteTextBuffer || _load_remoteTextBuffer()).existingBufferForUri;
  }
});
Object.defineProperty(exports, 'loadBufferForUri', {
  enumerable: true,
  get: function () {
    return (_remoteTextBuffer || _load_remoteTextBuffer()).loadBufferForUri;
  }
});

var _RemoteDirectoryPlaceholder;

function _load_RemoteDirectoryPlaceholder() {
  return _RemoteDirectoryPlaceholder = require('./RemoteDirectoryPlaceholder');
}

Object.defineProperty(exports, 'RemoteDirectoryPlaceholder', {
  enumerable: true,
  get: function () {
    return _interopRequireDefault(_RemoteDirectoryPlaceholder || _load_RemoteDirectoryPlaceholder()).default;
  }
});
exports.getAdbServiceByNuclideUri = getAdbServiceByNuclideUri;
exports.getBuckServiceByNuclideUri = getBuckServiceByNuclideUri;
exports.getClangServiceByNuclideUri = getClangServiceByNuclideUri;
exports.getCodeSearchServiceByNuclideUri = getCodeSearchServiceByNuclideUri;
exports.getCtagsServiceByNuclideUri = getCtagsServiceByNuclideUri;
exports.getDefinitionPreviewServiceByNuclideUri = getDefinitionPreviewServiceByNuclideUri;
exports.getFileSystemServiceByNuclideUri = getFileSystemServiceByNuclideUri;
exports.getFileWatcherServiceByNuclideUri = getFileWatcherServiceByNuclideUri;
exports.getFlowServiceByNuclideUri = getFlowServiceByNuclideUri;
exports.getFuzzyFileSearchServiceByNuclideUri = getFuzzyFileSearchServiceByNuclideUri;
exports.awaitGeneratedFileServiceByNuclideUri = awaitGeneratedFileServiceByNuclideUri;
exports.getGrepServiceByNuclideUri = getGrepServiceByNuclideUri;
exports.getHackLanguageForUri = getHackLanguageForUri;
exports.getHgServiceByNuclideUri = getHgServiceByNuclideUri;
exports.getInfoServiceByNuclideUri = getInfoServiceByNuclideUri;
exports.getMerlinServiceByNuclideUri = getMerlinServiceByNuclideUri;
exports.getMetroServiceByNuclideUri = getMetroServiceByNuclideUri;
exports.getNativeDebuggerServiceByNuclideUri = getNativeDebuggerServiceByNuclideUri;
exports.getOpenFilesServiceByNuclideUri = getOpenFilesServiceByNuclideUri;
exports.getPhpDebuggerServiceByNuclideUri = getPhpDebuggerServiceByNuclideUri;
exports.getHhvmDebuggerServiceByNuclideUri = getHhvmDebuggerServiceByNuclideUri;
exports.getPtyServiceByNuclideUri = getPtyServiceByNuclideUri;
exports.getPythonServiceByNuclideUri = getPythonServiceByNuclideUri;
exports.getPythonServiceByConnection = getPythonServiceByConnection;
exports.getReasonServiceByNuclideUri = getReasonServiceByNuclideUri;
exports.getRemoteCommandServiceByNuclideUri = getRemoteCommandServiceByNuclideUri;
exports.getSdbServiceByNuclideUri = getSdbServiceByNuclideUri;
exports.getSocketServiceByNuclideUri = getSocketServiceByNuclideUri;
exports.getSourceControlServiceByNuclideUri = getSourceControlServiceByNuclideUri;
exports.getVSCodeLanguageServiceByConnection = getVSCodeLanguageServiceByConnection;
exports.getVSCodeLanguageServiceByNuclideUri = getVSCodeLanguageServiceByNuclideUri;
exports.getCqueryLSPServiceByConnection = getCqueryLSPServiceByConnection;
exports.getCqueryLSPServiceByNuclideUri = getCqueryLSPServiceByNuclideUri;
exports.getVSCodeDebuggerAdapterServiceByNuclideUri = getVSCodeDebuggerAdapterServiceByNuclideUri;
exports.getRemoteDebuggerCommandServiceByNuclideUri = getRemoteDebuggerCommandServiceByNuclideUri;

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _RemoteConnection;

function _load_RemoteConnection() {
  return _RemoteConnection = require('./RemoteConnection');
}

var _RemoteDirectory;

function _load_RemoteDirectory() {
  return _RemoteDirectory = require('./RemoteDirectory');
}

var _RemoteFile;

function _load_RemoteFile() {
  return _RemoteFile = require('./RemoteFile');
}

var _ServerConnection;

function _load_ServerConnection() {
  return _ServerConnection = require('./ServerConnection');
}

var _ConnectionCache;

function _load_ConnectionCache() {
  return _ConnectionCache = require('./ConnectionCache');
}

var _SshHandshake;

function _load_SshHandshake() {
  return _SshHandshake = require('./SshHandshake');
}

var _serviceManager;

function _load_serviceManager() {
  return _serviceManager = require('./service-manager');
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

exports.RemoteConnection = (_RemoteConnection || _load_RemoteConnection()).RemoteConnection;
exports.RemoteDirectory = (_RemoteDirectory || _load_RemoteDirectory()).RemoteDirectory;
exports.RemoteFile = (_RemoteFile || _load_RemoteFile()).RemoteFile;
exports.ServerConnection = (_ServerConnection || _load_ServerConnection()).ServerConnection;
exports.ConnectionCache = (_ConnectionCache || _load_ConnectionCache()).ConnectionCache;
exports.SshHandshake = (_SshHandshake || _load_SshHandshake()).SshHandshake;
exports.decorateSshConnectionDelegateWithTracking = (_SshHandshake || _load_SshHandshake()).decorateSshConnectionDelegateWithTracking;
exports.getService = (_serviceManager || _load_serviceManager()).getService;
exports.getServiceByConnection = (_serviceManager || _load_serviceManager()).getServiceByConnection;
exports.getServiceByNuclideUri = (_serviceManager || _load_serviceManager()).getServiceByNuclideUri;
exports.getlocalService = (_serviceManager || _load_serviceManager()).getlocalService;
function getAdbServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('AdbService', uri));
}

function getBuckServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('BuckService', uri));
}

function getClangServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('ClangService', uri));
}

function getCodeSearchServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('CodeSearchService', uri));
}

function getCtagsServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('CtagsService', uri));
}

function getDefinitionPreviewServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('DefinitionPreviewService', uri));
}

function getFileSystemServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('FileSystemService', uri));
}

function getFileWatcherServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('FileWatcherService', uri));
}

function getFlowServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('FlowService', uri));
}

function getFuzzyFileSearchServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('FuzzyFileSearchService', uri));
}

function awaitGeneratedFileServiceByNuclideUri(uri) {
  return (0, (_serviceManager || _load_serviceManager()).awaitServiceByNuclideUri)('GeneratedFileService', uri).then((_nullthrows || _load_nullthrows()).default);
}

function getGrepServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('GrepService', uri));
}

function getHackLanguageForUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('HackService', uri));
}

function getHgServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('HgService', uri));
}

function getInfoServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('InfoService', uri));
}

function getMerlinServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('MerlinService', uri));
}

function getMetroServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('MetroService', uri));
}

function getNativeDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('NativeDebuggerService', uri));
}

function getOpenFilesServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('OpenFilesService', uri));
}

function getPhpDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('PhpDebuggerService', uri));
}

function getHhvmDebuggerServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('HhvmDebuggerService', uri));
}

function getPtyServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('PtyService', uri));
}

function getPythonServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('PythonService', uri));
}

function getPythonServiceByConnection(connection) {
  return (0, (_serviceManager || _load_serviceManager()).getServiceByConnection)('PythonService', connection);
}

function getReasonServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('ReasonService', uri));
}

function getRemoteCommandServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('RemoteCommandService', uri));
}

function getSdbServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('SdbService', uri));
}

function getSocketServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('SocketService', uri));
}

function getSourceControlServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('SourceControlService', uri));
}

function getVSCodeLanguageServiceByConnection(connection) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByConnection)('VSCodeLanguageService', connection));
}

function getVSCodeLanguageServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('VSCodeLanguageService', uri));
}

function getCqueryLSPServiceByConnection(connection) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByConnection)('CqueryLSPService', connection));
}

function getCqueryLSPServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('CqueryLSPService', uri));
}

function getVSCodeDebuggerAdapterServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('VSCodeDebuggerAdapterService', uri));
}

function getRemoteDebuggerCommandServiceByNuclideUri(uri) {
  return (0, (_nullthrows || _load_nullthrows()).default)((0, (_serviceManager || _load_serviceManager()).getServiceByNuclideUri)('RemoteDebuggerCommandService', uri));
}