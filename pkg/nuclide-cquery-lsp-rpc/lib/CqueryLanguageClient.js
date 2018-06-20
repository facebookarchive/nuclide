'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryLanguageClient = undefined;

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _convert;

function _load_convert() {
  return _convert = require('../../nuclide-vscode-language-service-rpc/lib/convert');
}

var _LspLanguageService;

function _load_LspLanguageService() {
  return _LspLanguageService = require('../../nuclide-vscode-language-service-rpc/lib/LspLanguageService');
}

var _CqueryOutlineParser;

function _load_CqueryOutlineParser() {
  return _CqueryOutlineParser = require('./outline/CqueryOutlineParser');
}

// FIXME pelmers: tracking cquery/issues/30
// https://github.com/jacobdufault/cquery/issues/30#issuecomment-345536318
function shortenByOneCharacter({ newText, range }) {
  return {
    newText,
    range: {
      start: range.start,
      end: { line: range.end.line, character: range.end.character - 1 }
    }
  };
} /**
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
class CqueryLanguageClient extends (_LspLanguageService || _load_LspLanguageService()).LspLanguageService {

  start() {
    // Workaround for https://github.com/babel/babel/issues/3930
    return super.start().then(() => this.startCquery());
  }

  constructor(logger, fileCache, host, languageServerName, command, args, spawnOptions = {}, projectRoot, fileExtensions, initializationOptions, additionalLogFilesRetentionPeriod, logFile, cacheDirectory, progressInfo, useOriginalEnvironment = false) {
    super(logger, fileCache, host, languageServerName, command, args, spawnOptions,
    /* fork */false, projectRoot, fileExtensions, initializationOptions, additionalLogFilesRetentionPeriod, useOriginalEnvironment);
    this._logFile = logFile;
    this._cacheDirectory = cacheDirectory;
    this._progressInfo = progressInfo;
  }

  async startCquery() {
    const progressObservable = _rxjsBundlesRxMinJs.Observable.create(subscriber => {
      this._lspConnection._jsonRpcConnection.onNotification({ method: '$cquery/progress' }, args => {
        const {
          indexRequestCount,
          doIdMapCount,
          loadPreviousIndexCount,
          onIdMappedCount,
          onIndexedCount
        } = args;
        const total = indexRequestCount + doIdMapCount + loadPreviousIndexCount + onIdMappedCount + onIndexedCount;
        subscriber.next(total);
      });
    }).distinctUntilChanged();
    if (this._progressInfo != null) {
      const { id, label } = this._progressInfo;
      // Because of the 'freshen' command, cquery may finish
      // (i.e. progress reaches 0) then start emitting progress events again.
      // So each time it reaches 0 create a new id by adding a monotonic number.
      let progressId = 0;
      this._progressSubscription = progressObservable.subscribe(totalJobs => {
        const taggedId = id + progressId;
        if (totalJobs === 0) {
          // label null clears the indicator.
          this._handleProgressNotification({
            id: taggedId,
            label: null
          });
          progressId++;
        } else {
          this._handleProgressNotification({
            id: taggedId,
            label: `cquery ${label}: ${totalJobs} jobs`
          });
        }
      });
    }
    // TODO pelmers Register handlers for other custom cquery messages.
    // TODO pelmers hook into refactorizer for renaming?
  }

  dispose() {
    if (this._progressSubscription != null) {
      this._progressSubscription.unsubscribe();
    }
    super.dispose();
  }

  getCacheDirectory() {
    return this._cacheDirectory;
  }

  _createOutlineTreeHierarchy(list) {
    return (0, (_CqueryOutlineParser || _load_CqueryOutlineParser()).parseOutlineTree)(list);
  }

  _executeCommand(command, args) {
    const cqueryEditCommands = new Set(['cquery._applyFixIt']);
    if (cqueryEditCommands.has(command) && args != null && args.length === 2) {
      return this._applyEdit(...args).then(result => this._notifyOnFail(result, 'Cquery: apply edit failed'));
    } else {
      return super._executeCommand(command, args);
    }
    // TODO pelmers: handle cquery._autoImplement
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
        const edits = command.arguments[1];
        // Split each edit into its own command.
        for (const edit of edits) {
          const includeValue = edit.newText.trim();
          if (!seenIncludes.has(includeValue)) {
            seenIncludes.add(includeValue);
            // Add a command for quote and bracket includes.
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
  }

  // TODO pelmers(T25418348): remove when cquery implements workspace/applyEdit
  // track https://github.com/jacobdufault/cquery/issues/283
  async _applyEdit(file, edits) {
    return this._host.applyTextEditsForMultipleFiles(new Map([[(0, (_convert || _load_convert()).lspUri_localPath)(file), (0, (_convert || _load_convert()).lspTextEdits_atomTextEdits)(edits.map(shortenByOneCharacter))]]));
  }

  async freshenIndex() {
    // identical to vscode extension, https://git.io/vbUbQ
    this._lspConnection._jsonRpcConnection.sendNotification('$cquery/freshenIndex', {});
  }

  async requestLocationsCommand(methodName, path, point) {
    const position = (0, (_convert || _load_convert()).atomPoint_lspPosition)(point);
    const response = await this._lspConnection._jsonRpcConnection.sendRequest(methodName, {
      textDocument: {
        uri: (0, (_convert || _load_convert()).localPath_lspUri)(path)
      },
      position
    });
    return response == null ? [] : response.map(({ uri, range }) => ({
      uri: (0, (_convert || _load_convert()).lspUri_localPath)(uri),
      range: (0, (_convert || _load_convert()).lspRange_atomRange)(range)
    }));
  }
}
exports.CqueryLanguageClient = CqueryLanguageClient;