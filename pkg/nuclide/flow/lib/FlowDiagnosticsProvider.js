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

var _logging = require('../../logging');

var _require = require('../../commons');

var promises = _require.promises;
var array = _require.array;
var RequestSerializer = promises.RequestSerializer;

var _require2 = require('../../diagnostics/provider-base');

var DiagnosticsProviderBase = _require2.DiagnosticsProviderBase;

var logger = (0, _logging.getLogger)();

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
      })['catch'](function (e) {
        return logger.error(e);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3lCQW9CMEIsaUJBQWlCOztrQ0FFRixzQkFBc0I7O3VCQUt2QyxlQUFlOztlQUpiLE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQTNDLFFBQVEsWUFBUixRQUFRO0lBQUUsS0FBSyxZQUFMLEtBQUs7SUFDZixpQkFBaUIsR0FBSSxRQUFRLENBQTdCLGlCQUFpQjs7Z0JBQ1UsT0FBTyxDQUFDLGlDQUFpQyxDQUFDOztJQUFyRSx1QkFBdUIsYUFBdkIsdUJBQXVCOztBQUc5QixJQUFNLE1BQU0sR0FBRyx5QkFBVyxDQUFDOztnQkFFWCxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLGFBQUwsS0FBSzs7QUFDWixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O2dCQUVkLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBeEMsV0FBVyxhQUFYLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NsQixTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7OztBQUc3QixTQUFPLElBQUksS0FBSyxDQUNkLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzNDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDekMsQ0FBQztDQUNIOzs7QUFHRCxTQUFTLGtCQUFrQixDQUFDLE9BQU8sRUFBRTtBQUNuQyxTQUFPO0FBQ0wsUUFBSSxFQUFFLE9BQU87QUFDYixRQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUN0QixZQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUN6QixTQUFLLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQztHQUM3QixD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LEVBQUUsZUFBZSxDQUFDLENBQUM7U0FDL0M7QUFDRCx1QkFBZSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztPQUNsQzs7QUFFRCxhQUFPLEVBQUUsa0JBQWtCLEVBQWxCLGtCQUFrQixFQUFFLENBQUM7S0FDL0I7OztXQUVvQiwrQkFBQyxXQUFtQixFQUFRO0FBQy9DLFVBQU0saUJBQWlCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQztBQUNwQyxXQUFLLElBQU0sYUFBYSxJQUFJLElBQUksQ0FBQyxvQkFBb0IsRUFBRTs0Q0FDdkIsYUFBYTs7WUFBcEMsU0FBUTtZQUFFLFNBQVM7O0FBQzFCLFlBQUksQ0FBQyxTQUFRLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxFQUFFO0FBQ3JDLG1CQUFTO1NBQ1Y7QUFDRCxhQUFLLElBQU0sUUFBUSxJQUFJLFNBQVMsRUFBRTtBQUNoQywyQkFBaUIsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDakM7QUFDRCxZQUFJLENBQUMsb0JBQW9CLFVBQU8sQ0FBQyxTQUFRLENBQUMsQ0FBQztPQUM1QztBQUNELFVBQUksQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUM7QUFDNUMsYUFBSyxFQUFFLE1BQU07QUFDYixpQkFBUyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUM7T0FDekMsQ0FBQyxDQUFDO0tBQ0o7OztTQTdLRyx1QkFBdUI7OztBQWdMN0IsTUFBTSxDQUFDLE9BQU8sR0FBRyx1QkFBdUIsQ0FBQyIsImZpbGUiOiJGbG93RGlhZ25vc3RpY3NQcm92aWRlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtCdXN5U2lnbmFsUHJvdmlkZXJCYXNlfSBmcm9tICcuLi8uLi9idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9yZW1vdGUtdXJpJztcbmltcG9ydCB0eXBlIHtcbiAgRmlsZURpYWdub3N0aWNNZXNzYWdlLFxuICBNZXNzYWdlVXBkYXRlQ2FsbGJhY2ssXG4gIE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayxcbiAgRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlLFxufSBmcm9tICcuLi8uLi9kaWFnbm9zdGljcy9iYXNlJztcblxuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHtnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi9GbG93U2VydmljZUZhY3RvcnknO1xuY29uc3Qge3Byb21pc2VzLCBhcnJheX0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG5jb25zdCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9ID0gcmVxdWlyZSgnLi4vLi4vZGlhZ25vc3RpY3MvcHJvdmlkZXItYmFzZScpO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuY29uc3Qge1JhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG5jb25zdCB7SlNfR1JBTU1BUlN9ID0gcmVxdWlyZSgnLi9jb25zdGFudHMuanMnKTtcblxuLypcbiAqIFRPRE8gcmVtb3ZlIHRoZXNlIGR1cGxpY2F0ZSBkZWZpbml0aW9ucyBvbmNlIHdlIGZpZ3VyZSBvdXQgaW1wb3J0aW5nIHR5cGVzXG4gKiB0aHJvdWdoIHN5bWxpbmtzLlxuICovXG5leHBvcnQgdHlwZSBEaWFnbm9zdGljcyA9IHtcbiAgZmxvd1Jvb3Q6IE51Y2xpZGVVcmk7XG4gIG1lc3NhZ2VzOiBBcnJheTxGbG93RGlhZ25vc3RpY0l0ZW0+XG59O1xudHlwZSBGbG93RXJyb3IgPSB7XG4gIGxldmVsOiBzdHJpbmc7XG4gIGRlc2NyOiBzdHJpbmc7XG4gIHBhdGg6IHN0cmluZztcbiAgbGluZTogbnVtYmVyO1xuICBzdGFydDogbnVtYmVyO1xuICBlbmRsaW5lOiBudW1iZXI7XG4gIGVuZDogbnVtYmVyO1xufVxuXG50eXBlIEZsb3dEaWFnbm9zdGljSXRlbSA9IEFycmF5PEZsb3dFcnJvcj47XG5cbi8qKlxuICogQ3VycmVudGx5LCBhIGRpYWdub3N0aWMgZnJvbSBGbG93IGlzIGFuIG9iamVjdCB3aXRoIGEgXCJtZXNzYWdlXCIgcHJvcGVydHkuXG4gKiBFYWNoIGl0ZW0gaW4gdGhlIFwibWVzc2FnZVwiIGFycmF5IGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICogICAgIC0gcGF0aCAoc3RyaW5nKSBGaWxlIHRoYXQgY29udGFpbnMgdGhlIGVycm9yLlxuICogICAgIC0gZGVzY3IgKHN0cmluZykgRGVzY3JpcHRpb24gb2YgdGhlIGVycm9yLlxuICogICAgIC0gbGluZSAobnVtYmVyKSBTdGFydCBsaW5lLlxuICogICAgIC0gZW5kbGluZSAobnVtYmVyKSBFbmQgbGluZS5cbiAqICAgICAtIHN0YXJ0IChudW1iZXIpIFN0YXJ0IGNvbHVtbi5cbiAqICAgICAtIGVuZCAobnVtYmVyKSBFbmQgY29sdW1uLlxuICogICAgIC0gY29kZSAobnVtYmVyKSBQcmVzdW1hYmx5IGFuIGVycm9yIGNvZGUuXG4gKiBUaGUgbWVzc2FnZSBhcnJheSBtYXkgaGF2ZSBtb3JlIHRoYW4gb25lIGl0ZW0uIEZvciBleGFtcGxlLCBpZiB0aGVyZSBpcyBhXG4gKiB0eXBlIGluY29tcGF0aWJpbGl0eSBlcnJvciwgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIG1lc3NhZ2UgYXJyYXkgYmxhbWVzIHRoZVxuICogdXNhZ2Ugb2YgdGhlIHdyb25nIHR5cGUgYW5kIHRoZSBzZWNvbmQgYmxhbWVzIHRoZSBkZWNsYXJhdGlvbiBvZiB0aGUgdHlwZVxuICogd2l0aCB3aGljaCB0aGUgdXNhZ2UgZGlzYWdyZWVzLiBOb3RlIHRoYXQgdGhlc2UgY291bGQgb2NjdXIgaW4gZGlmZmVyZW50XG4gKiBmaWxlcy5cbiAqL1xuZnVuY3Rpb24gZXh0cmFjdFJhbmdlKG1lc3NhZ2UpIHtcbiAgLy8gSXQncyB1bmNsZWFyIHdoeSB0aGUgMS1iYXNlZCB0byAwLWJhc2VkIGluZGV4aW5nIHdvcmtzIHRoZSB3YXkgdGhhdCBpdFxuICAvLyBkb2VzLCBidXQgdGhpcyBoYXMgdGhlIGRlc2lyZWQgZWZmZWN0IGluIHRoZSBVSSwgaW4gcHJhY3RpY2UuXG4gIHJldHVybiBuZXcgUmFuZ2UoXG4gICAgW21lc3NhZ2VbJ2xpbmUnXSAtIDEsIG1lc3NhZ2VbJ3N0YXJ0J10gLSAxXSxcbiAgICBbbWVzc2FnZVsnZW5kbGluZSddIC0gMSwgbWVzc2FnZVsnZW5kJ11dXG4gICk7XG59XG5cbi8vIEEgdHJhY2Ugb2JqZWN0IGlzIHZlcnkgc2ltaWxhciB0byBhbiBlcnJvciBvYmplY3QuXG5mdW5jdGlvbiBmbG93TWVzc2FnZVRvVHJhY2UobWVzc2FnZSkge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUcmFjZScsXG4gICAgdGV4dDogbWVzc2FnZVsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogbWVzc2FnZVsncGF0aCddLFxuICAgIHJhbmdlOiBleHRyYWN0UmFuZ2UobWVzc2FnZSksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGZsb3dNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZShmbG93TWVzc2FnZXMpIHtcbiAgY29uc3QgZmxvd01lc3NhZ2UgPSBmbG93TWVzc2FnZXNbMF07XG5cbiAgY29uc3QgZGlhZ25vc3RpY01lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSA9IHtcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIHByb3ZpZGVyTmFtZTogJ0Zsb3cnLFxuICAgIHR5cGU6IGZsb3dNZXNzYWdlWydsZXZlbCddID09PSAnZXJyb3InID8gJ0Vycm9yJyA6ICdXYXJuaW5nJyxcbiAgICB0ZXh0OiBmbG93TWVzc2FnZVsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogZmxvd01lc3NhZ2VbJ3BhdGgnXSxcbiAgICByYW5nZTogZXh0cmFjdFJhbmdlKGZsb3dNZXNzYWdlKSxcbiAgfTtcblxuICAvLyBXaGVuIHRoZSBtZXNzYWdlIGlzIGFuIGFycmF5IHdpdGggbXVsdGlwbGUgZWxlbWVudHMsIHRoZSBzZWNvbmQgZWxlbWVudFxuICAvLyBvbndhcmRzIGNvbXByaXNlIHRoZSB0cmFjZSBmb3IgdGhlIGVycm9yLlxuICBpZiAoZmxvd01lc3NhZ2VzLmxlbmd0aCA+IDEpIHtcbiAgICBkaWFnbm9zdGljTWVzc2FnZS50cmFjZSA9IGZsb3dNZXNzYWdlcy5zbGljZSgxKS5tYXAoZmxvd01lc3NhZ2VUb1RyYWNlKTtcbiAgfVxuXG4gIHJldHVybiBkaWFnbm9zdGljTWVzc2FnZTtcbn1cblxuY2xhc3MgRmxvd0RpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjtcblxuICAvKipcbiAgICAqIE1hcHMgZmxvdyByb290IHRvIHRoZSBzZXQgb2YgZmlsZSBwYXRocyB1bmRlciB0aGF0IHJvb3QgZm9yIHdoaWNoIHdlIGhhdmVcbiAgICAqIGV2ZXIgcmVwb3J0ZWQgZGlhZ25vc3RpY3MuXG4gICAgKi9cbiAgX2Zsb3dSb290VG9GaWxlUGF0aHM6IE1hcDxOdWNsaWRlVXJpLCBTZXQ8TnVjbGlkZVVyaT4+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBib29sZWFuLFxuICAgIGJ1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSxcbiAgICBQcm92aWRlckJhc2U/OiB0eXBlb2YgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UgPSBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSxcbiAgKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IG5ldyBTZXQoSlNfR1JBTU1BUlMpLFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1bkRpYWdub3N0aWNzKGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgUHJvdmlkZXJCYXNlKHV0aWxzT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgX3J1bkRpYWdub3N0aWNzKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgICdGbG93OiBXYWl0aW5nIGZvciBkaWFnbm9zdGljcycsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvciksXG4gICAgKS5jYXRjaChlID0+IGxvZ2dlci5lcnJvcihlKSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2Zsb3cucnVuLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRDb250ZW50cyA9IHRleHRFZGl0b3IuaXNNb2RpZmllZCgpID8gdGV4dEVkaXRvci5nZXRUZXh0KCkgOiBudWxsO1xuXG4gICAgY29uc3QgZmxvd1NlcnZpY2UgPSBnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaShmaWxlKTtcbiAgICBpbnZhcmlhbnQoZmxvd1NlcnZpY2UpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bihcbiAgICAgIGZsb3dTZXJ2aWNlLmZsb3dGaW5kRGlhZ25vc3RpY3MoZmlsZSwgY3VycmVudENvbnRlbnRzKVxuICAgICk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdvdXRkYXRlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGlhZ25vc3RpY3M6ID9EaWFnbm9zdGljcyA9IHJlc3VsdC5yZXN1bHQ7XG4gICAgaWYgKCFkaWFnbm9zdGljcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7Zmxvd1Jvb3QsIG1lc3NhZ2VzfSA9IGRpYWdub3N0aWNzO1xuXG4gICAgY29uc3QgcGF0aHNUb0ludmFsaWRhdGUgPSB0aGlzLl9nZXRQYXRoc1RvSW52YWxpZGF0ZShmbG93Um9vdCk7XG4gICAgLypcbiAgICAgKiBUT0RPIENvbnNpZGVyIG9wdGltaXppbmcgZm9yIHRoZSBjb21tb24gY2FzZSBvZiBvbmx5IGEgc2luZ2xlIGZsb3cgcm9vdFxuICAgICAqIGJ5IGludmFsaWRhdGluZyBhbGwgaW5zdGVhZCBvZiBlbnVtZXJhdGluZyB0aGUgZmlsZXMuXG4gICAgICovXG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IHBhdGhzVG9JbnZhbGlkYXRlfSk7XG5cbiAgICBjb25zdCBwYXRoc0ZvclJvb3QgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5zZXQoZmxvd1Jvb3QsIHBhdGhzRm9yUm9vdCk7XG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzKSB7XG4gICAgICAvKlxuICAgICAgICogRWFjaCBtZXNzYWdlIGNvbnNpc3RzIG9mIHNldmVyYWwgZGlmZmVyZW50IGNvbXBvbmVudHMsIGVhY2ggd2l0aCBpdHNcbiAgICAgICAqIG93biB0ZXh0IGFuZCBwYXRoLlxuICAgICAgICovXG4gICAgICBmb3IgKGNvbnN0IG1lc3NhZ2VDb21wb25lbnQgb2YgbWVzc2FnZSkge1xuICAgICAgICBwYXRoc0ZvclJvb3QuYWRkKG1lc3NhZ2VDb21wb25lbnQucGF0aCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKHRoaXMuX3Byb2Nlc3NEaWFnbm9zdGljcyhtZXNzYWdlcywgZmlsZSkpO1xuICB9XG5cbiAgX2dldFBhdGhzVG9JbnZhbGlkYXRlKGZsb3dSb290OiBOdWNsaWRlVXJpKTogQXJyYXk8TnVjbGlkZVVyaT4ge1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMuX2Zsb3dSb290VG9GaWxlUGF0aHMuZ2V0KGZsb3dSb290KTtcbiAgICBpZiAoIWZpbGVQYXRocykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXkuZnJvbShmaWxlUGF0aHMpO1xuICB9XG5cbiAgX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogdm9pZCB7XG4gICAgLy8gRXZlcnkgdGltZSB3ZSBnZXQgYSBuZXcgc3Vic2NyaWJlciwgd2UgbmVlZCB0byBwdXNoIHJlc3VsdHMgdG8gdGhlbS4gVGhpc1xuICAgIC8vIGxvZ2ljIGlzIGNvbW1vbiB0byBhbGwgcHJvdmlkZXJzIGFuZCBzaG91bGQgYmUgYWJzdHJhY3RlZCBvdXQgKHQ3ODEzMDY5KVxuICAgIC8vXG4gICAgLy8gT25jZSB3ZSBwcm92aWRlIGFsbCBkaWFnbm9zdGljcywgaW5zdGVhZCBvZiBqdXN0IHRoZSBjdXJyZW50IGZpbGUsIHdlIGNhblxuICAgIC8vIHByb2JhYmx5IHJlbW92ZSB0aGUgYWN0aXZlVGV4dEVkaXRvciBwYXJhbWV0ZXIuXG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgY29uc3QgbWF0Y2hlc0dyYW1tYXIgPSBKU19HUkFNTUFSUy5pbmRleE9mKGFjdGl2ZVRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkgIT09IC0xO1xuICAgICAgaWYgKG1hdGNoZXNHcmFtbWFyKSB7XG4gICAgICAgIHRoaXMuX3J1bkRpYWdub3N0aWNzKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFJ1bk9uVGhlRmx5KHJ1bk9uVGhlRmx5OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnNldFJ1bk9uVGhlRmx5KHJ1bk9uVGhlRmx5KTtcbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9wcm9jZXNzRGlhZ25vc3RpY3MoXG4gICAgZGlhZ25vc3RpY3M6IEFycmF5PEZsb3dEaWFnbm9zdGljSXRlbT4sXG4gICAgY3VycmVudEZpbGU6IHN0cmluZ1xuICApOiBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUge1xuXG4gICAgLy8gY29udmVydCBhcnJheSBtZXNzYWdlcyB0byBFcnJvciBPYmplY3RzIHdpdGggVHJhY2VzXG4gICAgY29uc3QgZmlsZURpYWdub3N0aWNzID0gZGlhZ25vc3RpY3MubWFwKGZsb3dNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZSk7XG5cbiAgICBjb25zdCBmaWxlUGF0aFRvTWVzc2FnZXMgPSBuZXcgTWFwKCk7XG5cbiAgICAvLyBUaGlzIGludmFsaWRhdGVzIHRoZSBlcnJvcnMgaW4gdGhlIGN1cnJlbnQgZmlsZS4gSWYgRmxvdywgd2hlbiBydW5uaW5nIGluIHRoaXMgcm9vdCwgaGFzXG4gICAgLy8gcmVwb3J0ZWQgZXJyb3JzIGZvciB0aGlzIGZpbGUsIHRoaXMgaW52YWxpZGF0aW9uIGlzIG5vdCBuZWNlc3NhcnkgYmVjYXVzZSB0aGUgcGF0aCB3aWxsIGJlXG4gICAgLy8gZXhwbGljaXRseSBpbnZhbGlkYXRlZC4gSG93ZXZlciwgaWYgRmxvdyBoYXMgcmVwb3J0ZWQgYW4gZXJyb3IgaW4gdGhpcyByb290IGZyb20gYW5vdGhlciByb290XG4gICAgLy8gKGFzIHNvbWV0aW1lcyBoYXBwZW5zIHdoZW4gRmxvdyByb290cyBjb250YWluIHN5bWxpbmtzIHRvIG90aGVyIEZsb3cgcm9vdHMpLCBhbmQgaXQgYWxzbyBkb2VzXG4gICAgLy8gbm90IHJlcG9ydCB0aGF0IHNhbWUgZXJyb3Igd2hlbiBydW5uaW5nIGluIHRoaXMgRmxvdyByb290LCB0aGVuIHdlIHdhbnQgdGhlIGVycm9yIHRvXG4gICAgLy8gZGlzYXBwZWFyIHdoZW4gdGhpcyBmaWxlIGlzIG9wZW5lZC5cbiAgICAvL1xuICAgIC8vIFRoaXMgaXNuJ3QgYSBwZXJmZWN0IHNvbHV0aW9uLCBzaW5jZSBpdCBjYW4gc3RpbGwgbGVhdmUgZGlhZ25vc3RpY3MgdXAgaW4gb3RoZXIgZmlsZXMsIGJ1dFxuICAgIC8vIHRoaXMgaXMgYSBjb3JuZXIgY2FzZSBhbmQgZG9pbmcgdGhpcyBpcyBzdGlsbCBiZXR0ZXIgdGhhbiBkb2luZyBub3RoaW5nLlxuICAgIC8vXG4gICAgLy8gSSB0aGluayB0aGF0IHdoZW5ldmVyIHRoaXMgaGFwcGVucywgaXQncyBhIGJ1ZyBpbiBGbG93LiBJdCBzZWVtcyBzdHJhbmdlIGZvciBGbG93IHRvIHJlcG9ydFxuICAgIC8vIGVycm9ycyBpbiBvbmUgcGxhY2Ugd2hlbiBydW4gZnJvbSBvbmUgcm9vdCwgYW5kIG5vdCByZXBvcnQgZXJyb3JzIGluIHRoYXQgc2FtZSBwbGFjZSB3aGVuIHJ1blxuICAgIC8vIGZyb20gYW5vdGhlciByb290LiBCdXQgc3VjaCBpcyBsaWZlLlxuICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQoY3VycmVudEZpbGUsIFtdKTtcblxuICAgIGZvciAoY29uc3QgZGlhZ25vc3RpYyBvZiBmaWxlRGlhZ25vc3RpY3MpIHtcbiAgICAgIGNvbnN0IHBhdGggPSBkaWFnbm9zdGljWydmaWxlUGF0aCddO1xuICAgICAgbGV0IGRpYWdub3N0aWNBcnJheSA9IGZpbGVQYXRoVG9NZXNzYWdlcy5nZXQocGF0aCk7XG4gICAgICBpZiAoIWRpYWdub3N0aWNBcnJheSkge1xuICAgICAgICBkaWFnbm9zdGljQXJyYXkgPSBbXTtcbiAgICAgICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChwYXRoLCBkaWFnbm9zdGljQXJyYXkpO1xuICAgICAgfVxuICAgICAgZGlhZ25vc3RpY0FycmF5LnB1c2goZGlhZ25vc3RpYyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHsgZmlsZVBhdGhUb01lc3NhZ2VzIH07XG4gIH1cblxuICBpbnZhbGlkYXRlUHJvamVjdFBhdGgocHJvamVjdFBhdGg6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHBhdGhzVG9JbnZhbGlkYXRlID0gbmV3IFNldCgpO1xuICAgIGZvciAoY29uc3QgZmxvd1Jvb3RFbnRyeSBvZiB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzKSB7XG4gICAgICBjb25zdCBbZmxvd1Jvb3QsIGZpbGVQYXRoc10gPSBmbG93Um9vdEVudHJ5O1xuICAgICAgaWYgKCFmbG93Um9vdC5zdGFydHNXaXRoKHByb2plY3RQYXRoKSkge1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICAgIGZvciAoY29uc3QgZmlsZVBhdGggb2YgZmlsZVBhdGhzKSB7XG4gICAgICAgIHBhdGhzVG9JbnZhbGlkYXRlLmFkZChmaWxlUGF0aCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzLmRlbGV0ZShmbG93Um9vdCk7XG4gICAgfVxuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbih7XG4gICAgICBzY29wZTogJ2ZpbGUnLFxuICAgICAgZmlsZVBhdGhzOiBhcnJheS5mcm9tKHBhdGhzVG9JbnZhbGlkYXRlKSxcbiAgICB9KTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyO1xuIl19