'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CqueryLanguageClient = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _rxjsBundlesRxMinJs = require('rxjs/bundles/Rx.min.js');

var _observable;

function _load_observable() {
  return _observable = require('nuclide-commons/observable');
}

var _convert;

function _load_convert() {
  return _convert = require('../../nuclide-vscode-language-service-rpc/lib/convert');
}

var _LspLanguageService;

function _load_LspLanguageService() {
  return _LspLanguageService = require('../../nuclide-vscode-language-service-rpc/lib/LspLanguageService');
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

  startCquery() {
    var _this = this;

    return (0, _asyncToGenerator.default)(function* () {
      const progressSubject = new _rxjsBundlesRxMinJs.Subject();
      _this._lspConnection._jsonRpcConnection.onNotification({ method: '$cquery/progress' }, function (args) {
        const {
          indexRequestCount,
          doIdMapCount,
          loadPreviousIndexCount,
          onIdMappedCount,
          onIndexedCount
        } = args;
        const total = indexRequestCount + doIdMapCount + loadPreviousIndexCount + onIdMappedCount + onIndexedCount;
        progressSubject.next(total);
      });
      // cquery progress is strange; sometimes it reaches 0 then goes back up
      // again, so we wait a bit before clearing the progress icon at 0.
      progressSubject.distinctUntilChanged().throttleTime(50).do(
      // update progress text
      function (value) {
        const label = `cquery: ${value} jobs`;
        _this._handleProgressNotification({ id: 'cquery-progress', label });
      })
      // if progress has not changed for 2 seconds and is now 0 then complete.
      .let((0, (_observable || _load_observable()).fastDebounce)(2000)).subscribe(
      // next
      function (value) {
        if (value === 0) {
          progressSubject.complete();
        }
      },
      // error
      null,
      // complete
      function () {
        _this._handleProgressNotification({
          id: 'cquery-progress',
          label: null
        });
      });
      // TODO pelmers Register handlers for other custom cquery messages.
      // TODO pelmers hook into refactorizer for renaming?
    })();
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
          const includeValue = edit.newText;
          if (!seenIncludes.has(includeValue)) {
            seenIncludes.add(includeValue);
            outputCommands.push({
              command: 'cquery._applyFixIt',
              title: 'Insert ' + includeValue,
              arguments: [file, [edit]]
            });
          }
        }
      }
    }
    return super._convertCommands_CodeActions(outputCommands);
  }

  _notifyOnFail(success, falseMessage) {
    var _this2 = this;

    return (0, _asyncToGenerator.default)(function* () {
      if (!success) {
        return _this2._host.dialogNotification('warning', falseMessage).refCount().toPromise();
      }
    })();
  }

  // TODO pelmers(T25418348): remove when cquery implements workspace/applyEdit
  // track https://github.com/jacobdufault/cquery/issues/283
  _applyEdit(file, edits) {
    var _this3 = this;

    return (0, _asyncToGenerator.default)(function* () {
      return _this3._host.applyTextEditsForMultipleFiles(new Map([[(0, (_convert || _load_convert()).lspUri_localPath)(file), (0, (_convert || _load_convert()).lspTextEdits_atomTextEdits)(edits.map(shortenByOneCharacter))]]));
    })();
  }

  freshenIndex() {
    var _this4 = this;

    return (0, _asyncToGenerator.default)(function* () {
      // identical to vscode extension, https://git.io/vbUbQ
      _this4._lspConnection._jsonRpcConnection.sendNotification('$cquery/freshenIndex');
    })();
  }

  requestLocationsCommand(methodName, path, point) {
    var _this5 = this;

    return (0, _asyncToGenerator.default)(function* () {
      const position = (0, (_convert || _load_convert()).atomPoint_lspPosition)(point);
      const response = yield _this5._lspConnection._jsonRpcConnection.sendRequest(methodName, {
        textDocument: {
          uri: (0, (_convert || _load_convert()).localPath_lspUri)(path)
        },
        position
      });
      return response == null ? [] : response.map(function ({ uri, range }) {
        return {
          uri: (0, (_convert || _load_convert()).lspUri_localPath)(uri),
          range: (0, (_convert || _load_convert()).lspRange_atomRange)(range)
        };
      });
    })();
  }
}
exports.CqueryLanguageClient = CqueryLanguageClient;