'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryLanguageClient = undefined;

var _fsPromise;

function _load_fsPromise() {
  return _fsPromise = _interopRequireDefault(require('../../../modules/nuclide-commons/fsPromise'));
}

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _nuclideAnalytics;

function _load_nuclideAnalytics() {
  return _nuclideAnalytics = require('../../nuclide-analytics');
}

var _utils;

function _load_utils() {
  return _utils = require('../../nuclide-clang-rpc/lib/utils');
}

var _convert;

function _load_convert() {
  return _convert = require('../../nuclide-vscode-language-service-rpc/lib/convert');
}

var _LspLanguageService;

function _load_LspLanguageService() {
  return _LspLanguageService = require('../../nuclide-vscode-language-service-rpc/lib/LspLanguageService');
}

var _CqueryProjectManager;

function _load_CqueryProjectManager() {
  return _CqueryProjectManager = require('./CqueryProjectManager');
}

var _CqueryOutlineParser;

function _load_CqueryOutlineParser() {
  return _CqueryOutlineParser = require('./outline/CqueryOutlineParser');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// FIXME pelmers: tracking cquery/issues/30
// https://github.com/jacobdufault/cquery/issues/30#issuecomment-345536318
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
function shortenByOneCharacter({ newText, range }) {
  return {
    newText,
    range: {
      start: range.start,
      end: { line: range.end.line, character: range.end.character - 1 }
    }
  };
}

class CqueryLanguageClient extends (_LspLanguageService || _load_LspLanguageService()).LspLanguageService {

  start() {
    // Workaround for https://github.com/babel/babel/issues/3930
    return super.start().then(() => this.startCquery());
  }

  constructor(logger, fileCache, host, languageServerName, command, args, spawnOptions = {}, projectRoot, fileExtensions, initializationOptions, additionalLogFilesRetentionPeriod, logFile, progressInfo, projectKey, projectManager, useOriginalEnvironment = false) {
    super(logger, fileCache, host, languageServerName, command, args, spawnOptions,
    /* fork */false, projectRoot, fileExtensions, initializationOptions, additionalLogFilesRetentionPeriod, useOriginalEnvironment);
    this._logFile = logFile;
    this._progressInfo = progressInfo;
    this._projectKey = projectKey;
    this._projectManager = projectManager;
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

  _isFileInProject(file) {
    const project = this._projectManager.getProjectForFile(file);
    const checkProject = project != null ? (_CqueryProjectManager || _load_CqueryProjectManager()).CqueryProjectManager.getProjectKey(project) === this._projectKey : // TODO pelmers: header files aren't in the map because they do not
    // appear in compile_commands.json, but they should be cached!
    (0, (_utils || _load_utils()).isHeaderFile)(file);

    return checkProject && super._isFileInProject(file);
  }

  observeDiagnostics() {
    // Only emit diagnostics for files in the project.
    return super.observeDiagnostics().refCount().do(diagnosticMap => {
      for (const [file] of diagnosticMap) {
        if (!this._isFileInProject(file)) {
          diagnosticMap.delete(file);
        }
      }
    }).publish();
  }

  _handleClose() {
    (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('lsp-handle-close', {
      name: this._languageServerName,
      projectKey: this._projectKey,
      fileList: this._projectManager.getFilesInProject(this._projectKey)
    });
    this._logger.error('Lsp.Close - will auto-restart');
    this._host.consoleNotification(this._languageServerName, 'warning', `Automatically restarting ${this._languageServerName} for ${this._projectKey} after a crash`);
    (_fsPromise || _load_fsPromise()).default.readFile(this._logFile).then(contents => {
      const lines = contents.toString('utf8').split('\n');
      // Find a line with 'stack trace' and take the rest (or up to 40 lines.)
      let foundStackTrace = false;
      const stackTraceLines = lines.filter(line => {
        // the string 'Stack trace:' matches loguru.hpp:
        // https://github.com/emilk/loguru/blob/master/loguru.hpp#L2424
        foundStackTrace = foundStackTrace || line.startsWith('Stack trace:');
        return foundStackTrace;
      });
      (0, (_nuclideAnalytics || _load_nuclideAnalytics()).track)('cquery-crash-trace', {
        projectKey: this._projectKey,
        trace: stackTraceLines.slice(0, 40).join('\n')
      });
      // Restart now because otherwise the restart would overwrite the log file.
      this._setState('Initial');
      this.start();
    }).catch(err => {
      this._host.consoleNotification(this._languageServerName, 'error', `Unable to restart ${this._languageServerName} because of ${err}`);
    });
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