'use strict';

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

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('./lib/AutoImportsManager');
}

var _TextDocuments;

function _load_TextDocuments() {
  return _TextDocuments = _interopRequireDefault(require('./TextDocuments'));
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

var _CommandExecuter;

function _load_CommandExecuter() {
  return _CommandExecuter = require('./CommandExecuter');
}

var _initializeLogging;

function _load_initializeLogging() {
  return _initializeLogging = _interopRequireDefault(require('../logging/initializeLogging'));
}

var _getConfig;

function _load_getConfig() {
  return _getConfig = require('./getConfig');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
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

const reader = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageReader(process.stdin);
const writer = new (_vscodeJsonrpc || _load_vscodeJsonrpc()).StreamMessageWriter(process.stdout);

const connection = (0, (_vscodeLanguageserver || _load_vscodeLanguageserver()).createConnection)(reader, writer);
(0, (_initializeLogging || _load_initializeLogging()).default)(connection);

const logger = (0, (_log4js || _load_log4js()).getLogger)('nuclide-js-imports-server');

const documents = new (_TextDocuments || _load_TextDocuments()).default();

// This will be set based on initializationOptions.
const shouldProvideFlags = {
  diagnostics: false,
  autocomplete: false
};

let autoImportsManager = new (_AutoImportsManager || _load_AutoImportsManager()).AutoImportsManager([]);
let importFormatter = new (_ImportFormatter || _load_ImportFormatter()).ImportFormatter([], false);
let completion = new (_Completions || _load_Completions()).Completions(documents, autoImportsManager, importFormatter, false);
let diagnostics = new (_Diagnostics || _load_Diagnostics()).Diagnostics(autoImportsManager, importFormatter);
let codeActions = new (_CodeActions || _load_CodeActions()).CodeActions(autoImportsManager, importFormatter);
let commandExecuter = new (_CommandExecuter || _load_CommandExecuter()).CommandExecuter(connection, importFormatter, documents);

connection.onInitialize(params => {
  const root = params.rootPath || process.cwd();
  logger.debug('Server initialized.');
  const envs = (0, (_getConfig || _load_getConfig()).getEslintEnvs)(root);
  const flowConfig = (0, (_getConfig || _load_getConfig()).getConfigFromFlow)(root);
  shouldProvideFlags.diagnostics = shouldProvideDiagnostics(params, root);
  shouldProvideFlags.autocomplete = shouldProvideAutocomplete(params, root);
  if (!shouldProvideFlags.diagnostics && !shouldProvideFlags.autocomplete) {
    // We aren't providing autocomplete or diagnostics (+ code actions)
    return {
      capabilities: {
        textDocumentSync: {
          openClose: false,
          change: 0 }
      }
    };
  }
  importFormatter = new (_ImportFormatter || _load_ImportFormatter()).ImportFormatter(flowConfig.moduleDirs, flowConfig.hasteSettings.isHaste);
  autoImportsManager = new (_AutoImportsManager || _load_AutoImportsManager()).AutoImportsManager(envs);
  autoImportsManager.indexAndWatchDirectory(root);
  completion = new (_Completions || _load_Completions()).Completions(documents, autoImportsManager, importFormatter, flowConfig.hasteSettings.isHaste);
  diagnostics = new (_Diagnostics || _load_Diagnostics()).Diagnostics(autoImportsManager, importFormatter);
  codeActions = new (_CodeActions || _load_CodeActions()).CodeActions(autoImportsManager, importFormatter);
  commandExecuter = new (_CommandExecuter || _load_CommandExecuter()).CommandExecuter(connection, importFormatter, documents);
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: getAllTriggerCharacters()
      },
      codeActionProvider: true,
      executeCommandProvider: Array.from(Object.keys((_CommandExecuter || _load_CommandExecuter()).CommandExecuter.COMMANDS))
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
    const uri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(params.document.uri);
    if (uri != null) {
      autoImportsManager.workerIndexFile(uri, params.document.getText());
      findAndSendDiagnostics(params.document.getText(), uri);
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
  if (shouldProvideFlags.autocomplete) {
    const nuclideFormattedUri = (_nuclideUri || _load_nuclideUri()).default.uriToNuclideUri(textDocumentPosition.textDocument.uri);
    return nuclideFormattedUri != null ? completion.provideCompletions(textDocumentPosition, nuclideFormattedUri) : [];
  }
  return [];
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
  return params.initializationOptions != null && params.initializationOptions.diagnosticsWhitelist != null && params.initializationOptions.diagnosticsWhitelist.length !== 0 ? params.initializationOptions.diagnosticsWhitelist.some(regex => root.match(new RegExp(regex))) : (_Settings || _load_Settings()).Settings.shouldProvideDiagnosticsDefault;
}

function shouldProvideAutocomplete(params, root) {
  return params.initializationOptions != null && params.initializationOptions.autocompleteWhitelist != null && params.initializationOptions.diagnosticsWhitelist.length !== 0 ? params.initializationOptions.autocompleteWhitelist.some(regex => root.match(new RegExp(regex))) : (_Settings || _load_Settings()).Settings.shouldProvideAutocompleteDefault;
}