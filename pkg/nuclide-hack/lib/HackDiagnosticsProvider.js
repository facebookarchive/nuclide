var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var findDiagnostics = _asyncToGenerator(function* (editor) {
  var filePath = editor.getPath();
  var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(filePath);
  if (!hackLanguage || !filePath) {
    return [];
  }

  (0, _assert2['default'])(filePath);
  var contents = editor.getText();

  return yield hackLanguage.getDiagnostics(filePath, contents);
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideAnalytics = require('../../nuclide-analytics');

var _HackLanguage = require('./HackLanguage');

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideDiagnosticsProviderBase = require('../../nuclide-diagnostics-provider-base');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _nuclideHackCommon = require('../../nuclide-hack-common');

var RequestSerializer = _nuclideCommons.promises.RequestSerializer;

/**
 * Currently, a diagnostic from Hack is an object with a "message" property.
 * Each item in the "message" array is an object with the following fields:
 *     - path (string) File that contains the error.
 *     - descr (string) Description of the error.
 *     - line (number) Start line.
 *     - endline (number) End line.
 *     - start (number) Start column.
 *     - end (number) End column.
 *     - code (number) Presumably an error code.
 * The message array may have more than one item. For example, if there is a
 * type incompatibility error, the first item in the message array blames the
 * usage of the wrong type and the second blames the declaration of the type
 * with which the usage disagrees. Note that these could occur in different
 * files.
 */
function extractRange(message) {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  return new _atom.Range([message['line'] - 1, message['start'] - 1], [message['line'] - 1, message['end']]);
}

// A trace object is very similar to an error object.
function hackMessageToTrace(traceError) {
  return {
    type: 'Trace',
    text: traceError['descr'],
    filePath: traceError['path'],
    range: extractRange(traceError)
  };
}

function hackMessageToDiagnosticMessage(hackDiagnostic) {
  var hackMessages = hackDiagnostic.message;

  var causeMessage = hackMessages[0];
  (0, _assert2['default'])(causeMessage.path != null);
  var diagnosticMessage = {
    scope: 'file',
    providerName: 'Hack: ' + hackMessages[0].code,
    type: 'Error',
    text: causeMessage.descr,
    filePath: causeMessage.path,
    range: extractRange(causeMessage)
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (hackMessages.length > 1) {
    diagnosticMessage.trace = hackMessages.slice(1).map(hackMessageToTrace);
  }

  return diagnosticMessage;
}

var HackDiagnosticsProvider = (function () {
  function HackDiagnosticsProvider(shouldRunOnTheFly, busySignalProvider) {
    var _this = this;

    var ProviderBase = arguments.length <= 2 || arguments[2] === undefined ? _nuclideDiagnosticsProviderBase.DiagnosticsProviderBase : arguments[2];

    _classCallCheck(this, HackDiagnosticsProvider);

    this._busySignalProvider = busySignalProvider;
    var utilsOptions = {
      grammarScopes: _nuclideHackCommon.HACK_GRAMMARS_SET,
      shouldRunOnTheFly: shouldRunOnTheFly,
      onTextEditorEvent: function onTextEditorEvent(editor) {
        return _this._runDiagnostics(editor);
      },
      onNewUpdateSubscriber: function onNewUpdateSubscriber(callback) {
        return _this._receivedNewUpdateSubscriber(callback);
      }
    };
    this._providerBase = new ProviderBase(utilsOptions);
    this._requestSerializer = new RequestSerializer();
    this._hackLanguageToFilePaths = new Map();
  }

  _createDecoratedClass(HackDiagnosticsProvider, [{
    key: '_runDiagnostics',
    value: function _runDiagnostics(textEditor) {
      var _this2 = this;

      this._busySignalProvider.reportBusy('Hack: Waiting for diagnostics', function () {
        return _this2._runDiagnosticsImpl(textEditor);
      });
    }
  }, {
    key: '_runDiagnosticsImpl',
    decorators: [(0, _nuclideAnalytics.trackTiming)('hack.run-diagnostics')],
    value: _asyncToGenerator(function* (textEditor) {
      var filePath = textEditor.getPath();
      if (!filePath) {
        return;
      }

      // `hh_client` doesn't currently support `onTheFly` diagnosis.
      // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
      // the `HackWorker` model will diagnose with the updated editor contents.
      var diagnosisResult = yield this._requestSerializer.run(findDiagnostics(textEditor));
      if (diagnosisResult.status === 'outdated' || diagnosisResult.result == null) {
        return;
      }

      var diagnostics = diagnosisResult.result;
      var hackLanguage = yield (0, _HackLanguage.getHackLanguageForUri)(textEditor.getPath());
      if (!hackLanguage) {
        return;
      }

      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [filePath] });
      this._invalidatePathsForHackLanguage(hackLanguage);

      var pathsForHackLanguage = new Set();
      this._hackLanguageToFilePaths.set(hackLanguage, pathsForHackLanguage);
      for (var diagnostic of diagnostics) {
        /*
         * Each message consists of several different components, each with its
         * own text and path.
         */
        for (var diagnosticMessage of diagnostic.message) {
          pathsForHackLanguage.add(diagnosticMessage.path);
        }
      }

      this._providerBase.publishMessageUpdate(this._processDiagnostics(diagnostics));
    })
  }, {
    key: '_processDiagnostics',
    value: function _processDiagnostics(diagnostics) {
      // Convert array messages to Error Objects with Traces.
      var fileDiagnostics = diagnostics.map(hackMessageToDiagnosticMessage);

      var filePathToMessages = new Map();
      for (var diagnostic of fileDiagnostics) {
        var path = diagnostic['filePath'];
        var diagnosticArray = filePathToMessages.get(path);
        if (!diagnosticArray) {
          diagnosticArray = [];
          filePathToMessages.set(path, diagnosticArray);
        }
        diagnosticArray.push(diagnostic);
      }

      return { filePathToMessages: filePathToMessages };
    }
  }, {
    key: '_getPathsToInvalidate',
    value: function _getPathsToInvalidate(hackLanguage) {
      if (!hackLanguage.isHackAvailable()) {
        return [];
      }
      var filePaths = this._hackLanguageToFilePaths.get(hackLanguage);
      if (!filePaths) {
        return [];
      }
      return Array.from(filePaths);
    }
  }, {
    key: '_receivedNewUpdateSubscriber',
    value: function _receivedNewUpdateSubscriber(callback) {
      // Every time we get a new subscriber, we need to push results to them. This
      // logic is common to all providers and should be abstracted out (t7813069)
      //
      // Once we provide all diagnostics, instead of just the current file, we can
      // probably remove the activeTextEditor parameter.
      var activeTextEditor = atom.workspace.getActiveTextEditor();
      if (activeTextEditor) {
        if (_nuclideHackCommon.HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
          this._runDiagnostics(activeTextEditor);
        }
      }
    }
  }, {
    key: 'setRunOnTheFly',
    value: function setRunOnTheFly(runOnTheFly) {
      this._providerBase.setRunOnTheFly(runOnTheFly);
    }
  }, {
    key: 'onMessageUpdate',
    value: function onMessageUpdate(callback) {
      return this._providerBase.onMessageUpdate(callback);
    }
  }, {
    key: 'onMessageInvalidation',
    value: function onMessageInvalidation(callback) {
      return this._providerBase.onMessageInvalidation(callback);
    }
  }, {
    key: 'invalidateProjectPath',
    value: function invalidateProjectPath(projectPath) {
      var hackLanguage = (0, _HackLanguage.getCachedHackLanguageForUri)(projectPath);
      if (!hackLanguage) {
        return;
      }
      this._invalidatePathsForHackLanguage(hackLanguage);
    }
  }, {
    key: '_invalidatePathsForHackLanguage',
    value: function _invalidatePathsForHackLanguage(hackLanguage) {
      var pathsToInvalidate = this._getPathsToInvalidate(hackLanguage);
      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: pathsToInvalidate });
      this._hackLanguageToFilePaths['delete'](hackLanguage);
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._providerBase.dispose();
    }
  }]);

  return HackDiagnosticsProvider;
})();

module.exports = HackDiagnosticsProvider;

/**
 * Maps hack root to the set of file paths under that root for which we have
 * ever reported diagnostics.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhY2tEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7SUFxUGUsZUFBZSxxQkFBOUIsV0FDRSxNQUF1QixFQUNxQjtBQUM1QyxNQUFNLFFBQVEsR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDbEMsTUFBTSxZQUFZLEdBQUcsTUFBTSx5Q0FBc0IsUUFBUSxDQUFDLENBQUM7QUFDM0QsTUFBSSxDQUFDLFlBQVksSUFBSSxDQUFDLFFBQVEsRUFBRTtBQUM5QixXQUFPLEVBQUUsQ0FBQztHQUNYOztBQUVELDJCQUFVLFFBQVEsQ0FBQyxDQUFDO0FBQ3BCLE1BQU0sUUFBUSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQzs7QUFFbEMsU0FBTyxNQUFNLFlBQVksQ0FBQyxjQUFjLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0NBQzlEOzs7Ozs7OztnQ0F6T3lCLHlCQUF5Qjs7NEJBQ2MsZ0JBQWdCOzs4QkFDMUQsdUJBQXVCOzs4Q0FDUix5Q0FBeUM7O29CQUMzRCxNQUFNOztzQkFDSixRQUFROzs7O2lDQUVFLDJCQUEyQjs7SUFFcEQsaUJBQWlCLDRCQUFqQixpQkFBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlCeEIsU0FBUyxZQUFZLENBQUMsT0FBMEIsRUFBYzs7O0FBRzVELFNBQU8sZ0JBQ0wsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDM0MsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUN0QyxDQUFDO0NBQ0g7OztBQUdELFNBQVMsa0JBQWtCLENBQUMsVUFBNkIsRUFBVTtBQUNqRSxTQUFPO0FBQ0wsUUFBSSxFQUFFLE9BQU87QUFDYixRQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUN6QixZQUFR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QixDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFOEIseUNBQUMsWUFBMEIsRUFBUTtBQUNoRSxVQUFNLGlCQUFpQixHQUFHLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNuRSxVQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUMzQyxFQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLGlCQUFpQixFQUFDLENBQzlDLENBQUM7QUFDRixVQUFJLENBQUMsd0JBQXdCLFVBQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUNwRDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzlCOzs7U0FuSkcsdUJBQXVCOzs7QUFxSzdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsdUJBQXVCLENBQUMiLCJmaWxlIjoiSGFja0RpYWdub3N0aWNzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWJ1c3ktc2lnbmFsJztcbmltcG9ydCB0eXBlIHtIYWNrTGFuZ3VhZ2V9IGZyb20gJy4vSGFja0xhbmd1YWdlJztcbmltcG9ydCB0eXBlIHtcbiAgSGFja0RpYWdub3N0aWMsXG4gIFNpbmdsZUhhY2tNZXNzYWdlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stYmFzZS9saWIvSGFja1NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxuICBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtYmFzZSc7XG5cbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcbmltcG9ydCB7Z2V0SGFja0xhbmd1YWdlRm9yVXJpLCBnZXRDYWNoZWRIYWNrTGFuZ3VhZ2VGb3JVcml9IGZyb20gJy4vSGFja0xhbmd1YWdlJztcbmltcG9ydCB7cHJvbWlzZXN9IGZyb20gJy4uLy4uL251Y2xpZGUtY29tbW9ucyc7XG5pbXBvcnQge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLXByb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHtSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7SEFDS19HUkFNTUFSU19TRVR9IGZyb20gJy4uLy4uL251Y2xpZGUtaGFjay1jb21tb24nO1xuXG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG4vKipcbiAqIEN1cnJlbnRseSwgYSBkaWFnbm9zdGljIGZyb20gSGFjayBpcyBhbiBvYmplY3Qgd2l0aCBhIFwibWVzc2FnZVwiIHByb3BlcnR5LlxuICogRWFjaCBpdGVtIGluIHRoZSBcIm1lc3NhZ2VcIiBhcnJheSBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqICAgICAtIHBhdGggKHN0cmluZykgRmlsZSB0aGF0IGNvbnRhaW5zIHRoZSBlcnJvci5cbiAqICAgICAtIGRlc2NyIChzdHJpbmcpIERlc2NyaXB0aW9uIG9mIHRoZSBlcnJvci5cbiAqICAgICAtIGxpbmUgKG51bWJlcikgU3RhcnQgbGluZS5cbiAqICAgICAtIGVuZGxpbmUgKG51bWJlcikgRW5kIGxpbmUuXG4gKiAgICAgLSBzdGFydCAobnVtYmVyKSBTdGFydCBjb2x1bW4uXG4gKiAgICAgLSBlbmQgKG51bWJlcikgRW5kIGNvbHVtbi5cbiAqICAgICAtIGNvZGUgKG51bWJlcikgUHJlc3VtYWJseSBhbiBlcnJvciBjb2RlLlxuICogVGhlIG1lc3NhZ2UgYXJyYXkgbWF5IGhhdmUgbW9yZSB0aGFuIG9uZSBpdGVtLiBGb3IgZXhhbXBsZSwgaWYgdGhlcmUgaXMgYVxuICogdHlwZSBpbmNvbXBhdGliaWxpdHkgZXJyb3IsIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtZXNzYWdlIGFycmF5IGJsYW1lcyB0aGVcbiAqIHVzYWdlIG9mIHRoZSB3cm9uZyB0eXBlIGFuZCB0aGUgc2Vjb25kIGJsYW1lcyB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIHR5cGVcbiAqIHdpdGggd2hpY2ggdGhlIHVzYWdlIGRpc2FncmVlcy4gTm90ZSB0aGF0IHRoZXNlIGNvdWxkIG9jY3VyIGluIGRpZmZlcmVudFxuICogZmlsZXMuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RSYW5nZShtZXNzYWdlOiBTaW5nbGVIYWNrTWVzc2FnZSk6IGF0b20kUmFuZ2Uge1xuICAvLyBJdCdzIHVuY2xlYXIgd2h5IHRoZSAxLWJhc2VkIHRvIDAtYmFzZWQgaW5kZXhpbmcgd29ya3MgdGhlIHdheSB0aGF0IGl0XG4gIC8vIGRvZXMsIGJ1dCB0aGlzIGhhcyB0aGUgZGVzaXJlZCBlZmZlY3QgaW4gdGhlIFVJLCBpbiBwcmFjdGljZS5cbiAgcmV0dXJuIG5ldyBSYW5nZShcbiAgICBbbWVzc2FnZVsnbGluZSddIC0gMSwgbWVzc2FnZVsnc3RhcnQnXSAtIDFdLFxuICAgIFttZXNzYWdlWydsaW5lJ10gLSAxLCBtZXNzYWdlWydlbmQnXV1cbiAgKTtcbn1cblxuLy8gQSB0cmFjZSBvYmplY3QgaXMgdmVyeSBzaW1pbGFyIHRvIGFuIGVycm9yIG9iamVjdC5cbmZ1bmN0aW9uIGhhY2tNZXNzYWdlVG9UcmFjZSh0cmFjZUVycm9yOiBTaW5nbGVIYWNrTWVzc2FnZSk6IE9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1RyYWNlJyxcbiAgICB0ZXh0OiB0cmFjZUVycm9yWydkZXNjciddLFxuICAgIGZpbGVQYXRoOiB0cmFjZUVycm9yWydwYXRoJ10sXG4gICAgcmFuZ2U6IGV4dHJhY3RSYW5nZSh0cmFjZUVycm9yKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGFja01lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKFxuICBoYWNrRGlhZ25vc3RpYzoge21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30sXG4pOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2Uge1xuICBjb25zdCB7bWVzc2FnZTogaGFja01lc3NhZ2VzfSA9IGhhY2tEaWFnbm9zdGljO1xuXG4gIGNvbnN0IGNhdXNlTWVzc2FnZSA9IGhhY2tNZXNzYWdlc1swXTtcbiAgaW52YXJpYW50KGNhdXNlTWVzc2FnZS5wYXRoICE9IG51bGwpO1xuICBjb25zdCBkaWFnbm9zdGljTWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlID0ge1xuICAgIHNjb3BlOiAnZmlsZScsXG4gICAgcHJvdmlkZXJOYW1lOiBgSGFjazogJHtoYWNrTWVzc2FnZXNbMF0uY29kZX1gLFxuICAgIHR5cGU6ICdFcnJvcicsXG4gICAgdGV4dDogY2F1c2VNZXNzYWdlLmRlc2NyLFxuICAgIGZpbGVQYXRoOiBjYXVzZU1lc3NhZ2UucGF0aCxcbiAgICByYW5nZTogZXh0cmFjdFJhbmdlKGNhdXNlTWVzc2FnZSksXG4gIH07XG5cbiAgLy8gV2hlbiB0aGUgbWVzc2FnZSBpcyBhbiBhcnJheSB3aXRoIG11bHRpcGxlIGVsZW1lbnRzLCB0aGUgc2Vjb25kIGVsZW1lbnRcbiAgLy8gb253YXJkcyBjb21wcmlzZSB0aGUgdHJhY2UgZm9yIHRoZSBlcnJvci5cbiAgaWYgKGhhY2tNZXNzYWdlcy5sZW5ndGggPiAxKSB7XG4gICAgZGlhZ25vc3RpY01lc3NhZ2UudHJhY2UgPSBoYWNrTWVzc2FnZXMuc2xpY2UoMSkubWFwKGhhY2tNZXNzYWdlVG9UcmFjZSk7XG4gIH1cblxuICByZXR1cm4gZGlhZ25vc3RpY01lc3NhZ2U7XG59XG5cbmNsYXNzIEhhY2tEaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI7XG5cbiAgLyoqXG4gICAqIE1hcHMgaGFjayByb290IHRvIHRoZSBzZXQgb2YgZmlsZSBwYXRocyB1bmRlciB0aGF0IHJvb3QgZm9yIHdoaWNoIHdlIGhhdmVcbiAgICogZXZlciByZXBvcnRlZCBkaWFnbm9zdGljcy5cbiAgICovXG4gIF9oYWNrTGFuZ3VhZ2VUb0ZpbGVQYXRoczogTWFwPEhhY2tMYW5ndWFnZSwgU2V0PE51Y2xpZGVVcmk+PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzaG91bGRSdW5PblRoZUZseTogYm9vbGVhbixcbiAgICBidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UsXG4gICAgUHJvdmlkZXJCYXNlOiB0eXBlb2YgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UgPSBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSxcbiAgKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IEhBQ0tfR1JBTU1BUlNfU0VULFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1bkRpYWdub3N0aWNzKGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgUHJvdmlkZXJCYXNlKHV0aWxzT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9oYWNrTGFuZ3VhZ2VUb0ZpbGVQYXRocyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIF9ydW5EaWFnbm9zdGljcyh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgICdIYWNrOiBXYWl0aW5nIGZvciBkaWFnbm9zdGljcycsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvciksXG4gICAgKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnaGFjay5ydW4tZGlhZ25vc3RpY3MnKVxuICBhc3luYyBfcnVuRGlhZ25vc3RpY3NJbXBsKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGBoaF9jbGllbnRgIGRvZXNuJ3QgY3VycmVudGx5IHN1cHBvcnQgYG9uVGhlRmx5YCBkaWFnbm9zaXMuXG4gICAgLy8gU28sIGN1cnJlbnRseSwgaXQgd291bGQgb25seSB3b3JrIGlmIHRoZXJlIGlzIG5vIGBoaF9jbGllbnRgIG9yIGAuaGhjb25maWdgIHdoZXJlXG4gICAgLy8gdGhlIGBIYWNrV29ya2VyYCBtb2RlbCB3aWxsIGRpYWdub3NlIHdpdGggdGhlIHVwZGF0ZWQgZWRpdG9yIGNvbnRlbnRzLlxuICAgIGNvbnN0IGRpYWdub3Npc1Jlc3VsdCA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bihmaW5kRGlhZ25vc3RpY3ModGV4dEVkaXRvcikpO1xuICAgIGlmIChkaWFnbm9zaXNSZXN1bHQuc3RhdHVzID09PSAnb3V0ZGF0ZWQnIHx8IGRpYWdub3Npc1Jlc3VsdC5yZXN1bHQgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRpYWdub3N0aWNzID0gZGlhZ25vc2lzUmVzdWx0LnJlc3VsdDtcbiAgICBjb25zdCBoYWNrTGFuZ3VhZ2UgPSBhd2FpdCBnZXRIYWNrTGFuZ3VhZ2VGb3JVcmkodGV4dEVkaXRvci5nZXRQYXRoKCkpO1xuICAgIGlmICghaGFja0xhbmd1YWdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IFtmaWxlUGF0aF19KTtcbiAgICB0aGlzLl9pbnZhbGlkYXRlUGF0aHNGb3JIYWNrTGFuZ3VhZ2UoaGFja0xhbmd1YWdlKTtcblxuICAgIGNvbnN0IHBhdGhzRm9ySGFja0xhbmd1YWdlID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2hhY2tMYW5ndWFnZVRvRmlsZVBhdGhzLnNldChoYWNrTGFuZ3VhZ2UsIHBhdGhzRm9ySGFja0xhbmd1YWdlKTtcbiAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWMgb2YgZGlhZ25vc3RpY3MpIHtcbiAgICAgIC8qXG4gICAgICAgKiBFYWNoIG1lc3NhZ2UgY29uc2lzdHMgb2Ygc2V2ZXJhbCBkaWZmZXJlbnQgY29tcG9uZW50cywgZWFjaCB3aXRoIGl0c1xuICAgICAgICogb3duIHRleHQgYW5kIHBhdGguXG4gICAgICAgKi9cbiAgICAgIGZvciAoY29uc3QgZGlhZ25vc3RpY01lc3NhZ2Ugb2YgZGlhZ25vc3RpYy5tZXNzYWdlKSB7XG4gICAgICAgIHBhdGhzRm9ySGFja0xhbmd1YWdlLmFkZChkaWFnbm9zdGljTWVzc2FnZS5wYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUodGhpcy5fcHJvY2Vzc0RpYWdub3N0aWNzKGRpYWdub3N0aWNzKSk7XG4gIH1cblxuICBfcHJvY2Vzc0RpYWdub3N0aWNzKGRpYWdub3N0aWNzOiBBcnJheTx7bWVzc2FnZTogSGFja0RpYWdub3N0aWM7fT4pOiBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUge1xuICAgIC8vIENvbnZlcnQgYXJyYXkgbWVzc2FnZXMgdG8gRXJyb3IgT2JqZWN0cyB3aXRoIFRyYWNlcy5cbiAgICBjb25zdCBmaWxlRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5tYXAoaGFja01lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKTtcblxuICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWMgb2YgZmlsZURpYWdub3N0aWNzKSB7XG4gICAgICBjb25zdCBwYXRoID0gZGlhZ25vc3RpY1snZmlsZVBhdGgnXTtcbiAgICAgIGxldCBkaWFnbm9zdGljQXJyYXkgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KHBhdGgpO1xuICAgICAgaWYgKCFkaWFnbm9zdGljQXJyYXkpIHtcbiAgICAgICAgZGlhZ25vc3RpY0FycmF5ID0gW107XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQocGF0aCwgZGlhZ25vc3RpY0FycmF5KTtcbiAgICAgIH1cbiAgICAgIGRpYWdub3N0aWNBcnJheS5wdXNoKGRpYWdub3N0aWMpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGZpbGVQYXRoVG9NZXNzYWdlcyB9O1xuICB9XG5cbiAgX2dldFBhdGhzVG9JbnZhbGlkYXRlKGhhY2tMYW5ndWFnZTogSGFja0xhbmd1YWdlKTogQXJyYXk8TnVjbGlkZVVyaT4ge1xuICAgIGlmICghaGFja0xhbmd1YWdlLmlzSGFja0F2YWlsYWJsZSgpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMuX2hhY2tMYW5ndWFnZVRvRmlsZVBhdGhzLmdldChoYWNrTGFuZ3VhZ2UpO1xuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBBcnJheS5mcm9tKGZpbGVQYXRocyk7XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICAvLyBFdmVyeSB0aW1lIHdlIGdldCBhIG5ldyBzdWJzY3JpYmVyLCB3ZSBuZWVkIHRvIHB1c2ggcmVzdWx0cyB0byB0aGVtLiBUaGlzXG4gICAgLy8gbG9naWMgaXMgY29tbW9uIHRvIGFsbCBwcm92aWRlcnMgYW5kIHNob3VsZCBiZSBhYnN0cmFjdGVkIG91dCAodDc4MTMwNjkpXG4gICAgLy9cbiAgICAvLyBPbmNlIHdlIHByb3ZpZGUgYWxsIGRpYWdub3N0aWNzLCBpbnN0ZWFkIG9mIGp1c3QgdGhlIGN1cnJlbnQgZmlsZSwgd2UgY2FuXG4gICAgLy8gcHJvYmFibHkgcmVtb3ZlIHRoZSBhY3RpdmVUZXh0RWRpdG9yIHBhcmFtZXRlci5cbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICBpZiAoSEFDS19HUkFNTUFSU19TRVQuaGFzKGFjdGl2ZVRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHtcbiAgICAgICAgdGhpcy5fcnVuRGlhZ25vc3RpY3MoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2Uuc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHkpO1xuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2spO1xuICB9XG5cbiAgb25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrOiBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG5cbiAgaW52YWxpZGF0ZVByb2plY3RQYXRoKHByb2plY3RQYXRoOiBOdWNsaWRlVXJpKTogdm9pZCB7XG4gICAgY29uc3QgaGFja0xhbmd1YWdlID0gZ2V0Q2FjaGVkSGFja0xhbmd1YWdlRm9yVXJpKHByb2plY3RQYXRoKTtcbiAgICBpZiAoIWhhY2tMYW5ndWFnZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9pbnZhbGlkYXRlUGF0aHNGb3JIYWNrTGFuZ3VhZ2UoaGFja0xhbmd1YWdlKTtcbiAgfVxuXG4gIF9pbnZhbGlkYXRlUGF0aHNGb3JIYWNrTGFuZ3VhZ2UoaGFja0xhbmd1YWdlOiBIYWNrTGFuZ3VhZ2UpOiB2b2lkIHtcbiAgICBjb25zdCBwYXRoc1RvSW52YWxpZGF0ZSA9IHRoaXMuX2dldFBhdGhzVG9JbnZhbGlkYXRlKGhhY2tMYW5ndWFnZSk7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKFxuICAgICAge3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoczogcGF0aHNUb0ludmFsaWRhdGV9LFxuICAgICk7XG4gICAgdGhpcy5faGFja0xhbmd1YWdlVG9GaWxlUGF0aHMuZGVsZXRlKGhhY2tMYW5ndWFnZSk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5kaXNwb3NlKCk7XG4gIH1cbn1cblxuYXN5bmMgZnVuY3Rpb24gZmluZERpYWdub3N0aWNzKFxuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbik6IFByb21pc2U8QXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+PiB7XG4gIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgY29uc3QgaGFja0xhbmd1YWdlID0gYXdhaXQgZ2V0SGFja0xhbmd1YWdlRm9yVXJpKGZpbGVQYXRoKTtcbiAgaWYgKCFoYWNrTGFuZ3VhZ2UgfHwgIWZpbGVQYXRoKSB7XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgaW52YXJpYW50KGZpbGVQYXRoKTtcbiAgY29uc3QgY29udGVudHMgPSBlZGl0b3IuZ2V0VGV4dCgpO1xuXG4gIHJldHVybiBhd2FpdCBoYWNrTGFuZ3VhZ2UuZ2V0RGlhZ25vc3RpY3MoZmlsZVBhdGgsIGNvbnRlbnRzKTtcbn1cblxubW9kdWxlLmV4cG9ydHMgPSBIYWNrRGlhZ25vc3RpY3NQcm92aWRlcjtcbiJdfQ==