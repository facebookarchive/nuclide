"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryLanguageClient = void 0;

function _convert() {
  const data = require("../../nuclide-vscode-language-service-rpc/lib/convert");

  _convert = function () {
    return data;
  };

  return data;
}

function _LspLanguageService() {
  const data = require("../../nuclide-vscode-language-service-rpc/lib/LspLanguageService");

  _LspLanguageService = function () {
    return data;
  };

  return data;
}

function _CqueryOutlineParser() {
  const data = require("./outline/CqueryOutlineParser");

  _CqueryOutlineParser = function () {
    return data;
  };

  return data;
}

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
// Provides some extra commands on top of base Lsp.
// FIXME pelmers: tracking cquery/issues/30
// https://github.com/jacobdufault/cquery/issues/30#issuecomment-345536318
function shortenByOneCharacter({
  newText,
  range
}) {
  return {
    newText,
    range: {
      start: range.start,
      end: {
        line: range.end.line,
        character: range.end.character - 1
      }
    }
  };
}

class CqueryLanguageClient extends _LspLanguageService().LspLanguageService {
  constructor(logger, fileCache, host, languageServerName, command, args, spawnOptions = {}, projectRoot, fileExtensions, initializationOptions, additionalLogFilesRetentionPeriod, logFile, cacheDirectory, useOriginalEnvironment = false) {
    super(logger, fileCache, host, languageServerName, command, args, spawnOptions,
    /* fork */
    false, projectRoot, fileExtensions, initializationOptions, additionalLogFilesRetentionPeriod, useOriginalEnvironment);
    this._logFile = logFile;
    this._cacheDirectory = cacheDirectory;
  }

  getCacheDirectory() {
    return this._cacheDirectory;
  }

  _createOutlineTreeHierarchy(list) {
    return (0, _CqueryOutlineParser().parseOutlineTree)(list);
  }

  _executeCommand(command, args) {
    const cqueryEditCommands = new Set(['cquery._applyFixIt']);

    if (cqueryEditCommands.has(command) && args != null && args.length === 2) {
      return this._applyEdit(...args).then(result => this._notifyOnFail(result, 'Cquery: apply edit failed'));
    } else {
      return super._executeCommand(command, args);
    } // TODO pelmers: handle cquery._autoImplement

  }

  _convertCommands_CodeActions(commands) {
    // Find 'cquery._insertInclude' commands and deduplicate/expand them.
    // If there is one edit then the message is 'Insert #include <header>',
    // Otherwise the message is 'Pick one of $x includes' and we ask for choice.
    const outputCommands = [];
    const seenIncludes = new Set();

    for (const command of commands) {
      if (command.command !== 'cquery._insertInclude') {
        outputCommands.push(command);
      } else if (command.arguments != null && command.arguments.length === 2) {
        const file = command.arguments[0];
        const edits = command.arguments[1]; // Split each edit into its own command.

        for (const edit of edits) {
          const includeValue = edit.newText.trim();

          if (!seenIncludes.has(includeValue)) {
            seenIncludes.add(includeValue); // Add a command for quote and bracket includes.

            for (const wrappedInclude of [`<${includeValue}>`, `"${includeValue}"`]) {
              outputCommands.push({
                command: 'cquery._applyFixIt',
                title: 'Insert ' + wrappedInclude,
                arguments: [file, [Object.assign({}, edit, {
                  newText: `#include ${wrappedInclude}\n`
                })]]
              });
            }
          }
        }
      }
    }

    return super._convertCommands_CodeActions(outputCommands);
  }

  async _notifyOnFail(success, falseMessage) {
    if (!success) {
      return this._host.dialogNotification('warning', falseMessage).refCount().toPromise();
    }
  } // TODO pelmers(T25418348): remove when cquery implements workspace/applyEdit
  // track https://github.com/jacobdufault/cquery/issues/283


  async _applyEdit(file, edits) {
    return this._host.applyTextEditsForMultipleFiles(new Map([[(0, _convert().lspUri_localPath)(file), (0, _convert().lspTextEdits_atomTextEdits)(edits.map(shortenByOneCharacter))]]));
  }

}

exports.CqueryLanguageClient = CqueryLanguageClient;