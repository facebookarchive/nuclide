/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {
  createConnection,
  CompletionItem,
  TextDocumentPositionParams,
  IConnection,
  InitializeResult,
} from 'vscode-languageserver';

import {StreamMessageReader, StreamMessageWriter} from 'vscode-jsonrpc';
import {getLogger} from 'log4js';

import {AutoImportsManager} from './lib/AutoImportsManager';
import TextDocuments from './TextDocuments';
import {ImportFormatter} from './lib/ImportFormatter';
import {Completions} from './Completions';
import {Diagnostics} from './Diagnostics';
import {Settings} from './Settings';

import initializeLogging from '../logging/initializeLogging';
import {getEslintEnvs, getConfigFromFlow} from './getConfig';
import nuclideUri from 'nuclide-commons/nuclideUri';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

const reader = new StreamMessageReader(process.stdin);
const writer = new StreamMessageWriter(process.stdout);

const connection: IConnection = createConnection(reader, writer);
initializeLogging(connection);

const logger = getLogger('nuclide-js-imports-server');

const documents: TextDocuments = new TextDocuments();

let autoImportsManager = new AutoImportsManager([]);
let importFormatter = new ImportFormatter([]);
let completion = new Completions(
  documents,
  autoImportsManager,
  importFormatter,
  false,
);
let diagnostics = new Diagnostics(autoImportsManager, importFormatter);

connection.onInitialize((params): InitializeResult => {
  const root = params.rootPath || process.cwd();
  logger.debug('Server initialized.');
  const envs = getEslintEnvs(root);
  const flowConfig = getConfigFromFlow(root);

  importFormatter = new ImportFormatter(flowConfig.moduleDirs);
  autoImportsManager = new AutoImportsManager(envs);
  autoImportsManager.indexAndWatchDirectory(root);
  completion = new Completions(
    documents,
    autoImportsManager,
    importFormatter,
    flowConfig.hasteSettings.isHaste,
  );
  diagnostics = new Diagnostics(autoImportsManager, importFormatter);
  return {
    capabilities: {
      textDocumentSync: documents.syncKind,
      completionProvider: {
        resolveProvider: true,
        triggerCharacters: getAllTriggerCharacters(),
      },
    },
  };
});

documents.onDidOpenTextDocument(params => {
  try {
    const uri = nuclideUri.uriToNuclideUri(params.textDocument.uri);
    // flowlint-next-line sketchy-null-string:off
    if (uri) {
      autoImportsManager.workerIndexFile(uri, params.textDocument.getText());
      findAndSendDiagnostics(params.textDocument.getText(), uri);
    }
  } catch (e) {
    logger.error(e);
  }
});

documents.onDidChangeContent(params => {
  try {
    const uri = nuclideUri.uriToNuclideUri(params.document.uri);
    // flowlint-next-line sketchy-null-string:off
    if (uri) {
      autoImportsManager.workerIndexFile(uri, params.document.getText());
      findAndSendDiagnostics(params.document.getText(), uri);
    }
  } catch (e) {
    logger.error(e);
  }
});

documents.onDidClose(params => {
  // Clear out diagnostics.
  connection.sendDiagnostics({uri: params.textDocument.uri, diagnostics: []});
});

function findAndSendDiagnostics(text: string, uri: NuclideUri): void {
  if (Settings.shouldProvideDiagnostics) {
    const diagnosticsForFile = diagnostics.findDiagnosticsForFile(text, uri);
    connection.sendDiagnostics({
      uri: nuclideUri.nuclideUriToUri(uri),
      diagnostics: diagnosticsForFile,
    });
  }
}

// Code completion:
connection.onCompletion(
  (textDocumentPosition: TextDocumentPositionParams): Array<CompletionItem> => {
    const nuclideFormattedUri = nuclideUri.uriToNuclideUri(
      textDocumentPosition.textDocument.uri,
    );
    // flowlint-next-line sketchy-null-string:off
    return nuclideFormattedUri
      ? completion.provideCompletions(textDocumentPosition, nuclideFormattedUri)
      : [];
  },
);

documents.listen(connection);
connection.listen();

function getAllTriggerCharacters(): Array<string> {
  const characters = [' ', '}', '='];
  // Add all the characters from A-z
  for (let char = 'A'.charCodeAt(0); char <= 'z'.charCodeAt(0); char++) {
    characters.push(String.fromCharCode(char));
  }
  return characters;
}
