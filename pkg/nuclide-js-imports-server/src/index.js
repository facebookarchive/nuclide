'use strict';

var _idx;

function _load_idx() {
  return _idx = _interopRequireDefault(require('idx'));
}

var _vscodeLanguageserver;

function _load_vscodeLanguageserver() {
  return _vscodeLanguageserver = require('vscode-languageserver');
}

var _vscodeJsonrpc;

function _load_vscodeJsonrpc() {
  return _vscodeJsonrpc = require('vscode-jsonrpc');
}

var _log4js;

function _load_log4js() {
  return _log4js = require('log4js');
}

var _SafeStreamMessageReader;

function _load_SafeStreamMessageReader() {
  return _SafeStreamMessageReader = _interopRequireDefault(require('../../../modules/nuclide-commons/SafeStreamMessageReader'));
}

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('./lib/AutoImportsManager');
}

var _TextDocuments;

function _load_TextDocuments() {
  return _TextDocuments = _interopRequireDefault(require('../../nuclide-lsp-implementation-common/TextDocuments'));
}

var _ImportFormatter;

function _load_ImportFormatter() {
  return _ImportFormatter = require('./lib/ImportFormatter');
}

var _Completions;

function _load_Completions() {
  return _Completions = require('./Completions');
}

var _Diagnostics;

function _load_Diagnostics() {
  return _Diagnostics = require('./Diagnostics');
}

var _Settings;

function _load_Settings() {
  return _Settings = require('./Settings');
}

var _CodeActions;

function _load_CodeActions() {
  return _CodeActions = require('./CodeActions');
}

var _CommandExecutor;

function _load_CommandExecutor() {
  return _CommandExecutor = require('./CommandExecutor');
}

var _initializeLogging;

function _load_initializeLogging() {
  return _initializeLogging = _interopRequireDefault(require('../logging/initializeLogging'));
}

var _Config;

function _load_Config() {
  return _Config = require('./Config');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('../../../modules/nuclide-commons/nuclideUri'));
}

var _constantsForClient;

function _load_constantsForClient() {
  return _constantsForClient = require('./utils/constantsForClient');
}

var _WorkspaceSymbols;

function _load_WorkspaceSymbols() {
  return _WorkspaceSymbols = require('./WorkspaceSymbols');
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

const reader = new (_SafeStreamMessageReader || _load_SafeStreamMessageReader()).default(process.stdin);
const writer = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(process.stdout);

const connection = (0, (_vscodeLanguageserver || _load_vscodeLanguageserver()).createConnection)(reader, writer);
(0, (_initializeLogging || _load_initializeLogging()).default)(connection);

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-js-imports-server');

const documents = new (_TextDocuments || _load_TextDocuments()).default();

// This will be set based on initializationOptions.
const shouldProvideFlags = {
  diagnostics: false
};

let autoImportsManager = new (_AutoImportsManager || _load_AutoImportsManager()).AutoImportsManager([]);
let importFormatter = new (_ImportFormatter || _load_ImportFormatter()).ImportFormatter([], false);
let completion = new (_Completions || _load_Completions()).Completions(autoImportsManager.getDefinitionManager(), documents, autoImportsManager, importFormatter);
let diagnostics = new (_Diagnostics || _load_Diagnostics()).Diagnostics(autoImportsManager, importFormatter);
let codeActions = new (_CodeActions || _load_CodeActions()).CodeActions(autoImportsManager, importFormatter);
let commandExecuter = new (_CommandExecutor || _load_CommandExecutor()).CommandExecutor(connection, autoImportsManager, importFormatter, documents);

connection.onInitialize(params => {
  const root = params.rootPath || process.cwd();
  const eslintGlobals = (0, (_Config || _load_Config()).getEslintGlobals)(root);
  const flowConfig = (0, (_Config || _load_Config()).getConfigFromFlow)(root);
  shouldProvideFlags.diagnostics = shouldProvideDiagnostics(params, root);
  importFormatter = new (_ImportFormatter || _load_ImportFormatter()).ImportFormatter(flowConfig.moduleDirs, shouldUseRequires(params, root));
  autoImportsManager = new (_AutoImportsManager || _load_AutoImportsManager()).AutoImportsManager(eslintGlobals, params.initializationOptions.componentModulePathFilter);
  autoImportsManager.indexAndWatchDirectory(root);
  completion = new (_Completions || _load_Completions()).Completions(autoImportsManager.getDefinitionManager(), documents, autoImportsManager, importFormatter);
  diagnostics = new (_Diagnostics || _load_Diagnostics()).Diagnostics(autoImportsManager, importFormatter);
  codeActions = new (_CodeActions || _load_CodeActions()).CodeActions(autoImportsManager, importFormatter);
  commandExecuter = new (_CommandExecutor || _load_CommandExecutor()).CommandExecutor(connection, autoImportsManager, importFormatter, documents);
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: getAllTriggerCharacters()
      },
      codeActionProvider: true,
      documentFormattingProvider: true,
      executeCommandProvider: Array.from(Object.keys((_CommandExecutor || _load_CommandExecutor()).CommandExecutor.COMMANDS)),
      workspaceSymbolProvider: true
    }
  };
});

documents.onDidOpenTextDocument(params => {
  try {
    const uri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(params.textDocument.uri);
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
    const uri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(params.textDocument.uri);
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
  connection.sendDiagnostics({ uri: params.textDocument.uri, diagnostics: [] });
});

function findAndSendDiagnostics(text, uri) {
  if (shouldProvideFlags.diagnostics) {
    const diagnosticsForFile = diagnostics.findDiagnosticsForFile(text, uri);
    connection.sendDiagnostics({
      uri: (_nuclideUri || _load_nuclideUri()).default.nuclideUriToUri(uri),
      diagnostics: diagnosticsForFile
    });
  }
}

// Code completion:
connection.onCompletion(textDocumentPosition => {
  const nuclideFormattedUri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(textDocumentPosition.textDocument.uri);
  return nuclideFormattedUri != null ? completion.provideCompletions(textDocumentPosition, nuclideFormattedUri) : [];
});

connection.onCodeAction(codeActionParams => {
  try {
    const uri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(codeActionParams.textDocument.uri);
    return uri != null ? codeActions.provideCodeActions(codeActionParams.context && codeActionParams.context.diagnostics, uri) : [];
  } catch (error) {
    logger.error(error);
    return [];
  }
});

connection.onExecuteCommand(params => {
  const { command, arguments: args } = params;
  logger.debug('Executing command', command, 'with args', args);
  commandExecuter.executeCommand(command, args);
});

connection.onWorkspaceSymbol(params => {
  return (_WorkspaceSymbols || _load_WorkspaceSymbols()).WorkspaceSymbols.getWorkspaceSymbols(autoImportsManager, params);
});

connection.onDocumentFormatting(params => {
  const fileUri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(params.textDocument.uri);
  return Promise.resolve(params.options.tabSize !== (_constantsForClient || _load_constantsForClient()).TAB_SIZE_SIGNIFYING_FIX_ALL_IMPORTS_FORMATTING || fileUri == null ? [] : commandExecuter.getEditsForFixingAllImports(fileUri));
});

documents.listen(connection);
connection.listen();

function getAllTriggerCharacters() {
  const characters = [' ', '}', '='];
  // Add all the characters from A-z
  for (let char = 'A'.charCodeAt(0); char <= 'z'.charCodeAt(0); char++) {
    characters.push(String.fromCharCode(char));
  }
  return characters;
}

function shouldProvideDiagnostics(params, root) {
  var _ref, _ref2;

  const diagnosticsWhitelist = ((_ref = params) != null ? (_ref2 = _ref.initializationOptions) != null ? _ref2.diagnosticsWhitelist : _ref2 : _ref) || [];
  return diagnosticsWhitelist.length !== 0 ? diagnosticsWhitelist.some(regex => root.match(new RegExp(regex))) : (_Settings || _load_Settings()).Settings.shouldProvideDiagnosticsDefault;
}

function shouldUseRequires(params, root) {
  var _ref3, _ref4;

  const requiresWhitelist = ((_ref3 = params) != null ? (_ref4 = _ref3.initializationOptions) != null ? _ref4.requiresWhitelist : _ref4 : _ref3) || [];
  return requiresWhitelist.some(regex => root.match(new RegExp(regex)));
}