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

var _nuclideAnalytics = require('../../nuclide-analytics');

var _FlowServiceFactory = require('./FlowServiceFactory');

var _nuclideLogging = require('../../nuclide-logging');

var _require = require('../../nuclide-commons');

var promises = _require.promises;
var RequestSerializer = promises.RequestSerializer;

var _require2 = require('../../nuclide-diagnostics-provider-base');

var DiagnosticsProviderBase = _require2.DiagnosticsProviderBase;

var logger = (0, _nuclideLogging.getLogger)();

var _require3 = require('atom');

var Range = _require3.Range;

var invariant = require('assert');

var _require4 = require('./constants');

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

// Use `atom$Range | void` rather than `?atom$Range` to exclude `null`, so that the type is
// compatible with the `range` property, which is an optional property rather than a nullable
// property.
function extractRange(message) {
  // It's unclear why the 1-based to 0-based indexing works the way that it
  // does, but this has the desired effect in the UI, in practice.
  var range = message.range;
  if (range == null) {
    return undefined;
  } else {
    return new Range([range.start.line - 1, range.start.column - 1], [range.end.line - 1, range.end.column]);
  }
}

function extractPath(message) {
  return message.range == null ? undefined : message.range.file;
}

// A trace object is very similar to an error object.
function flowMessageToTrace(message) {
  return {
    type: 'Trace',
    text: message['descr'],
    filePath: extractPath(message),
    range: extractRange(message)
  };
}

function flowMessageToDiagnosticMessage(diagnostic) {
  var flowMessage = diagnostic.messageComponents[0];

  // The Flow type does not capture this, but the first message always has a path, and the
  // diagnostics package requires a FileDiagnosticMessage to have a path.
  var path = extractPath(flowMessage);
  invariant(path != null, 'Expected path to not be null or undefined');

  var diagnosticMessage = {
    scope: 'file',
    providerName: 'Flow',
    type: diagnostic['level'] === 'error' ? 'Error' : 'Warning',
    text: flowMessage['descr'],
    filePath: path,
    range: extractRange(flowMessage)
  };

  // When the message is an array with multiple elements, the second element
  // onwards comprise the trace for the error.
  if (diagnostic.messageComponents.length > 1) {
    diagnosticMessage.trace = diagnostic.messageComponents.slice(1).map(flowMessageToTrace);
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
    decorators: [(0, _nuclideAnalytics.trackTiming)('flow.run-diagnostics')],
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
        for (var messageComponent of message.messageComponents) {
          if (messageComponent.range != null) {
            pathsForRoot.add(messageComponent.range.file);
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
        filePaths: Array.from(pathsToInvalidate)
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBMEIwQix5QkFBeUI7O2tDQUVWLHNCQUFzQjs7OEJBS3ZDLHVCQUF1Qjs7ZUFKNUIsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQUE1QyxRQUFRLFlBQVIsUUFBUTtJQUNSLGlCQUFpQixHQUFJLFFBQVEsQ0FBN0IsaUJBQWlCOztnQkFDVSxPQUFPLENBQUMseUNBQXlDLENBQUM7O0lBQTdFLHVCQUF1QixhQUF2Qix1QkFBdUI7O0FBRzlCLElBQU0sTUFBTSxHQUFHLGdDQUFXLENBQUM7O2dCQUVYLE9BQU8sQ0FBQyxNQUFNLENBQUM7O0lBQXhCLEtBQUssYUFBTCxLQUFLOztBQUNaLElBQU0sU0FBUyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQzs7Z0JBRWQsT0FBTyxDQUFDLGFBQWEsQ0FBQzs7SUFBckMsV0FBVyxhQUFYLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFzQmxCLFNBQVMsWUFBWSxDQUFDLE9BQXlCLEVBQXFCOzs7QUFHbEUsTUFBTSxLQUFLLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQztBQUM1QixNQUFJLEtBQUssSUFBSSxJQUFJLEVBQUU7QUFDakIsV0FBTyxTQUFTLENBQUM7R0FDbEIsTUFBTTtBQUNMLFdBQU8sSUFBSSxLQUFLLENBQ2QsQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLEVBQzlDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxFQUFFLEtBQUssQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQ3ZDLENBQUM7R0FDSDtDQUNGOztBQUVELFNBQVMsV0FBVyxDQUFDLE9BQXlCLEVBQXFCO0FBQ2pFLFNBQU8sT0FBTyxDQUFDLEtBQUssSUFBSSxJQUFJLEdB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QzVDO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQztBQUM1QyxhQUFLLEVBQUUsTUFBTTtBQUNiLGlCQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztPQUN6QyxDQUFDLENBQUM7S0FDSjs7O1NBL0tHLHVCQUF1Qjs7O0FBa0w3QixNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6IkZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL251Y2xpZGUtYnVzeS1zaWduYWwnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL251Y2xpZGUtcmVtb3RlLXVyaSc7XG5pbXBvcnQgdHlwZSB7XG4gIEZpbGVEaWFnbm9zdGljTWVzc2FnZSxcbiAgTWVzc2FnZVVwZGF0ZUNhbGxiYWNrLFxuICBNZXNzYWdlSW52YWxpZGF0aW9uQ2FsbGJhY2ssXG4gIERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSxcbiAgVHJhY2UsXG59IGZyb20gJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtYmFzZSc7XG5pbXBvcnQgdHlwZSB7XG4gIERpYWdub3N0aWNzLFxuICBEaWFnbm9zdGljLFxuICBNZXNzYWdlQ29tcG9uZW50LFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWZsb3ctYmFzZSc7XG5cbmltcG9ydCB7dHJhY2tUaW1pbmd9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuaW1wb3J0IHtnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaX0gZnJvbSAnLi9GbG93U2VydmljZUZhY3RvcnknO1xuY29uc3Qge3Byb21pc2VzfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtY29tbW9ucycpO1xuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IHByb21pc2VzO1xuY29uc3Qge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSA9IHJlcXVpcmUoJy4uLy4uL251Y2xpZGUtZGlhZ25vc3RpY3MtcHJvdmlkZXItYmFzZScpO1xuXG5pbXBvcnQge2dldExvZ2dlcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1sb2dnaW5nJztcbmNvbnN0IGxvZ2dlciA9IGdldExvZ2dlcigpO1xuXG5jb25zdCB7UmFuZ2V9ID0gcmVxdWlyZSgnYXRvbScpO1xuY29uc3QgaW52YXJpYW50ID0gcmVxdWlyZSgnYXNzZXJ0Jyk7XG5cbmNvbnN0IHtKU19HUkFNTUFSU30gPSByZXF1aXJlKCcuL2NvbnN0YW50cycpO1xuXG4vKipcbiAqIEN1cnJlbnRseSwgYSBkaWFnbm9zdGljIGZyb20gRmxvdyBpcyBhbiBvYmplY3Qgd2l0aCBhIFwibWVzc2FnZVwiIHByb3BlcnR5LlxuICogRWFjaCBpdGVtIGluIHRoZSBcIm1lc3NhZ2VcIiBhcnJheSBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqICAgICAtIHBhdGggKHN0cmluZykgRmlsZSB0aGF0IGNvbnRhaW5zIHRoZSBlcnJvci5cbiAqICAgICAtIGRlc2NyIChzdHJpbmcpIERlc2NyaXB0aW9uIG9mIHRoZSBlcnJvci5cbiAqICAgICAtIGxpbmUgKG51bWJlcikgU3RhcnQgbGluZS5cbiAqICAgICAtIGVuZGxpbmUgKG51bWJlcikgRW5kIGxpbmUuXG4gKiAgICAgLSBzdGFydCAobnVtYmVyKSBTdGFydCBjb2x1bW4uXG4gKiAgICAgLSBlbmQgKG51bWJlcikgRW5kIGNvbHVtbi5cbiAqICAgICAtIGNvZGUgKG51bWJlcikgUHJlc3VtYWJseSBhbiBlcnJvciBjb2RlLlxuICogVGhlIG1lc3NhZ2UgYXJyYXkgbWF5IGhhdmUgbW9yZSB0aGFuIG9uZSBpdGVtLiBGb3IgZXhhbXBsZSwgaWYgdGhlcmUgaXMgYVxuICogdHlwZSBpbmNvbXBhdGliaWxpdHkgZXJyb3IsIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtZXNzYWdlIGFycmF5IGJsYW1lcyB0aGVcbiAqIHVzYWdlIG9mIHRoZSB3cm9uZyB0eXBlIGFuZCB0aGUgc2Vjb25kIGJsYW1lcyB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIHR5cGVcbiAqIHdpdGggd2hpY2ggdGhlIHVzYWdlIGRpc2FncmVlcy4gTm90ZSB0aGF0IHRoZXNlIGNvdWxkIG9jY3VyIGluIGRpZmZlcmVudFxuICogZmlsZXMuXG4gKi9cblxuLy8gVXNlIGBhdG9tJFJhbmdlIHwgdm9pZGAgcmF0aGVyIHRoYW4gYD9hdG9tJFJhbmdlYCB0byBleGNsdWRlIGBudWxsYCwgc28gdGhhdCB0aGUgdHlwZSBpc1xuLy8gY29tcGF0aWJsZSB3aXRoIHRoZSBgcmFuZ2VgIHByb3BlcnR5LCB3aGljaCBpcyBhbiBvcHRpb25hbCBwcm9wZXJ0eSByYXRoZXIgdGhhbiBhIG51bGxhYmxlXG4vLyBwcm9wZXJ0eS5cbmZ1bmN0aW9uIGV4dHJhY3RSYW5nZShtZXNzYWdlOiBNZXNzYWdlQ29tcG9uZW50KTogYXRvbSRSYW5nZSB8IHZvaWQge1xuICAvLyBJdCdzIHVuY2xlYXIgd2h5IHRoZSAxLWJhc2VkIHRvIDAtYmFzZWQgaW5kZXhpbmcgd29ya3MgdGhlIHdheSB0aGF0IGl0XG4gIC8vIGRvZXMsIGJ1dCB0aGlzIGhhcyB0aGUgZGVzaXJlZCBlZmZlY3QgaW4gdGhlIFVJLCBpbiBwcmFjdGljZS5cbiAgY29uc3QgcmFuZ2UgPSBtZXNzYWdlLnJhbmdlO1xuICBpZiAocmFuZ2UgPT0gbnVsbCkge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG5ldyBSYW5nZShcbiAgICAgIFtyYW5nZS5zdGFydC5saW5lIC0gMSwgcmFuZ2Uuc3RhcnQuY29sdW1uIC0gMV0sXG4gICAgICBbcmFuZ2UuZW5kLmxpbmUgLSAxLCByYW5nZS5lbmQuY29sdW1uXVxuICAgICk7XG4gIH1cbn1cblxuZnVuY3Rpb24gZXh0cmFjdFBhdGgobWVzc2FnZTogTWVzc2FnZUNvbXBvbmVudCk6IE51Y2xpZGVVcmkgfCB2b2lkIHtcbiAgcmV0dXJuIG1lc3NhZ2UucmFuZ2UgPT0gbnVsbCA/IHVuZGVmaW5lZCA6IG1lc3NhZ2UucmFuZ2UuZmlsZTtcbn1cblxuLy8gQSB0cmFjZSBvYmplY3QgaXMgdmVyeSBzaW1pbGFyIHRvIGFuIGVycm9yIG9iamVjdC5cbmZ1bmN0aW9uIGZsb3dNZXNzYWdlVG9UcmFjZShtZXNzYWdlOiBNZXNzYWdlQ29tcG9uZW50KTogVHJhY2Uge1xuICByZXR1cm4ge1xuICAgIHR5cGU6ICdUcmFjZScsXG4gICAgdGV4dDogbWVzc2FnZVsnZGVzY3InXSxcbiAgICBmaWxlUGF0aDogZXh0cmFjdFBhdGgobWVzc2FnZSksXG4gICAgcmFuZ2U6IGV4dHJhY3RSYW5nZShtZXNzYWdlKSxcbiAgfTtcbn1cblxuZnVuY3Rpb24gZmxvd01lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKGRpYWdub3N0aWM6IERpYWdub3N0aWMpIHtcbiAgY29uc3QgZmxvd01lc3NhZ2UgPSBkaWFnbm9zdGljLm1lc3NhZ2VDb21wb25lbnRzWzBdO1xuXG4gIC8vIFRoZSBGbG93IHR5cGUgZG9lcyBub3QgY2FwdHVyZSB0aGlzLCBidXQgdGhlIGZpcnN0IG1lc3NhZ2UgYWx3YXlzIGhhcyBhIHBhdGgsIGFuZCB0aGVcbiAgLy8gZGlhZ25vc3RpY3MgcGFja2FnZSByZXF1aXJlcyBhIEZpbGVEaWFnbm9zdGljTWVzc2FnZSB0byBoYXZlIGEgcGF0aC5cbiAgY29uc3QgcGF0aCA9IGV4dHJhY3RQYXRoKGZsb3dNZXNzYWdlKTtcbiAgaW52YXJpYW50KHBhdGggIT0gbnVsbCwgJ0V4cGVjdGVkIHBhdGggdG8gbm90IGJlIG51bGwgb3IgdW5kZWZpbmVkJyk7XG5cbiAgY29uc3QgZGlhZ25vc3RpY01lc3NhZ2U6IEZpbGVEaWFnbm9zdGljTWVzc2FnZSA9IHtcbiAgICBzY29wZTogJ2ZpbGUnLFxuICAgIHByb3ZpZGVyTmFtZTogJ0Zsb3cnLFxuICAgIHR5cGU6IGRpYWdub3N0aWNbJ2xldmVsJ10gPT09ICdlcnJvcicgPyAnRXJyb3InIDogJ1dhcm5pbmcnLFxuICAgIHRleHQ6IGZsb3dNZXNzYWdlWydkZXNjciddLFxuICAgIGZpbGVQYXRoOiBwYXRoLFxuICAgIHJhbmdlOiBleHRyYWN0UmFuZ2UoZmxvd01lc3NhZ2UpLFxuICB9O1xuXG4gIC8vIFdoZW4gdGhlIG1lc3NhZ2UgaXMgYW4gYXJyYXkgd2l0aCBtdWx0aXBsZSBlbGVtZW50cywgdGhlIHNlY29uZCBlbGVtZW50XG4gIC8vIG9ud2FyZHMgY29tcHJpc2UgdGhlIHRyYWNlIGZvciB0aGUgZXJyb3IuXG4gIGlmIChkaWFnbm9zdGljLm1lc3NhZ2VDb21wb25lbnRzLmxlbmd0aCA+IDEpIHtcbiAgICBkaWFnbm9zdGljTWVzc2FnZS50cmFjZSA9IGRpYWdub3N0aWMubWVzc2FnZUNvbXBvbmVudHMuc2xpY2UoMSkubWFwKGZsb3dNZXNzYWdlVG9UcmFjZSk7XG4gIH1cblxuICByZXR1cm4gZGlhZ25vc3RpY01lc3NhZ2U7XG59XG5cbmNsYXNzIEZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI7XG5cbiAgLyoqXG4gICAgKiBNYXBzIGZsb3cgcm9vdCB0byB0aGUgc2V0IG9mIGZpbGUgcGF0aHMgdW5kZXIgdGhhdCByb290IGZvciB3aGljaCB3ZSBoYXZlXG4gICAgKiBldmVyIHJlcG9ydGVkIGRpYWdub3N0aWNzLlxuICAgICovXG4gIF9mbG93Um9vdFRvRmlsZVBhdGhzOiBNYXA8TnVjbGlkZVVyaSwgU2V0PE51Y2xpZGVVcmk+PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzaG91bGRSdW5PblRoZUZseTogYm9vbGVhbixcbiAgICBidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UsXG4gICAgUHJvdmlkZXJCYXNlPzogdHlwZW9mIERpYWdub3N0aWNzUHJvdmlkZXJCYXNlID0gRGlhZ25vc3RpY3NQcm92aWRlckJhc2UsXG4gICkge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlciA9IGJ1c3lTaWduYWxQcm92aWRlcjtcbiAgICBjb25zdCB1dGlsc09wdGlvbnMgPSB7XG4gICAgICBncmFtbWFyU2NvcGVzOiBuZXcgU2V0KEpTX0dSQU1NQVJTKSxcbiAgICAgIHNob3VsZFJ1bk9uVGhlRmx5LFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IGVkaXRvciA9PiB0aGlzLl9ydW5EaWFnbm9zdGljcyhlZGl0b3IpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiBjYWxsYmFjayA9PiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2spLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlID0gbmV3IFByb3ZpZGVyQmFzZSh1dGlsc09wdGlvbnMpO1xuICAgIHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyID0gbmV3IFJlcXVlc3RTZXJpYWxpemVyKCk7XG4gICAgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIF9ydW5EaWFnbm9zdGljcyh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICAnRmxvdzogV2FpdGluZyBmb3IgZGlhZ25vc3RpY3MnLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuRGlhZ25vc3RpY3NJbXBsKHRleHRFZGl0b3IpLFxuICAgICkuY2F0Y2goZSA9PiBsb2dnZXIuZXJyb3IoZSkpO1xuICB9XG5cbiAgQHRyYWNrVGltaW5nKCdmbG93LnJ1bi1kaWFnbm9zdGljcycpXG4gIGFzeW5jIF9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvcjogVGV4dEVkaXRvcik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGZpbGUgPSB0ZXh0RWRpdG9yLmdldFBhdGgoKTtcbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjdXJyZW50Q29udGVudHMgPSB0ZXh0RWRpdG9yLmlzTW9kaWZpZWQoKSA/IHRleHRFZGl0b3IuZ2V0VGV4dCgpIDogbnVsbDtcblxuICAgIGNvbnN0IGZsb3dTZXJ2aWNlID0gZ2V0Rmxvd1NlcnZpY2VCeU51Y2xpZGVVcmkoZmlsZSk7XG4gICAgaW52YXJpYW50KGZsb3dTZXJ2aWNlKTtcbiAgICBjb25zdCByZXN1bHQgPSBhd2FpdCB0aGlzLl9yZXF1ZXN0U2VyaWFsaXplci5ydW4oXG4gICAgICBmbG93U2VydmljZS5mbG93RmluZERpYWdub3N0aWNzKGZpbGUsIGN1cnJlbnRDb250ZW50cylcbiAgICApO1xuICAgIGlmIChyZXN1bHQuc3RhdHVzID09PSAnb3V0ZGF0ZWQnKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IGRpYWdub3N0aWNzOiA/RGlhZ25vc3RpY3MgPSByZXN1bHQucmVzdWx0O1xuICAgIGlmICghZGlhZ25vc3RpY3MpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qge2Zsb3dSb290LCBtZXNzYWdlc30gPSBkaWFnbm9zdGljcztcblxuICAgIGNvbnN0IHBhdGhzVG9JbnZhbGlkYXRlID0gdGhpcy5fZ2V0UGF0aHNUb0ludmFsaWRhdGUoZmxvd1Jvb3QpO1xuICAgIC8qXG4gICAgICogVE9ETyBDb25zaWRlciBvcHRpbWl6aW5nIGZvciB0aGUgY29tbW9uIGNhc2Ugb2Ygb25seSBhIHNpbmdsZSBmbG93IHJvb3RcbiAgICAgKiBieSBpbnZhbGlkYXRpbmcgYWxsIGluc3RlYWQgb2YgZW51bWVyYXRpbmcgdGhlIGZpbGVzLlxuICAgICAqL1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZUludmFsaWRhdGlvbih7c2NvcGU6ICdmaWxlJywgZmlsZVBhdGhzOiBwYXRoc1RvSW52YWxpZGF0ZX0pO1xuXG4gICAgY29uc3QgcGF0aHNGb3JSb290ID0gbmV3IFNldCgpO1xuICAgIHRoaXMuX2Zsb3dSb290VG9GaWxlUGF0aHMuc2V0KGZsb3dSb290LCBwYXRoc0ZvclJvb3QpO1xuICAgIGZvciAoY29uc3QgbWVzc2FnZSBvZiBtZXNzYWdlcykge1xuICAgICAgLypcbiAgICAgICAqIEVhY2ggbWVzc2FnZSBjb25zaXN0cyBvZiBzZXZlcmFsIGRpZmZlcmVudCBjb21wb25lbnRzLCBlYWNoIHdpdGggaXRzXG4gICAgICAgKiBvd24gdGV4dCBhbmQgcGF0aC5cbiAgICAgICAqL1xuICAgICAgZm9yIChjb25zdCBtZXNzYWdlQ29tcG9uZW50IG9mIG1lc3NhZ2UubWVzc2FnZUNvbXBvbmVudHMpIHtcbiAgICAgICAgaWYgKG1lc3NhZ2VDb21wb25lbnQucmFuZ2UgIT0gbnVsbCkge1xuICAgICAgICAgIHBhdGhzRm9yUm9vdC5hZGQobWVzc2FnZUNvbXBvbmVudC5yYW5nZS5maWxlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5wdWJsaXNoTWVzc2FnZVVwZGF0ZSh0aGlzLl9wcm9jZXNzRGlhZ25vc3RpY3MobWVzc2FnZXMsIGZpbGUpKTtcbiAgfVxuXG4gIF9nZXRQYXRoc1RvSW52YWxpZGF0ZShmbG93Um9vdDogTnVjbGlkZVVyaSk6IEFycmF5PE51Y2xpZGVVcmk+IHtcbiAgICBjb25zdCBmaWxlUGF0aHMgPSB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzLmdldChmbG93Um9vdCk7XG4gICAgaWYgKCFmaWxlUGF0aHMpIHtcbiAgICAgIHJldHVybiBbXTtcbiAgICB9XG4gICAgcmV0dXJuIEFycmF5LmZyb20oZmlsZVBhdGhzKTtcbiAgfVxuXG4gIF9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IHZvaWQge1xuICAgIC8vIEV2ZXJ5IHRpbWUgd2UgZ2V0IGEgbmV3IHN1YnNjcmliZXIsIHdlIG5lZWQgdG8gcHVzaCByZXN1bHRzIHRvIHRoZW0uIFRoaXNcbiAgICAvLyBsb2dpYyBpcyBjb21tb24gdG8gYWxsIHByb3ZpZGVycyBhbmQgc2hvdWxkIGJlIGFic3RyYWN0ZWQgb3V0ICh0NzgxMzA2OSlcbiAgICAvL1xuICAgIC8vIE9uY2Ugd2UgcHJvdmlkZSBhbGwgZGlhZ25vc3RpY3MsIGluc3RlYWQgb2YganVzdCB0aGUgY3VycmVudCBmaWxlLCB3ZSBjYW5cbiAgICAvLyBwcm9iYWJseSByZW1vdmUgdGhlIGFjdGl2ZVRleHRFZGl0b3IgcGFyYW1ldGVyLlxuICAgIGNvbnN0IGFjdGl2ZVRleHRFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgaWYgKGFjdGl2ZVRleHRFZGl0b3IpIHtcbiAgICAgIGNvbnN0IG1hdGNoZXNHcmFtbWFyID0gSlNfR1JBTU1BUlMuaW5kZXhPZihhY3RpdmVUZXh0RWRpdG9yLmdldEdyYW1tYXIoKS5zY29wZU5hbWUpICE9PSAtMTtcbiAgICAgIGlmIChtYXRjaGVzR3JhbW1hcikge1xuICAgICAgICB0aGlzLl9ydW5EaWFnbm9zdGljcyhhY3RpdmVUZXh0RWRpdG9yKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBzZXRSdW5PblRoZUZseShydW5PblRoZUZseTogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5zZXRSdW5PblRoZUZseShydW5PblRoZUZseSk7XG4gIH1cblxuICBvbk1lc3NhZ2VVcGRhdGUoY2FsbGJhY2s6IE1lc3NhZ2VVcGRhdGVDYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjayk7XG4gIH1cblxuICBvbk1lc3NhZ2VJbnZhbGlkYXRpb24oY2FsbGJhY2s6IE1lc3NhZ2VJbnZhbGlkYXRpb25DYWxsYmFjayk6IElEaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5kaXNwb3NlKCk7XG4gIH1cblxuICBfcHJvY2Vzc0RpYWdub3N0aWNzKFxuICAgIGRpYWdub3N0aWNzOiBBcnJheTxEaWFnbm9zdGljPixcbiAgICBjdXJyZW50RmlsZTogc3RyaW5nXG4gICk6IERpYWdub3N0aWNQcm92aWRlclVwZGF0ZSB7XG5cbiAgICAvLyBjb252ZXJ0IGFycmF5IG1lc3NhZ2VzIHRvIEVycm9yIE9iamVjdHMgd2l0aCBUcmFjZXNcbiAgICBjb25zdCBmaWxlRGlhZ25vc3RpY3MgPSBkaWFnbm9zdGljcy5tYXAoZmxvd01lc3NhZ2VUb0RpYWdub3N0aWNNZXNzYWdlKTtcblxuICAgIGNvbnN0IGZpbGVQYXRoVG9NZXNzYWdlcyA9IG5ldyBNYXAoKTtcblxuICAgIC8vIFRoaXMgaW52YWxpZGF0ZXMgdGhlIGVycm9ycyBpbiB0aGUgY3VycmVudCBmaWxlLiBJZiBGbG93LCB3aGVuIHJ1bm5pbmcgaW4gdGhpcyByb290LCBoYXNcbiAgICAvLyByZXBvcnRlZCBlcnJvcnMgZm9yIHRoaXMgZmlsZSwgdGhpcyBpbnZhbGlkYXRpb24gaXMgbm90IG5lY2Vzc2FyeSBiZWNhdXNlIHRoZSBwYXRoIHdpbGwgYmVcbiAgICAvLyBleHBsaWNpdGx5IGludmFsaWRhdGVkLiBIb3dldmVyLCBpZiBGbG93IGhhcyByZXBvcnRlZCBhbiBlcnJvciBpbiB0aGlzIHJvb3QgZnJvbSBhbm90aGVyIHJvb3RcbiAgICAvLyAoYXMgc29tZXRpbWVzIGhhcHBlbnMgd2hlbiBGbG93IHJvb3RzIGNvbnRhaW4gc3ltbGlua3MgdG8gb3RoZXIgRmxvdyByb290cyksIGFuZCBpdCBhbHNvIGRvZXNcbiAgICAvLyBub3QgcmVwb3J0IHRoYXQgc2FtZSBlcnJvciB3aGVuIHJ1bm5pbmcgaW4gdGhpcyBGbG93IHJvb3QsIHRoZW4gd2Ugd2FudCB0aGUgZXJyb3IgdG9cbiAgICAvLyBkaXNhcHBlYXIgd2hlbiB0aGlzIGZpbGUgaXMgb3BlbmVkLlxuICAgIC8vXG4gICAgLy8gVGhpcyBpc24ndCBhIHBlcmZlY3Qgc29sdXRpb24sIHNpbmNlIGl0IGNhbiBzdGlsbCBsZWF2ZSBkaWFnbm9zdGljcyB1cCBpbiBvdGhlciBmaWxlcywgYnV0XG4gICAgLy8gdGhpcyBpcyBhIGNvcm5lciBjYXNlIGFuZCBkb2luZyB0aGlzIGlzIHN0aWxsIGJldHRlciB0aGFuIGRvaW5nIG5vdGhpbmcuXG4gICAgLy9cbiAgICAvLyBJIHRoaW5rIHRoYXQgd2hlbmV2ZXIgdGhpcyBoYXBwZW5zLCBpdCdzIGEgYnVnIGluIEZsb3cuIEl0IHNlZW1zIHN0cmFuZ2UgZm9yIEZsb3cgdG8gcmVwb3J0XG4gICAgLy8gZXJyb3JzIGluIG9uZSBwbGFjZSB3aGVuIHJ1biBmcm9tIG9uZSByb290LCBhbmQgbm90IHJlcG9ydCBlcnJvcnMgaW4gdGhhdCBzYW1lIHBsYWNlIHdoZW4gcnVuXG4gICAgLy8gZnJvbSBhbm90aGVyIHJvb3QuIEJ1dCBzdWNoIGlzIGxpZmUuXG4gICAgZmlsZVBhdGhUb01lc3NhZ2VzLnNldChjdXJyZW50RmlsZSwgW10pO1xuXG4gICAgZm9yIChjb25zdCBkaWFnbm9zdGljIG9mIGZpbGVEaWFnbm9zdGljcykge1xuICAgICAgY29uc3QgcGF0aCA9IGRpYWdub3N0aWNbJ2ZpbGVQYXRoJ107XG4gICAgICBsZXQgZGlhZ25vc3RpY0FycmF5ID0gZmlsZVBhdGhUb01lc3NhZ2VzLmdldChwYXRoKTtcbiAgICAgIGlmICghZGlhZ25vc3RpY0FycmF5KSB7XG4gICAgICAgIGRpYWdub3N0aWNBcnJheSA9IFtdO1xuICAgICAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KHBhdGgsIGRpYWdub3N0aWNBcnJheSk7XG4gICAgICB9XG4gICAgICBkaWFnbm9zdGljQXJyYXkucHVzaChkaWFnbm9zdGljKTtcbiAgICB9XG5cbiAgICByZXR1cm4geyBmaWxlUGF0aFRvTWVzc2FnZXMgfTtcbiAgfVxuXG4gIGludmFsaWRhdGVQcm9qZWN0UGF0aChwcm9qZWN0UGF0aDogc3RyaW5nKTogdm9pZCB7XG4gICAgY29uc3QgcGF0aHNUb0ludmFsaWRhdGUgPSBuZXcgU2V0KCk7XG4gICAgZm9yIChjb25zdCBmbG93Um9vdEVudHJ5IG9mIHRoaXMuX2Zsb3dSb290VG9GaWxlUGF0aHMpIHtcbiAgICAgIGNvbnN0IFtmbG93Um9vdCwgZmlsZVBhdGhzXSA9IGZsb3dSb290RW50cnk7XG4gICAgICBpZiAoIWZsb3dSb290LnN0YXJ0c1dpdGgocHJvamVjdFBhdGgpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuICAgICAgZm9yIChjb25zdCBmaWxlUGF0aCBvZiBmaWxlUGF0aHMpIHtcbiAgICAgICAgcGF0aHNUb0ludmFsaWRhdGUuYWRkKGZpbGVQYXRoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX2Zsb3dSb290VG9GaWxlUGF0aHMuZGVsZXRlKGZsb3dSb290KTtcbiAgICB9XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtcbiAgICAgIHNjb3BlOiAnZmlsZScsXG4gICAgICBmaWxlUGF0aHM6IEFycmF5LmZyb20ocGF0aHNUb0ludmFsaWRhdGUpLFxuICAgIH0pO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmxvd0RpYWdub3N0aWNzUHJvdmlkZXI7XG4iXX0=