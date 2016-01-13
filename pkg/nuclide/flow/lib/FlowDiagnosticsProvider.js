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

var _require = require('../../client');

var getServiceByNuclideUri = _require.getServiceByNuclideUri;

var _require2 = require('../../commons');

var promises = _require2.promises;
var array = _require2.array;
var RequestSerializer = promises.RequestSerializer;

var _require3 = require('../../diagnostics/provider-base');

var DiagnosticsProviderBase = _require3.DiagnosticsProviderBase;

var _require4 = require('atom');

var Range = _require4.Range;

var invariant = require('assert');

var _require5 = require('./constants.js');

var JS_GRAMMARS = _require5.JS_GRAMMARS;

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

      var flowService = getServiceByNuclideUri('FlowService', file);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O3lCQW9CMEIsaUJBQWlCOztlQUVWLE9BQU8sQ0FBQyxjQUFjLENBQUM7O0lBQWpELHNCQUFzQixZQUF0QixzQkFBc0I7O2dCQUNILE9BQU8sQ0FBQyxlQUFlLENBQUM7O0lBQTNDLFFBQVEsYUFBUixRQUFRO0lBQUUsS0FBSyxhQUFMLEtBQUs7SUFDZixpQkFBaUIsR0FBSSxRQUFRLENBQTdCLGlCQUFpQjs7Z0JBQ1UsT0FBTyxDQUFDLGlDQUFpQyxDQUFDOztJQUFyRSx1QkFBdUIsYUFBdkIsdUJBQXVCOztnQkFDZCxPQUFPLENBQUMsTUFBTSxDQUFDOztJQUF4QixLQUFLLGFBQUwsS0FBSzs7QUFDWixJQUFNLFNBQVMsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7O2dCQUVkLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzs7SUFBeEMsV0FBVyxhQUFYLFdBQVc7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBc0NsQixTQUFTLFlBQVksQ0FBQyxPQUFPLEVBQUU7OztBQUc3QixTQUFPLElBQUksS0FBSyxDQUNkLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQzNDLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FDekMsQ0FBQztDQUNIOzs7QUFHRCxTQUFTLGtCQUFrQixDQUFDLE9BQU8sRUFBRTtBQUNuQyxTQUFPO0FBQ0wsUUFBSSxFQUFFLE9BQU87QUFDYixRQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUN0QixZQUFRLEVBQUUsT0FBTyxDQUFDLE1BQU0sQ0FBQztBQUN6QixTQUFLLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQztHQUM3QixDQUFDO0NB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QVUsQ0FBQyxDQUFDO09BQ2xDOztBQUVELGFBQU8sRUFBRSxrQkFBa0IsRUFBbEIsa0JBQWtCLEVBQUUsQ0FBQztLQUMvQjs7O1dBRW9CLCtCQUFDLFdBQW1CLEVBQVE7QUFDL0MsVUFBTSxpQkFBaUIsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0FBQ3BDLFdBQUssSUFBTSxhQUFhLElBQUksSUFBSSxDQUFDLG9CQUFvQixFQUFFOzRDQUN2QixhQUFhOztZQUFwQyxTQUFRO1lBQUUsU0FBUzs7QUFDMUIsWUFBSSxDQUFDLFNBQVEsQ0FBQyxVQUFVLENBQUMsV0FBVyxDQUFDLEVBQUU7QUFDckMsbUJBQVM7U0FDVjtBQUNELGFBQUssSUFBTSxRQUFRLElBQUksU0FBUyxFQUFFO0FBQ2hDLDJCQUFpQixDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztTQUNqQztBQUNELFlBQUksQ0FBQyxvQkFBb0IsVUFBTyxDQUFDLFNBQVEsQ0FBQyxDQUFDO09BQzVDO0FBQ0QsVUFBSSxDQUFDLGFBQWEsQ0FBQywwQkFBMEIsQ0FBQztBQUM1QyxhQUFLLEVBQUUsTUFBTTtBQUNiLGlCQUFTLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQztPQUN6QyxDQUFDLENBQUM7S0FDSjs7O1NBN0tHLHVCQUF1Qjs7O0FBZ0w3QixNQUFNLENBQUMsT0FBTyxHQUFHLHVCQUF1QixDQUFDIiwiZmlsZSI6IkZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0J1c3lTaWduYWxQcm92aWRlckJhc2V9IGZyb20gJy4uLy4uL2J1c3ktc2lnbmFsLXByb3ZpZGVyLWJhc2UnO1xuaW1wb3J0IHR5cGUge051Y2xpZGVVcml9IGZyb20gJy4uLy4uL3JlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxuICBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUsXG59IGZyb20gJy4uLy4uL2RpYWdub3N0aWNzL2Jhc2UnO1xuXG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5jb25zdCB7Z2V0U2VydmljZUJ5TnVjbGlkZVVyaX0gPSByZXF1aXJlKCcuLi8uLi9jbGllbnQnKTtcbmNvbnN0IHtwcm9taXNlcywgYXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vY29tbW9ucycpO1xuY29uc3Qge1JlcXVlc3RTZXJpYWxpemVyfSA9IHByb21pc2VzO1xuY29uc3Qge0RpYWdub3N0aWNzUHJvdmlkZXJCYXNlfSA9IHJlcXVpcmUoJy4uLy4uL2RpYWdub3N0aWNzL3Byb3ZpZGVyLWJhc2UnKTtcbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxuY29uc3Qge0pTX0dSQU1NQVJTfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzLmpzJyk7XG5cbi8qXG4gKiBUT0RPIHJlbW92ZSB0aGVzZSBkdXBsaWNhdGUgZGVmaW5pdGlvbnMgb25jZSB3ZSBmaWd1cmUgb3V0IGltcG9ydGluZyB0eXBlc1xuICogdGhyb3VnaCBzeW1saW5rcy5cbiAqL1xuZXhwb3J0IHR5cGUgRGlhZ25vc3RpY3MgPSB7XG4gIGZsb3dSb290OiBOdWNsaWRlVXJpLFxuICBtZXNzYWdlczogQXJyYXk8Rmxvd0RpYWdub3N0aWNJdGVtPlxufTtcbnR5cGUgRmxvd0Vycm9yID0ge1xuICBsZXZlbDogc3RyaW5nLFxuICBkZXNjcjogc3RyaW5nLFxuICBwYXRoOiBzdHJpbmcsXG4gIGxpbmU6IG51bWJlcixcbiAgc3RhcnQ6IG51bWJlcixcbiAgZW5kbGluZTogbnVtYmVyLFxuICBlbmQ6IG51bWJlcixcbn1cblxudHlwZSBGbG93RGlhZ25vc3RpY0l0ZW0gPSBBcnJheTxGbG93RXJyb3I+O1xuXG4vKipcbiAqIEN1cnJlbnRseSwgYSBkaWFnbm9zdGljIGZyb20gRmxvdyBpcyBhbiBvYmplY3Qgd2l0aCBhIFwibWVzc2FnZVwiIHByb3BlcnR5LlxuICogRWFjaCBpdGVtIGluIHRoZSBcIm1lc3NhZ2VcIiBhcnJheSBpcyBhbiBvYmplY3Qgd2l0aCB0aGUgZm9sbG93aW5nIGZpZWxkczpcbiAqICAgICAtIHBhdGggKHN0cmluZykgRmlsZSB0aGF0IGNvbnRhaW5zIHRoZSBlcnJvci5cbiAqICAgICAtIGRlc2NyIChzdHJpbmcpIERlc2NyaXB0aW9uIG9mIHRoZSBlcnJvci5cbiAqICAgICAtIGxpbmUgKG51bWJlcikgU3RhcnQgbGluZS5cbiAqICAgICAtIGVuZGxpbmUgKG51bWJlcikgRW5kIGxpbmUuXG4gKiAgICAgLSBzdGFydCAobnVtYmVyKSBTdGFydCBjb2x1bW4uXG4gKiAgICAgLSBlbmQgKG51bWJlcikgRW5kIGNvbHVtbi5cbiAqICAgICAtIGNvZGUgKG51bWJlcikgUHJlc3VtYWJseSBhbiBlcnJvciBjb2RlLlxuICogVGhlIG1lc3NhZ2UgYXJyYXkgbWF5IGhhdmUgbW9yZSB0aGFuIG9uZSBpdGVtLiBGb3IgZXhhbXBsZSwgaWYgdGhlcmUgaXMgYVxuICogdHlwZSBpbmNvbXBhdGliaWxpdHkgZXJyb3IsIHRoZSBmaXJzdCBpdGVtIGluIHRoZSBtZXNzYWdlIGFycmF5IGJsYW1lcyB0aGVcbiAqIHVzYWdlIG9mIHRoZSB3cm9uZyB0eXBlIGFuZCB0aGUgc2Vjb25kIGJsYW1lcyB0aGUgZGVjbGFyYXRpb24gb2YgdGhlIHR5cGVcbiAqIHdpdGggd2hpY2ggdGhlIHVzYWdlIGRpc2FncmVlcy4gTm90ZSB0aGF0IHRoZXNlIGNvdWxkIG9jY3VyIGluIGRpZmZlcmVudFxuICogZmlsZXMuXG4gKi9cbmZ1bmN0aW9uIGV4dHJhY3RSYW5nZShtZXNzYWdlKSB7XG4gIC8vIEl0J3MgdW5jbGVhciB3aHkgdGhlIDEtYmFzZWQgdG8gMC1iYXNlZCBpbmRleGluZyB3b3JrcyB0aGUgd2F5IHRoYXQgaXRcbiAgLy8gZG9lcywgYnV0IHRoaXMgaGFzIHRoZSBkZXNpcmVkIGVmZmVjdCBpbiB0aGUgVUksIGluIHByYWN0aWNlLlxuICByZXR1cm4gbmV3IFJhbmdlKFxuICAgIFttZXNzYWdlWydsaW5lJ10gLSAxLCBtZXNzYWdlWydzdGFydCddIC0gMV0sXG4gICAgW21lc3NhZ2VbJ2VuZGxpbmUnXSAtIDEsIG1lc3NhZ2VbJ2VuZCddXVxuICApO1xufVxuXG4vLyBBIHRyYWNlIG9iamVjdCBpcyB2ZXJ5IHNpbWlsYXIgdG8gYW4gZXJyb3Igb2JqZWN0LlxuZnVuY3Rpb24gZmxvd01lc3NhZ2VUb1RyYWNlKG1lc3NhZ2UpIHtcbiAgcmV0dXJuIHtcbiAgICB0eXBlOiAnVHJhY2UnLFxuICAgIHRleHQ6IG1lc3NhZ2VbJ2Rlc2NyJ10sXG4gICAgZmlsZVBhdGg6IG1lc3NhZ2VbJ3BhdGgnXSxcbiAgICByYW5nZTogZXh0cmFjdFJhbmdlKG1lc3NhZ2UpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBmbG93TWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2UoZmxvd01lc3NhZ2VzKSB7XG4gIGNvbnN0IGZsb3dNZXNzYWdlID0gZmxvd01lc3NhZ2VzWzBdO1xuXG4gIGNvbnN0IGRpYWdub3N0aWNNZXNzYWdlOiBGaWxlRGlhZ25vc3RpY01lc3NhZ2UgPSB7XG4gICAgc2NvcGU6ICdmaWxlJyxcbiAgICBwcm92aWRlck5hbWU6ICdGbG93JyxcbiAgICB0eXBlOiBmbG93TWVzc2FnZVsnbGV2ZWwnXSA9PT0gJ2Vycm9yJyA/ICdFcnJvcicgOiAnV2FybmluZycsXG4gICAgdGV4dDogZmxvd01lc3NhZ2VbJ2Rlc2NyJ10sXG4gICAgZmlsZVBhdGg6IGZsb3dNZXNzYWdlWydwYXRoJ10sXG4gICAgcmFuZ2U6IGV4dHJhY3RSYW5nZShmbG93TWVzc2FnZSksXG4gIH07XG5cbiAgLy8gV2hlbiB0aGUgbWVzc2FnZSBpcyBhbiBhcnJheSB3aXRoIG11bHRpcGxlIGVsZW1lbnRzLCB0aGUgc2Vjb25kIGVsZW1lbnRcbiAgLy8gb253YXJkcyBjb21wcmlzZSB0aGUgdHJhY2UgZm9yIHRoZSBlcnJvci5cbiAgaWYgKGZsb3dNZXNzYWdlcy5sZW5ndGggPiAxKSB7XG4gICAgZGlhZ25vc3RpY01lc3NhZ2UudHJhY2UgPSBmbG93TWVzc2FnZXMuc2xpY2UoMSkubWFwKGZsb3dNZXNzYWdlVG9UcmFjZSk7XG4gIH1cblxuICByZXR1cm4gZGlhZ25vc3RpY01lc3NhZ2U7XG59XG5cbmNsYXNzIEZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyIHtcbiAgX3Byb3ZpZGVyQmFzZTogRGlhZ25vc3RpY3NQcm92aWRlckJhc2U7XG4gIF9idXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2U7XG4gIF9yZXF1ZXN0U2VyaWFsaXplcjogUmVxdWVzdFNlcmlhbGl6ZXI7XG5cbiAgLyoqXG4gICAgKiBNYXBzIGZsb3cgcm9vdCB0byB0aGUgc2V0IG9mIGZpbGUgcGF0aHMgdW5kZXIgdGhhdCByb290IGZvciB3aGljaCB3ZSBoYXZlXG4gICAgKiBldmVyIHJlcG9ydGVkIGRpYWdub3N0aWNzLlxuICAgICovXG4gIF9mbG93Um9vdFRvRmlsZVBhdGhzOiBNYXA8TnVjbGlkZVVyaSwgU2V0PE51Y2xpZGVVcmk+PjtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBzaG91bGRSdW5PblRoZUZseTogYm9vbGVhbixcbiAgICBidXN5U2lnbmFsUHJvdmlkZXI6IEJ1c3lTaWduYWxQcm92aWRlckJhc2UsXG4gICAgUHJvdmlkZXJCYXNlPzogdHlwZW9mIERpYWdub3N0aWNzUHJvdmlkZXJCYXNlID0gRGlhZ25vc3RpY3NQcm92aWRlckJhc2UsXG4gICkge1xuICAgIHRoaXMuX2J1c3lTaWduYWxQcm92aWRlciA9IGJ1c3lTaWduYWxQcm92aWRlcjtcbiAgICBjb25zdCB1dGlsc09wdGlvbnMgPSB7XG4gICAgICBncmFtbWFyU2NvcGVzOiBuZXcgU2V0KEpTX0dSQU1NQVJTKSxcbiAgICAgIHNob3VsZFJ1bk9uVGhlRmx5LFxuICAgICAgb25UZXh0RWRpdG9yRXZlbnQ6IGVkaXRvciA9PiB0aGlzLl9ydW5EaWFnbm9zdGljcyhlZGl0b3IpLFxuICAgICAgb25OZXdVcGRhdGVTdWJzY3JpYmVyOiBjYWxsYmFjayA9PiB0aGlzLl9yZWNlaXZlZE5ld1VwZGF0ZVN1YnNjcmliZXIoY2FsbGJhY2spLFxuICAgIH07XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlID0gbmV3IFByb3ZpZGVyQmFzZSh1dGlsc09wdGlvbnMpO1xuICAgIHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyID0gbmV3IFJlcXVlc3RTZXJpYWxpemVyKCk7XG4gICAgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocyA9IG5ldyBNYXAoKTtcbiAgfVxuXG4gIF9ydW5EaWFnbm9zdGljcyh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogdm9pZCB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyLnJlcG9ydEJ1c3koXG4gICAgICAnRmxvdzogV2FpdGluZyBmb3IgZGlhZ25vc3RpY3MnLFxuICAgICAgKCkgPT4gdGhpcy5fcnVuRGlhZ25vc3RpY3NJbXBsKHRleHRFZGl0b3IpLFxuICAgICk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2Zsb3cucnVuLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRDb250ZW50cyA9IHRleHRFZGl0b3IuaXNNb2RpZmllZCgpID8gdGV4dEVkaXRvci5nZXRUZXh0KCkgOiBudWxsO1xuXG4gICAgY29uc3QgZmxvd1NlcnZpY2UgPSBnZXRTZXJ2aWNlQnlOdWNsaWRlVXJpKCdGbG93U2VydmljZScsIGZpbGUpO1xuICAgIGludmFyaWFudChmbG93U2VydmljZSk7XG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIucnVuKFxuICAgICAgZmxvd1NlcnZpY2UuZmxvd0ZpbmREaWFnbm9zdGljcyhmaWxlLCBjdXJyZW50Q29udGVudHMpXG4gICAgKTtcbiAgICBpZiAocmVzdWx0LnN0YXR1cyA9PT0gJ291dGRhdGVkJykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBkaWFnbm9zdGljczogP0RpYWdub3N0aWNzID0gcmVzdWx0LnJlc3VsdDtcbiAgICBpZiAoIWRpYWdub3N0aWNzKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHtmbG93Um9vdCwgbWVzc2FnZXN9ID0gZGlhZ25vc3RpY3M7XG5cbiAgICBjb25zdCBwYXRoc1RvSW52YWxpZGF0ZSA9IHRoaXMuX2dldFBhdGhzVG9JbnZhbGlkYXRlKGZsb3dSb290KTtcbiAgICAvKlxuICAgICAqIFRPRE8gQ29uc2lkZXIgb3B0aW1pemluZyBmb3IgdGhlIGNvbW1vbiBjYXNlIG9mIG9ubHkgYSBzaW5nbGUgZmxvdyByb290XG4gICAgICogYnkgaW52YWxpZGF0aW5nIGFsbCBpbnN0ZWFkIG9mIGVudW1lcmF0aW5nIHRoZSBmaWxlcy5cbiAgICAgKi9cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe3Njb3BlOiAnZmlsZScsIGZpbGVQYXRoczogcGF0aHNUb0ludmFsaWRhdGV9KTtcblxuICAgIGNvbnN0IHBhdGhzRm9yUm9vdCA9IG5ldyBTZXQoKTtcbiAgICB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzLnNldChmbG93Um9vdCwgcGF0aHNGb3JSb290KTtcbiAgICBmb3IgKGNvbnN0IG1lc3NhZ2Ugb2YgbWVzc2FnZXMpIHtcbiAgICAgIC8qXG4gICAgICAgKiBFYWNoIG1lc3NhZ2UgY29uc2lzdHMgb2Ygc2V2ZXJhbCBkaWZmZXJlbnQgY29tcG9uZW50cywgZWFjaCB3aXRoIGl0c1xuICAgICAgICogb3duIHRleHQgYW5kIHBhdGguXG4gICAgICAgKi9cbiAgICAgIGZvciAoY29uc3QgbWVzc2FnZUNvbXBvbmVudCBvZiBtZXNzYWdlKSB7XG4gICAgICAgIHBhdGhzRm9yUm9vdC5hZGQobWVzc2FnZUNvbXBvbmVudC5wYXRoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VVcGRhdGUodGhpcy5fcHJvY2Vzc0RpYWdub3N0aWNzKG1lc3NhZ2VzLCBmaWxlKSk7XG4gIH1cblxuICBfZ2V0UGF0aHNUb0ludmFsaWRhdGUoZmxvd1Jvb3Q6IE51Y2xpZGVVcmkpOiBBcnJheTxOdWNsaWRlVXJpPiB7XG4gICAgY29uc3QgZmlsZVBhdGhzID0gdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5nZXQoZmxvd1Jvb3QpO1xuICAgIGlmICghZmlsZVBhdGhzKSB7XG4gICAgICByZXR1cm4gW107XG4gICAgfVxuICAgIHJldHVybiBhcnJheS5mcm9tKGZpbGVQYXRocyk7XG4gIH1cblxuICBfcmVjZWl2ZWROZXdVcGRhdGVTdWJzY3JpYmVyKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiB2b2lkIHtcbiAgICAvLyBFdmVyeSB0aW1lIHdlIGdldCBhIG5ldyBzdWJzY3JpYmVyLCB3ZSBuZWVkIHRvIHB1c2ggcmVzdWx0cyB0byB0aGVtLiBUaGlzXG4gICAgLy8gbG9naWMgaXMgY29tbW9uIHRvIGFsbCBwcm92aWRlcnMgYW5kIHNob3VsZCBiZSBhYnN0cmFjdGVkIG91dCAodDc4MTMwNjkpXG4gICAgLy9cbiAgICAvLyBPbmNlIHdlIHByb3ZpZGUgYWxsIGRpYWdub3N0aWNzLCBpbnN0ZWFkIG9mIGp1c3QgdGhlIGN1cnJlbnQgZmlsZSwgd2UgY2FuXG4gICAgLy8gcHJvYmFibHkgcmVtb3ZlIHRoZSBhY3RpdmVUZXh0RWRpdG9yIHBhcmFtZXRlci5cbiAgICBjb25zdCBhY3RpdmVUZXh0RWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGlmIChhY3RpdmVUZXh0RWRpdG9yKSB7XG4gICAgICBjb25zdCBtYXRjaGVzR3JhbW1hciA9IEpTX0dSQU1NQVJTLmluZGV4T2YoYWN0aXZlVGV4dEVkaXRvci5nZXRHcmFtbWFyKCkuc2NvcGVOYW1lKSAhPT0gLTE7XG4gICAgICBpZiAobWF0Y2hlc0dyYW1tYXIpIHtcbiAgICAgICAgdGhpcy5fcnVuRGlhZ25vc3RpY3MoYWN0aXZlVGV4dEVkaXRvcik7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHk6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9wcm92aWRlckJhc2Uuc2V0UnVuT25UaGVGbHkocnVuT25UaGVGbHkpO1xuICB9XG5cbiAgb25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrOiBNZXNzYWdlVXBkYXRlQ2FsbGJhY2spOiBhdG9tJERpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogYXRvbSREaXNwb3NhYmxlIHtcbiAgICByZXR1cm4gdGhpcy5fcHJvdmlkZXJCYXNlLm9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjayk7XG4gIH1cblxuICBkaXNwb3NlKCkge1xuICAgIHRoaXMuX3Byb3ZpZGVyQmFzZS5kaXNwb3NlKCk7XG4gIH1cblxuICBfcHJvY2Vzc0RpYWdub3N0aWNzKFxuICAgIGRpYWdub3N0aWNzOiBBcnJheTxGbG93RGlhZ25vc3RpY0l0ZW0+LFxuICAgIGN1cnJlbnRGaWxlOiBzdHJpbmdcbiAgKTogRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlIHtcblxuICAgIC8vIGNvbnZlcnQgYXJyYXkgbWVzc2FnZXMgdG8gRXJyb3IgT2JqZWN0cyB3aXRoIFRyYWNlc1xuICAgIGNvbnN0IGZpbGVEaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzLm1hcChmbG93TWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2UpO1xuXG4gICAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gVGhpcyBpbnZhbGlkYXRlcyB0aGUgZXJyb3JzIGluIHRoZSBjdXJyZW50IGZpbGUuIElmIEZsb3csIHdoZW4gcnVubmluZyBpbiB0aGlzIHJvb3QsIGhhc1xuICAgIC8vIHJlcG9ydGVkIGVycm9ycyBmb3IgdGhpcyBmaWxlLCB0aGlzIGludmFsaWRhdGlvbiBpcyBub3QgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIHBhdGggd2lsbCBiZVxuICAgIC8vIGV4cGxpY2l0bHkgaW52YWxpZGF0ZWQuIEhvd2V2ZXIsIGlmIEZsb3cgaGFzIHJlcG9ydGVkIGFuIGVycm9yIGluIHRoaXMgcm9vdCBmcm9tIGFub3RoZXIgcm9vdFxuICAgIC8vIChhcyBzb21ldGltZXMgaGFwcGVucyB3aGVuIEZsb3cgcm9vdHMgY29udGFpbiBzeW1saW5rcyB0byBvdGhlciBGbG93IHJvb3RzKSwgYW5kIGl0IGFsc28gZG9lc1xuICAgIC8vIG5vdCByZXBvcnQgdGhhdCBzYW1lIGVycm9yIHdoZW4gcnVubmluZyBpbiB0aGlzIEZsb3cgcm9vdCwgdGhlbiB3ZSB3YW50IHRoZSBlcnJvciB0b1xuICAgIC8vIGRpc2FwcGVhciB3aGVuIHRoaXMgZmlsZSBpcyBvcGVuZWQuXG4gICAgLy9cbiAgICAvLyBUaGlzIGlzbid0IGEgcGVyZmVjdCBzb2x1dGlvbiwgc2luY2UgaXQgY2FuIHN0aWxsIGxlYXZlIGRpYWdub3N0aWNzIHVwIGluIG90aGVyIGZpbGVzLCBidXRcbiAgICAvLyB0aGlzIGlzIGEgY29ybmVyIGNhc2UgYW5kIGRvaW5nIHRoaXMgaXMgc3RpbGwgYmV0dGVyIHRoYW4gZG9pbmcgbm90aGluZy5cbiAgICAvL1xuICAgIC8vIEkgdGhpbmsgdGhhdCB3aGVuZXZlciB0aGlzIGhhcHBlbnMsIGl0J3MgYSBidWcgaW4gRmxvdy4gSXQgc2VlbXMgc3RyYW5nZSBmb3IgRmxvdyB0byByZXBvcnRcbiAgICAvLyBlcnJvcnMgaW4gb25lIHBsYWNlIHdoZW4gcnVuIGZyb20gb25lIHJvb3QsIGFuZCBub3QgcmVwb3J0IGVycm9ycyBpbiB0aGF0IHNhbWUgcGxhY2Ugd2hlbiBydW5cbiAgICAvLyBmcm9tIGFub3RoZXIgcm9vdC4gQnV0IHN1Y2ggaXMgbGlmZS5cbiAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KGN1cnJlbnRGaWxlLCBbXSk7XG5cbiAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWMgb2YgZmlsZURpYWdub3N0aWNzKSB7XG4gICAgICBjb25zdCBwYXRoID0gZGlhZ25vc3RpY1snZmlsZVBhdGgnXTtcbiAgICAgIGxldCBkaWFnbm9zdGljQXJyYXkgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KHBhdGgpO1xuICAgICAgaWYgKCFkaWFnbm9zdGljQXJyYXkpIHtcbiAgICAgICAgZGlhZ25vc3RpY0FycmF5ID0gW107XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQocGF0aCwgZGlhZ25vc3RpY0FycmF5KTtcbiAgICAgIH1cbiAgICAgIGRpYWdub3N0aWNBcnJheS5wdXNoKGRpYWdub3N0aWMpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGZpbGVQYXRoVG9NZXNzYWdlcyB9O1xuICB9XG5cbiAgaW52YWxpZGF0ZVByb2plY3RQYXRoKHByb2plY3RQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBwYXRoc1RvSW52YWxpZGF0ZSA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGNvbnN0IGZsb3dSb290RW50cnkgb2YgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocykge1xuICAgICAgY29uc3QgW2Zsb3dSb290LCBmaWxlUGF0aHNdID0gZmxvd1Jvb3RFbnRyeTtcbiAgICAgIGlmICghZmxvd1Jvb3Quc3RhcnRzV2l0aChwcm9qZWN0UGF0aCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBwYXRoc1RvSW52YWxpZGF0ZS5hZGQoZmlsZVBhdGgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5kZWxldGUoZmxvd1Jvb3QpO1xuICAgIH1cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe1xuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGZpbGVQYXRoczogYXJyYXkuZnJvbShwYXRoc1RvSW52YWxpZGF0ZSksXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGbG93RGlhZ25vc3RpY3NQcm92aWRlcjtcbiJdfQ==