"use strict";

function _vscodeLanguageserver() {
  const data = require("vscode-languageserver");

  _vscodeLanguageserver = function () {
    return data;
  };

  return data;
}

function _vscodeJsonrpc() {
  const data = require("vscode-jsonrpc");

  _vscodeJsonrpc = function () {
    return data;
  };

  return data;
}

function _log4js() {
  const data = require("log4js");

  _log4js = function () {
    return data;
  };

  return data;
}

function _SafeStreamMessageReader() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/SafeStreamMessageReader"));

  _SafeStreamMessageReader = function () {
    return data;
  };

  return data;
}

function _AutoImportsManager() {
  const data = require("./lib/AutoImportsManager");

  _AutoImportsManager = function () {
    return data;
  };

  return data;
}

function _TextDocuments() {
  const data = _interopRequireDefault(require("../../nuclide-lsp-implementation-common/TextDocuments"));

  _TextDocuments = function () {
    return data;
  };

  return data;
}

function _ImportFormatter() {
  const data = require("./lib/ImportFormatter");

  _ImportFormatter = function () {
    return data;
  };

  return data;
}

function _Completions() {
  const data = require("./Completions");

  _Completions = function () {
    return data;
  };

  return data;
}

function _Diagnostics() {
  const data = require("./Diagnostics");

  _Diagnostics = function () {
    return data;
  };

  return data;
}

function _Settings() {
  const data = require("./Settings");

  _Settings = function () {
    return data;
  };

  return data;
}

function _CodeActions() {
  const data = require("./CodeActions");

  _CodeActions = function () {
    return data;
  };

  return data;
}

function _CommandExecutor() {
  const data = require("./CommandExecutor");

  _CommandExecutor = function () {
    return data;
  };

  return data;
}

function _initializeLogging() {
  const data = _interopRequireDefault(require("../logging/initializeLogging"));

  _initializeLogging = function () {
    return data;
  };

  return data;
}

function _Config() {
  const data = require("./Config");

  _Config = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _constantsForClient() {
  const data = require("./utils/constantsForClient");

  _constantsForClient = function () {
    return data;
  };

  return data;
}

function _WorkspaceSymbols() {
  const data = require("./WorkspaceSymbols");

  _WorkspaceSymbols = function () {
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
const reader = new (_SafeStreamMessageReader().default)(process.stdin);
const writer = new (_vscodeJsonrpc().StreamMessageWriter)(process.stdout);
const connection = (0, _vscodeLanguageserver().createConnection)(reader, writer);
(0, _initializeLogging().default)(connection);
const logger = (0, _log4js().getLogger)('nuclide-js-imports-server');
const documents = new (_TextDocuments().default)(); // This will be set based on initializationOptions.

const shouldProvideFlags = {
  diagnostics: false
};
let autoImportsManager = new (_AutoImportsManager().AutoImportsManager)([]);
let importFormatter = new (_ImportFormatter().ImportFormatter)([], false);
let completion = new (_Completions().Completions)(autoImportsManager.getDefinitionManager(), documents, autoImportsManager, importFormatter);
let diagnostics = new (_Diagnostics().Diagnostics)(autoImportsManager, importFormatter);
let codeActions = new (_CodeActions().CodeActions)(autoImportsManager, importFormatter);
let commandExecuter = new (_CommandExecutor().CommandExecutor)(connection, autoImportsManager, importFormatter, documents);
connection.onInitialize(params => {
  const root = params.rootPath || process.cwd();
  const eslintGlobals = (0, _Config().getEslintGlobals)(root);
  const flowConfig = (0, _Config().getConfigFromFlow)(root);
  shouldProvideFlags.diagnostics = shouldProvideDiagnostics(params, root);
  importFormatter = new (_ImportFormatter().ImportFormatter)(flowConfig.moduleDirs, shouldUseRequires(params, root));
  autoImportsManager = new (_AutoImportsManager().AutoImportsManager)(eslintGlobals, params.initializationOptions.componentModulePathFilter);
  autoImportsManager.indexAndWatchDirectory(root);
  completion = new (_Completions().Completions)(autoImportsManager.getDefinitionManager(), documents, autoImportsManager, importFormatter);
  diagnostics = new (_Diagnostics().Diagnostics)(autoImportsManager, importFormatter);
  codeActions = new (_CodeActions().CodeActions)(autoImportsManager, importFormatter);
  commandExecuter = new (_CommandExecutor().CommandExecutor)(connection, autoImportsManager, importFormatter, documents);
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: getAllTriggerCharacters()
      },
      codeActionProvider: true,
      documentFormattingProvider: true,
      executeCommandProvider: Array.from(Object.keys(_CommandExecutor().CommandExecutor.COMMANDS)),
      workspaceSymbolProvider: true,
      hoverProvider: true
    }
  };
});
documents.onDidOpenTextDocument(params => {
  try {
    const uri = _nuclideUri().default.uriToNuclideUri(params.textDocument.uri);

    if (uri != null) {
      autoImportsManager.workerIndexFile(uri, params.textDocument.getText());
      findAndSendDiagnostics(params.textDocument.getText(), uri);
    }
  } catch (e) {
    logger.error(e);
  }
});
documents.onDidChangeContent(params => {
  try {
    const uri = _nuclideUri().default.uriToNuclideUri(params.textDocument.uri);

    if (uri != null) {
      autoImportsManager.workerIndexFile(uri, params.textDocument.getText());
      findAndSendDiagnostics(params.textDocument.getText(), uri);
    }
  } catch (e) {
    logger.error(e);
  }
});
documents.onDidClose(params => {
  // Clear out diagnostics.
  connection.sendDiagnostics({
    uri: params.textDocument.uri,
    diagnostics: []
  });
});

function findAndSendDiagnostics(text, uri) {
  if (shouldProvideFlags.diagnostics) {
    const diagnosticsForFile = diagnostics.findDiagnosticsForFile(text, uri);
    connection.sendDiagnostics({
      uri: _nuclideUri().default.nuclideUriToUri(uri),
      diagnostics: diagnosticsForFile
    });
  }
}

connection.onHover(hoverRequest => {
  return autoImportsManager.getDefinitionManager().getHover(documents.get(hoverRequest.textDocument.uri), hoverRequest);
}); // Code completion:

connection.onCompletion(textDocumentPosition => {
  const nuclideFormattedUri = _nuclideUri().default.uriToNuclideUri(textDocumentPosition.textDocument.uri);

  return nuclideFormattedUri != null ? completion.provideCompletions(textDocumentPosition, nuclideFormattedUri) : [];
});
connection.onCodeAction(codeActionParams => {
  try {
    const uri = _nuclideUri().default.uriToNuclideUri(codeActionParams.textDocument.uri);

    return uri != null ? codeActions.provideCodeActions(codeActionParams.context && codeActionParams.context.diagnostics, uri) : [];
  } catch (error) {
    logger.error(error);
    return [];
  }
});
connection.onExecuteCommand(params => {
  const {
    command,
    arguments: args
  } = params;
  logger.debug('Executing command', command, 'with args', args);
  commandExecuter.executeCommand(command, args);
});
connection.onWorkspaceSymbol(params => {
  return _WorkspaceSymbols().WorkspaceSymbols.getWorkspaceSymbols(autoImportsManager, params);
});
connection.onDocumentFormatting(params => {
  const fileUri = _nuclideUri().default.uriToNuclideUri(params.textDocument.uri);

  return Promise.resolve(params.options.tabSize !== _constantsForClient().TAB_SIZE_SIGNIFYING_FIX_ALL_IMPORTS_FORMATTING || fileUri == null ? [] : commandExecuter.getEditsForFixingAllImports(fileUri));
});
documents.listen(connection);
connection.listen();

function getAllTriggerCharacters() {
  const characters = [' ', '}', '=']; // Add all the characters from A-z

  for (let char = 'A'.charCodeAt(0); char <= 'z'.charCodeAt(0); char++) {
    characters.push(String.fromCharCode(char));
  }

  return characters;
}

function shouldProvideDiagnostics(params, root) {
  var _ref;

  const diagnosticsWhitelist = ((_ref = params) != null ? (_ref = _ref.initializationOptions) != null ? _ref.diagnosticsWhitelist : _ref : _ref) || [];
  return diagnosticsWhitelist.length !== 0 ? diagnosticsWhitelist.some(regex => root.match(new RegExp(regex))) : _Settings().Settings.shouldProvideDiagnosticsDefault;
}

function shouldUseRequires(params, root) {
  var _ref2;

  const requiresWhitelist = ((_ref2 = params) != null ? (_ref2 = _ref2.initializationOptions) != null ? _ref2.requiresWhitelist : _ref2 : _ref2) || [];
  return requiresWhitelist.some(regex => root.match(new RegExp(regex)));
}