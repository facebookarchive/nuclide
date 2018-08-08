"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getBigDigClientByNuclideUri = getBigDigClientByNuclideUri;
exports.getBuckServiceByNuclideUri = getBuckServiceByNuclideUri;
exports.getBuckServiceByConnection = getBuckServiceByConnection;
exports.getClangServiceByNuclideUri = getClangServiceByNuclideUri;
exports.getCodeSearchServiceByNuclideUri = getCodeSearchServiceByNuclideUri;
exports.getCtagsServiceByNuclideUri = getCtagsServiceByNuclideUri;
exports.getDefinitionPreviewServiceByNuclideUri = getDefinitionPreviewServiceByNuclideUri;
exports.getFbsimctlServiceByNuclideUri = getFbsimctlServiceByNuclideUri;
exports.getFileSystemServiceByNuclideUri = getFileSystemServiceByNuclideUri;
exports.getFileSystemServiceByConnection = getFileSystemServiceByConnection;
exports.getFileWatcherServiceByNuclideUri = getFileWatcherServiceByNuclideUri;
exports.getFlowServiceByNuclideUri = getFlowServiceByNuclideUri;
exports.getFuzzyFileSearchServiceByNuclideUri = getFuzzyFileSearchServiceByNuclideUri;
exports.awaitGeneratedFileServiceByNuclideUri = awaitGeneratedFileServiceByNuclideUri;
exports.getGrepServiceByNuclideUri = getGrepServiceByNuclideUri;
exports.getHackLanguageForUri = getHackLanguageForUri;
exports.getHgServiceByNuclideUri = getHgServiceByNuclideUri;
exports.getHhvmDebuggerServiceByNuclideUri = getHhvmDebuggerServiceByNuclideUri;
exports.getInfoServiceByNuclideUri = getInfoServiceByNuclideUri;
exports.getInfoServiceByConnection = getInfoServiceByConnection;
exports.getMetroServiceByNuclideUri = getMetroServiceByNuclideUri;
exports.getOpenFilesServiceByNuclideUri = getOpenFilesServiceByNuclideUri;
exports.getPythonServiceByNuclideUri = getPythonServiceByNuclideUri;
exports.getPythonServiceByConnection = getPythonServiceByConnection;
exports.getRemoteCommandServiceByNuclideUri = getRemoteCommandServiceByNuclideUri;
exports.getSocketServiceByNuclideUri = getSocketServiceByNuclideUri;
exports.getSourceControlServiceByNuclideUri = getSourceControlServiceByNuclideUri;
exports.getVSCodeLanguageServiceByConnection = getVSCodeLanguageServiceByConnection;
exports.getVSCodeLanguageServiceByNuclideUri = getVSCodeLanguageServiceByNuclideUri;
exports.getCqueryLSPServiceByConnection = getCqueryLSPServiceByConnection;
exports.getCqueryLSPServiceByNuclideUri = getCqueryLSPServiceByNuclideUri;
Object.defineProperty(exports, "RemoteConnection", {
  enumerable: true,
  get: function () {
    return _RemoteConnection().RemoteConnection;
  }
});
Object.defineProperty(exports, "RemoteDirectory", {
  enumerable: true,
  get: function () {
    return _RemoteDirectory().RemoteDirectory;
  }
});
Object.defineProperty(exports, "RemoteFile", {
  enumerable: true,
  get: function () {
    return _RemoteFile().RemoteFile;
  }
});
Object.defineProperty(exports, "ServerConnection", {
  enumerable: true,
  get: function () {
    return _ServerConnection().ServerConnection;
  }
});
Object.defineProperty(exports, "ConnectionCache", {
  enumerable: true,
  get: function () {
    return _ConnectionCache().ConnectionCache;
  }
});
Object.defineProperty(exports, "SshHandshake", {
  enumerable: true,
  get: function () {
    return _SshHandshake().SshHandshake;
  }
});
Object.defineProperty(exports, "decorateSshConnectionDelegateWithTracking", {
  enumerable: true,
  get: function () {
    return _SshHandshake().decorateSshConnectionDelegateWithTracking;
  }
});
Object.defineProperty(exports, "getService", {
  enumerable: true,
  get: function () {
    return _serviceManager().getService;
  }
});
Object.defineProperty(exports, "getServiceByConnection", {
  enumerable: true,
  get: function () {
    return _serviceManager().getServiceByConnection;
  }
});
Object.defineProperty(exports, "getServiceByNuclideUri", {
  enumerable: true,
  get: function () {
    return _serviceManager().getServiceByNuclideUri;
  }
});
Object.defineProperty(exports, "getlocalService", {
  enumerable: true,
  get: function () {
    return _serviceManager().getlocalService;
  }
});
Object.defineProperty(exports, "bufferForUri", {
  enumerable: true,
  get: function () {
    return _remoteTextBuffer().bufferForUri;
  }
});
Object.defineProperty(exports, "existingBufferForUri", {
  enumerable: true,
  get: function () {
    return _remoteTextBuffer().existingBufferForUri;
  }
});
Object.defineProperty(exports, "loadBufferForUri", {
  enumerable: true,
  get: function () {
    return _remoteTextBuffer().loadBufferForUri;
  }
});
Object.defineProperty(exports, "RemoteDirectoryPlaceholder", {
  enumerable: true,
  get: function () {
    return _RemoteDirectoryPlaceholder().default;
  }
});

function _nullthrows() {
  const data = _interopRequireDefault(require("nullthrows"));

  _nullthrows = function () {
    return data;
  };

  return data;
}

function _RemoteConnection() {
  const data = require("./RemoteConnection");

  _RemoteConnection = function () {
    return data;
  };

  return data;
}

function _RemoteDirectory() {
  const data = require("./RemoteDirectory");

  _RemoteDirectory = function () {
    return data;
  };

  return data;
}

function _RemoteFile() {
  const data = require("./RemoteFile");

  _RemoteFile = function () {
    return data;
  };

  return data;
}

function _ServerConnection() {
  const data = require("./ServerConnection");

  _ServerConnection = function () {
    return data;
  };

  return data;
}

function _ConnectionCache() {
  const data = require("./ConnectionCache");

  _ConnectionCache = function () {
    return data;
  };

  return data;
}

function _SshHandshake() {
  const data = require("./SshHandshake");

  _SshHandshake = function () {
    return data;
  };

  return data;
}

function _serviceManager() {
  const data = require("./service-manager");

  _serviceManager = function () {
    return data;
  };

  return data;
}

function _remoteTextBuffer() {
  const data = require("./remote-text-buffer");

  _remoteTextBuffer = function () {
    return data;
  };

  return data;
}

function _RemoteDirectoryPlaceholder() {
  const data = _interopRequireDefault(require("./RemoteDirectoryPlaceholder"));

  _RemoteDirectoryPlaceholder = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */
function getBigDigClientByNuclideUri(uri) {
  const connection = _ServerConnection().ServerConnection.getForUri(uri);

  if (!connection) {
    throw new Error(`no server connection for ${uri}`);
  }

  return connection.getBigDigClient();
}

function getBuckServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('BuckService', uri));
}

function getBuckServiceByConnection(connection) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByConnection)('BuckService', connection));
}

function getClangServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('ClangService', uri));
}

function getCodeSearchServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('CodeSearchService', uri));
}

function getCtagsServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('CtagsService', uri));
}

function getDefinitionPreviewServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('DefinitionPreviewService', uri));
}

function getFbsimctlServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('FbsimctlService', uri));
}

function getFileSystemServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('FileSystemService', uri));
}

function getFileSystemServiceByConnection(connection) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByConnection)('FileSystemService', connection));
}

function getFileWatcherServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('FileWatcherService', uri));
}

function getFlowServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('FlowService', uri));
}

function getFuzzyFileSearchServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('FuzzyFileSearchService', uri));
}

function awaitGeneratedFileServiceByNuclideUri(uri) {
  return (0, _serviceManager().awaitServiceByNuclideUri)('GeneratedFileService', uri).then(_nullthrows().default);
}

function getGrepServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('GrepService', uri));
}

function getHackLanguageForUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('HackService', uri));
}

function getHgServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('HgService', uri));
}

function getHhvmDebuggerServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('HhvmDebuggerService', uri));
}

function getInfoServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('InfoService', uri));
}

function getInfoServiceByConnection(connection) {
  return (0, _serviceManager().getServiceByConnection)('InfoService', connection);
}

function getMetroServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('MetroService', uri));
}

function getOpenFilesServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('OpenFilesService', uri));
}

function getPythonServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('PythonService', uri));
}

function getPythonServiceByConnection(connection) {
  return (0, _serviceManager().getServiceByConnection)('PythonService', connection);
}

function getRemoteCommandServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('RemoteCommandService', uri));
}

function getSocketServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('SocketService', uri));
}

function getSourceControlServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('SourceControlService', uri));
}

function getVSCodeLanguageServiceByConnection(connection) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByConnection)('VSCodeLanguageService', connection));
}

function getVSCodeLanguageServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('VSCodeLanguageService', uri));
}

function getCqueryLSPServiceByConnection(connection) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByConnection)('CqueryLSPService', connection));
}

function getCqueryLSPServiceByNuclideUri(uri) {
  return (0, _nullthrows().default)((0, _serviceManager().getServiceByNuclideUri)('CqueryLSPService', uri));
}