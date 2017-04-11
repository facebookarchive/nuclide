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
exports.atomRangeToRange = atomRangeToRange;
exports.convertDiagnostics = convertDiagnostics;
exports.convertDiagnostic = convertDiagnostic;
exports.convertSeverity = convertSeverity;
exports.createTextDocumentPositionParams = createTextDocumentPositionParams;
exports.convertCompletion = convertCompletion;
exports.convertSearchResult = convertSearchResult;

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../commons-node/nuclideUri'));
}

var _collection;

function _load_collection() {
  return _collection = require('../../commons-node/collection');
}

var _range;

function _load_range() {
  return _range = require('../../commons-node/range');
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

var _languageserver;

function _load_languageserver() {
  return _languageserver = require('./languageserver');
}

var _protocol;

function _load_protocol() {
  return _protocol = require('./protocol');
}

var _tokenizedText;

function _load_tokenizedText() {
  return _tokenizedText = require('../../commons-node/tokenizedText');
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Marshals messages from Nuclide's LanguageService
// to VS Code's Language Server Protocol
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
        _this._logger.logError('LanguageServerProtocolProcess - error spawning child process: ' + e);
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
    this._logger.logError('NYI: getDiagnostics');
    return Promise.resolve(null);
  }

  observeDiagnostics() {
    const con = this._process._connection;
    return _rxjsBundlesRxMinJs.Observable.fromEventPattern(con.onDiagnosticsNotification.bind(con), () => undefined).map(convertDiagnostics).publish();
  }

  getAutocompleteSuggestions(fileVersion, position, activatedManually, prefix) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (_this3._process._capabilities.completionProvider == null) {
        return null;
      }
      const result = yield _this3._process._connection.completion((yield _this3.createTextDocumentPositionParams(fileVersion, position)));
      if (Array.isArray(result)) {
        return {
          isIncomplete: false,
          items: result.map(convertCompletion)
        };
      } else {
        return {
          isIncomplete: result.isIncomplete,
          items: result.items.map(convertCompletion)
        };
      }
    })();
  }

  getDefinition(fileVersion, position) {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this4._process._capabilities.definitionProvider) {
        return null;
      }
      const result = yield _this4._process._connection.gotoDefinition((yield _this4.createTextDocumentPositionParams(fileVersion, position)));
      return {
        // TODO: use wordAtPos to determine queryrange
        queryRange: [new (_simpleTextBuffer || _load_simpleTextBuffer()).Range(position, position)],
        definitions: _this4.locationsDefinitions(result)
      };
    })();
  }

  getDefinitionById(file, id) {
    this._logger.logError('NYI: getDefinitionById');
    return Promise.resolve(null);
  }

  findReferences(fileVersion, position) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this5._process._capabilities.referencesProvider) {
        return null;
      }
      const buffer = yield _this5.getBufferAtVersion(fileVersion);
      const positionParams = createTextDocumentPositionParams(fileVersion, position);
      const params = Object.assign({}, positionParams, { context: { includeDeclaration: true } });
      // ReferenceParams is like TextDocumentPositionParams but with one extra field.
      const response = yield _this5._process._connection.findReferences(params);
      const references = response.map(_this5.locationToFindReference);

      // We want to know the name of the symbol. The best we can do is reconstruct
      // this from the range of one (any) of the references we got back. We're only
      // willing to do this for references in files already in the filecache, but
      // thanks to includeDeclaration:true then the file where the user clicked will
      // assuredly be in the cache!
      let referencedSymbolName = null;
      for (const ref of references) {
        const refBuffer = _this5._fileCache.getBuffer(ref.uri);
        if (refBuffer != null) {
          referencedSymbolName = refBuffer.getTextInRange(ref.range);
          break;
        }
      }
      // Failing that we'll try using a regexp on the buffer. (belt and braces!)
      if (referencedSymbolName == null && buffer != null) {
        const WORD_REGEX = /\w+/gi;
        const match = (0, (_range || _load_range()).wordAtPositionFromBuffer)(buffer, position, WORD_REGEX);
        if (match != null && match.wordMatch.length > 0) {
          referencedSymbolName = match.wordMatch[0];
        }
      }
      // Failing that ...
      if (referencedSymbolName == null) {
        referencedSymbolName = 'symbol';
      }

      return {
        type: 'data',
        baseUri: _this5._process._projectRoot,
        referencedSymbolName,
        references
      };
    })();
  }

  getCoverage(filePath) {
    var _this6 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this6._process._capabilities.typeCoverageProvider) {
        return null;
      }
      const params = { textDocument: toTextDocumentIdentifier(filePath) };
      const response = yield _this6._process._connection.typeCoverage(params);

      const convertUncovered = function (uncovered) {
        return {
          range: rangeToAtomRange(uncovered.range),
          message: uncovered.message
        };
      };
      return {
        percentage: response.coveredPercent,
        uncoveredRegions: response.uncoveredRanges.map(convertUncovered)
      };
    })();
  }

  getOutline(fileVersion) {
    var _this7 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this7._process._capabilities.documentSymbolProvider) {
        return null;
      }
      yield _this7.getBufferAtVersion(fileVersion); // push out any pending edits
      const params = { textDocument: toTextDocumentIdentifier(fileVersion.filePath) };
      const response = yield _this7._process._connection.documentSymbol(params);

      // The response is a flat list of SymbolInformation, which has location+name+containerName.
      // We're going to reconstruct a tree out of them. This can't be done with 100% accuracy in
      // all cases, but it can be done accurately in *almost* all cases.

      // For each symbolInfo in the list, we have exactly one corresponding tree node.
      // We'll also sort the nodes in lexical order of occurrence in the source
      // document. This is useful because containers always come lexically before their
      // children. (This isn't a LSP guarantee; just a heuristic.)
      const list = response.map(function (symbol) {
        return [symbol, {
          icon: symbolKindToAtomIcon(symbol.kind),
          tokenizedText: symbolToTokenizedText(symbol),
          startPosition: positionToPoint(symbol.location.range.start),
          children: []
        }];
      });
      list.sort(function ([, aNode], [, bNode]) {
        return aNode.startPosition.compare(bNode.startPosition);
      });

      // We'll need to look up for parents by name, so construct a map from names to nodes
      // of that name. Note: an undefined SymbolInformation.containerName means root,
      // but it's easier for us to represent with ''.
      const mapElements = list.map(function ([symbol, node]) {
        return [symbol.name, node];
      });
      const map = (0, (_collection || _load_collection()).collect)(mapElements);
      if (map.has('')) {
        _this7._logger.logError('Outline textDocument/documentSymbol returned an empty symbol name');
      }

      // The algorithm for reconstructing the tree out of list items rests on identifying
      // an item's parent based on the item's containerName. It's easy if there's only one
      // parent of that name. But if there are multiple parent candidates, we'll try to pick
      // the one that comes immediately lexically before the item. (If there are no parent
      // candidates, we've been given a malformed item, so we'll just ignore it.)
      const root = { plainText: '', startPosition: new (_simpleTextBuffer || _load_simpleTextBuffer()).Point(0, 0), children: [] };
      map.set('', [root]);
      for (const [symbol, node] of list) {
        const parentName = symbol.containerName || '';
        const parentCandidates = map.get(parentName);
        if (parentCandidates == null) {
          _this7._logger.logError(`Outline textDocument/documentSymbol ${symbol.name} is missing container ${parentName}`);
        } else {
          if (!(parentCandidates.length > 0)) {
            throw new Error('Invariant violation: "parentCandidates.length > 0"');
          }
          // Find the first candidate that's lexically *after* our symbol.


          const symbolPos = positionToPoint(symbol.location.range.start);
          const iAfter = parentCandidates.findIndex(function (p) {
            return p.startPosition.compare(symbolPos) > 0;
          });
          if (iAfter === -1) {
            // No candidates after item? Then item's parent is the last candidate.
            parentCandidates[parentCandidates.length - 1].children.push(node);
          } else if (iAfter === 0) {
            // All candidates after item? That's an error! We'll arbitrarily pick first one.
            parentCandidates[0].children.push(node);
            _this7._logger.logError(`Outline textDocument/documentSymbol ${symbol.name} comes after its container`);
          } else {
            // Some candidates before+after? Then item's parent is the last candidate before.
            parentCandidates[iAfter - 1].children.push(node);
          }
        }
      }

      return { outlineTrees: root.children };
    })();
  }

  typeHint(fileVersion, position) {
    var _this8 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this8._process._capabilities.hoverProvider) {
        return null;
      }
      const request = yield _this8.createTextDocumentPositionParams(fileVersion, position);
      const response = yield _this8._process._connection.hover(request);

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
    var _this9 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this9._process._capabilities.documentHighlightProvider) {
        return null;
      }
      const params = yield _this9.createTextDocumentPositionParams(fileVersion, position);
      const response = yield _this9._process._connection.documentHighlight(params);
      const convertHighlight = function (highlight) {
        return rangeToAtomRange(highlight.range);
      };
      return response.map(convertHighlight);
    })();
  }

  formatSource(fileVersion, atomRange) {
    var _this10 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const buffer = yield _this10.getBufferAtVersion(fileVersion);
      if (buffer == null) {
        _this10._logger.logError('LSP.formatSource - null buffer');
        return null;
      }
      const options = { tabSize: 2, insertSpaces: true };
      // TODO: from where should we pick up these options? Can we omit them?
      const params = { textDocument: toTextDocumentIdentifier(fileVersion.filePath), options };
      let edits;

      // The user might have requested to format either some or all of the buffer.
      // And the LSP server might have the capability to format some or all.
      // We'll match up the request+capability as best we can...
      const canAll = Boolean(_this10._process._capabilities.documentFormattingProvider);
      const canRange = Boolean(_this10._process._capabilities.documentRangeFormattingProvider);
      const wantAll = buffer.getRange().compare(atomRange) === 0;
      if (canAll && (wantAll || !canRange)) {
        edits = yield _this10._process._connection.documentFormatting(params);
      } else if (canRange) {
        // Range is exclusive, and Nuclide snaps it to entire rows. So range.start
        // is character 0 of the start line, and range.end is character 0 of the
        // first line AFTER the selection.
        const range = atomRangeToRange(atomRange);
        edits = yield _this10._process._connection.documentRangeFormattting(Object.assign({}, params, { range }));
      } else {
        _this10._logger.logError('LSP.formatSource - not supported by server');
        return null;
      }

      const convertRange = function (lspTextEdit) {
        return {
          oldRange: rangeToAtomRange(lspTextEdit.range),
          newText: lspTextEdit.newText
        };
      };
      return edits.map(convertRange);
    })();
  }

  formatEntireFile(fileVersion, range) {
    // A language service implements either formatSource or formatEntireFile,
    // and we should pick formatSource in our AtomLanguageServiceConfig.
    this._logger.logError('LSP CodeFormat providers should use formatEntireFile: false');
    return Promise.resolve(null);
  }

  getEvaluationExpression(fileVersion, position) {
    this._logger.logError('NYI: getEvaluationExpression');
    return Promise.resolve(null);
  }

  supportsSymbolSearch(directories) {
    return Promise.resolve(Boolean(this._process._capabilities.workspaceSymbolProvider));
  }

  symbolSearch(query, directories) {
    var _this11 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!_this11._process._capabilities.workspaceSymbolProvider) {
        return null;
      }
      const result = yield _this11._process._connection.workspaceSymbol({ query });
      return result.map(convertSearchResult);
    })();
  }

  getProjectRoot(fileUri) {
    this._logger.logError('NYI: getProjectRoot');
    return Promise.resolve(null);
  }

  isFileInProject(fileUri) {
    this._logger.logError('NYI: isFileInProject');
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

  locationToFindReference(location) {
    return {
      uri: location.uri,
      name: null,
      range: rangeToAtomRange(location.range)
    };
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
    var _this12 = this;

    return (0, _asyncToGenerator.default)(function* () {
      yield _this12.getBufferAtVersion(fileVersion);
      return createTextDocumentPositionParams(fileVersion, position);
    })();
  }
}

exports.LanguageServerProtocolProcess = LanguageServerProtocolProcess; // Encapsulates an LSP process
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 */

class LspProcess {

  constructor(logger, process, projectRoot, isIpc) {
    this._logger = logger;
    this._process = process;
    this._projectRoot = projectRoot;

    this._logger.logInfo('LanguageServerProtocolProcess - created child process with PID: ' + process.pid);

    process.stdin.on('error', error => {
      this._logger.logError('LanguageServerProtocolProcess - error writing data: ' + error);
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

    this._connection = new (_languageserver || _load_languageserver()).LanguageServerV2(this._logger, connection);
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

function atomRangeToRange(range) {
  return {
    start: pointToPosition(range.start),
    end: pointToPosition(range.end)
  };
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
    case (_protocol || _load_protocol()).DiagnosticSeverity.Error:
    default:
      return 'Error';
    case (_protocol || _load_protocol()).DiagnosticSeverity.Warning:
    case (_protocol || _load_protocol()).DiagnosticSeverity.Information:
    case (_protocol || _load_protocol()).DiagnosticSeverity.Hint:
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

// Converts an LSP SymbolInformation.kind number into an Atom icon
// from https://github.com/atom/atom/blob/master/static/octicons.less -
// you can see the pictures at https://octicons.github.com/
function symbolKindToAtomIcon(kind) {
  // for reference, vscode: https://github.com/Microsoft/vscode/blob/be08f9f3a1010354ae2d8b84af017ed1043570e7/src/vs/editor/contrib/suggest/browser/media/suggest.css#L135
  // for reference, hack: https://github.com/facebook/nuclide/blob/20cf17dca439e02a64f4365f3a52b0f26cf53726/pkg/nuclide-hack-rpc/lib/SymbolSearch.js#L120
  switch (kind) {
    case (_protocol || _load_protocol()).SymbolKind.File:
      return 'file';
    case (_protocol || _load_protocol()).SymbolKind.Module:
      return 'file-submodule';
    case (_protocol || _load_protocol()).SymbolKind.Namespace:
      return 'file-submodule';
    case (_protocol || _load_protocol()).SymbolKind.Package:
      return 'package';
    case (_protocol || _load_protocol()).SymbolKind.Class:
      return 'code';
    case (_protocol || _load_protocol()).SymbolKind.Method:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Property:
      return 'key';
    case (_protocol || _load_protocol()).SymbolKind.Field:
      return 'key';
    case (_protocol || _load_protocol()).SymbolKind.Constructor:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Enum:
      return 'file-binary';
    case (_protocol || _load_protocol()).SymbolKind.Interface:
      return 'puzzle';
    case (_protocol || _load_protocol()).SymbolKind.Function:
      return 'zap';
    case (_protocol || _load_protocol()).SymbolKind.Variable:
      return 'pencil';
    case (_protocol || _load_protocol()).SymbolKind.Constant:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.String:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Number:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Boolean:
      return 'quote';
    case (_protocol || _load_protocol()).SymbolKind.Array:
      return 'list-ordered';
    default:
      return 'question';
  }
}

// Converts an LSP SymbolInformation into TokenizedText
function symbolToTokenizedText(symbol) {
  const tokens = [];

  // The TokenizedText ontology is deliberately small, much smaller than
  // SymbolInformation.kind, because it's used for colorization and you don't
  // want your colorized text looking like a fruit salad.
  switch (symbol.kind) {
    case (_protocol || _load_protocol()).SymbolKind.File:
    case (_protocol || _load_protocol()).SymbolKind.Module:
    case (_protocol || _load_protocol()).SymbolKind.Package:
    case (_protocol || _load_protocol()).SymbolKind.Namespace:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Class:
    case (_protocol || _load_protocol()).SymbolKind.Interface:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).className)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Constructor:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).constructor)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.Method:
    case (_protocol || _load_protocol()).SymbolKind.Property:
    case (_protocol || _load_protocol()).SymbolKind.Field:
    case (_protocol || _load_protocol()).SymbolKind.Enum:
    case (_protocol || _load_protocol()).SymbolKind.Function:
    case (_protocol || _load_protocol()).SymbolKind.Constant:
    case (_protocol || _load_protocol()).SymbolKind.Variable:
    case (_protocol || _load_protocol()).SymbolKind.Array:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).method)(symbol.name));
      break;
    case (_protocol || _load_protocol()).SymbolKind.String:
    case (_protocol || _load_protocol()).SymbolKind.Number:
    case (_protocol || _load_protocol()).SymbolKind.Boolean:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).string)(symbol.name));
      break;
    default:
      tokens.push((0, (_tokenizedText || _load_tokenizedText()).plain)(symbol.name));
  }

  return tokens;
}

function convertSearchResult(info) {
  let hoverText = 'unknown';
  for (const key in (_protocol || _load_protocol()).SymbolKind) {
    if (info.kind === (_protocol || _load_protocol()).SymbolKind[key]) {
      hoverText = key;
    }
  }
  return {
    path: info.location.uri,
    line: info.location.range.start.line,
    column: info.location.range.start.character,
    name: info.name,
    containerName: info.containerName,
    icon: symbolKindToAtomIcon(info.kind),
    hoverText
  };
}