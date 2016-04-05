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

var _nuclideAnalytics = require('../../nuclide-analytics');

var _hack = require('./hack');

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
      var diagnosisResult = yield this._requestSerializer.run((0, _hack.findDiagnostics)(textEditor));
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
      return _nuclideCommons.array.from(filePaths);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhY2tEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBeUIwQix5QkFBeUI7O29CQUNyQixRQUFROzs0QkFDMkIsZ0JBQWdCOzs4QkFDbkQsdUJBQXVCOzs4Q0FDZix5Q0FBeUM7O29CQUMzRCxNQUFNOztzQkFDSixRQUFROzs7O2lDQUVFLDJCQUEyQjs7SUFFcEQsaUJBQWlCLDRCQUFqQixpQkFBaUI7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQWlCeEIsU0FBUyxZQUFZLENBQUMsT0FBMEIsRUFBYzs7O0FBRzVELFNBQU8sZ0JBQ0wsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFDM0MsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUN0QyxDQUFDO0NBQ0g7OztBQUdELFNBQVMsa0JBQWtCLENBQUMsVUFBNkIsRUFBVTtBQUNqRSxTQUFPO0FBQ0wsUUFBSSxFQUFFLE9BQU87QUFDYixRQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQztBQUN6QixZQUFRLEVBQUUsVUFBVSxDQUFDLE1BQU0sQ0FBQztBQUM1QixTQUFLLEVBQUUsWUFBWSxDQUFDLFVBQVUsQ0FBQztHQUNoQyxDQUFDO0NBQ0g7O0FBRUQsU0FBUyw4QkFBOEIsQ0FDckMsY0FBMEMsRUFDbkI7TUFDUCxZQUFZLEdBQUksY0FBYyxDQUF2QyxPQUFPOztBQUVkLE1BQU0sWUFBWSxHQUFHLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUNyQywyQkFBVSxZQUFZLENBQUMsSUFBSSxJQUFJLElBQUksQ0FBQyxDQUFDO0FBQ3JDLE1BQU0saUJBQXdDLEdBQUc7QUFDL0MsU0FBSyxFQUFFLE1BQU07QUFDYixnQkFBWSxhQUFXLFlBQVksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJ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QkFBdUI7OztBQXNKN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJIYWNrRGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5pbXBvcnQgdHlwZSB7SGFja0xhbmd1YWdlfSBmcm9tICcuL0hhY2tMYW5ndWFnZSc7XG5pbXBvcnQgdHlwZSB7XG4gIEhhY2tEaWFnbm9zdGljLFxuICBTaW5nbGVIYWNrTWVzc2FnZSxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1oYWNrLWJhc2UvbGliL0hhY2tTZXJ2aWNlJztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbiAgRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuXG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2ZpbmREaWFnbm9zdGljc30gZnJvbSAnLi9oYWNrJztcbmltcG9ydCB7Z2V0SGFja0xhbmd1YWdlRm9yVXJpLCBnZXRDYWNoZWRIYWNrTGFuZ3VhZ2VGb3JVcml9IGZyb20gJy4vSGFja0xhbmd1YWdlJztcbmltcG9ydCB7YXJyYXksIHByb21pc2VzfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHtEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1wcm92aWRlci1iYXNlJztcbmltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0hBQ0tfR1JBTU1BUlNfU0VUfSBmcm9tICcuLi8uLi9udWNsaWRlLWhhY2stY29tbW9uJztcblxuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IHByb21pc2VzO1xuLyoqXG4gKiBDdXJyZW50bHksIGEgZGlhZ25vc3RpYyBmcm9tIEhhY2sgaXMgYW4gb2JqZWN0IHdpdGggYSBcIm1lc3NhZ2VcIiBwcm9wZXJ0eS5cbiAqIEVhY2ggaXRlbSBpbiB0aGUgXCJtZXNzYWdlXCIgYXJyYXkgaXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gKiAgICAgLSBwYXRoIChzdHJpbmcpIEZpbGUgdGhhdCBjb250YWlucyB0aGUgZXJyb3IuXG4gKiAgICAgLSBkZXNjciAoc3RyaW5nKSBEZXNjcmlwdGlvbiBvZiB0aGUgZXJyb3IuXG4gKiAgICAgLSBsaW5lIChudW1iZXIpIFN0YXJ0IGxpbmUuXG4gKiAgICAgLSBlbmRsaW5lIChudW1iZXIpIEVuZCBsaW5lLlxuICogICAgIC0gc3RhcnQgKG51bWJlcikgU3RhcnQgY29sdW1uLlxuICogICAgIC0gZW5kIChudW1iZXIpIEVuZCBjb2x1bW4uXG4gKiAgICAgLSBjb2RlIChudW1iZXIpIFByZXN1bWFibHkgYW4gZXJyb3IgY29kZS5cbiAqIFRoZSBtZXNzYWdlIGFycmF5IG1heSBoYXZlIG1vcmUgdGhhbiBvbmUgaXRlbS4gRm9yIGV4YW1wbGUsIGlmIHRoZXJlIGlzIGFcbiAqIHR5cGUgaW5jb21wYXRpYmlsaXR5IGVycm9yLCB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbWVzc2FnZSBhcnJheSBibGFtZXMgdGhlXG4gKiB1c2FnZSBvZiB0aGUgd3JvbmcgdHlwZSBhbmQgdGhlIHNlY29uZCBibGFtZXMgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSB0eXBlXG4gKiB3aXRoIHdoaWNoIHRoZSB1c2FnZSBkaXNhZ3JlZXMuIE5vdGUgdGhhdCB0aGVzZSBjb3VsZCBvY2N1ciBpbiBkaWZmZXJlbnRcbiAqIGZpbGVzLlxuICovXG5mdW5jdGlvbiBleHRyYWN0UmFuZ2UobWVzc2FnZTogU2luZ2xlSGFja01lc3NhZ2UpOiBhdG9tJFJhbmdlIHtcbiAgLy8gSXQncyB1bmNsZWFyIHdoeSB0aGUgMS1iYXNlZCB0byAwLWJhc2VkIGluZGV4aW5nIHdvcmtzIHRoZSB3YXkgdGhhdCBpdFxuICAvLyBkb2VzLCBidXQgdGhpcyBoYXMgdGhlIGRlc2lyZWQgZWZmZWN0IGluIHRoZSBVSSwgaW4gcHJhY3RpY2UuXG4gIHJldHVybiBuZXcgUmFuZ2UoXG4gICAgW21lc3NhZ2VbJ2xpbmUnXSAtIDEsIG1lc3NhZ2VbJ3N0YXJ0J10gLSAxXSxcbiAgICBbbWVzc2FnZVsnbGluZSddIC0gMSwgbWVzc2FnZVsnZW5kJ11dXG4gICk7XG59XG5cbi8vIEEgdHJhY2Ugb2JqZWN0IGlzIHZlcnkgc2ltaWxhciB0byBhbiBlcnJvciBvYmplY3QuXG5mdW5jdGlvbiBoYWNrTWVzc2FnZVRvVHJhY2UodHJhY2VFcnJvcjogU2luZ2xlSGFja01lc3NhZ2UpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUcmFjZScsXG4gICAgdGV4dDogdHJhY2VFcnJvclsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogdHJhY2VFcnJvclsncGF0aCddLFxuICAgIHJhbmdlOiBleHRyYWN0UmFuZ2UodHJhY2VFcnJvciksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGhhY2tNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZShcbiAgaGFja0RpYWdub3N0aWM6IHttZXNzYWdlOiBIYWNrRGlhZ25vc3RpYzt9LFxuKTogRmlsZURpYWdub3N0aWNNZXNzYWdlIHtcbiAgY29uc3Qge21lc3NhZ2U6IGhhY2tNZXNzYWdlc30gPSBoYWNrRGlhZ25vc3RpYztcblxuICBjb25zdCBjYXVzZU1lc3NhZ2UgPSBoYWNrTWVzc2FnZXNbMF07XG4gIGludmFyaWFudChjYXVzZU1lc3NhZ2UucGF0aCAhPSBudWxsKTtcbiAgY29uc3QgZGlhZ25vc3RpY01lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSA9IHtcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIHByb3ZpZGVyTmFtZTogYEhhY2s6ICR7aGFja01lc3NhZ2VzWzBdLmNvZGV9YCxcbiAgICB0eXBlOiAnRXJyb3InLFxuICAgIHRleHQ6IGNhdXNlTWVzc2FnZS5kZXNjcixcbiAgICBmaWxlUGF0aDogY2F1c2VNZXNzYWdlLnBhdGgsXG4gICAgcmFuZ2U6IGV4dHJhY3RSYW5nZShjYXVzZU1lc3NhZ2UpLFxuICB9O1xuXG4gIC8vIFdoZW4gdGhlIG1lc3NhZ2UgaXMgYW4gYXJyYXkgd2l0aCBtdWx0aXBsZSBlbGVtZW50cywgdGhlIHNlY29uZCBlbGVtZW50XG4gIC8vIG9ud2FyZHMgY29tcHJpc2UgdGhlIHRyYWNlIGZvciB0aGUgZXJyb3IuXG4gIGlmIChoYWNrTWVzc2FnZXMubGVuZ3RoID4gMSkge1xuICAgIGRpYWdub3N0aWNNZXNzYWdlLnRyYWNlID0gaGFja01lc3NhZ2VzLnNsaWNlKDEpLm1hcChoYWNrTWVzc2FnZVRvVHJhY2UpO1xuICB9XG5cbiAgcmV0dXJuIGRpYWdub3N0aWNNZXNzYWdlO1xufVxuXG5jbGFzcyBIYWNrRGlhZ25vc3RpY3NQcm92aWRlciB7XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG4gIF9wcm92aWRlckJhc2U6IERpYWdub3N0aWNzUHJvdmlkZXJCYXNlO1xuICBfcmVxdWVzdFNlcmlhbGl6ZXI6IFJlcXVlc3RTZXJpYWxpemVyO1xuXG4gIC8qKlxuICAgKiBNYXBzIGhhY2sgcm9vdCB0byB0aGUgc2V0IG9mIGZpbGUgcGF0aHMgdW5kZXIgdGhhdCByb290IGZvciB3aGljaCB3ZSBoYXZlXG4gICAqIGV2ZXIgcmVwb3J0ZWQgZGlhZ25vc3RpY3MuXG4gICAqL1xuICBfaGFja0xhbmd1YWdlVG9GaWxlUGF0aHM6IE1hcDxIYWNrTGFuZ3VhZ2UsIFNldDxOdWNsaWRlVXJpPj47XG5cbiAgY29uc3RydWN0b3IoXG4gICAgc2hvdWxkUnVuT25UaGVGbHk6IGJvb2xlYW4sXG4gICAgYnVzeVNpZ25hbFByb3ZpZGVyOiBCdXN5U2lnbmFsUHJvdmlkZXJCYXNlLFxuICAgIFByb3ZpZGVyQmFzZTogdHlwZW9mIERpYWdub3N0aWNzUHJvdmlkZXJCYXNlID0gRGlhZ25vc3RpY3NQcm92aWRlckJhc2UsXG4gICkge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlciA9IGJ1c3lTaWduYWxQcm92aWRlcjtcbiAgICBjb25zdCB1dGlsc09wdGlvbnMgPSB7XG4gICAgICBncmFtbWFyU2NvcGVzOiBIQUNLX0dSQU1NQVJTX1NFVCxcbiAgICAgIHNob3VsZFJ1bk9uVGhlRmx5LFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IGVkaXRvciA9PiB0aGlzLl9ydW5EaWFnbm9zdGljcyhlZGl0b3IpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiBjYWxsYmFjayA9PiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2spLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlID0gbmV3IFByb3ZpZGVyQmFzZSh1dGlsc09wdGlvbnMpO1xuICAgIHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyID0gbmV3IFJlcXVlc3RTZXJpYWxpemVyKCk7XG4gICAgdGhpcy5faGFja0xhbmd1YWdlVG9GaWxlUGF0aHMgPSBuZXcgTWFwKCk7XG4gIH1cblxuICBfcnVuRGlhZ25vc3RpY3ModGV4dEVkaXRvcjogYXRvbSRUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICAnSGFjazogV2FpdGluZyBmb3IgZGlhZ25vc3RpY3MnLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuRGlhZ25vc3RpY3NJbXBsKHRleHRFZGl0b3IpLFxuICAgICk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2hhY2sucnVuLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlUGF0aCA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBgaGhfY2xpZW50YCBkb2Vzbid0IGN1cnJlbnRseSBzdXBwb3J0IGBvblRoZUZseWAgZGlhZ25vc2lzLlxuICAgIC8vIFNvLCBjdXJyZW50bHksIGl0IHdvdWxkIG9ubHkgd29yayBpZiB0aGVyZSBpcyBubyBgaGhfY2xpZW50YCBvciBgLmhoY29uZmlnYCB3aGVyZVxuICAgIC8vIHRoZSBgSGFja1dvcmtlcmAgbW9kZWwgd2lsbCBkaWFnbm9zZSB3aXRoIHRoZSB1cGRhdGVkIGVkaXRvciBjb250ZW50cy5cbiAgICBjb25zdCBkaWFnbm9zaXNSZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4oZmluZERpYWdub3N0aWNzKHRleHRFZGl0b3IpKTtcbiAgICBpZiAoZGlhZ25vc2lzUmVzdWx0LnN0YXR1cyA9PT0gJ291dGRhdGVkJyB8fCBkaWFnbm9zaXNSZXN1bHQucmVzdWx0ID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaWFnbm9zdGljcyA9IGRpYWdub3Npc1Jlc3VsdC5yZXN1bHQ7XG4gICAgY29uc3QgaGFja0xhbmd1YWdlID0gYXdhaXQgZ2V0SGFja0xhbmd1YWdlRm9yVXJpKHRleHRFZGl0b3IuZ2V0UGF0aCgpKTtcbiAgICBpZiAoIWhhY2tMYW5ndWFnZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbih7c2NvcGU6ICdmaWxlJywgZmlsZVBhdGhzOiBbZmlsZVBhdGhdfSk7XG4gICAgdGhpcy5faW52YWxpZGF0ZVBhdGhzRm9ySGFja0xhbmd1YWdlKGhhY2tMYW5ndWFnZSk7XG5cbiAgICBjb25zdCBwYXRoc0ZvckhhY2tMYW5ndWFnZSA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9oYWNrTGFuZ3VhZ2VUb0ZpbGVQYXRocy5zZXQoaGFja0xhbmd1YWdlLCBwYXRoc0ZvckhhY2tMYW5ndWFnZSk7XG4gICAgZm9yIChjb25zdCBkaWFnbm9zdGljIG9mIGRpYWdub3N0aWNzKSB7XG4gICAgICAvKlxuICAgICAgICogRWFjaCBtZXNzYWdlIGNvbnNpc3RzIG9mIHNldmVyYWwgZGlmZmVyZW50IGNvbXBvbmVudHMsIGVhY2ggd2l0aCBpdHNcbiAgICAgICAqIG93biB0ZXh0IGFuZCBwYXRoLlxuICAgICAgICovXG4gICAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWNNZXNzYWdlIG9mIGRpYWdub3N0aWMubWVzc2FnZSkge1xuICAgICAgICBwYXRoc0ZvckhhY2tMYW5ndWFnZS5hZGQoZGlhZ25vc3RpY01lc3NhZ2UucGF0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKHRoaXMuX3Byb2Nlc3NEaWFnbm9zdGljcyhkaWFnbm9zdGljcykpO1xuICB9XG5cbiAgX3Byb2Nlc3NEaWFnbm9zdGljcyhkaWFnbm9zdGljczogQXJyYXk8e21lc3NhZ2U6IEhhY2tEaWFnbm9zdGljO30+KTogRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlIHtcbiAgICAvLyBDb252ZXJ0IGFycmF5IG1lc3NhZ2VzIHRvIEVycm9yIE9iamVjdHMgd2l0aCBUcmFjZXMuXG4gICAgY29uc3QgZmlsZURpYWdub3N0aWNzID0gZGlhZ25vc3RpY3MubWFwKGhhY2tNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZSk7XG5cbiAgICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXMgPSBuZXcgTWFwKCk7XG4gICAgZm9yIChjb25zdCBkaWFnbm9zdGljIG9mIGZpbGVEaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgcGF0aCA9IGRpYWdub3N0aWNbJ2ZpbGVQYXRoJ107XG4gICAgICBsZXQgZGlhZ25vc3RpY0FycmF5ID0gZmlsZVBhdGhUb01lc3NhZ2VzLmdldChwYXRoKTtcbiAgICAgIGlmICghZGlhZ25vc3RpY0FycmF5KSB7XG4gICAgICAgIGRpYWdub3N0aWNBcnJheSA9IFtdO1xuICAgICAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KHBhdGgsIGRpYWdub3N0aWNBcnJheSk7XG4gICAgICB9XG4gICAgICBkaWFnbm9zdGljQXJyYXkucHVzaChkaWFnbm9zdGljKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBmaWxlUGF0aFRvTWVzc2FnZXMgfTtcbiAgfVxuXG4gIF9nZXRQYXRoc1RvSW52YWxpZGF0ZShoYWNrTGFuZ3VhZ2U6IEhhY2tMYW5ndWFnZSk6IEFycmF5PE51Y2xpZGVVcmk+IHtcbiAgICBpZiAoIWhhY2tMYW5ndWFnZS5pc0hhY2tBdmFpbGFibGUoKSkge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICBjb25zdCBmaWxlUGF0aHMgPSB0aGlzLl9oYWNrTGFuZ3VhZ2VUb0ZpbGVQYXRocy5nZXQoaGFja0xhbmd1YWdlKTtcbiAgICBpZiAoIWZpbGVQYXRocykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXkuZnJvbShmaWxlUGF0aHMpO1xuICB9XG5cbiAgX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogdm9pZCB7XG4gICAgLy8gRXZlcnkgdGltZSB3ZSBnZXQgYSBuZXcgc3Vic2NyaWJlciwgd2UgbmVlZCB0byBwdXNoIHJlc3VsdHMgdG8gdGhlbS4gVGhpc1xuICAgIC8vIGxvZ2ljIGlzIGNvbW1vbiB0byBhbGwgcHJvdmlkZXJzIGFuZCBzaG91bGQgYmUgYWJzdHJhY3RlZCBvdXQgKHQ3ODEzMDY5KVxuICAgIC8vXG4gICAgLy8gT25jZSB3ZSBwcm92aWRlIGFsbCBkaWFnbm9zdGljcywgaW5zdGVhZCBvZiBqdXN0IHRoZSBjdXJyZW50IGZpbGUsIHdlIGNhblxuICAgIC8vIHByb2JhYmx5IHJlbW92ZSB0aGUgYWN0aXZlVGV4dEVkaXRvciBwYXJhbWV0ZXIuXG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgaWYgKEhBQ0tfR1JBTU1BUlNfU0VULmhhcyhhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpKSB7XG4gICAgICAgIHRoaXMuX3J1bkRpYWdub3N0aWNzKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFJ1bk9uVGhlRmx5KHJ1bk9uVGhlRmx5OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnNldFJ1bk9uVGhlRmx5KHJ1bk9uVGhlRmx5KTtcbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGludmFsaWRhdGVQcm9qZWN0UGF0aChwcm9qZWN0UGF0aDogTnVjbGlkZVVyaSk6IHZvaWQge1xuICAgIGNvbnN0IGhhY2tMYW5ndWFnZSA9IGdldENhY2hlZEhhY2tMYW5ndWFnZUZvclVyaShwcm9qZWN0UGF0aCk7XG4gICAgaWYgKCFoYWNrTGFuZ3VhZ2UpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5faW52YWxpZGF0ZVBhdGhzRm9ySGFja0xhbmd1YWdlKGhhY2tMYW5ndWFnZSk7XG4gIH1cblxuICBfaW52YWxpZGF0ZVBhdGhzRm9ySGFja0xhbmd1YWdlKGhhY2tMYW5ndWFnZTogSGFja0xhbmd1YWdlKTogdm9pZCB7XG4gICAgY29uc3QgcGF0aHNUb0ludmFsaWRhdGUgPSB0aGlzLl9nZXRQYXRoc1RvSW52YWxpZGF0ZShoYWNrTGFuZ3VhZ2UpO1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbihcbiAgICAgIHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IHBhdGhzVG9JbnZhbGlkYXRlfSxcbiAgICApO1xuICAgIHRoaXMuX2hhY2tMYW5ndWFnZVRvRmlsZVBhdGhzLmRlbGV0ZShoYWNrTGFuZ3VhZ2UpO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UuZGlzcG9zZSgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gSGFja0RpYWdub3N0aWNzUHJvdmlkZXI7XG4iXX0=