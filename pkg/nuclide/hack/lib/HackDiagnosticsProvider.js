var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _analytics = require('../../analytics');

var _hack = require('./hack');

var _commons = require('../../commons');

var _diagnosticsProviderBase = require('../../diagnostics/provider-base');

var _atom = require('atom');

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _hackCommonLibConstants = require('../../hack-common/lib/constants');

var RequestSerializer = _commons.promises.RequestSerializer;

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
    providerName: 'Hack',
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

    var ProviderBase = arguments.length <= 2 || arguments[2] === undefined ? _diagnosticsProviderBase.DiagnosticsProviderBase : arguments[2];

    _classCallCheck(this, HackDiagnosticsProvider);

    this._busySignalProvider = busySignalProvider;
    var utilsOptions = {
      grammarScopes: _hackCommonLibConstants.HACK_GRAMMARS_SET,
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
    decorators: [(0, _analytics.trackTiming)('hack.run-diagnostics')],
    value: _asyncToGenerator(function* (textEditor) {
      var filePath = textEditor.getPath();
      if (!filePath) {
        return;
      }

      // `hh_client` doesn't currently support `onTheFly` diagnosis.
      // So, currently, it would only work if there is no `hh_client` or `.hhconfig` where
      // the `HackWorker` model will diagnose with the updated editor contents.

      var _ref = yield this._requestSerializer.run((0, _hack.findDiagnostics)(textEditor));

      var status = _ref.status;
      var result = _ref.result;

      if (!result || status === 'outdated') {
        return;
      }

      var diagnostics = result;
      var hackLanguage = yield (0, _hack.getHackLanguageForUri)(textEditor.getPath());
      if (!hackLanguage) {
        return;
      }

      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: [filePath] });
      this._invalidatePathsForHackLanguage(hackLanguage);

      var pathsForHackLanguage = new Set();
      this._hackLanguageToFilePaths.set(hackLanguage, pathsForHackLanguage);
      for (var diagnostic of diagnostics) {
        /* Each message consists of several different components, each with its
         * own text and path. */
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
      return _commons.array.from(filePaths);
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
        if (_hackCommonLibConstants.HACK_GRAMMARS_SET.has(activeTextEditor.getGrammar().scopeName)) {
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
      var hackLanguage = (0, _hack.getCachedHackLanguageForUri)(projectPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhY2tEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBc0IwQixpQkFBaUI7O29CQUN1QyxRQUFROzt1QkFDNUQsZUFBZTs7dUNBQ1AsaUNBQWlDOztvQkFDbkQsTUFBTTs7c0JBQ0osUUFBUTs7OztzQ0FFRSxpQ0FBaUM7O0lBRTFELGlCQUFpQixxQkFBakIsaUJBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQnhCLFNBQVMsWUFBWSxDQUFDLE9BQTBCLEVBQWM7OztBQUc1RCxTQUFPLGdCQUNMLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzNDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDdEMsQ0FBQztDQUNIOzs7QUFHRCxTQUFTLGtCQUFrQixDQUFDLFVBQTZCLEVBQVU7QUFDakUsU0FBTztBQUNMLFFBQUksRUFBRSxPQUFPO0FBQ2IsUUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUM7QUFDekIsWUFBUSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDNUIsU0FBSyxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUM7R0FDaEMsQ0FBQztDQUNIOztBQUVELFNBQVMsOEJBQThCLENBQ3JDLGNBQTBDLEVBQ25CO01BQ1AsWUFBWSxHQUFJLGNBQWMsQ0FBdkMsT0FBTzs7QUFFZCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsMkJBQVUsWUFBWSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNyQyxNQUFNLGlCQUF3QyxHQUFHO0FBQy9DLFNBQUssRUFBRSxNQUFNO0FBQ2IsZ0JBQVksRUFBRSxNQUFNO0FBQ3BCLFFBQUksRUFBRSxPQUFPO0FBQ2IsUUFBSSxFQUFFLFlB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YWNrRGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIEhhY2tMYW5ndWFnZSBmcm9tICcuL0hhY2tMYW5ndWFnZSc7XG5pbXBvcnQgdHlwZSB7SGFja0RpYWdub3N0aWMsIFNpbmdsZUhhY2tNZXNzYWdlfSBmcm9tICcuLi8uLi9oYWNrLWJhc2UvbGliL3R5cGVzJztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbiAgRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlLFxufSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcy9iYXNlJztcblxuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7ZmluZERpYWdub3N0aWNzLCBnZXRIYWNrTGFuZ3VhZ2VGb3JVcmksIGdldENhY2hlZEhhY2tMYW5ndWFnZUZvclVyaX0gZnJvbSAnLi9oYWNrJztcbmltcG9ydCB7YXJyYXksIHByb21pc2VzfSBmcm9tICcuLi8uLi9jb21tb25zJztcbmltcG9ydCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHtSYW5nZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmltcG9ydCB7SEFDS19HUkFNTUFSU19TRVR9IGZyb20gJy4uLy4uL2hhY2stY29tbW9uL2xpYi9jb25zdGFudHMnO1xuXG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG4vKipcbiAqIEN1cnJlbnRseSwgYSBkaWFnbm9zdGljIGZyb20gSGFjayBpcyBhbiBvYmplY3Qgd2l0aCBhIFwibWVzc2FnZVwiIHByb3BlcnR5LlxuICogRWFjaCBpdGVtIGluIHRoZSBcIm1lc3NhZ2VcIiBhcnJheSBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqICAgICAtIHBhdGggKHN0cmluZykgRmlsZSB0aGF0IGNvbnRhaW5zIHRoZSBlcnJvci5cbiAqICAgICAtIGRlc2NyIChzdHJpbmcpIERlc2NyaXB0aW9uIG9mIHRoZSBlcnJvci5cbiAqICAgICAtIGxpbmUgKG51bWJlcikgU3RhcnQgbGluZS5cbiAqICAgICAtIGVuZGxpbmUgKG51bWJlcikgRW5kIGxpbmUuXG4gKiAgICAgLSBzdGFydCAobnVtYmVyKSBTdGFydCBjb2x1bW4uXG4gKiAgICAgLSBlbmQgKG51bWJlcikgRW5kIGNvbHVtbi5cbiAqICAgICAtIGNvZGUgKG51bWJlcikgUHJlc3VtYWJseSBhbiBlcnJvciBjb2RlLlxuICogVGhlIG1lc3NhZ2UgYXJyYXkgbWF5IGhhdmUgbW9yZSB0aGFuIG9uZSBpdGVtLiBGb3IgZXhhbXBsZSwgaWYgdGhlcmUgaXMgYVxuICogdHlwZSBpbmNvbXBhdGliaWxpdHkgZXJyb3IsIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtZXNzYWdlIGFycmF5IGJsYW1lcyB0aGVcbiAqIHVzYWdlIG9mIHRoZSB3cm9uZyB0eXBlIGFuZCB0aGUgc2Vjb25kIGJsYW1lcyB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIHR5cGVcbiAqIHdpdGggd2hpY2ggdGhlIHVzYWdlIGRpc2FncmVlcy4gTm90ZSB0aGF0IHRoZXNlIGNvdWxkIG9jY3VyIGluIGRpZmZlcmVudFxuICogZmlsZXMuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RSYW5nZShtZXNzYWdlOiBTaW5nbGVIYWNrTWVzc2FnZSk6IGF0b20kUmFuZ2Uge1xuICAvLyBJdCdzIHVuY2xlYXIgd2h5IHRoZSAxLWJhc2VkIHRvIDAtYmFzZWQgaW5kZXhpbmcgd29ya3MgdGhlIHdheSB0aGF0IGl0XG4gIC8vIGRvZXMsIGJ1dCB0aGlzIGhhcyB0aGUgZGVzaXJlZCBlZmZlY3QgaW4gdGhlIFVJLCBpbiBwcmFjdGljZS5cbiAgcmV0dXJuIG5ldyBSYW5nZShcbiAgICBbbWVzc2FnZVsnbGluZSddIC0gMSwgbWVzc2FnZVsnc3RhcnQnXSAtIDFdLFxuICAgIFttZXNzYWdlWydsaW5lJ10gLSAxLCBtZXNzYWdlWydlbmQnXV1cbiAgKTtcbn1cblxuLy8gQSB0cmFjZSBvYmplY3QgaXMgdmVyeSBzaW1pbGFyIHRvIGFuIGVycm9yIG9iamVjdC5cbmZ1bmN0aW9uIGhhY2tNZXNzYWdlVG9UcmFjZSh0cmFjZUVycm9yOiBTaW5nbGVIYWNrTWVzc2FnZSk6IE9iamVjdCB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1RyYWNlJyxcbiAgICB0ZXh0OiB0cmFjZUVycm9yWydkZXNjciddLFxuICAgIGZpbGVQYXRoOiB0cmFjZUVycm9yWydwYXRoJ10sXG4gICAgcmFuZ2U6IGV4dHJhY3RSYW5nZSh0cmFjZUVycm9yKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGFja01lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKFxuICBoYWNrRGlhZ25vc3RpYzoge21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30sXG4pOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2Uge1xuICBjb25zdCB7bWVzc2FnZTogaGFja01lc3NhZ2VzfSA9IGhhY2tEaWFnbm9zdGljO1xuXG4gIGNvbnN0IGNhdXNlTWVzc2FnZSA9IGhhY2tNZXNzYWdlc1swXTtcbiAgaW52YXJpYW50KGNhdXNlTWVzc2FnZS5wYXRoICE9IG51bGwpO1xuICBjb25zdCBkaWFnbm9zdGljTWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlID0ge1xuICAgIHNjb3BlOiAnZmlsZScsXG4gICAgcHJvdmlkZXJOYW1lOiAnSGFjaycsXG4gICAgdHlwZTogJ0Vycm9yJyxcbiAgICB0ZXh0OiBjYXVzZU1lc3NhZ2UuZGVzY3IsXG4gICAgZmlsZVBhdGg6IGNhdXNlTWVzc2FnZS5wYXRoLFxuICAgIHJhbmdlOiBleHRyYWN0UmFuZ2UoY2F1c2VNZXNzYWdlKSxcbiAgfTtcblxuICAvLyBXaGVuIHRoZSBtZXNzYWdlIGlzIGFuIGFycmF5IHdpdGggbXVsdGlwbGUgZWxlbWVudHMsIHRoZSBzZWNvbmQgZWxlbWVudFxuICAvLyBvbndhcmRzIGNvbXByaXNlIHRoZSB0cmFjZSBmb3IgdGhlIGVycm9yLlxuICBpZiAoaGFja01lc3NhZ2VzLmxlbmd0aCA+IDEpIHtcbiAgICBkaWFnbm9zdGljTWVzc2FnZS50cmFjZSA9IGhhY2tNZXNzYWdlcy5zbGljZSgxKS5tYXAoaGFja01lc3NhZ2VUb1RyYWNlKTtcbiAgfVxuXG4gIHJldHVybiBkaWFnbm9zdGljTWVzc2FnZTtcbn1cblxuY2xhc3MgSGFja0RpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlO1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjtcblxuICAvKipcbiAgICogTWFwcyBoYWNrIHJvb3QgdG8gdGhlIHNldCBvZiBmaWxlIHBhdGhzIHVuZGVyIHRoYXQgcm9vdCBmb3Igd2hpY2ggd2UgaGF2ZVxuICAgKiBldmVyIHJlcG9ydGVkIGRpYWdub3N0aWNzLlxuICAgKi9cbiAgX2hhY2tMYW5ndWFnZVRvRmlsZVBhdGhzOiBNYXA8SGFja0xhbmd1YWdlLCBTZXQ8TnVjbGlkZVVyaT4+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBib29sZWFuLFxuICAgIGJ1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSxcbiAgICBQcm92aWRlckJhc2U6IHR5cGVvZiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSA9IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlLFxuICApIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIgPSBidXN5U2lnbmFsUHJvdmlkZXI7XG4gICAgY29uc3QgdXRpbHNPcHRpb25zID0ge1xuICAgICAgZ3JhbW1hclNjb3BlczogSEFDS19HUkFNTUFSU19TRVQsXG4gICAgICBzaG91bGRSdW5PblRoZUZseSxcbiAgICAgIG9uVGV4dEVkaXRvckV2ZW50OiBlZGl0b3IgPT4gdGhpcy5fcnVuRGlhZ25vc3RpY3MoZWRpdG9yKSxcbiAgICAgIG9uTmV3VXBkYXRlU3Vic2NyaWJlcjogY2FsbGJhY2sgPT4gdGhpcy5fcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrKSxcbiAgICB9O1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZSA9IG5ldyBQcm92aWRlckJhc2UodXRpbHNPcHRpb25zKTtcbiAgICB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplciA9IG5ldyBSZXF1ZXN0U2VyaWFsaXplcigpO1xuICAgIHRoaXMuX2hhY2tMYW5ndWFnZVRvRmlsZVBhdGhzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgX3J1bkRpYWdub3N0aWNzKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IHZvaWQge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlci5yZXBvcnRCdXN5KFxuICAgICAgJ0hhY2s6IFdhaXRpbmcgZm9yIGRpYWdub3N0aWNzJyxcbiAgICAgICgpID0+IHRoaXMuX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yKSxcbiAgICApO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdoYWNrLnJ1bi1kaWFnbm9zdGljcycpXG4gIGFzeW5jIF9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZVBhdGggPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gYGhoX2NsaWVudGAgZG9lc24ndCBjdXJyZW50bHkgc3VwcG9ydCBgb25UaGVGbHlgIGRpYWdub3Npcy5cbiAgICAvLyBTbywgY3VycmVudGx5LCBpdCB3b3VsZCBvbmx5IHdvcmsgaWYgdGhlcmUgaXMgbm8gYGhoX2NsaWVudGAgb3IgYC5oaGNvbmZpZ2Agd2hlcmVcbiAgICAvLyB0aGUgYEhhY2tXb3JrZXJgIG1vZGVsIHdpbGwgZGlhZ25vc2Ugd2l0aCB0aGUgdXBkYXRlZCBlZGl0b3IgY29udGVudHMuXG4gICAgY29uc3Qge3N0YXR1cywgcmVzdWx0fSA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bihmaW5kRGlhZ25vc3RpY3ModGV4dEVkaXRvcikpO1xuICAgIGlmICghcmVzdWx0IHx8IHN0YXR1cyA9PT0gJ291dGRhdGVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGRpYWdub3N0aWNzID0gcmVzdWx0O1xuICAgIGNvbnN0IGhhY2tMYW5ndWFnZSA9IGF3YWl0IGdldEhhY2tMYW5ndWFnZUZvclVyaSh0ZXh0RWRpdG9yLmdldFBhdGgoKSk7XG4gICAgaWYgKCFoYWNrTGFuZ3VhZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoczogW2ZpbGVQYXRoXX0pO1xuICAgIHRoaXMuX2ludmFsaWRhdGVQYXRoc0ZvckhhY2tMYW5ndWFnZShoYWNrTGFuZ3VhZ2UpO1xuXG4gICAgY29uc3QgcGF0aHNGb3JIYWNrTGFuZ3VhZ2UgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5faGFja0xhbmd1YWdlVG9GaWxlUGF0aHMuc2V0KGhhY2tMYW5ndWFnZSwgcGF0aHNGb3JIYWNrTGFuZ3VhZ2UpO1xuICAgIGZvciAoY29uc3QgZGlhZ25vc3RpYyBvZiBkaWFnbm9zdGljcykge1xuICAgICAgLyogRWFjaCBtZXNzYWdlIGNvbnNpc3RzIG9mIHNldmVyYWwgZGlmZmVyZW50IGNvbXBvbmVudHMsIGVhY2ggd2l0aCBpdHNcbiAgICAgICAqIG93biB0ZXh0IGFuZCBwYXRoLiAqL1xuICAgICAgZm9yIChjb25zdCBkaWFnbm9zdGljTWVzc2FnZSBvZiBkaWFnbm9zdGljLm1lc3NhZ2UpIHtcbiAgICAgICAgcGF0aHNGb3JIYWNrTGFuZ3VhZ2UuYWRkKGRpYWdub3N0aWNNZXNzYWdlLnBhdGgpO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZVVwZGF0ZSh0aGlzLl9wcm9jZXNzRGlhZ25vc3RpY3MoZGlhZ25vc3RpY3MpKTtcbiAgfVxuXG4gIF9wcm9jZXNzRGlhZ25vc3RpY3MoZGlhZ25vc3RpY3M6IEFycmF5PHttZXNzYWdlOiBIYWNrRGlhZ25vc3RpYzt9Pik6IERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSB7XG4gICAgLy8gQ29udmVydCBhcnJheSBtZXNzYWdlcyB0byBFcnJvciBPYmplY3RzIHdpdGggVHJhY2VzLlxuICAgIGNvbnN0IGZpbGVEaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzLm1hcChoYWNrTWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2UpO1xuXG4gICAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzID0gbmV3IE1hcCgpO1xuICAgIGZvciAoY29uc3QgZGlhZ25vc3RpYyBvZiBmaWxlRGlhZ25vc3RpY3MpIHtcbiAgICAgIGNvbnN0IHBhdGggPSBkaWFnbm9zdGljWydmaWxlUGF0aCddO1xuICAgICAgbGV0IGRpYWdub3N0aWNBcnJheSA9IGZpbGVQYXRoVG9NZXNzYWdlcy5nZXQocGF0aCk7XG4gICAgICBpZiAoIWRpYWdub3N0aWNBcnJheSkge1xuICAgICAgICBkaWFnbm9zdGljQXJyYXkgPSBbXTtcbiAgICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChwYXRoLCBkaWFnbm9zdGljQXJyYXkpO1xuICAgICAgfVxuICAgICAgZGlhZ25vc3RpY0FycmF5LnB1c2goZGlhZ25vc3RpYyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgZmlsZVBhdGhUb01lc3NhZ2VzIH07XG4gIH1cblxuICBfZ2V0UGF0aHNUb0ludmFsaWRhdGUoaGFja0xhbmd1YWdlOiBIYWNrTGFuZ3VhZ2UpOiBBcnJheTxOdWNsaWRlVXJpPiB7XG4gICAgaWYgKCFoYWNrTGFuZ3VhZ2UuaXNIYWNrQXZhaWxhYmxlKCkpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgY29uc3QgZmlsZVBhdGhzID0gdGhpcy5faGFja0xhbmd1YWdlVG9GaWxlUGF0aHMuZ2V0KGhhY2tMYW5ndWFnZSk7XG4gICAgaWYgKCFmaWxlUGF0aHMpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIGFycmF5LmZyb20oZmlsZVBhdGhzKTtcbiAgfVxuXG4gIF9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IHZvaWQge1xuICAgIC8vIEV2ZXJ5IHRpbWUgd2UgZ2V0IGEgbmV3IHN1YnNjcmliZXIsIHdlIG5lZWQgdG8gcHVzaCByZXN1bHRzIHRvIHRoZW0uIFRoaXNcbiAgICAvLyBsb2dpYyBpcyBjb21tb24gdG8gYWxsIHByb3ZpZGVycyBhbmQgc2hvdWxkIGJlIGFic3RyYWN0ZWQgb3V0ICh0NzgxMzA2OSlcbiAgICAvL1xuICAgIC8vIE9uY2Ugd2UgcHJvdmlkZSBhbGwgZGlhZ25vc3RpY3MsIGluc3RlYWQgb2YganVzdCB0aGUgY3VycmVudCBmaWxlLCB3ZSBjYW5cbiAgICAvLyBwcm9iYWJseSByZW1vdmUgdGhlIGFjdGl2ZVRleHRFZGl0b3IgcGFyYW1ldGVyLlxuICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIGlmIChIQUNLX0dSQU1NQVJTX1NFVC5oYXMoYWN0aXZlVGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSkge1xuICAgICAgICB0aGlzLl9ydW5EaWFnbm9zdGljcyhhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRSdW5PblRoZUZseShydW5PblRoZUZseTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5zZXRSdW5PblRoZUZseShydW5PblRoZUZseSk7XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IGF0b20kRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2spO1xuICB9XG5cbiAgb25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrOiBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2spOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGludmFsaWRhdGVQcm9qZWN0UGF0aChwcm9qZWN0UGF0aDogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGNvbnN0IGhhY2tMYW5ndWFnZSA9IGdldENhY2hlZEhhY2tMYW5ndWFnZUZvclVyaShwcm9qZWN0UGF0aCk7XG4gICAgaWYgKCFoYWNrTGFuZ3VhZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faW52YWxpZGF0ZVBhdGhzRm9ySGFja0xhbmd1YWdlKGhhY2tMYW5ndWFnZSk7XG4gIH1cblxuICBfaW52YWxpZGF0ZVBhdGhzRm9ySGFja0xhbmd1YWdlKGhhY2tMYW5ndWFnZTogSGFja0xhbmd1YWdlKTogdm9pZCB7XG4gICAgY29uc3QgcGF0aHNUb0ludmFsaWRhdGUgPSB0aGlzLl9nZXRQYXRoc1RvSW52YWxpZGF0ZShoYWNrTGFuZ3VhZ2UpO1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbihcbiAgICAgIHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IHBhdGhzVG9JbnZhbGlkYXRlfSxcbiAgICApO1xuICAgIHRoaXMuX2hhY2tMYW5ndWFnZVRvRmlsZVBhdGhzLmRlbGV0ZShoYWNrTGFuZ3VhZ2UpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UuZGlzcG9zZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGFja0RpYWdub3N0aWNzUHJvdmlkZXI7XG4iXX0=