'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LanguageServerProtocolProcess = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

exports.toTextDocumentIdentifier = toTextDocumentIdentifier;
exports.pointToPosition = pointToPosition;
exports.positionToPoint = positionToPoint;
exports.rangeToAtomRange = rangeToAtomRange;
exports.convertDiagnostics = convertDiagnostics;
exports.convertDiagnostic = convertDiagnostic;
exports.convertSeverity = convertSeverity;
exports.createTextDocumentPositionParams = createTextDocumentPositionParams;
exports.convertCompletion = convertCompletion;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _nuclideOpenFilesRpc;

function _load_nuclideOpenFilesRpc() {
  return _nuclideOpenFilesRpc = require('../../nuclide-open-files-rpc');
}

var _vscodeJsonrpc;

function _load_vscodeJsonrpc() {
  return _vscodeJsonrpc = _interopRequireWildcard(require('vscode-jsonrpc'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _simpleTextBuffer;

function _load_simpleTextBuffer() {
  return _simpleTextBuffer = require('simple-text-buffer');
}

var _languageserverV;

function _load_languageserverV() {
  return _languageserverV = require('./languageserver-v2');
}

var _protocolV;

function _load_protocolV() {
  return _protocolV = require('./protocol-v2');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Marshals messages from Nuclide's LanguageService
// to VS Code's Language Server Protocol
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class LanguageServerProtocolProcess {

  constructor(logger, fileCache, createProcess, projectRoot, fileExtensions) {
    this._logger = logger;
    this._fileCache = fileCache;
    this._fileVersionNotifier = new (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileVersionNotifier();
    this._projectRoot = projectRoot;
    this._createProcess = createProcess;
    this._fileExtensions = fileExtensions;
  }

  static create(logger, fileCache, createProcess, projectRoot, fileExtensions) {
    return (0, _asyncToGenerator.default)(function* () {
      const result = new LanguageServerProtocolProcess(logger, fileCache, createProcess, projectRoot, fileExtensions);
      yield result._ensureProcess();
      return result;
    })();
  }

  _subscribeToFileEvents() {
    this._fileSubscription = this._fileCache.observeFileEvents()
    // TODO: Filter on projectRoot
    .filter(fileEvent => {
      const fileExtension = (_nuclideUri || _load_nuclideUri()).default.extname(fileEvent.fileVersion.filePath);
      return this._fileExtensions.indexOf(fileExtension) !== -1;
    }).subscribe(fileEvent => {
      const filePath = fileEvent.fileVersion.filePath;
      const version = fileEvent.fileVersion.version;
      switch (fileEvent.kind) {
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.OPEN:
          this._process._connection.didOpenTextDocument({
            textDocument: {
              uri: filePath,
              languageId: 'python', // TODO
              version,
              text: fileEvent.contents
            }
          });
          break;
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.CLOSE:
          this._process._connection.didCloseTextDocument({
            textDocument: toTextDocumentIdentifier(filePath)
          });
          break;
        case (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).FileEventKind.EDIT:
          this._fileCache.getBufferAtVersion(fileEvent.fileVersion).then(buffer => {
            if (buffer == null) {
              // TODO: stale ... send full contents from current buffer version
              return;
            }
            this._process._connection.didChangeTextDocument({
              textDocument: {
                uri: filePath,
                version
              },
              // Send full contents
              // TODO: If the provider handles incremental diffs
              // Then send them instead
              contentChanges: [{
                text: buffer.getText()
              }]
            });
          });
          break;
        default:
          throw new Error(`Unexpected FileEvent kind: ${JSON.stringify(fileEvent)}`);
      }
      this._fileVersionNotifier.onEvent(fileEvent);
    });
  }

  // TODO: Handle the process termination/restart.
  _ensureProcess() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      try {
        _this._process = yield LspProcess.create(_this._logger, _this._createProcess(), _this._projectRoot);
        _this._subscribeToFileEvents();
      } catch (e) {
        _this._logger.logError('LanguageServerProtocolProcess - error spawning child process: ', e);
        throw e;
      }
    })();
  }

  _onNotification(message) {
    this._logger.logError(`LanguageServerProtocolProcess - onNotification: ${JSON.stringify(message)}`);
    // TODO: Handle incoming messages
  }

  getRoot() {
    return this._projectRoot;
  }

  getBufferAtVersion(fileVersion) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const buffer = yield (0, (_nuclideOpenFilesRpc || _load_nuclideOpenFilesRpc()).getBufferAtVersion)(fileVersion);
      // Must also wait for edits to be sent to the LSP process
      if (!(yield _this2._fileVersionNotifier.waitForBufferAtVersion(fileVersion))) {
        return null;
      }
      return buffer != null && buffer.changeCount === fileVersion.version ? buffer : null;
    })();
  }

  getDiagnostics(fileVersion) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  observeDiagnostics() {
    const con = this._process._connection;
    return _rxjsBundlesRxMinJs.Observable.fromEventPattern(con.onDiagnosticsNotification.bind(con), () => undefined).map(convertDiagnostics).publish();
  }

  getAutocompleteSuggestions(fileVersion, position, activatedManually, prefix) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this3._process._connection.completion((yield _this3.createTextDocumentPositionParams(fileVersion, position)));
      return Array.isArray(result) ? result.map(convertCompletion) : result.items.map(convertCompletion);
    })();
  }

  getDefinition(fileVersion, position) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const result = yield _this4._process._connection.gotoDefinition((yield _this4.createTextDocumentPositionParams(fileVersion, position)));
      return {
        // TODO: use wordAtPos to determine queryrange
        queryRange: [new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(position, position)],
        definitions: _this4.locationsDefinitions(result)
      };
    })();
  }

  getDefinitionById(file, id) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  findReferences(fileVersion, position) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  getCoverage(filePath) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  getOutline(fileVersion) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  typeHint(fileVersion, position) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const request = yield _this5.createTextDocumentPositionParams(fileVersion, position);
      const response = yield _this5._process._connection.hover(request);

      let hint = response.contents;
      if (Array.isArray(hint)) {
        hint = hint.length > 0 ? hint[0] : '';
        // TODO: render multiple hints at once with a thin divider between them
      }
      if (typeof hint === 'string') {
        // TODO: convert markdown to text
      } else {
        hint = hint.value;
        // TODO: colorize code if possible. (is hard without knowing its context)
      }

      let range = new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(position, position);
      if (response.range) {
        range = rangeToAtomRange(response.range);
      }

      return hint ? { hint, range } : null;
    })();
  }

  highlight(fileVersion, position) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  formatSource(fileVersion, range) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  formatEntireFile(fileVersion, range) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  getEvaluationExpression(fileVersion, position) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  getProjectRoot(fileUri) {
    this._logger.logError('NYI');
    return Promise.resolve(null);
  }

  isFileInProject(fileUri) {
    this._logger.logError('NYI');
    return Promise.resolve(false);
  }

  dispose() {
    this._process.dispose();
    /* TODO
    if (!this.isDisposed()) {
      // Atempt to send disconnect message before shutting down connection
      try {
        this._logger.logTrace(
          'Attempting to disconnect cleanly from LanguageServerProtocolProcess');
        this.getConnectionService().disconnect();
      } catch (e) {
        // Failing to send the shutdown is not fatal...
        // ... continue with shutdown.
        this._logger.logError('Hack Process died before disconnect() could be sent.');
      }
      super.dispose();
      this._fileVersionNotifier.dispose();
      this._fileSubscription.unsubscribe();
      if (processes.has(this._fileCache)) {
        processes.get(this._fileCache).delete(this._projectRoot);
      }
    } else {
      this._logger.logInfo(
        `LanguageServerProtocolProcess attempt to shut down already disposed ${this.getRoot()}.`);
    }
    */
  }

  locationToDefinition(location) {
    return {
      path: location.uri,
      position: positionToPoint(location.range.start),
      language: 'Python', // TODO
      projectRoot: this._projectRoot
    };
  }

  locationsDefinitions(locations) {
    if (Array.isArray(locations)) {
      return locations.map(this.locationToDefinition.bind(this));
    } else {
      return [this.locationToDefinition(locations)];
    }
  }

  createTextDocumentPositionParams(fileVersion, position) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this6.getBufferAtVersion(fileVersion);
      return createTextDocumentPositionParams(fileVersion, position);
    })();
  }
}

exports.LanguageServerProtocolProcess = LanguageServerProtocolProcess; // Encapsulates an LSP process

class LspProcess {

  constructor(logger, process, projectRoot, isIpc) {
    this._logger = logger;
    this._process = process;
    this._projectRoot = projectRoot;

    this._logger.logInfo('LanguageServerProtocolProcess - created child process with PID: ', process.pid);

    process.stdin.on('error', error => {
      this._logger.logError('LanguageServerProtocolProcess - error writing data: ', error);
    });

    let reader;
    let writer;
    if (isIpc) {
      reader = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).IPCMessageReader(process);
      writer = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).IPCMessageWriter(process);
    } else {
      reader = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageReader(process.stdout);
      writer = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(process.stdin);
    }

    const rpc_logger = {
      error(message) {
        logger.logError('JsonRpc ' + message);
      },
      warn(message) {
        logger.logInfo('JsonRpc ' + message);
      },
      info(message) {
        logger.logInfo('JsonRpc ' + message);
      },
      log(message) {
        logger.logInfo('JsonRpc ' + message);
      }
    };

    const connection = (_vscodeJsonrpc || _load_vscodeJsonrpc()).createMessageConnection(reader, writer, rpc_logger);

    connection.listen();
    // TODO: connection.onNotification(this._onNotification.bind(this));

    this._connection = new (_languageserverV || _load_languageserverV()).LanguageServerV2(this._logger, connection);
  }

  // Creates the connection and initializes capabilities
  static create(logger, process, projectRoot) {
    return (0, _asyncToGenerator.default)(function* () {
      const result = new LspProcess(logger, process, projectRoot, false);

      const init = {
        // TODO:
        initializationOptions: {},
        processId: process.pid,
        rootPath: projectRoot,
        capabilities: {}
      };
      result._capabilities = (yield result._connection.initialize(init)).capabilities;

      return result;
    })();
  }

  _onNotification(message) {
    this._logger.logError(`LanguageServerProtocolProcess - onNotification: ${JSON.stringify(message)}`);
    // TODO: Handle incoming messages
  }

  dispose() {
    // TODO
  }
}

function toTextDocumentIdentifier(filePath) {
  return {
    uri: filePath
  };
}

function pointToPosition(position) {
  return {
    line: position.row,
    character: position.column
  };
}

function positionToPoint(position) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(position.line, position.character);
}

function rangeToAtomRange(range) {
  return new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(positionToPoint(range.start), positionToPoint(range.end));
}

function convertDiagnostics(params) {
  return {
    filePath: params.uri,
    messages: params.diagnostics.map(diagnostic => convertDiagnostic(params.uri, diagnostic))
  };
}

function convertDiagnostic(filePath, diagnostic) {
  return {
    // TODO: diagnostic.code
    scope: 'file',
    providerName: diagnostic.source || 'TODO: VSCode LSP',
    type: convertSeverity(diagnostic.severity),
    filePath,
    text: diagnostic.message,
    range: rangeToAtomRange(diagnostic.range)
  };
}

function convertSeverity(severity) {
  switch (severity) {
    case null:
    case undefined:
    case (_protocolV || _load_protocolV()).DiagnosticSeverity.Error:
    default:
      return 'Error';
    case (_protocolV || _load_protocolV()).DiagnosticSeverity.Warning:
    case (_protocolV || _load_protocolV()).DiagnosticSeverity.Information:
    case (_protocolV || _load_protocolV()).DiagnosticSeverity.Hint:
      return 'Warning';
  }
}

function createTextDocumentPositionParams(fileVersion, position) {
  return {
    textDocument: toTextDocumentIdentifier(fileVersion.filePath),
    position: pointToPosition(position)
  };
}

function convertCompletion(item) {
  return {
    text: item.insertText || item.label,
    displayText: item.label,
    type: item.detail,
    description: item.documentation
  };
}