'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HackReference} from 'nuclide-hack-base/lib/types';
import type {HackDiagnosticItem} from './types';

import invariant from 'assert';
import {getClient, getFileSystemServiceByNuclideUri} from 'nuclide-client';
import {extractWordAtPosition} from 'nuclide-atom-helpers';
import HackLanguage from './HackLanguage';
import {getPath} from 'nuclide-remote-uri';
import {Range} from 'atom';
import pathUtil from 'path';

const {awaitMilliSeconds} = require('nuclide-commons').promises;

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
    const filePath = editor.getPath();
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (!hackLanguage || !filePath) {
      return [];
    }

    invariant(filePath);
    const localPath = getPath(filePath);
    const contents = editor.getText();

    let diagnostics;
    if (hackLanguage.isHackClientAvailable()) {
      // Work around `hh_client` returns server busy error, and fails retrying (when enabled),
      // if a `check` call is made before 3 seconds of a file being saved.
      await awaitMilliSeconds(HH_DIAGNOSTICS_DELAY_MS);
      diagnostics = await hackLanguage.getServerDiagnostics(filePath);
    } else {
      diagnostics = await hackLanguage.getDiagnostics(localPath, contents);
    }
    return diagnostics;
  },

  async fetchCompletionsForEditor(editor: TextEditor, prefix: string): Promise<Array<any>> {
    var hackLanguage = await getHackLanguageForUri(editor.getPath());
    var filePath = editor.getPath();
    if (!hackLanguage || !filePath) {
      return [];
    }

    invariant(filePath);
    const contents = editor.getText();
    const cursor = editor.getLastCursor();
    const offset = editor.getBuffer().characterIndexForPosition(cursor.getBufferPosition());
    // The returned completions may have unrelated results, even though the offset is set on the end of the prefix.
    const completions = await hackLanguage.getCompletions(filePath, contents, offset);
    // Filter out the completions that do not contain the prefix as a token in the match text case insentively.
    const tokenLowerCase = prefix.toLowerCase();

    const {compareHackCompletions} = require('./utils');
    const hackCompletionsCompartor = compareHackCompletions(prefix);

    return completions
      .filter(completion => completion.matchText.toLowerCase().indexOf(tokenLowerCase) >= 0)
      // Sort the auto-completions based on a scoring function considering:
      // case sensitivity, position in the completion, private functions and alphabetical order.
      .sort((completion1, completion2) => hackCompletionsCompartor(completion1.matchText, completion2.matchText));
  },

  async formatSourceFromEditor(editor: TextEditor, range: atom$Range): Promise<string> {
    var buffer = editor.getBuffer();
    var filePath = editor.getPath();
    var hackLanguage = await getHackLanguageForUri(filePath);
    if (!hackLanguage || !filePath) {
      return buffer.getTextInRange(range);
    }

    var startPosition = buffer.characterIndexForPosition(range.start);
    var endPosition = buffer.characterIndexForPosition(range.end);
    return await hackLanguage.formatSource(buffer.getText(), startPosition + 1, endPosition + 1);
  },

  async typeHintFromEditor(editor: TextEditor, position: atom$Point): Promise<?TypeHint> {
    var filePath = editor.getPath();
    var hackLanguage = await getHackLanguageForUri(filePath);
    if (!hackLanguage || !filePath) {
      return null;
    }

    var matchData = extractWordAtPosition(editor, position, HACK_WORD_REGEX);
    if (!matchData) {
      return null;
    }

    var path = getPath(filePath);
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
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    const filePath = editor.getPath();
    if (!hackLanguage || !filePath) {
      return null;
    }

    const contents = editor.getText();
    const buffer = editor.getBuffer();
    const lineText = buffer.lineForRow(line);
    const pos = await hackLanguage.getDefinition(
      filePath, contents, line + 1, column + 1, lineText
    );
    if (!pos) {
      return null;
    }
    let range = null;
    // If the search string was expanded to include more than a valid regex php word.
    // e.g. in case of XHP tags, the start and end column are provided to underline the full range
    // to visit its definition.
    if (pos.searchStartColumn && pos.searchEndColumn) {
      range = new Range([line, pos.searchStartColumn], [line, pos.searchEndColumn]);
    }
    return {
      file: pos.path,
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
    const filePath = editor.getPath();
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (!hackLanguage || !filePath) {
      return null;
    }

    const contents = editor.getText();
    const symbol = await hackLanguage.getSymbolNameAtPositionWithDependencies(
      getPath(filePath),
      contents,
      line + 1,
      column + 1
    );
    if (!symbol) {
      return null;
    }
    const referencesResult = await hackLanguage.getReferences(filePath, contents, symbol.name);
    if (!referencesResult) {
      return null;
    }
    var {hackRoot, references} = referencesResult;
    return {baseUri: hackRoot, symbolName: symbol.name, references};
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

function getCachedHackLanguageForUri(uri: NuclideUri): ?HackLanguage {
  var client = getClient(uri);
  if (!client) {
    return null;
  }
  return clientToHackLanguage[client.getID()];
}

function getHackLanguageForUri(uri: NuclideUri): Promise<?HackLanguage> {
  // `getClient` can return null if a file path doesn't have a root directory in the tree.
  // Also, returns null when reloading Atom with open files, while the RemoteConnection creation is pending.
  var client = getClient(uri);
  if (!client) {
    return null;
  }
  return createHackLanguageIfNotExisting(client, uri);
}

async function createHackLanguageIfNotExisting(
  client: NuclideClient,
  fileUri: NuclideUri,
): Promise<HackLanguage> {
  var clientId = client.getID();
  if (clientToHackLanguage[clientId]) {
    return clientToHackLanguage[clientId];
  }
  var filePath = getPath(fileUri);
  var hackClient;
  var [isHackClientAvailable, nearestPath] = await Promise.all([
    client.isHackClientAvailable(),
    getFileSystemServiceByNuclideUri(fileUri)
      .findNearestFile('.hhconfig', pathUtil.dirname(filePath)),
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
  clientToHackLanguage[clientId] = new HackLanguage(hackClient, nearestPath, fileUri);
  return clientToHackLanguage[clientId];
}
