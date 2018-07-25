"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageHandler = void 0;

function _log4js() {
  const data = _interopRequireDefault(require("log4js"));

  _log4js = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _performanceNow() {
  const data = _interopRequireDefault(require("../../../../modules/nuclide-commons/performanceNow"));

  _performanceNow = function () {
    return data;
  };

  return data;
}

function _clangFlagsReader() {
  const data = require("../../../nuclide-clang-rpc/lib/clang-flags-reader");

  _clangFlagsReader = function () {
    return data;
  };

  return data;
}

function _convert() {
  const data = require("../../../nuclide-vscode-language-service-rpc/lib/convert");

  _convert = function () {
    return data;
  };

  return data;
}

function _protocol() {
  const data = require("../../../nuclide-vscode-language-service-rpc/lib/protocol");

  _protocol = function () {
    return data;
  };

  return data;
}

function _CqueryInitialization() {
  const data = require("./CqueryInitialization");

  _CqueryInitialization = function () {
    return data;
  };

  return data;
}

function _FlagUtils() {
  const data = require("./FlagUtils");

  _FlagUtils = function () {
    return data;
  };

  return data;
}

function _messages() {
  const data = require("./messages");

  _messages = function () {
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
 * 
 * @format
 */
const logger = _log4js().default.getLogger('nuclide-cquery-wrapper');
/**
 * Message handlers defined here perform processing on messages from the
 * client (Nuclide) and then forward to the server (cquery).
 */


class MessageHandler {
  // Writes to cquery.
  // Writes to client.
  // Absolute path to project root.
  // Map source file to its flags def file (either buck or compile_commands.json)
  // Set of known compilation database folders.
  // Map of pending opened files to their command resolution promise.
  // A file in this map means that we've seen its didOpen but have not resolved
  // its compile commands from Buck or the filesystem.
  // Used to resolve races between open/close events.
  // The last output of $cquery/progress.
  constructor(serverWriter, clientWriter) {
    this._knownFileMap = new Map();
    this._knownCompileCommandsSet = new Set();
    this._pendingOpenRequests = new Map();
    this._lastJobsTotal = 0;
    this._serverWriter = serverWriter;
    this._clientWriter = clientWriter;

    this._updateStatus();
  }
  /**
   * Attempt to handle a message from the client editor.
   */


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

        case 'initialize':
          this._initialize(message);

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
  } // Merge default initialization options with client-provided overrides.


  _initialize(initMessage) {
    const originalParams = initMessage.params;
    const originalInitialization = originalParams.initializationOptions;

    if (originalParams.rootUri != null) {
      this._projectRoot = (0, _convert().lspUri_localPath)(originalParams.rootUri);
    } else if (originalParams.rootPath != null) {
      this._projectRoot = originalParams.rootPath;
    } else {
      logger.fatal('Initialize request had no rootPath or rootUri field.');
      return;
    }

    const nuclideInitialization = (0, _CqueryInitialization().getInitializationOptions)((0, _CqueryInitialization().resolveCacheDir)(this._projectRoot), this._projectRoot, []); // Merge the client-provided and the Nuclide-custom parameters.

    const initializationOptions = Object.assign({}, nuclideInitialization, originalInitialization);
    const params = Object.assign({}, originalParams, {
      initializationOptions
    });

    this._serverWriter.write(Object.assign({}, initMessage, {
      params
    }));
  }

  async _didOpen(openMessage) {
    const params = openMessage.params;
    const path = (0, _convert().lspUri_localPath)(params.textDocument.uri);

    const displayPath = this._stripRoot(path);

    if (this._knownFileMap.has(path)) {
      // If we have seen the path then don't find a compilation database again.
      return this._serverWriter.write(openMessage);
    } else if (this._pendingOpenRequests.has(path)) {
      // If there's another open request still in flight then drop the request.
      this._clientWriter.write((0, _messages().windowMessage)(_protocol().MessageType.Info, `${displayPath} still being opened`));

      return;
    }

    const startTime = (0, _performanceNow().default)();

    this._clientWriter.write((0, _messages().windowMessage)(_protocol().MessageType.Info, `Looking for flags of ${displayPath}`));

    let flagsInfo = null;

    let resolveOpenRequest = () => {};

    this._pendingOpenRequests.set(path, new Promise((resolve, _) => {
      resolveOpenRequest = resolve;
    }));

    this._updateStatus();

    try {
      flagsInfo = await (0, _FlagUtils().flagsInfoForPath)(path);
    } catch (e) {
      logger.error(`Error finding flags for ${displayPath}, ${e}`);
    } finally {
      this._pendingOpenRequests.delete(path);
    }

    const duration = (0, _performanceNow().default)() - startTime;

    if (flagsInfo != null) {
      const {
        databaseDirectory,
        flagsFile
      } = flagsInfo;

      const databaseFile = _nuclideUri().default.join(databaseDirectory, 'compile_commands.json');

      this._clientWriter.write((0, _messages().windowMessage)(_protocol().MessageType.Info, `Found flags for ${displayPath} at ${flagsFile} in ${duration}ms`));

      this._knownFileMap.set(path, flagsFile);

      if (!this._knownCompileCommandsSet.has(databaseDirectory)) {
        this._knownCompileCommandsSet.add(databaseDirectory);

        this._serverWriter.write((0, _messages().addDbMessage)(databaseDirectory)); // Read the database file and cache listed files as known.


        (0, _clangFlagsReader().readCompilationFlags)(databaseFile).subscribe(entry => this._knownFileMap.set(entry.file, flagsFile));
      }
    } else {
      this._clientWriter.write((0, _messages().windowMessage)(_protocol().MessageType.Warning, `Could not find flags for ${displayPath} in ${duration}ms, diagnostics may not be correct.`));
    }

    this._updateStatus();

    this._serverWriter.write(openMessage);

    resolveOpenRequest();
  }

  async _didClose(closeMessage) {
    const params = closeMessage.params;
    const path = (0, _convert().lspUri_localPath)(params.textDocument.uri);

    const displayPath = this._stripRoot(path); // If user closes the file while the open request is pending, then wait
    // for the open request to finish before emitting the close notification.
    // Otherwise we could end up with inconsistent state with server thinking
    // the file is open when the client has closed it.


    try {
      if (this._pendingOpenRequests.has(path)) {
        this._clientWriter.write((0, _messages().windowMessage)(_protocol().MessageType.Warning, `${displayPath} closed before we finished opening it`));

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
    const total = indexRequestCount + doIdMapCount + loadPreviousIndexCount + onIdMappedCount + onIndexedCount; // Only trigger the status update if the total has changed.

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
      this._clientWriter.write((0, _messages().windowStatusMessage)({
        type: _protocol().MessageType.Info,
        message: 'cquery ready'
      }));
    } else {
      const jobsMessage = `cquery: ${this._lastJobsTotal} jobs`;
      const buildingMessage = buildingFiles.length > 0 ? 'Fetching flags for:\n - ' + buildingFiles.join('\n - ') : '';
      const status = {
        type: _protocol().MessageType.Warning,
        // Double newline for markdown line break.
        message: jobsMessage + '\n\n' + buildingMessage
      };

      this._clientWriter.write((0, _messages().windowStatusMessage)(status));
    }
  }

}

exports.MessageHandler = MessageHandler;