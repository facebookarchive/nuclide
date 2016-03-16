'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';
import type {
  HackReference,
  HackDiagnostic,
  HackOutline,
} from '../../nuclide-hack-base/lib/HackService';
import type {TypeHint} from '../../nuclide-type-hint-interfaces';
import type {HackLanguage} from './HackLanguage';

import invariant from 'assert';
import {extractWordAtPosition} from '../../nuclide-atom-helpers';
import {createHackLanguage} from './HackLanguage';
import {getPath, isRemote} from '../../nuclide-remote-uri';
import {Range} from 'atom';
import {getHackService} from './utils';
import {RemoteConnection} from '../../nuclide-remote-connection';
import {compareHackCompletions} from './utils';
import {getConfig} from './config';

const HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;


/**
 * This is responsible for managing (creating/disposing) multiple HackLanguage instances,
 * creating the designated HackService instances with the NuclideClient it needs per remote project.
 * Also, it deelegates the language feature request to the correct HackLanguage instance.
 */
const uriToHackLanguage: Map<string, HackLanguage> = new Map();

// dummy key into uriToHackLanguage for local projects.
// Any non-remote NuclideUri will do.
// TODO: I suspect we should key the local service off of the presence of a .hhconfig file
// rather than having a single HackLanguage for all local requests. Regardless, we haven't tested
// local hack services so save that for another day.
const LOCAL_URI_KEY = 'local-hack-key';

module.exports = {

  async findDiagnostics(
    editor: atom$TextEditor,
  ): Promise<Array<{message: HackDiagnostic;}>> {
    const filePath = editor.getPath();
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (!hackLanguage || !filePath) {
      return [];
    }

    invariant(filePath);
    const contents = editor.getText();

    return await hackLanguage.getDiagnostics(filePath, contents);
  },

  async fetchCompletionsForEditor(editor: atom$TextEditor, prefix: string): Promise<Array<any>> {
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    const filePath = editor.getPath();
    if (!hackLanguage || !filePath) {
      return [];
    }

    invariant(filePath);
    const contents = editor.getText();
    const cursor = editor.getLastCursor();
    const offset = editor.getBuffer().characterIndexForPosition(cursor.getBufferPosition());
    // The returned completions may have unrelated results, even though the offset is set on the end
    // of the prefix.
    const completions = await hackLanguage.getCompletions(filePath, contents, offset);
    // Filter out the completions that do not contain the prefix as a token in the match text case
    // insentively.
    const tokenLowerCase = prefix.toLowerCase();

    const hackCompletionsCompartor = compareHackCompletions(prefix);
    return completions
      .filter(completion => completion.matchText.toLowerCase().indexOf(tokenLowerCase) >= 0)
      // Sort the auto-completions based on a scoring function considering:
      // case sensitivity, position in the completion, private functions and alphabetical order.
      .sort((completion1, completion2) =>
        hackCompletionsCompartor(completion1.matchText, completion2.matchText));
  },

  async formatSourceFromEditor(editor: atom$TextEditor, range: atom$Range): Promise<string> {
    const buffer = editor.getBuffer();
    const filePath = editor.getPath();
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (!hackLanguage || !filePath) {
      return buffer.getTextInRange(range);
    }

    const startPosition = buffer.characterIndexForPosition(range.start);
    const endPosition = buffer.characterIndexForPosition(range.end);
    return await hackLanguage.formatSource(buffer.getText(), startPosition + 1, endPosition + 1);
  },

  async codeHighlightFromEditor(
    editor: atom$TextEditor,
    position: atom$Point,
  ): Promise<Array<atom$Range>> {
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    if (!hackLanguage) {
      return [];
    }

    const matchData = extractWordAtPosition(editor, position, HACK_WORD_REGEX);
    if (
      !matchData ||
      !matchData.wordMatch.length ||
      !matchData.wordMatch[0].startsWith('$')
    ) {
      return [];
    }

    return hackLanguage.highlightSource(
      getPath(editor.getPath() || ''),
      editor.getText(),
      position.row + 1,
      position.column,
    );
  },

  async typeHintFromEditor(editor: atom$TextEditor, position: atom$Point): Promise<?TypeHint> {
    const filePath = editor.getPath();
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (!hackLanguage || !filePath) {
      return null;
    }

    const matchData = extractWordAtPosition(editor, position, HACK_WORD_REGEX);
    if (!matchData) {
      return null;
    }

    const path = getPath(filePath);
    const contents = editor.getText();

    const type = await hackLanguage.getType(
      path, contents, matchData.wordMatch[0], position.row + 1, position.column + 1);
    if (!type || type === '_') {
      return null;
    } else {
      return {
        hint: type,
        range: matchData.range,
      };
    }
  },

  async outlineFromEditor(editor: atom$TextEditor): Promise<?HackOutline> {
    const filePath = editor.getPath();
    if (filePath == null) {
      return  null;
    }
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (hackLanguage == null) {
      return null;
    }

    const contents = editor.getText();

    return await hackLanguage.getOutline(filePath, contents);
  },

  /**
   * If a location can be found for the declaration, the return value will
   * resolve to an object with these fields: file, line, column.
   */
  async findDefinition(
    editor: atom$TextEditor,
    line: number,
    column: number,
  ): Promise<?Array<Object>> {
    const hackLanguage = await getHackLanguageForUri(editor.getPath());
    const filePath = editor.getPath();
    if (!hackLanguage || !filePath) {
      return null;
    }

    const contents = editor.getText();
    const buffer = editor.getBuffer();
    const lineText = buffer.lineForRow(line);
    const positions = await hackLanguage.getDefinition(
      filePath, contents, line + 1, column + 1, lineText
    );
    if (positions.length === 0) {
      return null;
    }
    return positions.map(position => {
      let range = null;
      // If the search string was expanded to include more than a valid regex php word.
      // e.g. in case of XHP tags, the start and end column are provided to underline the full range
      // to visit its definition.
      if (position.searchStartColumn && position.searchEndColumn) {
        range = new Range([line, position.searchStartColumn], [line, position.searchEndColumn]);
      }
      return {
        ...position,
        range,
      };
    });
  },

  async findReferences(
    editor: atom$TextEditor,
    line: number,
    column: number
  ): Promise<?{baseUri: string; symbolName: string; references: Array<HackReference>}> {
    const filePath = editor.getPath();
    const hackLanguage = await getHackLanguageForUri(filePath);
    if (!hackLanguage || !filePath) {
      return null;
    }

    const contents = editor.getText();
    return await hackLanguage.findReferences(
      filePath,
      contents,
      line,
      column,
    );
  },

  getHackLanguageForUri,
  getCachedHackLanguageForUri,
};

// Returns null if we can't get the key at this time because the RemoteConnection is initializing.
// This can happen on startup when reloading remote files.
function getKeyOfUri(uri: NuclideUri): ?string {
  const remoteConnection = RemoteConnection.getForUri(uri);
  return remoteConnection == null ?
    (isRemote(uri) ? null : LOCAL_URI_KEY) :
    remoteConnection.getUriForInitialWorkingDirectory();
}

function getCachedHackLanguageForUri(uri: NuclideUri): ?HackLanguage {
  const key = getKeyOfUri(uri);
  return key == null ? null : uriToHackLanguage.get(uri);
}

async function getHackLanguageForUri(uri: ?NuclideUri): Promise<?HackLanguage> {
  if (uri == null || uri.length === 0) {
    return null;
  }
  const key = getKeyOfUri(uri);
  if (key == null) {
    return null;
  }
  return await createHackLanguageIfNotExisting(key, uri);
}

async function createHackLanguageIfNotExisting(
  key: string,
  fileUri: NuclideUri,
): Promise<HackLanguage> {
  if (!uriToHackLanguage.has(key)) {
    const service = getHackService(fileUri);
    const config = getConfig();
    const hackEnvironment = await service.getHackEnvironmentDetails(
      fileUri,
      config.hhClientPath,
      config.useIdeConnection);
    const isHHAvailable = hackEnvironment != null;
    const {hackRoot} = hackEnvironment || {};

    // If multiple calls were done asynchronously, then return the single-created HackLanguage.
    if (!uriToHackLanguage.has(key)) {
      uriToHackLanguage.set(key, createHackLanguage(isHHAvailable, hackRoot, fileUri));
    }
  }
  return uriToHackLanguage.get(key);
}
