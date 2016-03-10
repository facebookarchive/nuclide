Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _analytics = require('../../analytics');

var _FlowServiceFactory = require('./FlowServiceFactory');

var _require = require('../../commons');

var promises = _require.promises;
var array = _require.array;
var RequestSerializer = promises.RequestSerializer;

var _require2 = require('../../diagnostics/provider-base');

var DiagnosticsProviderBase = _require2.DiagnosticsProviderBase;

var _require3 = require('atom');

var Range = _require3.Range;

var invariant = require('assert');

var _require4 = require('./constants.js');

var JS_GRAMMARS = _require4.JS_GRAMMARS;

/*
 * TODO remove these duplicate definitions once we figure out importing types
 * through symlinks.
 */

/**
 * Currently, a diagnostic from Flow is an object with a "message" property.
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
  return new Range([message['line'] - 1, message['start'] - 1], [message['endline'] - 1, message['end']]);
}

// A trace object is very similar to an error object.
function flowMessageToTrace(message) {
  return {
    type: 'Trace',
    text: message['descr'],
    filePath: message['path'],
    range: extractRange(message)
  };
}

function flowMessageToDiagnosticMessage(flowMessages) {
  var flowMessage = flowMessages[0];

  var diagnosticMessage = {
    scope: 'file',
    providerName: 'Flow',
    type: flowMessage['level'] === 'error' ? 'Error' : 'Warning',
    text: flowMessage['descr'],
    filePath: flowMessage['path'],
    range: extractRange(flowMessage)
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (flowMessages.length > 1) {
    diagnosticMessage.trace = flowMessages.slice(1).map(flowMessageToTrace);
  }

  return diagnosticMessage;
}

var FlowDiagnosticsProvider = (function () {
  function FlowDiagnosticsProvider(shouldRunOnTheFly, busySignalProvider) {
    var _this = this;

    var ProviderBase = arguments.length <= 2 || arguments[2] === undefined ? DiagnosticsProviderBase : arguments[2];

    _classCallCheck(this, FlowDiagnosticsProvider);

    this._busySignalProvider = busySignalProvider;
    var utilsOptions = {
      grammarScopes: new Set(JS_GRAMMARS),
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
    this._flowRootToFilePaths = new Map();
  }

  _createDecoratedClass(FlowDiagnosticsProvider, [{
    key: '_runDiagnostics',
    value: function _runDiagnostics(textEditor) {
      var _this2 = this;

      this._busySignalProvider.reportBusy('Flow: Waiting for diagnostics', function () {
        return _this2._runDiagnosticsImpl(textEditor);
      });
    }
  }, {
    key: '_runDiagnosticsImpl',
    decorators: [(0, _analytics.trackTiming)('flow.run-diagnostics')],
    value: _asyncToGenerator(function* (textEditor) {
      var file = textEditor.getPath();
      if (!file) {
        return;
      }

      var currentContents = textEditor.isModified() ? textEditor.getText() : null;

      var flowService = (0, _FlowServiceFactory.getFlowServiceByNuclideUri)(file);
      invariant(flowService);
      var result = yield this._requestSerializer.run(flowService.flowFindDiagnostics(file, currentContents));
      if (result.status === 'outdated') {
        return;
      }
      var diagnostics = result.result;
      if (!diagnostics) {
        return;
      }
      var flowRoot = diagnostics.flowRoot;
      var messages = diagnostics.messages;

      var pathsToInvalidate = this._getPathsToInvalidate(flowRoot);
      /*
       * TODO Consider optimizing for the common case of only a single flow root
       * by invalidating all instead of enumerating the files.
       */
      this._providerBase.publishMessageInvalidation({ scope: 'file', filePaths: pathsToInvalidate });

      var pathsForRoot = new Set();
      this._flowRootToFilePaths.set(flowRoot, pathsForRoot);
      for (var message of messages) {
        /*
         * Each message consists of several different components, each with its
         * own text and path.
         */
        for (var messageComponent of message) {
          pathsForRoot.add(messageComponent.path);
        }
      }

      this._providerBase.publishMessageUpdate(this._processDiagnostics(messages, file));
    })
  }, {
    key: '_getPathsToInvalidate',
    value: function _getPathsToInvalidate(flowRoot) {
      var filePaths = this._flowRootToFilePaths.get(flowRoot);
      if (!filePaths) {
        return [];
      }
      return array.from(filePaths);
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
        var matchesGrammar = JS_GRAMMARS.indexOf(activeTextEditor.getGrammar().scopeName) !== -1;
        if (matchesGrammar) {
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
    key: 'dispose',
    value: function dispose() {
      this._providerBase.dispose();
    }
  }, {
    key: '_processDiagnostics',
    value: function _processDiagnostics(diagnostics, currentFile) {

      // convert array messages to Error Objects with Traces
      var fileDiagnostics = diagnostics.map(flowMessageToDiagnosticMessage);

      var filePathToMessages = new Map();

      // This invalidates the errors in the current file. If Flow, when running in this root, has
      // reported errors for this file, this invalidation is not necessary because the path will be
      // explicitly invalidated. However, if Flow has reported an error in this root from another root
      // (as sometimes happens when Flow roots contain symlinks to other Flow roots), and it also does
      // not report that same error when running in this Flow root, then we want the error to
      // disappear when this file is opened.
      //
      // This isn't a perfect solution, since it can still leave diagnostics up in other files, but
      // this is a corner case and doing this is still better than doing nothing.
      //
      // I think that whenever this happens, it's a bug in Flow. It seems strange for Flow to report
      // errors in one place when run from one root, and not report errors in that same place when run
      // from another root. But such is life.
      filePathToMessages.set(currentFile, []);

      for (var diagnostic of fileDiagnostics) {
        var _path = diagnostic['filePath'];
        var diagnosticArray = filePathToMessages.get(_path);
        if (!diagnosticArray) {
          diagnosticArray = [];
          filePathToMessages.set(_path, diagnosticArray);
        }
        diagnosticArray.push(diagnostic);
      }

      return { filePathToMessages: filePathToMessages };
    }
  }, {
    key: 'invalidateProjectPath',
    value: function invalidateProjectPath(projectPath) {
      var pathsToInvalidate = new Set();
      for (var flowRootEntry of this._flowRootToFilePaths) {
        var _flowRootEntry = _slicedToArray(flowRootEntry, 2);

        var _flowRoot = _flowRootEntry[0];
        var filePaths = _flowRootEntry[1];

        if (!_flowRoot.startsWith(projectPath)) {
          continue;
        }
        for (var filePath of filePaths) {
          pathsToInvalidate.add(filePath);
        }
        this._flowRootToFilePaths['delete'](_flowRoot);
      }
      this._providerBase.publishMessageInvalidation({
        scope: 'file',
        filePaths: array.from(pathsToInvalidate)
      });
    }
  }]);

  return FlowDiagnosticsProvider;
})();

module.exports = FlowDiagnosticsProvider;

/**
  * Maps flow root to the set of file paths under that root for which we have
  * ever reported diagnostics.
  */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3lCQW9CMEIsaUJBQWlCOztrQ0FFRixzQkFBc0I7O2VBQ3JDLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQTNDLFFBQVEsWUFBUixRQUFRO0lBQUUsS0FBSyxZQUFMLEtBQUs7SUFDZixpQkFBaUIsR0FBSSxRQUFRLENBQTdCLGlCQUFpQjs7Z0JBQ1UsT0FBTyxDQUFDLGlDQUFpQyxDQUFDOztJQUFyRSx1QkFBdUIsYUFBdkIsdUJBQXVCOztnQkFDZCxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLGFBQUwsS0FBSzs7QUFDWixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O2dCQUVkLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBeEMsV0FBVyxhQUFYLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NsQixTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7OztBQUc3QixTQUFPLElBQUksS0FBSyxDQUNkLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzNDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDekMsQ0FBQztDQUNIOzs7QUFHRCxTQUFTLGtCQUFrQixDQUFDLE9BQU8sRUFBRTtBQUNuQyxTQUFPO0FBQ0wsUUFBSSxFQUFFLE9BQU87QUFDYixRQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUN0QixZQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUN6QixTQUFLLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQztHQUM3QixDQUFDO0NBQ0g7O0FBRUQsU0FBUyw4QkFBOEIsQ0FBQyxZQUFZLEVBQUU7QUFD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QUFFLENBQUM7S0FDL0I7OztXQUVvQiwrQkFBQyxXQUFtQixFQUFRO0FBQy9DLFVBQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNwQyxXQUFLLElBQU0sYUFBYSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTs0Q0FDdkIsYUFBYTs7WUFBcEMsU0FBUTtZQUFFLFNBQVM7O0FBQzFCLFlBQUksQ0FBQyxTQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQ3JDLG1CQUFTO1NBQ1Y7QUFDRCxhQUFLLElBQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtBQUNoQywyQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDakM7QUFDRCxZQUFJLENBQUMsb0JBQW9CLFVBQU8sQ0FBQyxTQUFRLENBQUMsQ0FBQztPQUM1QztBQUNELFVBQUksQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUM7QUFDNUMsYUFBSyxFQUFFLE1BQU07QUFDYixpQkFBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7T0FDekMsQ0FBQyxDQUFDO0tBQ0o7OztTQTdLRyx1QkFBdUI7OztBQWdMN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJGbG93RGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbiAgRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlLFxufSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcy9iYXNlJztcblxuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHtnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi9GbG93U2VydmljZUZhY3RvcnknO1xuY29uc3Qge3Byb21pc2VzLCBhcnJheX0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG5jb25zdCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9ID0gcmVxdWlyZSgnLi4vLi4vZGlhZ25vc3RpY3MvcHJvdmlkZXItYmFzZScpO1xuY29uc3Qge1JhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG5jb25zdCB7SlNfR1JBTU1BUlN9ID0gcmVxdWlyZSgnLi9jb25zdGFudHMuanMnKTtcblxuLypcbiAqIFRPRE8gcmVtb3ZlIHRoZXNlIGR1cGxpY2F0ZSBkZWZpbml0aW9ucyBvbmNlIHdlIGZpZ3VyZSBvdXQgaW1wb3J0aW5nIHR5cGVzXG4gKiB0aHJvdWdoIHN5bWxpbmtzLlxuICovXG5leHBvcnQgdHlwZSBEaWFnbm9zdGljcyA9IHtcbiAgZmxvd1Jvb3Q6IE51Y2xpZGVVcmk7XG4gIG1lc3NhZ2VzOiBBcnJheTxGbG93RGlhZ25vc3RpY0l0ZW0+XG59O1xudHlwZSBGbG93RXJyb3IgPSB7XG4gIGxldmVsOiBzdHJpbmc7XG4gIGRlc2NyOiBzdHJpbmc7XG4gIHBhdGg6IHN0cmluZztcbiAgbGluZTogbnVtYmVyO1xuICBzdGFydDogbnVtYmVyO1xuICBlbmRsaW5lOiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xufVxuXG50eXBlIEZsb3dEaWFnbm9zdGljSXRlbSA9IEFycmF5PEZsb3dFcnJvcj47XG5cbi8qKlxuICogQ3VycmVudGx5LCBhIGRpYWdub3N0aWMgZnJvbSBGbG93IGlzIGFuIG9iamVjdCB3aXRoIGEgXCJtZXNzYWdlXCIgcHJvcGVydHkuXG4gKiBFYWNoIGl0ZW0gaW4gdGhlIFwibWVzc2FnZVwiIGFycmF5IGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICogICAgIC0gcGF0aCAoc3RyaW5nKSBGaWxlIHRoYXQgY29udGFpbnMgdGhlIGVycm9yLlxuICogICAgIC0gZGVzY3IgKHN0cmluZykgRGVzY3JpcHRpb24gb2YgdGhlIGVycm9yLlxuICogICAgIC0gbGluZSAobnVtYmVyKSBTdGFydCBsaW5lLlxuICogICAgIC0gZW5kbGluZSAobnVtYmVyKSBFbmQgbGluZS5cbiAqICAgICAtIHN0YXJ0IChudW1iZXIpIFN0YXJ0IGNvbHVtbi5cbiAqICAgICAtIGVuZCAobnVtYmVyKSBFbmQgY29sdW1uLlxuICogICAgIC0gY29kZSAobnVtYmVyKSBQcmVzdW1hYmx5IGFuIGVycm9yIGNvZGUuXG4gKiBUaGUgbWVzc2FnZSBhcnJheSBtYXkgaGF2ZSBtb3JlIHRoYW4gb25lIGl0ZW0uIEZvciBleGFtcGxlLCBpZiB0aGVyZSBpcyBhXG4gKiB0eXBlIGluY29tcGF0aWJpbGl0eSBlcnJvciwgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIG1lc3NhZ2UgYXJyYXkgYmxhbWVzIHRoZVxuICogdXNhZ2Ugb2YgdGhlIHdyb25nIHR5cGUgYW5kIHRoZSBzZWNvbmQgYmxhbWVzIHRoZSBkZWNsYXJhdGlvbiBvZiB0aGUgdHlwZVxuICogd2l0aCB3aGljaCB0aGUgdXNhZ2UgZGlzYWdyZWVzLiBOb3RlIHRoYXQgdGhlc2UgY291bGQgb2NjdXIgaW4gZGlmZmVyZW50XG4gKiBmaWxlcy5cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFJhbmdlKG1lc3NhZ2UpIHtcbiAgLy8gSXQncyB1bmNsZWFyIHdoeSB0aGUgMS1iYXNlZCB0byAwLWJhc2VkIGluZGV4aW5nIHdvcmtzIHRoZSB3YXkgdGhhdCBpdFxuICAvLyBkb2VzLCBidXQgdGhpcyBoYXMgdGhlIGRlc2lyZWQgZWZmZWN0IGluIHRoZSBVSSwgaW4gcHJhY3RpY2UuXG4gIHJldHVybiBuZXcgUmFuZ2UoXG4gICAgW21lc3NhZ2VbJ2xpbmUnXSAtIDEsIG1lc3NhZ2VbJ3N0YXJ0J10gLSAxXSxcbiAgICBbbWVzc2FnZVsnZW5kbGluZSddIC0gMSwgbWVzc2FnZVsnZW5kJ11dXG4gICk7XG59XG5cbi8vIEEgdHJhY2Ugb2JqZWN0IGlzIHZlcnkgc2ltaWxhciB0byBhbiBlcnJvciBvYmplY3QuXG5mdW5jdGlvbiBmbG93TWVzc2FnZVRvVHJhY2UobWVzc2FnZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUcmFjZScsXG4gICAgdGV4dDogbWVzc2FnZVsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogbWVzc2FnZVsncGF0aCddLFxuICAgIHJhbmdlOiBleHRyYWN0UmFuZ2UobWVzc2FnZSksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGZsb3dNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZShmbG93TWVzc2FnZXMpIHtcbiAgY29uc3QgZmxvd01lc3NhZ2UgPSBmbG93TWVzc2FnZXNbMF07XG5cbiAgY29uc3QgZGlhZ25vc3RpY01lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSA9IHtcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIHByb3ZpZGVyTmFtZTogJ0Zsb3cnLFxuICAgIHR5cGU6IGZsb3dNZXNzYWdlWydsZXZlbCddID09PSAnZXJyb3InID8gJ0Vycm9yJyA6ICdXYXJuaW5nJyxcbiAgICB0ZXh0OiBmbG93TWVzc2FnZVsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogZmxvd01lc3NhZ2VbJ3BhdGgnXSxcbiAgICByYW5nZTogZXh0cmFjdFJhbmdlKGZsb3dNZXNzYWdlKSxcbiAgfTtcblxuICAvLyBXaGVuIHRoZSBtZXNzYWdlIGlzIGFuIGFycmF5IHdpdGggbXVsdGlwbGUgZWxlbWVudHMsIHRoZSBzZWNvbmQgZWxlbWVudFxuICAvLyBvbndhcmRzIGNvbXByaXNlIHRoZSB0cmFjZSBmb3IgdGhlIGVycm9yLlxuICBpZiAoZmxvd01lc3NhZ2VzLmxlbmd0aCA+IDEpIHtcbiAgICBkaWFnbm9zdGljTWVzc2FnZS50cmFjZSA9IGZsb3dNZXNzYWdlcy5zbGljZSgxKS5tYXAoZmxvd01lc3NhZ2VUb1RyYWNlKTtcbiAgfVxuXG4gIHJldHVybiBkaWFnbm9zdGljTWVzc2FnZTtcbn1cblxuY2xhc3MgRmxvd0RpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjtcblxuICAvKipcbiAgICAqIE1hcHMgZmxvdyByb290IHRvIHRoZSBzZXQgb2YgZmlsZSBwYXRocyB1bmRlciB0aGF0IHJvb3QgZm9yIHdoaWNoIHdlIGhhdmVcbiAgICAqIGV2ZXIgcmVwb3J0ZWQgZGlhZ25vc3RpY3MuXG4gICAgKi9cbiAgX2Zsb3dSb290VG9GaWxlUGF0aHM6IE1hcDxOdWNsaWRlVXJpLCBTZXQ8TnVjbGlkZVVyaT4+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBib29sZWFuLFxuICAgIGJ1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSxcbiAgICBQcm92aWRlckJhc2U/OiB0eXBlb2YgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UgPSBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSxcbiAgKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IG5ldyBTZXQoSlNfR1JBTU1BUlMpLFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1bkRpYWdub3N0aWNzKGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgUHJvdmlkZXJCYXNlKHV0aWxzT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgX3J1bkRpYWdub3N0aWNzKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgICdGbG93OiBXYWl0aW5nIGZvciBkaWFnbm9zdGljcycsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvciksXG4gICAgKTtcbiAgfVxuXG4gIEB0cmFja1RpbWluZygnZmxvdy5ydW4tZGlhZ25vc3RpY3MnKVxuICBhc3luYyBfcnVuRGlhZ25vc3RpY3NJbXBsKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBjb25zdCBmaWxlID0gdGV4dEVkaXRvci5nZXRQYXRoKCk7XG4gICAgaWYgKCFmaWxlKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY3VycmVudENvbnRlbnRzID0gdGV4dEVkaXRvci5pc01vZGlmaWVkKCkgPyB0ZXh0RWRpdG9yLmdldFRleHQoKSA6IG51bGw7XG5cbiAgICBjb25zdCBmbG93U2VydmljZSA9IGdldEZsb3dTZXJ2aWNlQnlOdWNsaWRlVXJpKGZpbGUpO1xuICAgIGludmFyaWFudChmbG93U2VydmljZSk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIucnVuKFxuICAgICAgZmxvd1NlcnZpY2UuZmxvd0ZpbmREaWFnbm9zdGljcyhmaWxlLCBjdXJyZW50Q29udGVudHMpXG4gICAgKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ291dGRhdGVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkaWFnbm9zdGljczogP0RpYWdub3N0aWNzID0gcmVzdWx0LnJlc3VsdDtcbiAgICBpZiAoIWRpYWdub3N0aWNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtmbG93Um9vdCwgbWVzc2FnZXN9ID0gZGlhZ25vc3RpY3M7XG5cbiAgICBjb25zdCBwYXRoc1RvSW52YWxpZGF0ZSA9IHRoaXMuX2dldFBhdGhzVG9JbnZhbGlkYXRlKGZsb3dSb290KTtcbiAgICAvKlxuICAgICAqIFRPRE8gQ29uc2lkZXIgb3B0aW1pemluZyBmb3IgdGhlIGNvbW1vbiBjYXNlIG9mIG9ubHkgYSBzaW5nbGUgZmxvdyByb290XG4gICAgICogYnkgaW52YWxpZGF0aW5nIGFsbCBpbnN0ZWFkIG9mIGVudW1lcmF0aW5nIHRoZSBmaWxlcy5cbiAgICAgKi9cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoczogcGF0aHNUb0ludmFsaWRhdGV9KTtcblxuICAgIGNvbnN0IHBhdGhzRm9yUm9vdCA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzLnNldChmbG93Um9vdCwgcGF0aHNGb3JSb290KTtcbiAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgbWVzc2FnZXMpIHtcbiAgICAgIC8qXG4gICAgICAgKiBFYWNoIG1lc3NhZ2UgY29uc2lzdHMgb2Ygc2V2ZXJhbCBkaWZmZXJlbnQgY29tcG9uZW50cywgZWFjaCB3aXRoIGl0c1xuICAgICAgICogb3duIHRleHQgYW5kIHBhdGguXG4gICAgICAgKi9cbiAgICAgIGZvciAoY29uc3QgbWVzc2FnZUNvbXBvbmVudCBvZiBtZXNzYWdlKSB7XG4gICAgICAgIHBhdGhzRm9yUm9vdC5hZGQobWVzc2FnZUNvbXBvbmVudC5wYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUodGhpcy5fcHJvY2Vzc0RpYWdub3N0aWNzKG1lc3NhZ2VzLCBmaWxlKSk7XG4gIH1cblxuICBfZ2V0UGF0aHNUb0ludmFsaWRhdGUoZmxvd1Jvb3Q6IE51Y2xpZGVVcmkpOiBBcnJheTxOdWNsaWRlVXJpPiB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5nZXQoZmxvd1Jvb3QpO1xuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBhcnJheS5mcm9tKGZpbGVQYXRocyk7XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICAvLyBFdmVyeSB0aW1lIHdlIGdldCBhIG5ldyBzdWJzY3JpYmVyLCB3ZSBuZWVkIHRvIHB1c2ggcmVzdWx0cyB0byB0aGVtLiBUaGlzXG4gICAgLy8gbG9naWMgaXMgY29tbW9uIHRvIGFsbCBwcm92aWRlcnMgYW5kIHNob3VsZCBiZSBhYnN0cmFjdGVkIG91dCAodDc4MTMwNjkpXG4gICAgLy9cbiAgICAvLyBPbmNlIHdlIHByb3ZpZGUgYWxsIGRpYWdub3N0aWNzLCBpbnN0ZWFkIG9mIGp1c3QgdGhlIGN1cnJlbnQgZmlsZSwgd2UgY2FuXG4gICAgLy8gcHJvYmFibHkgcmVtb3ZlIHRoZSBhY3RpdmVUZXh0RWRpdG9yIHBhcmFtZXRlci5cbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICBjb25zdCBtYXRjaGVzR3JhbW1hciA9IEpTX0dSQU1NQVJTLmluZGV4T2YoYWN0aXZlVGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSAhPT0gLTE7XG4gICAgICBpZiAobWF0Y2hlc0dyYW1tYXIpIHtcbiAgICAgICAgdGhpcy5fcnVuRGlhZ25vc3RpY3MoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2Uuc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHkpO1xuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2spO1xuICB9XG5cbiAgb25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrOiBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UuZGlzcG9zZSgpO1xuICB9XG5cbiAgX3Byb2Nlc3NEaWFnbm9zdGljcyhcbiAgICBkaWFnbm9zdGljczogQXJyYXk8Rmxvd0RpYWdub3N0aWNJdGVtPixcbiAgICBjdXJyZW50RmlsZTogc3RyaW5nXG4gICk6IERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSB7XG5cbiAgICAvLyBjb252ZXJ0IGFycmF5IG1lc3NhZ2VzIHRvIEVycm9yIE9iamVjdHMgd2l0aCBUcmFjZXNcbiAgICBjb25zdCBmaWxlRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5tYXAoZmxvd01lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKTtcblxuICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcblxuICAgIC8vIFRoaXMgaW52YWxpZGF0ZXMgdGhlIGVycm9ycyBpbiB0aGUgY3VycmVudCBmaWxlLiBJZiBGbG93LCB3aGVuIHJ1bm5pbmcgaW4gdGhpcyByb290LCBoYXNcbiAgICAvLyByZXBvcnRlZCBlcnJvcnMgZm9yIHRoaXMgZmlsZSwgdGhpcyBpbnZhbGlkYXRpb24gaXMgbm90IG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBwYXRoIHdpbGwgYmVcbiAgICAvLyBleHBsaWNpdGx5IGludmFsaWRhdGVkLiBIb3dldmVyLCBpZiBGbG93IGhhcyByZXBvcnRlZCBhbiBlcnJvciBpbiB0aGlzIHJvb3QgZnJvbSBhbm90aGVyIHJvb3RcbiAgICAvLyAoYXMgc29tZXRpbWVzIGhhcHBlbnMgd2hlbiBGbG93IHJvb3RzIGNvbnRhaW4gc3ltbGlua3MgdG8gb3RoZXIgRmxvdyByb290cyksIGFuZCBpdCBhbHNvIGRvZXNcbiAgICAvLyBub3QgcmVwb3J0IHRoYXQgc2FtZSBlcnJvciB3aGVuIHJ1bm5pbmcgaW4gdGhpcyBGbG93IHJvb3QsIHRoZW4gd2Ugd2FudCB0aGUgZXJyb3IgdG9cbiAgICAvLyBkaXNhcHBlYXIgd2hlbiB0aGlzIGZpbGUgaXMgb3BlbmVkLlxuICAgIC8vXG4gICAgLy8gVGhpcyBpc24ndCBhIHBlcmZlY3Qgc29sdXRpb24sIHNpbmNlIGl0IGNhbiBzdGlsbCBsZWF2ZSBkaWFnbm9zdGljcyB1cCBpbiBvdGhlciBmaWxlcywgYnV0XG4gICAgLy8gdGhpcyBpcyBhIGNvcm5lciBjYXNlIGFuZCBkb2luZyB0aGlzIGlzIHN0aWxsIGJldHRlciB0aGFuIGRvaW5nIG5vdGhpbmcuXG4gICAgLy9cbiAgICAvLyBJIHRoaW5rIHRoYXQgd2hlbmV2ZXIgdGhpcyBoYXBwZW5zLCBpdCdzIGEgYnVnIGluIEZsb3cuIEl0IHNlZW1zIHN0cmFuZ2UgZm9yIEZsb3cgdG8gcmVwb3J0XG4gICAgLy8gZXJyb3JzIGluIG9uZSBwbGFjZSB3aGVuIHJ1biBmcm9tIG9uZSByb290LCBhbmQgbm90IHJlcG9ydCBlcnJvcnMgaW4gdGhhdCBzYW1lIHBsYWNlIHdoZW4gcnVuXG4gICAgLy8gZnJvbSBhbm90aGVyIHJvb3QuIEJ1dCBzdWNoIGlzIGxpZmUuXG4gICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChjdXJyZW50RmlsZSwgW10pO1xuXG4gICAgZm9yIChjb25zdCBkaWFnbm9zdGljIG9mIGZpbGVEaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgcGF0aCA9IGRpYWdub3N0aWNbJ2ZpbGVQYXRoJ107XG4gICAgICBsZXQgZGlhZ25vc3RpY0FycmF5ID0gZmlsZVBhdGhUb01lc3NhZ2VzLmdldChwYXRoKTtcbiAgICAgIGlmICghZGlhZ25vc3RpY0FycmF5KSB7XG4gICAgICAgIGRpYWdub3N0aWNBcnJheSA9IFtdO1xuICAgICAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KHBhdGgsIGRpYWdub3N0aWNBcnJheSk7XG4gICAgICB9XG4gICAgICBkaWFnbm9zdGljQXJyYXkucHVzaChkaWFnbm9zdGljKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBmaWxlUGF0aFRvTWVzc2FnZXMgfTtcbiAgfVxuXG4gIGludmFsaWRhdGVQcm9qZWN0UGF0aChwcm9qZWN0UGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcGF0aHNUb0ludmFsaWRhdGUgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBmbG93Um9vdEVudHJ5IG9mIHRoaXMuX2Zsb3dSb290VG9GaWxlUGF0aHMpIHtcbiAgICAgIGNvbnN0IFtmbG93Um9vdCwgZmlsZVBhdGhzXSA9IGZsb3dSb290RW50cnk7XG4gICAgICBpZiAoIWZsb3dSb290LnN0YXJ0c1dpdGgocHJvamVjdFBhdGgpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgcGF0aHNUb0ludmFsaWRhdGUuYWRkKGZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Zsb3dSb290VG9GaWxlUGF0aHMuZGVsZXRlKGZsb3dSb290KTtcbiAgICB9XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBmaWxlUGF0aHM6IGFycmF5LmZyb20ocGF0aHNUb0ludmFsaWRhdGUpLFxuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmxvd0RpYWdub3N0aWNzUHJvdmlkZXI7XG4iXX0=