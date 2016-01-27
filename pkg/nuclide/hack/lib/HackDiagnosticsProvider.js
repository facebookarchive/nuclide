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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkhhY2tEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBeUIwQixpQkFBaUI7O29CQUN1QyxRQUFROzt1QkFDNUQsZUFBZTs7dUNBQ1AsaUNBQWlDOztvQkFDbkQsTUFBTTs7c0JBQ0osUUFBUTs7OztzQ0FFRSxpQ0FBaUM7O0lBRTFELGlCQUFpQixxQkFBakIsaUJBQWlCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFpQnhCLFNBQVMsWUFBWSxDQUFDLE9BQTBCLEVBQWM7OztBQUc1RCxTQUFPLGdCQUNMLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzNDLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDdEMsQ0FBQztDQUNIOzs7QUFHRCxTQUFTLGtCQUFrQixDQUFDLFVBQTZCLEVBQVU7QUFDakUsU0FBTztBQUNMLFFBQUksRUFBRSxPQUFPO0FBQ2IsUUFBSSxFQUFFLFVBQVUsQ0FBQyxPQUFPLENBQUM7QUFDekIsWUFBUSxFQUFFLFVBQVUsQ0FBQyxNQUFNLENBQUM7QUFDNUIsU0FBSyxFQUFFLFlBQVksQ0FBQyxVQUFVLENBQUM7R0FDaEMsQ0FBQztDQUNIOztBQUVELFNBQVMsOEJBQThCLENBQ3JDLGNBQTBDLEVBQ25CO01BQ1AsWUFBWSxHQUFJLGNBQWMsQ0FBdkMsT0FBTzs7QUFFZCxNQUFNLFlBQVksR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDckMsMkJBQVUsWUFBWSxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztBQUNyQyxNQUFNLGlCQUF3QyxHQUFHO0FBQy9DLFNBQUssRUFBRSxNQUFNO0FBQ2IsZ0JBQVksRUFBRSxNQUFNO0FBQ3BCLFFBQUksRUFBRSxPQUFPO0FBQ2IsUUFBSSxFQUFFLFlB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YWNrRGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIEhhY2tMYW5ndWFnZSBmcm9tICcuL0hhY2tMYW5ndWFnZSc7XG5pbXBvcnQgdHlwZSB7XG4gIEhhY2tEaWFnbm9zdGljLFxuICBTaW5nbGVIYWNrTWVzc2FnZSxcbn0gZnJvbSAnLi4vLi4vaGFjay1iYXNlL2xpYi9IYWNrU2VydmljZSc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG4gIERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSxcbn0gZnJvbSAnLi4vLi4vZGlhZ25vc3RpY3MvYmFzZSc7XG5cbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5pbXBvcnQge2ZpbmREaWFnbm9zdGljcywgZ2V0SGFja0xhbmd1YWdlRm9yVXJpLCBnZXRDYWNoZWRIYWNrTGFuZ3VhZ2VGb3JVcml9IGZyb20gJy4vaGFjayc7XG5pbXBvcnQge2FycmF5LCBwcm9taXNlc30gZnJvbSAnLi4vLi4vY29tbW9ucyc7XG5pbXBvcnQge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcy9wcm92aWRlci1iYXNlJztcbmltcG9ydCB7UmFuZ2V9IGZyb20gJ2F0b20nO1xuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQge0hBQ0tfR1JBTU1BUlNfU0VUfSBmcm9tICcuLi8uLi9oYWNrLWNvbW1vbi9saWIvY29uc3RhbnRzJztcblxuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IHByb21pc2VzO1xuLyoqXG4gKiBDdXJyZW50bHksIGEgZGlhZ25vc3RpYyBmcm9tIEhhY2sgaXMgYW4gb2JqZWN0IHdpdGggYSBcIm1lc3NhZ2VcIiBwcm9wZXJ0eS5cbiAqIEVhY2ggaXRlbSBpbiB0aGUgXCJtZXNzYWdlXCIgYXJyYXkgaXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gKiAgICAgLSBwYXRoIChzdHJpbmcpIEZpbGUgdGhhdCBjb250YWlucyB0aGUgZXJyb3IuXG4gKiAgICAgLSBkZXNjciAoc3RyaW5nKSBEZXNjcmlwdGlvbiBvZiB0aGUgZXJyb3IuXG4gKiAgICAgLSBsaW5lIChudW1iZXIpIFN0YXJ0IGxpbmUuXG4gKiAgICAgLSBlbmRsaW5lIChudW1iZXIpIEVuZCBsaW5lLlxuICogICAgIC0gc3RhcnQgKG51bWJlcikgU3RhcnQgY29sdW1uLlxuICogICAgIC0gZW5kIChudW1iZXIpIEVuZCBjb2x1bW4uXG4gKiAgICAgLSBjb2RlIChudW1iZXIpIFByZXN1bWFibHkgYW4gZXJyb3IgY29kZS5cbiAqIFRoZSBtZXNzYWdlIGFycmF5IG1heSBoYXZlIG1vcmUgdGhhbiBvbmUgaXRlbS4gRm9yIGV4YW1wbGUsIGlmIHRoZXJlIGlzIGFcbiAqIHR5cGUgaW5jb21wYXRpYmlsaXR5IGVycm9yLCB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbWVzc2FnZSBhcnJheSBibGFtZXMgdGhlXG4gKiB1c2FnZSBvZiB0aGUgd3JvbmcgdHlwZSBhbmQgdGhlIHNlY29uZCBibGFtZXMgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSB0eXBlXG4gKiB3aXRoIHdoaWNoIHRoZSB1c2FnZSBkaXNhZ3JlZXMuIE5vdGUgdGhhdCB0aGVzZSBjb3VsZCBvY2N1ciBpbiBkaWZmZXJlbnRcbiAqIGZpbGVzLlxuICovXG5mdW5jdGlvbiBleHRyYWN0UmFuZ2UobWVzc2FnZTogU2luZ2xlSGFja01lc3NhZ2UpOiBhdG9tJFJhbmdlIHtcbiAgLy8gSXQncyB1bmNsZWFyIHdoeSB0aGUgMS1iYXNlZCB0byAwLWJhc2VkIGluZGV4aW5nIHdvcmtzIHRoZSB3YXkgdGhhdCBpdFxuICAvLyBkb2VzLCBidXQgdGhpcyBoYXMgdGhlIGRlc2lyZWQgZWZmZWN0IGluIHRoZSBVSSwgaW4gcHJhY3RpY2UuXG4gIHJldHVybiBuZXcgUmFuZ2UoXG4gICAgW21lc3NhZ2VbJ2xpbmUnXSAtIDEsIG1lc3NhZ2VbJ3N0YXJ0J10gLSAxXSxcbiAgICBbbWVzc2FnZVsnbGluZSddIC0gMSwgbWVzc2FnZVsnZW5kJ11dXG4gICk7XG59XG5cbi8vIEEgdHJhY2Ugb2JqZWN0IGlzIHZlcnkgc2ltaWxhciB0byBhbiBlcnJvciBvYmplY3QuXG5mdW5jdGlvbiBoYWNrTWVzc2FnZVRvVHJhY2UodHJhY2VFcnJvcjogU2luZ2xlSGFja01lc3NhZ2UpOiBPYmplY3Qge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUcmFjZScsXG4gICAgdGV4dDogdHJhY2VFcnJvclsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogdHJhY2VFcnJvclsncGF0aCddLFxuICAgIHJhbmdlOiBleHRyYWN0UmFuZ2UodHJhY2VFcnJvciksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGhhY2tNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZShcbiAgaGFja0RpYWdub3N0aWM6IHttZXNzYWdlOiBIYWNrRGlhZ25vc3RpYzt9LFxuKTogRmlsZURpYWdub3N0aWNNZXNzYWdlIHtcbiAgY29uc3Qge21lc3NhZ2U6IGhhY2tNZXNzYWdlc30gPSBoYWNrRGlhZ25vc3RpYztcblxuICBjb25zdCBjYXVzZU1lc3NhZ2UgPSBoYWNrTWVzc2FnZXNbMF07XG4gIGludmFyaWFudChjYXVzZU1lc3NhZ2UucGF0aCAhPSBudWxsKTtcbiAgY29uc3QgZGlhZ25vc3RpY01lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSA9IHtcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIHByb3ZpZGVyTmFtZTogJ0hhY2snLFxuICAgIHR5cGU6ICdFcnJvcicsXG4gICAgdGV4dDogY2F1c2VNZXNzYWdlLmRlc2NyLFxuICAgIGZpbGVQYXRoOiBjYXVzZU1lc3NhZ2UucGF0aCxcbiAgICByYW5nZTogZXh0cmFjdFJhbmdlKGNhdXNlTWVzc2FnZSksXG4gIH07XG5cbiAgLy8gV2hlbiB0aGUgbWVzc2FnZSBpcyBhbiBhcnJheSB3aXRoIG11bHRpcGxlIGVsZW1lbnRzLCB0aGUgc2Vjb25kIGVsZW1lbnRcbiAgLy8gb253YXJkcyBjb21wcmlzZSB0aGUgdHJhY2UgZm9yIHRoZSBlcnJvci5cbiAgaWYgKGhhY2tNZXNzYWdlcy5sZW5ndGggPiAxKSB7XG4gICAgZGlhZ25vc3RpY01lc3NhZ2UudHJhY2UgPSBoYWNrTWVzc2FnZXMuc2xpY2UoMSkubWFwKGhhY2tNZXNzYWdlVG9UcmFjZSk7XG4gIH1cblxuICByZXR1cm4gZGlhZ25vc3RpY01lc3NhZ2U7XG59XG5cbmNsYXNzIEhhY2tEaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI7XG5cbiAgLyoqXG4gICAqIE1hcHMgaGFjayByb290IHRvIHRoZSBzZXQgb2YgZmlsZSBwYXRocyB1bmRlciB0aGF0IHJvb3QgZm9yIHdoaWNoIHdlIGhhdmVcbiAgICogZXZlciByZXBvcnRlZCBkaWFnbm9zdGljcy5cbiAgICovXG4gIF9oYWNrTGFuZ3VhZ2VUb0ZpbGVQYXRoczogTWFwPEhhY2tMYW5ndWFnZSwgU2V0PE51Y2xpZGVVcmk+PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzaG91bGRSdW5PblRoZUZseTogYm9vbGVhbixcbiAgICBidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UsXG4gICAgUHJvdmlkZXJCYXNlOiB0eXBlb2YgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UgPSBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSxcbiAgKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IEhBQ0tfR1JBTU1BUlNfU0VULFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1bkRpYWdub3N0aWNzKGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgUHJvdmlkZXJCYXNlKHV0aWxzT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9oYWNrTGFuZ3VhZ2VUb0ZpbGVQYXRocyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIF9ydW5EaWFnbm9zdGljcyh0ZXh0RWRpdG9yOiBhdG9tJFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgICdIYWNrOiBXYWl0aW5nIGZvciBkaWFnbm9zdGljcycsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvciksXG4gICAgKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnaGFjay5ydW4tZGlhZ25vc3RpY3MnKVxuICBhc3luYyBfcnVuRGlhZ25vc3RpY3NJbXBsKHRleHRFZGl0b3I6IGF0b20kVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGVQYXRoID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIGBoaF9jbGllbnRgIGRvZXNuJ3QgY3VycmVudGx5IHN1cHBvcnQgYG9uVGhlRmx5YCBkaWFnbm9zaXMuXG4gICAgLy8gU28sIGN1cnJlbnRseSwgaXQgd291bGQgb25seSB3b3JrIGlmIHRoZXJlIGlzIG5vIGBoaF9jbGllbnRgIG9yIGAuaGhjb25maWdgIHdoZXJlXG4gICAgLy8gdGhlIGBIYWNrV29ya2VyYCBtb2RlbCB3aWxsIGRpYWdub3NlIHdpdGggdGhlIHVwZGF0ZWQgZWRpdG9yIGNvbnRlbnRzLlxuICAgIGNvbnN0IHtzdGF0dXMsIHJlc3VsdH0gPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4oZmluZERpYWdub3N0aWNzKHRleHRFZGl0b3IpKTtcbiAgICBpZiAoIXJlc3VsdCB8fCBzdGF0dXMgPT09ICdvdXRkYXRlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBkaWFnbm9zdGljcyA9IHJlc3VsdDtcbiAgICBjb25zdCBoYWNrTGFuZ3VhZ2UgPSBhd2FpdCBnZXRIYWNrTGFuZ3VhZ2VGb3JVcmkodGV4dEVkaXRvci5nZXRQYXRoKCkpO1xuICAgIGlmICghaGFja0xhbmd1YWdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IFtmaWxlUGF0aF19KTtcbiAgICB0aGlzLl9pbnZhbGlkYXRlUGF0aHNGb3JIYWNrTGFuZ3VhZ2UoaGFja0xhbmd1YWdlKTtcblxuICAgIGNvbnN0IHBhdGhzRm9ySGFja0xhbmd1YWdlID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2hhY2tMYW5ndWFnZVRvRmlsZVBhdGhzLnNldChoYWNrTGFuZ3VhZ2UsIHBhdGhzRm9ySGFja0xhbmd1YWdlKTtcbiAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWMgb2YgZGlhZ25vc3RpY3MpIHtcbiAgICAgIC8qIEVhY2ggbWVzc2FnZSBjb25zaXN0cyBvZiBzZXZlcmFsIGRpZmZlcmVudCBjb21wb25lbnRzLCBlYWNoIHdpdGggaXRzXG4gICAgICAgKiBvd24gdGV4dCBhbmQgcGF0aC4gKi9cbiAgICAgIGZvciAoY29uc3QgZGlhZ25vc3RpY01lc3NhZ2Ugb2YgZGlhZ25vc3RpYy5tZXNzYWdlKSB7XG4gICAgICAgIHBhdGhzRm9ySGFja0xhbmd1YWdlLmFkZChkaWFnbm9zdGljTWVzc2FnZS5wYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUodGhpcy5fcHJvY2Vzc0RpYWdub3N0aWNzKGRpYWdub3N0aWNzKSk7XG4gIH1cblxuICBfcHJvY2Vzc0RpYWdub3N0aWNzKGRpYWdub3N0aWNzOiBBcnJheTx7bWVzc2FnZTogSGFja0RpYWdub3N0aWM7fT4pOiBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUge1xuICAgIC8vIENvbnZlcnQgYXJyYXkgbWVzc2FnZXMgdG8gRXJyb3IgT2JqZWN0cyB3aXRoIFRyYWNlcy5cbiAgICBjb25zdCBmaWxlRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5tYXAoaGFja01lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKTtcblxuICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcbiAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWMgb2YgZmlsZURpYWdub3N0aWNzKSB7XG4gICAgICBjb25zdCBwYXRoID0gZGlhZ25vc3RpY1snZmlsZVBhdGgnXTtcbiAgICAgIGxldCBkaWFnbm9zdGljQXJyYXkgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KHBhdGgpO1xuICAgICAgaWYgKCFkaWFnbm9zdGljQXJyYXkpIHtcbiAgICAgICAgZGlhZ25vc3RpY0FycmF5ID0gW107XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQocGF0aCwgZGlhZ25vc3RpY0FycmF5KTtcbiAgICAgIH1cbiAgICAgIGRpYWdub3N0aWNBcnJheS5wdXNoKGRpYWdub3N0aWMpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGZpbGVQYXRoVG9NZXNzYWdlcyB9O1xuICB9XG5cbiAgX2dldFBhdGhzVG9JbnZhbGlkYXRlKGhhY2tMYW5ndWFnZTogSGFja0xhbmd1YWdlKTogQXJyYXk8TnVjbGlkZVVyaT4ge1xuICAgIGlmICghaGFja0xhbmd1YWdlLmlzSGFja0F2YWlsYWJsZSgpKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMuX2hhY2tMYW5ndWFnZVRvRmlsZVBhdGhzLmdldChoYWNrTGFuZ3VhZ2UpO1xuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBhcnJheS5mcm9tKGZpbGVQYXRocyk7XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICAvLyBFdmVyeSB0aW1lIHdlIGdldCBhIG5ldyBzdWJzY3JpYmVyLCB3ZSBuZWVkIHRvIHB1c2ggcmVzdWx0cyB0byB0aGVtLiBUaGlzXG4gICAgLy8gbG9naWMgaXMgY29tbW9uIHRvIGFsbCBwcm92aWRlcnMgYW5kIHNob3VsZCBiZSBhYnN0cmFjdGVkIG91dCAodDc4MTMwNjkpXG4gICAgLy9cbiAgICAvLyBPbmNlIHdlIHByb3ZpZGUgYWxsIGRpYWdub3N0aWNzLCBpbnN0ZWFkIG9mIGp1c3QgdGhlIGN1cnJlbnQgZmlsZSwgd2UgY2FuXG4gICAgLy8gcHJvYmFibHkgcmVtb3ZlIHRoZSBhY3RpdmVUZXh0RWRpdG9yIHBhcmFtZXRlci5cbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICBpZiAoSEFDS19HUkFNTUFSU19TRVQuaGFzKGFjdGl2ZVRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkpIHtcbiAgICAgICAgdGhpcy5fcnVuRGlhZ25vc3RpY3MoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2Uuc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHkpO1xuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cblxuICBpbnZhbGlkYXRlUHJvamVjdFBhdGgocHJvamVjdFBhdGg6IE51Y2xpZGVVcmkpOiB2b2lkIHtcbiAgICBjb25zdCBoYWNrTGFuZ3VhZ2UgPSBnZXRDYWNoZWRIYWNrTGFuZ3VhZ2VGb3JVcmkocHJvamVjdFBhdGgpO1xuICAgIGlmICghaGFja0xhbmd1YWdlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHRoaXMuX2ludmFsaWRhdGVQYXRoc0ZvckhhY2tMYW5ndWFnZShoYWNrTGFuZ3VhZ2UpO1xuICB9XG5cbiAgX2ludmFsaWRhdGVQYXRoc0ZvckhhY2tMYW5ndWFnZShoYWNrTGFuZ3VhZ2U6IEhhY2tMYW5ndWFnZSk6IHZvaWQge1xuICAgIGNvbnN0IHBhdGhzVG9JbnZhbGlkYXRlID0gdGhpcy5fZ2V0UGF0aHNUb0ludmFsaWRhdGUoaGFja0xhbmd1YWdlKTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oXG4gICAgICB7c2NvcGU6ICdmaWxlJywgZmlsZVBhdGhzOiBwYXRoc1RvSW52YWxpZGF0ZX0sXG4gICAgKTtcbiAgICB0aGlzLl9oYWNrTGFuZ3VhZ2VUb0ZpbGVQYXRocy5kZWxldGUoaGFja0xhbmd1YWdlKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLmRpc3Bvc2UoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhY2tEaWFnbm9zdGljc1Byb3ZpZGVyO1xuIl19