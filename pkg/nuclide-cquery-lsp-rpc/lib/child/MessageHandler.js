'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageHandler = undefined;

var _log4js;

function _load_log4js() {
  return _log4js = _interopRequireDefault(require('log4js'));
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../../modules/nuclide-commons/nuclideUri'));
}

var _performanceNow;

function _load_performanceNow() {
  return _performanceNow = _interopRequireDefault(require('../../../../modules/nuclide-commons/performanceNow'));
}

var _clangFlagsReader;

function _load_clangFlagsReader() {
  return _clangFlagsReader = require('../../../nuclide-clang-rpc/lib/clang-flags-reader');
}

var _convert;

function _load_convert() {
  return _convert = require('../../../nuclide-vscode-language-service-rpc/lib/convert');
}

var _protocol;

function _load_protocol() {
  return _protocol = require('../../../nuclide-vscode-language-service-rpc/lib/protocol');
}

var _FlagUtils;

function _load_FlagUtils() {
  return _FlagUtils = require('./FlagUtils');
}

var _messages;

function _load_messages() {
  return _messages = require('./messages');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const logger = (_log4js || _load_log4js()).default.getLogger('nuclide-cquery-wrapper');

/**
 * Message handlers defined here perform processing on messages from the
 * client (Nuclide) and then forward to the server (cquery).
 */
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

class MessageHandler {
  // Map of pending opened files to their command resolution promise.
  // A file in this map means that we've seen its didOpen but have not resolved
  // its compile commands from Buck or the filesystem.
  // Used to resolve races between open/close events.

  // Map source file to its flags def file (either buck or compile_commands.json)

  // Writes to client.
  constructor(projectRoot, serverWriter, clientWriter) {
    this._knownFileMap = new Map();
    this._knownCompileCommandsSet = new Set();
    this._pendingOpenRequests = new Map();
    this._lastJobsTotal = 0;

    this._projectRoot = projectRoot;
    this._serverWriter = serverWriter;
    this._clientWriter = clientWriter;
    this._updateStatus();
  }

  /**
   * Attempt to handle a message from the client editor.
   */

  // The last output of $cquery/progress.

  // Set of known compilation database folders.

  // Absolute path to project root.

  // Writes to cquery.
  handleFromClient(message) {
    const method = message.method;
    if (method != null) {
      switch (method) {
        case 'textDocument/didOpen':
          this._didOpen(message);
          return true;
        case 'textDocument/didClose':
          this._didClose(message);
          return true;
      }
    }
    return false;
  }

  /**
   * Attempt to handle a message from the cquery server.
   */
  handleFromServer(message) {
    const method = message.method;
    if (method != null) {
      switch (method) {
        case '$cquery/progress':
          this._progress(message);
          return true;
      }
    }
    return false;
  }

  /**
   * Return the currently known compilation databases.
   */
  knownProjects() {
    return Array.from(this._knownCompileCommandsSet);
  }

  async _didOpen(openMessage) {
    const params = openMessage.params;
    const path = (0, (_convert || _load_convert()).lspUri_localPath)(params.textDocument.uri);
    const displayPath = this._stripRoot(path);
    if (this._knownFileMap.has(path)) {
      // If we have seen the path then don't find a compilation database again.
      return this._serverWriter.write(openMessage);
    } else if (this._pendingOpenRequests.has(path)) {
      // If there's another open request still in flight then drop the request.
      this._clientWriter.write((0, (_messages || _load_messages()).windowMessage)((_protocol || _load_protocol()).MessageType.Info, `${displayPath} still being opened`));
      return;
    }
    const startTime = (0, (_performanceNow || _load_performanceNow()).default)();
    this._clientWriter.write((0, (_messages || _load_messages()).windowMessage)((_protocol || _load_protocol()).MessageType.Info, `Looking for flags of ${displayPath}`));
    let flagsInfo = null;
    let resolveOpenRequest = () => {};
    this._pendingOpenRequests.set(path, new Promise((resolve, _) => {
      resolveOpenRequest = resolve;
    }));
    this._updateStatus();
    try {
      flagsInfo = await (0, (_FlagUtils || _load_FlagUtils()).flagsInfoForPath)(path);
    } catch (e) {
      logger.error(`Error finding flags for ${displayPath}, ${e}`);
    } finally {
      this._pendingOpenRequests.delete(path);
    }
    const duration = (0, (_performanceNow || _load_performanceNow()).default)() - startTime;
    if (flagsInfo != null) {
      const { databaseDirectory, flagsFile } = flagsInfo;
      const databaseFile = (_nuclideUri || _load_nuclideUri()).default.join(databaseDirectory, 'compile_commands.json');
      this._clientWriter.write((0, (_messages || _load_messages()).windowMessage)((_protocol || _load_protocol()).MessageType.Info, `Found flags for ${displayPath} at ${flagsFile} in ${duration}ms`));
      this._knownFileMap.set(path, flagsFile);
      if (!this._knownCompileCommandsSet.has(databaseDirectory)) {
        this._knownCompileCommandsSet.add(databaseDirectory);
        this._serverWriter.write((0, (_messages || _load_messages()).addDbMessage)(databaseDirectory));
        // Read the database file and cache listed files as known.
        (0, (_clangFlagsReader || _load_clangFlagsReader()).readCompilationFlags)(databaseFile).subscribe(entry => this._knownFileMap.set(entry.file, flagsFile));
      }
    } else {
      this._clientWriter.write((0, (_messages || _load_messages()).windowMessage)((_protocol || _load_protocol()).MessageType.Warning, `Could not find flags for ${displayPath} in ${duration}ms, diagnostics may not be correct.`));
    }
    this._updateStatus();
    this._serverWriter.write(openMessage);
    resolveOpenRequest();
  }

  async _didClose(closeMessage) {
    const params = closeMessage.params;
    const path = (0, (_convert || _load_convert()).lspUri_localPath)(params.textDocument.uri);
    const displayPath = this._stripRoot(path);
    // If user closes the file while the open request is pending, then wait
    // for the open request to finish before emitting the close notification.
    // Otherwise we could end up with inconsistent state with server thinking
    // the file is open when the client has closed it.
    try {
      if (this._pendingOpenRequests.has(path)) {
        this._clientWriter.write((0, (_messages || _load_messages()).windowMessage)((_protocol || _load_protocol()).MessageType.Warning, `${displayPath} closed before we finished opening it`));
        await this._pendingOpenRequests.get(path);
      }
    } finally {
      this._serverWriter.write(closeMessage);
    }
  }

  _progress(progressMessage) {
    const params = progressMessage.params;
    const {
      indexRequestCount,
      doIdMapCount,
      loadPreviousIndexCount,
      onIdMappedCount,
      onIndexedCount
    } = params;
    const total = indexRequestCount + doIdMapCount + loadPreviousIndexCount + onIdMappedCount + onIndexedCount;
    // Only trigger the status update if the total has changed.
    if (this._lastJobsTotal !== total) {
      this._lastJobsTotal = total;
      this._updateStatus();
    }
  }

  _stripRoot(path) {
    // Return path with project root removed from the prefix.
    return path.startsWith(this._projectRoot) ? path.slice(this._projectRoot.length) : path;
  }

  _updateStatus() {
    const buildingFiles = Array.from(this._pendingOpenRequests.keys()).map(path => this._stripRoot(path));
    if (this._lastJobsTotal === 0 && buildingFiles.length === 0) {
      this._clientWriter.write((0, (_messages || _load_messages()).windowStatusMessage)({ type: (_protocol || _load_protocol()).MessageType.Info, message: 'cquery ready' }));
    } else {
      const jobsMessage = `cquery: ${this._lastJobsTotal} jobs`;
      const buildingMessage = buildingFiles.length > 0 ? 'Fetching flags for:\n - ' + buildingFiles.join('\n - ') : '';
      const status = {
        type: (_protocol || _load_protocol()).MessageType.Warning,
        // Double newline for markdown line break.
        message: jobsMessage + '\n\n' + buildingMessage
      };
      this._clientWriter.write((0, (_messages || _load_messages()).windowStatusMessage)(status));
    }
  }
}
exports.MessageHandler = MessageHandler;