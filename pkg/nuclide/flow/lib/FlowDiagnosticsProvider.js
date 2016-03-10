var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createDecoratedClass = (function () { function defineProperties(target, descriptors, initializers) { for (var i = 0; i < descriptors.length; i++) { var descriptor = descriptors[i]; var decorators = descriptor.decorators; var key = descriptor.key; delete descriptor.key; delete descriptor.decorators; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor || descriptor.initializer) descriptor.writable = true; if (decorators) { for (var f = 0; f < decorators.length; f++) { var decorator = decorators[f]; if (typeof decorator === 'function') { descriptor = decorator(target, key, descriptor) || descriptor; } else { throw new TypeError('The decorator for method ' + descriptor.key + ' is of the invalid type ' + typeof decorator); } } if (descriptor.initializer !== undefined) { initializers[key] = descriptor; continue; } } Object.defineProperty(target, key, descriptor); } } return function (Constructor, protoProps, staticProps, protoInitializers, staticInitializers) { if (protoProps) defineProperties(Constructor.prototype, protoProps, protoInitializers); if (staticProps) defineProperties(Constructor, staticProps, staticInitializers); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

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

  // The Flow type does not capture this, but the first message always has a path, and the
  // diagnostics package requires a FileDiagnosticMessage to have a path.
  var path = flowMessage['path'];
  invariant(path != null, 'Expected path to not be null or undefined');

  var diagnosticMessage = {
    scope: 'file',
    providerName: 'Flow',
    type: flowMessage['level'] === 'error' ? 'Error' : 'Warning',
    text: flowMessage['descr'],
    filePath: path,
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
          if (messageComponent.path != null) {
            pathsForRoot.add(messageComponent.path);
          }
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
    key: 'invalidateProjectPath',
    value: function invalidateProjectPath(projectPath) {
      var pathsToInvalidate = new Set();
      for (var flowRootEntry of this._flowRootToFilePaths) {
        var _flowRootEntry = _slicedToArray(flowRootEntry, 2);

        var flowRoot = _flowRootEntry[0];
        var filePaths = _flowRootEntry[1];

        if (!flowRoot.startsWith(projectPath)) {
          continue;
        }
        for (var filePath of filePaths) {
          pathsToInvalidate.add(filePath);
        }
        this._flowRootToFilePaths['delete'](flowRoot);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7eUJBeUIwQixpQkFBaUI7O2tDQUVGLHNCQUFzQjs7dUJBS3ZDLGVBQWU7O2VBSmIsT0FBTyxDQUFDLGVBQWUsQ0FBQzs7SUFBM0MsUUFBUSxZQUFSLFFBQVE7SUFBRSxLQUFLLFlBQUwsS0FBSztJQUNmLGlCQUFpQixHQUFJLFFBQVEsQ0FBN0IsaUJBQWlCOztnQkFDVSxPQUFPLENBQUMsaUNBQWlDLENBQUM7O0lBQXJFLHVCQUF1QixhQUF2Qix1QkFBdUI7O0FBRzlCLElBQU0sTUFBTSxHQUFHLHlCQUFXLENBQUM7O2dCQUVYLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXhCLEtBQUssYUFBTCxLQUFLOztBQUNaLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Z0JBRWQsT0FBTyxDQUFDLGdCQUFnQixDQUFDOztJQUF4QyxXQUFXLGFBQVgsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBa0JsQixTQUFTLFlBQVksQ0FBQyxPQUFzQixFQUFjOzs7QUFHeEQsU0FBTyxJQUFJLEtBQUssQ0FDZCxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUMzQyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsR0FBRyxDQUFDLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQ3pDLENBQUM7Q0FDSDs7O0FBR0QsU0FBUyxrQkFBa0IsQ0FBQyxPQUFzQixFQUFTO0FBQ3pELFNBQU87QUFDTCxRQUFJLEVBQUUsT0FBTztBQUNiLFFBQUksRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3RCLFlBQVEsRUFBRSxPQUFPLENBQUMsTUFBTSxDQUFDO0FBQ3pCLFNBQUssRUFBRSxZQUFZLENBQUMsT0FBTyxDQUFDO0dBQzdCLENBQUM7Q0FD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R0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsWUFBSSxDQUFDLGVBQWUsRUFBRTtBQUNwQix5QkFBZSxHQUFHLEVBQUUsQ0FBQztBQUNyQiw0QkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1NBQy9DO0FBQ0QsdUJBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDbEM7O0FBRUQsYUFBTyxFQUFFLGtCQUFrQixFQUFsQixrQkFBa0IsRUFBRSxDQUFDO0tBQy9COzs7V0FFb0IsK0JBQUMsV0FBbUIsRUFBUTtBQUMvQyxVQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEMsV0FBSyxJQUFNLGFBQWEsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7NENBQ3ZCLGFBQWE7O1lBQXBDLFFBQVE7WUFBRSxTQUFTOztBQUMxQixZQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUNyQyxtQkFBUztTQUNWO0FBQ0QsYUFBSyxJQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7QUFDaEMsMkJBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2pDO0FBQ0QsWUFBSSxDQUFDLG9CQUFvQixVQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDNUM7QUFDRCxVQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUFDO0FBQzVDLGFBQUssRUFBRSxNQUFNO0FBQ2IsaUJBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO09BQ3pDLENBQUMsQ0FBQztLQUNKOzs7U0EvS0csdUJBQXVCOzs7QUFrTDdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsdUJBQXVCLENBQUMiLCJmaWxlIjoiRmxvd0RpYWdub3N0aWNzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vYnVzeS1zaWduYWwtcHJvdmlkZXItYmFzZSc7XG5pbXBvcnQgdHlwZSB7TnVjbGlkZVVyaX0gZnJvbSAnLi4vLi4vcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG4gIERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSxcbiAgVHJhY2UsXG59IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL2Jhc2UnO1xuaW1wb3J0IHR5cGUge1xuICBEaWFnbm9zdGljcyxcbiAgU2luZ2xlTWVzc2FnZSxcbn0gZnJvbSAnLi4vLi4vZmxvdy1iYXNlJztcblxuaW1wb3J0IHt0cmFja1RpbWluZ30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IHtnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi9GbG93U2VydmljZUZhY3RvcnknO1xuY29uc3Qge3Byb21pc2VzLCBhcnJheX0gPSByZXF1aXJlKCcuLi8uLi9jb21tb25zJyk7XG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG5jb25zdCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9ID0gcmVxdWlyZSgnLi4vLi4vZGlhZ25vc3RpY3MvcHJvdmlkZXItYmFzZScpO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbG9nZ2luZyc7XG5jb25zdCBsb2dnZXIgPSBnZXRMb2dnZXIoKTtcblxuY29uc3Qge1JhbmdlfSA9IHJlcXVpcmUoJ2F0b20nKTtcbmNvbnN0IGludmFyaWFudCA9IHJlcXVpcmUoJ2Fzc2VydCcpO1xuXG5jb25zdCB7SlNfR1JBTU1BUlN9ID0gcmVxdWlyZSgnLi9jb25zdGFudHMuanMnKTtcblxuLyoqXG4gKiBDdXJyZW50bHksIGEgZGlhZ25vc3RpYyBmcm9tIEZsb3cgaXMgYW4gb2JqZWN0IHdpdGggYSBcIm1lc3NhZ2VcIiBwcm9wZXJ0eS5cbiAqIEVhY2ggaXRlbSBpbiB0aGUgXCJtZXNzYWdlXCIgYXJyYXkgaXMgYW4gb2JqZWN0IHdpdGggdGhlIGZvbGxvd2luZyBmaWVsZHM6XG4gKiAgICAgLSBwYXRoIChzdHJpbmcpIEZpbGUgdGhhdCBjb250YWlucyB0aGUgZXJyb3IuXG4gKiAgICAgLSBkZXNjciAoc3RyaW5nKSBEZXNjcmlwdGlvbiBvZiB0aGUgZXJyb3IuXG4gKiAgICAgLSBsaW5lIChudW1iZXIpIFN0YXJ0IGxpbmUuXG4gKiAgICAgLSBlbmRsaW5lIChudW1iZXIpIEVuZCBsaW5lLlxuICogICAgIC0gc3RhcnQgKG51bWJlcikgU3RhcnQgY29sdW1uLlxuICogICAgIC0gZW5kIChudW1iZXIpIEVuZCBjb2x1bW4uXG4gKiAgICAgLSBjb2RlIChudW1iZXIpIFByZXN1bWFibHkgYW4gZXJyb3IgY29kZS5cbiAqIFRoZSBtZXNzYWdlIGFycmF5IG1heSBoYXZlIG1vcmUgdGhhbiBvbmUgaXRlbS4gRm9yIGV4YW1wbGUsIGlmIHRoZXJlIGlzIGFcbiAqIHR5cGUgaW5jb21wYXRpYmlsaXR5IGVycm9yLCB0aGUgZmlyc3QgaXRlbSBpbiB0aGUgbWVzc2FnZSBhcnJheSBibGFtZXMgdGhlXG4gKiB1c2FnZSBvZiB0aGUgd3JvbmcgdHlwZSBhbmQgdGhlIHNlY29uZCBibGFtZXMgdGhlIGRlY2xhcmF0aW9uIG9mIHRoZSB0eXBlXG4gKiB3aXRoIHdoaWNoIHRoZSB1c2FnZSBkaXNhZ3JlZXMuIE5vdGUgdGhhdCB0aGVzZSBjb3VsZCBvY2N1ciBpbiBkaWZmZXJlbnRcbiAqIGZpbGVzLlxuICovXG5mdW5jdGlvbiBleHRyYWN0UmFuZ2UobWVzc2FnZTogU2luZ2xlTWVzc2FnZSk6IGF0b20kUmFuZ2Uge1xuICAvLyBJdCdzIHVuY2xlYXIgd2h5IHRoZSAxLWJhc2VkIHRvIDAtYmFzZWQgaW5kZXhpbmcgd29ya3MgdGhlIHdheSB0aGF0IGl0XG4gIC8vIGRvZXMsIGJ1dCB0aGlzIGhhcyB0aGUgZGVzaXJlZCBlZmZlY3QgaW4gdGhlIFVJLCBpbiBwcmFjdGljZS5cbiAgcmV0dXJuIG5ldyBSYW5nZShcbiAgICBbbWVzc2FnZVsnbGluZSddIC0gMSwgbWVzc2FnZVsnc3RhcnQnXSAtIDFdLFxuICAgIFttZXNzYWdlWydlbmRsaW5lJ10gLSAxLCBtZXNzYWdlWydlbmQnXV1cbiAgKTtcbn1cblxuLy8gQSB0cmFjZSBvYmplY3QgaXMgdmVyeSBzaW1pbGFyIHRvIGFuIGVycm9yIG9iamVjdC5cbmZ1bmN0aW9uIGZsb3dNZXNzYWdlVG9UcmFjZShtZXNzYWdlOiBTaW5nbGVNZXNzYWdlKTogVHJhY2Uge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUcmFjZScsXG4gICAgdGV4dDogbWVzc2FnZVsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogbWVzc2FnZVsncGF0aCddLFxuICAgIHJhbmdlOiBleHRyYWN0UmFuZ2UobWVzc2FnZSksXG4gIH07XG59XG5cbmZ1bmN0aW9uIGZsb3dNZXNzYWdlVG9EaWFnbm9zdGljTWVzc2FnZShmbG93TWVzc2FnZXMpIHtcbiAgY29uc3QgZmxvd01lc3NhZ2UgPSBmbG93TWVzc2FnZXNbMF07XG5cbiAgLy8gVGhlIEZsb3cgdHlwZSBkb2VzIG5vdCBjYXB0dXJlIHRoaXMsIGJ1dCB0aGUgZmlyc3QgbWVzc2FnZSBhbHdheXMgaGFzIGEgcGF0aCwgYW5kIHRoZVxuICAvLyBkaWFnbm9zdGljcyBwYWNrYWdlIHJlcXVpcmVzIGEgRmlsZURpYWdub3N0aWNNZXNzYWdlIHRvIGhhdmUgYSBwYXRoLlxuICBjb25zdCBwYXRoID0gZmxvd01lc3NhZ2VbJ3BhdGgnXTtcbiAgaW52YXJpYW50KHBhdGggIT0gbnVsbCwgJ0V4cGVjdGVkIHBhdGggdG8gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cbiAgY29uc3QgZGlhZ25vc3RpY01lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSA9IHtcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIHByb3ZpZGVyTmFtZTogJ0Zsb3cnLFxuICAgIHR5cGU6IGZsb3dNZXNzYWdlWydsZXZlbCddID09PSAnZXJyb3InID8gJ0Vycm9yJyA6ICdXYXJuaW5nJyxcbiAgICB0ZXh0OiBmbG93TWVzc2FnZVsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogcGF0aCxcbiAgICByYW5nZTogZXh0cmFjdFJhbmdlKGZsb3dNZXNzYWdlKSxcbiAgfTtcblxuICAvLyBXaGVuIHRoZSBtZXNzYWdlIGlzIGFuIGFycmF5IHdpdGggbXVsdGlwbGUgZWxlbWVudHMsIHRoZSBzZWNvbmQgZWxlbWVudFxuICAvLyBvbndhcmRzIGNvbXByaXNlIHRoZSB0cmFjZSBmb3IgdGhlIGVycm9yLlxuICBpZiAoZmxvd01lc3NhZ2VzLmxlbmd0aCA+IDEpIHtcbiAgICBkaWFnbm9zdGljTWVzc2FnZS50cmFjZSA9IGZsb3dNZXNzYWdlcy5zbGljZSgxKS5tYXAoZmxvd01lc3NhZ2VUb1RyYWNlKTtcbiAgfVxuXG4gIHJldHVybiBkaWFnbm9zdGljTWVzc2FnZTtcbn1cblxuY2xhc3MgRmxvd0RpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjtcblxuICAvKipcbiAgICAqIE1hcHMgZmxvdyByb290IHRvIHRoZSBzZXQgb2YgZmlsZSBwYXRocyB1bmRlciB0aGF0IHJvb3QgZm9yIHdoaWNoIHdlIGhhdmVcbiAgICAqIGV2ZXIgcmVwb3J0ZWQgZGlhZ25vc3RpY3MuXG4gICAgKi9cbiAgX2Zsb3dSb290VG9GaWxlUGF0aHM6IE1hcDxOdWNsaWRlVXJpLCBTZXQ8TnVjbGlkZVVyaT4+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBib29sZWFuLFxuICAgIGJ1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSxcbiAgICBQcm92aWRlckJhc2U/OiB0eXBlb2YgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UgPSBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSxcbiAgKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IG5ldyBTZXQoSlNfR1JBTU1BUlMpLFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1bkRpYWdub3N0aWNzKGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgUHJvdmlkZXJCYXNlKHV0aWxzT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgX3J1bkRpYWdub3N0aWNzKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgICdGbG93OiBXYWl0aW5nIGZvciBkaWFnbm9zdGljcycsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvciksXG4gICAgKS5jYXRjaChlID0+IGxvZ2dlci5lcnJvcihlKSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2Zsb3cucnVuLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRDb250ZW50cyA9IHRleHRFZGl0b3IuaXNNb2RpZmllZCgpID8gdGV4dEVkaXRvci5nZXRUZXh0KCkgOiBudWxsO1xuXG4gICAgY29uc3QgZmxvd1NlcnZpY2UgPSBnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaShmaWxlKTtcbiAgICBpbnZhcmlhbnQoZmxvd1NlcnZpY2UpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bihcbiAgICAgIGZsb3dTZXJ2aWNlLmZsb3dGaW5kRGlhZ25vc3RpY3MoZmlsZSwgY3VycmVudENvbnRlbnRzKVxuICAgICk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdvdXRkYXRlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGlhZ25vc3RpY3M6ID9EaWFnbm9zdGljcyA9IHJlc3VsdC5yZXN1bHQ7XG4gICAgaWYgKCFkaWFnbm9zdGljcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7Zmxvd1Jvb3QsIG1lc3NhZ2VzfSA9IGRpYWdub3N0aWNzO1xuXG4gICAgY29uc3QgcGF0aHNUb0ludmFsaWRhdGUgPSB0aGlzLl9nZXRQYXRoc1RvSW52YWxpZGF0ZShmbG93Um9vdCk7XG4gICAgLypcbiAgICAgKiBUT0RPIENvbnNpZGVyIG9wdGltaXppbmcgZm9yIHRoZSBjb21tb24gY2FzZSBvZiBvbmx5IGEgc2luZ2xlIGZsb3cgcm9vdFxuICAgICAqIGJ5IGludmFsaWRhdGluZyBhbGwgaW5zdGVhZCBvZiBlbnVtZXJhdGluZyB0aGUgZmlsZXMuXG4gICAgICovXG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IHBhdGhzVG9JbnZhbGlkYXRlfSk7XG5cbiAgICBjb25zdCBwYXRoc0ZvclJvb3QgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5zZXQoZmxvd1Jvb3QsIHBhdGhzRm9yUm9vdCk7XG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzKSB7XG4gICAgICAvKlxuICAgICAgICogRWFjaCBtZXNzYWdlIGNvbnNpc3RzIG9mIHNldmVyYWwgZGlmZmVyZW50IGNvbXBvbmVudHMsIGVhY2ggd2l0aCBpdHNcbiAgICAgICAqIG93biB0ZXh0IGFuZCBwYXRoLlxuICAgICAgICovXG4gICAgICBmb3IgKGNvbnN0IG1lc3NhZ2VDb21wb25lbnQgb2YgbWVzc2FnZSkge1xuICAgICAgICBpZiAobWVzc2FnZUNvbXBvbmVudC5wYXRoICE9IG51bGwpIHtcbiAgICAgICAgICBwYXRoc0ZvclJvb3QuYWRkKG1lc3NhZ2VDb21wb25lbnQucGF0aCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUodGhpcy5fcHJvY2Vzc0RpYWdub3N0aWNzKG1lc3NhZ2VzLCBmaWxlKSk7XG4gIH1cblxuICBfZ2V0UGF0aHNUb0ludmFsaWRhdGUoZmxvd1Jvb3Q6IE51Y2xpZGVVcmkpOiBBcnJheTxOdWNsaWRlVXJpPiB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5nZXQoZmxvd1Jvb3QpO1xuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBhcnJheS5mcm9tKGZpbGVQYXRocyk7XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICAvLyBFdmVyeSB0aW1lIHdlIGdldCBhIG5ldyBzdWJzY3JpYmVyLCB3ZSBuZWVkIHRvIHB1c2ggcmVzdWx0cyB0byB0aGVtLiBUaGlzXG4gICAgLy8gbG9naWMgaXMgY29tbW9uIHRvIGFsbCBwcm92aWRlcnMgYW5kIHNob3VsZCBiZSBhYnN0cmFjdGVkIG91dCAodDc4MTMwNjkpXG4gICAgLy9cbiAgICAvLyBPbmNlIHdlIHByb3ZpZGUgYWxsIGRpYWdub3N0aWNzLCBpbnN0ZWFkIG9mIGp1c3QgdGhlIGN1cnJlbnQgZmlsZSwgd2UgY2FuXG4gICAgLy8gcHJvYmFibHkgcmVtb3ZlIHRoZSBhY3RpdmVUZXh0RWRpdG9yIHBhcmFtZXRlci5cbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICBjb25zdCBtYXRjaGVzR3JhbW1hciA9IEpTX0dSQU1NQVJTLmluZGV4T2YoYWN0aXZlVGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSAhPT0gLTE7XG4gICAgICBpZiAobWF0Y2hlc0dyYW1tYXIpIHtcbiAgICAgICAgdGhpcy5fcnVuRGlhZ25vc3RpY3MoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2Uuc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHkpO1xuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2spO1xuICB9XG5cbiAgb25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrOiBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2spOiBJRGlzcG9zYWJsZSB7XG4gICAgcmV0dXJuIHRoaXMuX3Byb3ZpZGVyQmFzZS5vbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2spO1xuICB9XG5cbiAgZGlzcG9zZSgpIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UuZGlzcG9zZSgpO1xuICB9XG5cbiAgX3Byb2Nlc3NEaWFnbm9zdGljcyhcbiAgICBkaWFnbm9zdGljczogQXJyYXk8QXJyYXk8U2luZ2xlTWVzc2FnZT4+LFxuICAgIGN1cnJlbnRGaWxlOiBzdHJpbmdcbiAgKTogRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlIHtcblxuICAgIC8vIGNvbnZlcnQgYXJyYXkgbWVzc2FnZXMgdG8gRXJyb3IgT2JqZWN0cyB3aXRoIFRyYWNlc1xuICAgIGNvbnN0IGZpbGVEaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzLm1hcChmbG93TWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2UpO1xuXG4gICAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gVGhpcyBpbnZhbGlkYXRlcyB0aGUgZXJyb3JzIGluIHRoZSBjdXJyZW50IGZpbGUuIElmIEZsb3csIHdoZW4gcnVubmluZyBpbiB0aGlzIHJvb3QsIGhhc1xuICAgIC8vIHJlcG9ydGVkIGVycm9ycyBmb3IgdGhpcyBmaWxlLCB0aGlzIGludmFsaWRhdGlvbiBpcyBub3QgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIHBhdGggd2lsbCBiZVxuICAgIC8vIGV4cGxpY2l0bHkgaW52YWxpZGF0ZWQuIEhvd2V2ZXIsIGlmIEZsb3cgaGFzIHJlcG9ydGVkIGFuIGVycm9yIGluIHRoaXMgcm9vdCBmcm9tIGFub3RoZXIgcm9vdFxuICAgIC8vIChhcyBzb21ldGltZXMgaGFwcGVucyB3aGVuIEZsb3cgcm9vdHMgY29udGFpbiBzeW1saW5rcyB0byBvdGhlciBGbG93IHJvb3RzKSwgYW5kIGl0IGFsc28gZG9lc1xuICAgIC8vIG5vdCByZXBvcnQgdGhhdCBzYW1lIGVycm9yIHdoZW4gcnVubmluZyBpbiB0aGlzIEZsb3cgcm9vdCwgdGhlbiB3ZSB3YW50IHRoZSBlcnJvciB0b1xuICAgIC8vIGRpc2FwcGVhciB3aGVuIHRoaXMgZmlsZSBpcyBvcGVuZWQuXG4gICAgLy9cbiAgICAvLyBUaGlzIGlzbid0IGEgcGVyZmVjdCBzb2x1dGlvbiwgc2luY2UgaXQgY2FuIHN0aWxsIGxlYXZlIGRpYWdub3N0aWNzIHVwIGluIG90aGVyIGZpbGVzLCBidXRcbiAgICAvLyB0aGlzIGlzIGEgY29ybmVyIGNhc2UgYW5kIGRvaW5nIHRoaXMgaXMgc3RpbGwgYmV0dGVyIHRoYW4gZG9pbmcgbm90aGluZy5cbiAgICAvL1xuICAgIC8vIEkgdGhpbmsgdGhhdCB3aGVuZXZlciB0aGlzIGhhcHBlbnMsIGl0J3MgYSBidWcgaW4gRmxvdy4gSXQgc2VlbXMgc3RyYW5nZSBmb3IgRmxvdyB0byByZXBvcnRcbiAgICAvLyBlcnJvcnMgaW4gb25lIHBsYWNlIHdoZW4gcnVuIGZyb20gb25lIHJvb3QsIGFuZCBub3QgcmVwb3J0IGVycm9ycyBpbiB0aGF0IHNhbWUgcGxhY2Ugd2hlbiBydW5cbiAgICAvLyBmcm9tIGFub3RoZXIgcm9vdC4gQnV0IHN1Y2ggaXMgbGlmZS5cbiAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KGN1cnJlbnRGaWxlLCBbXSk7XG5cbiAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWMgb2YgZmlsZURpYWdub3N0aWNzKSB7XG4gICAgICBjb25zdCBwYXRoID0gZGlhZ25vc3RpY1snZmlsZVBhdGgnXTtcbiAgICAgIGxldCBkaWFnbm9zdGljQXJyYXkgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KHBhdGgpO1xuICAgICAgaWYgKCFkaWFnbm9zdGljQXJyYXkpIHtcbiAgICAgICAgZGlhZ25vc3RpY0FycmF5ID0gW107XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQocGF0aCwgZGlhZ25vc3RpY0FycmF5KTtcbiAgICAgIH1cbiAgICAgIGRpYWdub3N0aWNBcnJheS5wdXNoKGRpYWdub3N0aWMpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGZpbGVQYXRoVG9NZXNzYWdlcyB9O1xuICB9XG5cbiAgaW52YWxpZGF0ZVByb2plY3RQYXRoKHByb2plY3RQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBwYXRoc1RvSW52YWxpZGF0ZSA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGNvbnN0IGZsb3dSb290RW50cnkgb2YgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocykge1xuICAgICAgY29uc3QgW2Zsb3dSb290LCBmaWxlUGF0aHNdID0gZmxvd1Jvb3RFbnRyeTtcbiAgICAgIGlmICghZmxvd1Jvb3Quc3RhcnRzV2l0aChwcm9qZWN0UGF0aCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBwYXRoc1RvSW52YWxpZGF0ZS5hZGQoZmlsZVBhdGgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5kZWxldGUoZmxvd1Jvb3QpO1xuICAgIH1cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe1xuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGZpbGVQYXRoczogYXJyYXkuZnJvbShwYXRoc1RvSW52YWxpZGF0ZSksXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGbG93RGlhZ25vc3RpY3NQcm92aWRlcjtcbiJdfQ==