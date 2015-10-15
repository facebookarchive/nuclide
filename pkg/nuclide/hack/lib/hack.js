'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HackReference} from 'nuclide-hack-common';
import type {HackDiagnosticItem} from './types';

var invariant = require('assert');
var {getClient, getFileSystemServiceByNuclideUri} = require('nuclide-client');
var {extractWordAtPosition} = require('nuclide-atom-helpers');
var HackLanguage = require('./HackLanguage');
var logger = require('nuclide-logging').getLogger();
var {awaitMilliSeconds} = require('nuclide-commons').promises;
var {parse, getPath} = require('nuclide-remote-uri');

var pathUtil = require('path');

const NULL_CONNECTION_ID = 'null';
const HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

/**
 * This is responsible for managing (creating/disposing) multiple HackLanguage instances,
 * creating the designated HackService instances with the NuclideClient it needs per remote project.
 * Also, it deelegates the language feature request to the correct HackLanguage instance.
 */
var clientToHackLanguage: {[clientId: string]: HackLanguage} = {};
var HH_DIAGNOSTICS_DELAY_MS = 3000;

module.exports = {

  async findDiagnostics(
    editor: TextEditor
  ): Promise<Array<HackDiagnosticItem>> {
    var buffer = editor.getBuffer();
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (!hackLanguage) {
      return [];
    }

    var {path, protocol, host} = parse(editor.getPath());
    var contents = editor.getText();

    // Work around `hh_client` returns server busy error, and fails retrying (when enabled),
    // if a `check` call is made before 3 seconds of a file being saved.
    await awaitMilliSeconds(HH_DIAGNOSTICS_DELAY_MS);

    var diagnostics;
    if (hackLanguage.isHackClientAvailable()) {
      diagnostics = await hackLanguage.getServerDiagnostics();
    } else {
      diagnostics = await hackLanguage.getDiagnostics(path, contents);
    }

    diagnostics.forEach(diagnostic => {
      // Preserve original Nuclide URI so remote files return with a "nuclide://" prefix and are
      // associated with the correct TextEditor and tab.
      diagnostic.filePath = getFilePath(diagnostic.filePath, protocol, host);
    });

    return diagnostics;
  },

  async fetchCompletionsForEditor(editor: TextEditor, prefix: string): Promise<Array<any>> {
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (!hackLanguage) {
      return [];
    }

    var path = getPath(editor.getPath());
    var contents = editor.getText();
    var cursor = editor.getLastCursor();
    var offset = editor.getBuffer().characterIndexForPosition(cursor.getBufferPosition());
    // The returned completions may have unrelated results, even though the offset is set on the end of the prefix.
    var completions = await hackLanguage.getCompletions(path, contents, offset);
    // Filter out the completions that do not contain the prefix as a token in the match text case insentively.
    var tokenLowerCase = prefix.toLowerCase();

    var {compareHackCompletions} = require('./utils');
    var hackCompletionsCompartor = compareHackCompletions(prefix);

    return completions
      .filter(completion => completion.matchText.toLowerCase().indexOf(tokenLowerCase) >= 0)
      // Sort the auto-completions based on a scoring function considering:
      // case sensitivity, position in the completion, private functions and alphabetical order.
      .sort((completion1, completion2) => hackCompletionsCompartor(completion1.matchText, completion2.matchText));
  },

  async formatSourceFromEditor(editor: TextEditor, range: Range): Promise<string> {
    var buffer = editor.getBuffer();
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (!hackLanguage) {
      return buffer.getTextInRange(range);
    }

    var startPosition = buffer.characterIndexForPosition(range.start);
    var endPosition = buffer.characterIndexForPosition(range.end);
    return await hackLanguage.formatSource(buffer.getText(), startPosition + 1, endPosition + 1);
  },

  async typeHintFromEditor(editor: TextEditor, position: Point): Promise<?TypeHint> {
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (!hackLanguage) {
      return null;
    }

    var matchData = extractWordAtPosition(editor, position, HACK_WORD_REGEX);
    if (!matchData) {
      return null;
    }

    var path = getPath(editor.getPath());
    var contents = editor.getText();

    var type = await hackLanguage.getType(path, contents, matchData.wordMatch[0], position.row + 1, position.column + 1);
    if (!type || type === '_') {
      return null;
    } else {
      return {
        hint: type,
        range: matchData.range,
      };
    }
  },

  /**
   * If a location can be found for the declaration, the return value will
   * resolve to an object with these fields: file, line, column.
   */
  async findDefinition(editor: TextEditor, line: number, column: number): Promise<any> {
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (!hackLanguage) {
      return null;
    }

    var {path, protocol, host} = parse(editor.getPath());

    var contents = editor.getText();
    var buffer = editor.getBuffer();
    var lineText = buffer.lineForRow(line);
    var result = await hackLanguage.getDefinition(path, contents, line + 1, column + 1, lineText);
    if (!result || !result.length) {
      return null;
    }
    var pos = result[0];
    var range = null;
    // If the search string was expanded to include more than a valid regex php word.
    // e.g. in case of XHP tags, the start and end column are provided to underline the full range
    // to visit its definition.
    if (pos.searchStartColumn && pos.searchEndColumn) {
      var {Range} = require('atom');
      range = new Range([line, pos.searchStartColumn], [line, pos.searchEndColumn]);
    }
    return {
      file: getFilePath(pos.path, protocol, host),
      line: pos.line,
      column: pos.column,
      range,
    };
  },

  async findReferences(
    editor: TextEditor,
    line: number,
    column: number
  ): Promise<?{baseUri: string, symbolName: string; references: Array<HackReference>}> {
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (!hackLanguage) {
      return null;
    }

    var {path, protocol, host} = parse(editor.getPath());
    var contents = editor.getText();
    var symbol = await hackLanguage.getSymbolNameAtPositionWithDependencies(
      path,
      contents,
      line + 1,
      column + 1
    );
    if (!symbol) {
      return null;
    }
    var references = await hackLanguage.getReferences(contents, symbol.name);
    if (!references) {
      return null;
    }
    // Transform filenames back to Nuclide URIs.
    references.forEach(ref => {
      ref.filename = getFilePath(ref.filename, protocol, host);
    });
    var baseUri = getFilePath(hackLanguage.getBasePath(), protocol, host);
    return {baseUri, symbolName: symbol.name, references};
  },

  async isFinishedLoadingDependencies(editor: TextEditor): Promise<boolean> {
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    return hackLanguage.isFinishedLoadingDependencies();
  },

  async onFinishedLoadingDependencies(
    editor: TextEditor,
    callback: (() => mixed),
  ): Promise<atom$Disposable> {
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    return hackLanguage.onFinishedLoadingDependencies(callback);
  },

  getHackLanguageForUri,
  getCachedHackLanguageForUri,
};

function getFilePath(filePath: string, protocol: ?string, host: ?string): string {
  if (!protocol || !host) {
    return filePath;
  }
  return protocol + '//' + host + filePath;
}

function getClientId(buffer: TextBuffer): string {
  // A client id is needed when a client is verified to exist for that buffer and a HackLanguage exists.
  var client = getClient(buffer.getUri());
  invariant(client);
  return client.getID();
}

function getCachedHackLanguageForUri(uri: NuclideUri): ?HackLanguage {
  var client = getClient(uri);
  if (!client) {
    return null;
  }
  return clientToHackLanguage[client.getID()];
}

function getHackLanguageForUri(uri: NuclideUri): Promise<?HackLanguage> {
  var filePath = getPath(uri);
  // `getClient` can return null if a file path doesn't have a root directory in the tree.
  // Also, returns null when reloading Atom with open files, while the RemoteConnection creation is pending.
  var client = getClient(uri);
  if (!client) {
    return null;
  }
  return createHackLanguageIfNotExisting(uri, client, filePath);
}

async function createHackLanguageIfNotExisting(uri: NuclideUri, client: NuclideClient,
      filePath: string): Promise<HackLanguage> {
  var clientId = client.getID();
  if (clientToHackLanguage[clientId]) {
    return clientToHackLanguage[clientId];
  }
  var hackClient;
  var [isHackClientAvailable, nearestPath] = await Promise.all([
    client.isHackClientAvailable(),
    getFileSystemServiceByNuclideUri(uri).findNearestFile('.hhconfig', pathUtil.dirname(filePath)),
  ]);
  // If multiple calls, were done asynchronously, make sure to return the single-created HackLanguage.
  if (clientToHackLanguage[clientId]) {
    return clientToHackLanguage[clientId];
  }
  if (isHackClientAvailable && nearestPath) {
    hackClient = client;
  } else {
    hackClient = null;
  }
  clientToHackLanguage[clientId] = new HackLanguage(hackClient, nearestPath);
  return clientToHackLanguage[clientId];
}
