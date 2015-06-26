'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {getClient} = require('nuclide-client');
var {extractWordAtPosition} = require('nuclide-atom-helpers');
var HackLanguage = require('./HackLanguage');
var NullHackClient = require('./NullHackClient');
var logger = require('nuclide-logging').getLogger();
var url = require('url');
var pathUtil = require('path');

const NULL_CONNECTION_ID = 'null';
const HACK_WORD_REGEX = /[a-zA-Z0-9_$]+/g;

/**
 * This is responsible for managing (creating/disposing) multiple HackLanguage instances,
 * creating the designated HackService instances with the NuclideClient it needs per remote project.
 * Also, it deelegates the language feature request to the correct HackLanguage instance.
 */
var clientToHackLanguage: {[clientId: string]: HackLanguage} = {};
/**
 * Map of project id to an array of Hack Service diagnostics
 */
var clientToHackLinterCache: {[clientId: string]: Array<any>} = {};

module.exports = {

  async findDiagnostics(editor: TextEditor): Promise<Array<any>> {
    var buffer = editor.getBuffer();
    var hackLanguage = await getHackLanguageForBuffer(buffer);
    if (!hackLanguage) {
      return [];
    }

    var editorPath = editor.getPath();
    var {path} = url.parse(editorPath);
    var contents = editor.getText();
    var errors = await hackLanguage.getDiagnostics(path, contents);
    var mixedErrors = errors;
    var clientId = getClientId(buffer);
    if (clientToHackLinterCache[clientId]) {
      mixedErrors = errors.concat(clientToHackLinterCache[clientId]);
    }

    mixedErrors.forEach(error => {
      // Preserve original Nuclide URI so remote files return with a "nuclide://" prefix and are
      // associated with the correct TextEditor and tab.
      error.filePath = editorPath;
    });

    return mixedErrors;
  },

  async fetchCompletionsForEditor(editor: TextEditor, prefix: string): Promise<Array<any>> {
    var hackLanguage = await getHackLanguageForBuffer(editor.getBuffer());
    if (!hackLanguage) {
      return [];
    }
    var {path} = url.parse(editor.getPath());
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
    var hackLanguage = await getHackLanguageForBuffer(buffer);
    var startPosition = buffer.characterIndexForPosition(range.start);
    var endPosition = buffer.characterIndexForPosition(range.end);
    return await hackLanguage.formatSource(buffer.getText(), startPosition + 1, endPosition + 1);
  },

  async typeHintFromEditor(editor: TextEditor, position: Point): Promise<?TypeHint> {
    var hackLanguage = await getHackLanguageForBuffer(editor.getBuffer());
    if (!hackLanguage) {
      return null;
    }
    var matchData = extractWordAtPosition(editor, position, HACK_WORD_REGEX);
    if (!matchData) {
      return null;
    }

    var {path} = url.parse(editor.getPath());
    var contents = editor.getText();

    var type = await hackLanguage.getType(path, contents, matchData.wordMatch[0], position.row + 1, position.column + 1);
    if (!type) {
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
    var hackLanguage = await getHackLanguageForBuffer(editor.getBuffer());
    if (!hackLanguage) {
      return null;
    }
    var {path, protocol, host} = url.parse(editor.getPath());

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

  async onDidSave(editor: TextEditor): void {
    var {path} = url.parse(editor.getPath());
    var contents = editor.getText();
    var buffer = editor.getBuffer();
    var hackLanguage = await getHackLanguageForBuffer(buffer);
    if (!hackLanguage) {
      return;
    }

    // Update the HackWorker model with the contents of the file opened or saved.
    await hackLanguage.updateFile(path, contents);

    var diagnostics = [];
    try {
      diagnostics = await hackLanguage.getServerDiagnostics();
    } catch (err) {
      logger.error('Hack: getServerDiagnostics failed', err);
    }
    clientToHackLinterCache[getClientId(buffer)] = diagnostics;
    // Trigger the linter to catch the new diagnostics.
    atom.commands.dispatch(atom.views.getView(editor), 'linter:lint');
  },
};

function getFilePath(filePath: string, protocol: ?string, host: ?string): string {
  if (!protocol || !host) {
    return filePath;
  }
  return protocol + '//' + host + filePath;
}

function getClientId(buffer: TextBuffer): string {
  var client = getClient(buffer.getUri());
  return client ? client.getID() : 'undefined';
}

function getHackLanguageForBuffer(buffer: TextBuffer): Promise<?HackLanguage> {
  var uri = buffer.getUri();
  var {path: filePath} = url.parse(uri);
  // `getClient` can return null if a file path doesn't have a root directory in the tree.
  // Also, returns null when reloading Atom with open files, while the RemoteConnection creation is pending.
  var client = getClient(uri);
  if (!client) {
    return null;
  }
  return createHackLanguageIfNotExisting(client, filePath);
  // TODO(most): dispose the language/worker on project close.
}

async function createHackLanguageIfNotExisting(client: NuclideClient, filePath: string): Promise<HackLanguage> {
  var clientId = client.getID();
  if (clientToHackLanguage[clientId]) {
    return clientToHackLanguage[clientId];
  }
  var hackClient;
  var [isHackClientAvailable, nearestPath] = await Promise.all([
    client.isHackClientAvailable(),
    client.findNearestFile('.hhconfig', pathUtil.dirname(filePath)),
  ]);
  // If multiple calls, were done asynchronously, make sure to return the single-created HackLanguage.
  if (clientToHackLanguage[clientId]) {
    return clientToHackLanguage[clientId];
  }
  if (isHackClientAvailable && nearestPath) {
    hackClient = client;
  } else {
    hackClient = new NullHackClient();
  }
  clientToHackLanguage[clientId] = new HackLanguage(hackClient);
  return clientToHackLanguage[clientId];
}
