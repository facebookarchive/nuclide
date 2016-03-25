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
var array = _require.array;
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZsb3dEaWFnbm9zdGljc1Byb3ZpZGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Z0NBMEIwQix5QkFBeUI7O2tDQUVWLHNCQUFzQjs7OEJBS3ZDLHVCQUF1Qjs7ZUFKckIsT0FBTyxDQUFDLHVCQUF1QixDQUFDOztJQUFuRCxRQUFRLFlBQVIsUUFBUTtJQUFFLEtBQUssWUFBTCxLQUFLO0lBQ2YsaUJBQWlCLEdBQUksUUFBUSxDQUE3QixpQkFBaUI7O2dCQUNVLE9BQU8sQ0FBQyx5Q0FBeUMsQ0FBQzs7SUFBN0UsdUJBQXVCLGFBQXZCLHVCQUF1Qjs7QUFHOUIsSUFBTSxNQUFNLEdBQUcsZ0NBQVcsQ0FBQzs7Z0JBRVgsT0FBTyxDQUFDLE1BQU0sQ0FBQzs7SUFBeEIsS0FBSyxhQUFMLEtBQUs7O0FBQ1osSUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDOztnQkFFZCxPQUFPLENBQUMsYUFBYSxDQUFDOztJQUFyQyxXQUFXLGFBQVgsV0FBVzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXNCbEIsU0FBUyxZQUFZLENBQUMsT0FBeUIsRUFBcUI7OztBQUdsRSxNQUFNLEtBQUssR0FBRyxPQUFPLENBQUMsS0FBSyxDQUFDO0FBQzVCLE1BQUksS0FBSyxJQUFJLElBQUksRUFBRTtBQUNqQixXQUFPLFNBQVMsQ0FBQztHQUNsQixNQUFNO0FBQ0wsV0FBTyxJQUFJLEtBQUssQ0FDZCxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsRUFBRSxLQUFLLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsRUFDOUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxDQUFDLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FDdkMsQ0FBQztHQUNIO0NBQ0Y7O0FBRUQsU0FBUyxXQUFXLENBQUMsT0FBeUIsRUFBcUI7QUFDakUsU0FBTyxPQUFPLENBQUMsS0FBSyxJQUFJLElBQUksR0FBRyxTQUFTLEdBQUcsT0FBTyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7Q0FDL0Q7OztBQUdELFNBQVMsa0JBQWtCLENBQUMsT0FBeUIsRUFBUztBQUM1RCxTQUFPO0FBQ0wsUUFBSSxFQUFFLE9BQU87QUFDYixRQUFJLEVBQUUsT0FBTyxDQUFDLE9BQU8sQ0FBQztBQUN0QixZQUFRLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUM5QixTQUFLLEVBQUUsWUFBWSxDQUFDLE9BQU8sQ0FBQztHQUM3QixDQUFDO0NBQ0g7O0FBRUQsU0FBUyw4QkFBOEIsQ0FBQyxVQUFzQixFQUFFO0FBQzlELE1BQU0sV0FBVyxHQUFHLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUMsQ0FBQzs7OztBQUlwRCxNQUFNLElBQUksR0FBRyxXQUFXLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDdEMsV0FBUyxDQUFDLElBQUksSUFBSSxJQUFJLEVBQUUsMkNBQTJDLENBQUMsQ0FBQzs7QUFFckUsTUFBTSxpQkFBd0MsR0FBRztBQUMvQyxTQUFLLEVBQUUsTUFBTTtBQUNiLGdCQUFZLEVBQUUsTUFBTTtBQUNwQixRQUFJLEVBQUUsVUFBVSxDQUFDLE9BQU8sQ0FBQyxLQUFLLE9BQU8sR0FBRyxPQUFPLEdBQUcsU0FBUztBQUMzRCxRQUFJLEVBQUUsV0FBVyxDQUFDLE9BQU8sQ0FBQztBQUMxQixZQUFRLEVBQUUsSUFBSTtBQUNkLFNBQUssRUFBRSxZQUFZLENBQUMsV0FBVyxDQUFDO0dBQ2pDLENBQUM7Ozs7QUFJRixNQUFJLFVBQVUsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO0FBQzNDLHFCQUFpQixDQUFDLEtBQUssR0FBRyxVQUFVLENBQUMsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO0dBQ3pGOztBQUVELFNBQU8saUJBQWlCLENBQUM7Q0FDMUI7O0lBRUssdUJBQXVCO0FBV2hCLFdBWFAsdUJBQXVCLENBWXpCLGlCQUEwQixFQUMxQixrQkFBMEMsRUFFMUM7OztRQURBLFlBQTZDLHlEQUFHLHVCQUF1Qjs7MEJBZHJFLHVCQUF1Qjs7QUFnQnpCLFFBQUksQ0FBQyxtQkFBbUIsR0FBRyxrQkFBa0IsQ0FBQztBQUM5QyxRQUFNLFlBQVksR0FBRztBQUNuQixtQkFBYSxFQUFFLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQztBQUNuQyx1QkFBaUIsRUFBakIsaUJBQWlCO0FBQ2pCLHVCQUFpQixFQUFFLDJCQUFBLE1BQU07ZUFBSSxNQUFLLGVBQWUsQ0FBQyxNQUFNLENBQUM7T0FBQTtBQUN6RCwyQkFBcUIsRUFBRSwrQkFBQSxRQUFRO2VBQUksTUFBSyw0QkFBNEIsQ0FBQyxRQUFRLENBQUM7T0FBQTtLQUMvRSxDQUFDO0FBQ0YsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLFlBQVksQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNwRCxRQUFJLENBQUMsa0JBQWtCLEdBQUcsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO0FBQ2xELFFBQUksQ0FBQyxvQkFBb0IsR0FBRyxJQUFJLEdBQUcsRUFBRSxDQUFDO0dBQ3ZDOzt3QkExQkcsdUJBQXVCOztXQTRCWix5QkFBQyxVQUFzQixFQUFROzs7QUFDNUMsVUFBSSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsQ0FDakMsK0JBQStCLEVBQy9CO2VBQU0sT0FBSyxtQkFBbUIsQ0FBQyxVQUFVLENBQUM7T0FBQSxDQUMzQyxTQUFNLENBQUMsVUFBQSxDQUFDO2VBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDL0I7OztpQkFFQSxtQ0FBWSxzQkFBc0IsQ0FBQzs2QkFDWCxXQUFDLFVBQXNCLEVBQWlCO0FBQy9ELFVBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNsQyxVQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsZUFBTztPQUNSOztBQUVELFVBQU0sZUFBZSxHQUFHLFVBQVUsQ0FBQyxVQUFVLEVBQUUsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLEdBQUcsSUFBSSxDQUFDOztBQUU5RSxVQUFNLFdBQVcsR0FBRyxvREFBMkIsSUFBSSxDQUFDLENBQUM7QUFDckQsZUFBUyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0FBQ3ZCLFVBQU0sTUFBTSxHQUFHLE1BQU0sSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsQ0FDOUMsV0FBVyxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsQ0FDdkQsQ0FBQztBQUNGLFVBQUksTUFBTSxDQUFDLE1BQU0sS0FBSyxVQUFVLEVBQUU7QUFDaEMsZUFBTztPQUNSO0FBQ0QsVUFBTSxXQUF5QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUM7QUFDaEQsVUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNoQixlQUFPO09BQ1I7VUFDTSxRQUFRLEdBQWMsV0FBVyxDQUFqQyxRQUFRO1VBQUUsUUFBUSxHQUFJLFdBQVcsQ0FBdkIsUUFBUTs7QUFFekIsVUFBTSxpQkFBaUIsR0FBRyxJQUFJLENBQUMscUJBQXFCLENBQUMsUUFBUSxDQUFDLENBQUM7Ozs7O0FBSy9ELFVBQUksQ0FBQyxhQUFhLENBQUMsMEJBQTBCLENBQUMsRUFBQyxLQUFLLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxpQkFBaUIsRUFBQyxDQUFDLENBQUM7O0FBRTdGLFVBQU0sWUFBWSxHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDL0IsVUFBSSxDQUFDLG9CQUFvQixDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7QUFDdEQsV0FBSyxJQUFNLE9BQU8sSUFBSSxRQUFRLEVBQUU7Ozs7O0FBSzlCLGFBQUssSUFBTSxnQkFBZ0IsSUFBSSxPQUFPLENBQUMsaUJBQWlCLEVBQUU7QUFDeEQsY0FBSSxnQkFBZ0IsQ0FBQyxLQUFLLElBQUksSUFBSSxFQUFFO0FBQ2xDLHdCQUFZLENBQUMsR0FBRyxDQUFDLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQztXQUMvQztTQUNGO09BQ0Y7O0FBRUQsVUFBSSxDQUFDLGFBQWEsQ0FBQyxvQkFBb0IsQ0FBQyxJQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7S0FDbkY7OztXQUVvQiwrQkFBQyxRQUFvQixFQUFxQjtBQUM3RCxVQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzFELFVBQUksQ0FBQyxTQUFTLEVBQUU7QUFDZCxlQUFPLEVBQUUsQ0FBQztPQUNYO0FBQ0QsYUFBTyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQzlCOzs7V0FFMkIsc0NBQUMsUUFBK0IsRUFBUTs7Ozs7O0FBTWxFLFVBQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQzlELFVBQUksZ0JBQWdCLEVBQUU7QUFDcEIsWUFBTSxjQUFjLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQztBQUMzRixZQUFJLGNBQWMsRUFBRTtBQUNsQixjQUFJLENBQUMsZUFBZSxDQUFDLGdCQUFnQixDQUFDLENBQUM7U0FDeEM7T0FDRjtLQUNGOzs7V0FFYSx3QkFBQyxXQUFvQixFQUFRO0FBQ3pDLFVBQUksQ0FBQyxhQUFhLENBQUMsY0FBYyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFYyx5QkFBQyxRQUErQixFQUFlO0FBQzVELGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDckQ7OztXQUVvQiwrQkFBQyxRQUFxQyxFQUFlO0FBQ3hFLGFBQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyxxQkFBcUIsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUMzRDs7O1dBRU0sbUJBQUc7QUFDUixVQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzlCOzs7V0FFa0IsNkJBQ2pCLFdBQThCLEVBQzlCLFdBQW1CLEVBQ087OztBQUcxQixVQUFNLGVBQWUsR0FBRyxXQUFXLENBQUMsR0FBRyxDQUFDLDhCQUE4QixDQUFDLENBQUM7O0FBRXhFLFVBQU0sa0JBQWtCLEdBQUcsSUFBSSxHQUFHLEVBQUUsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FBZXJDLHdCQUFrQixDQUFDLEdBQUcsQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUM7O0FBRXhDLFdBQUssSUFBTSxVQUFVLElBQUksZUFBZSxFQUFFO0FBQ3hDLFlBQU0sSUFBSSxHQUFHLFVBQVUsQ0FBQyxVQUFVLENBQUMsQ0FBQztBQUNwQyxZQUFJLGVBQWUsR0FBRyxrQkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkQsWUFBSSxDQUFDLGVBQWUsRUFBRTtBQUNwQix5QkFBZSxHQUFHLEVBQUUsQ0FBQztBQUNyQiw0QkFBa0IsQ0FBQyxHQUFHLENBQUMsSUFBSSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1NBQy9DO0FBQ0QsdUJBQWUsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUM7T0FDbEM7O0FBRUQsYUFBTyxFQUFFLGtCQUFrQixFQUFsQixrQkFBa0IsRUFBRSxDQUFDO0tBQy9COzs7V0FFb0IsK0JBQUMsV0FBbUIsRUFBUTtBQUMvQyxVQUFNLGlCQUFpQixHQUFHLElBQUksR0FBRyxFQUFFLENBQUM7QUFDcEMsV0FBSyxJQUFNLGFBQWEsSUFBSSxJQUFJLENBQUMsb0JBQW9CLEVBQUU7NENBQ3ZCLGFBQWE7O1lBQXBDLFFBQVE7WUFBRSxTQUFTOztBQUMxQixZQUFJLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxXQUFXLENBQUMsRUFBRTtBQUNyQyxtQkFBUztTQUNWO0FBQ0QsYUFBSyxJQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7QUFDaEMsMkJBQWlCLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ2pDO0FBQ0QsWUFBSSxDQUFDLG9CQUFvQixVQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDNUM7QUFDRCxVQUFJLENBQUMsYUFBYSxDQUFDLDBCQUEwQixDQUFDO0FBQzVDLGFBQUssRUFBRSxNQUFNO0FBQ2IsaUJBQVMsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDO09BQ3pDLENBQUMsQ0FBQztLQUNKOzs7U0EvS0csdUJBQXVCOzs7QUFrTDdCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsdUJBQXVCLENBQUMiLCJmaWxlIjoiRmxvd0RpYWdub3N0aWNzUHJvdmlkZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7QnVzeVNpZ25hbFByb3ZpZGVyQmFzZX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1idXN5LXNpZ25hbC1wcm92aWRlci1iYXNlJztcbmltcG9ydCB0eXBlIHtOdWNsaWRlVXJpfSBmcm9tICcuLi8uLi9udWNsaWRlLXJlbW90ZS11cmknO1xuaW1wb3J0IHR5cGUge1xuICBGaWxlRGlhZ25vc3RpY01lc3NhZ2UsXG4gIE1lc3NhZ2VVcGRhdGVDYWxsYmFjayxcbiAgTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrLFxuICBEaWFnbm9zdGljUHJvdmlkZXJVcGRhdGUsXG4gIFRyYWNlLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRpYWdub3N0aWNzLWJhc2UnO1xuaW1wb3J0IHR5cGUge1xuICBEaWFnbm9zdGljcyxcbiAgRGlhZ25vc3RpYyxcbiAgTWVzc2FnZUNvbXBvbmVudCxcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1mbG93LWJhc2UnO1xuXG5pbXBvcnQge3RyYWNrVGltaW5nfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5cbmltcG9ydCB7Z2V0Rmxvd1NlcnZpY2VCeU51Y2xpZGVVcml9IGZyb20gJy4vRmxvd1NlcnZpY2VGYWN0b3J5JztcbmNvbnN0IHtwcm9taXNlcywgYXJyYXl9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1jb21tb25zJyk7XG5jb25zdCB7UmVxdWVzdFNlcmlhbGl6ZXJ9ID0gcHJvbWlzZXM7XG5jb25zdCB7RGlhZ25vc3RpY3NQcm92aWRlckJhc2V9ID0gcmVxdWlyZSgnLi4vLi4vbnVjbGlkZS1kaWFnbm9zdGljcy1wcm92aWRlci1iYXNlJyk7XG5cbmltcG9ydCB7Z2V0TG9nZ2VyfSBmcm9tICcuLi8uLi9udWNsaWRlLWxvZ2dpbmcnO1xuY29uc3QgbG9nZ2VyID0gZ2V0TG9nZ2VyKCk7XG5cbmNvbnN0IHtSYW5nZX0gPSByZXF1aXJlKCdhdG9tJyk7XG5jb25zdCBpbnZhcmlhbnQgPSByZXF1aXJlKCdhc3NlcnQnKTtcblxuY29uc3Qge0pTX0dSQU1NQVJTfSA9IHJlcXVpcmUoJy4vY29uc3RhbnRzJyk7XG5cbi8qKlxuICogQ3VycmVudGx5LCBhIGRpYWdub3N0aWMgZnJvbSBGbG93IGlzIGFuIG9iamVjdCB3aXRoIGEgXCJtZXNzYWdlXCIgcHJvcGVydHkuXG4gKiBFYWNoIGl0ZW0gaW4gdGhlIFwibWVzc2FnZVwiIGFycmF5IGlzIGFuIG9iamVjdCB3aXRoIHRoZSBmb2xsb3dpbmcgZmllbGRzOlxuICogICAgIC0gcGF0aCAoc3RyaW5nKSBGaWxlIHRoYXQgY29udGFpbnMgdGhlIGVycm9yLlxuICogICAgIC0gZGVzY3IgKHN0cmluZykgRGVzY3JpcHRpb24gb2YgdGhlIGVycm9yLlxuICogICAgIC0gbGluZSAobnVtYmVyKSBTdGFydCBsaW5lLlxuICogICAgIC0gZW5kbGluZSAobnVtYmVyKSBFbmQgbGluZS5cbiAqICAgICAtIHN0YXJ0IChudW1iZXIpIFN0YXJ0IGNvbHVtbi5cbiAqICAgICAtIGVuZCAobnVtYmVyKSBFbmQgY29sdW1uLlxuICogICAgIC0gY29kZSAobnVtYmVyKSBQcmVzdW1hYmx5IGFuIGVycm9yIGNvZGUuXG4gKiBUaGUgbWVzc2FnZSBhcnJheSBtYXkgaGF2ZSBtb3JlIHRoYW4gb25lIGl0ZW0uIEZvciBleGFtcGxlLCBpZiB0aGVyZSBpcyBhXG4gKiB0eXBlIGluY29tcGF0aWJpbGl0eSBlcnJvciwgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIG1lc3NhZ2UgYXJyYXkgYmxhbWVzIHRoZVxuICogdXNhZ2Ugb2YgdGhlIHdyb25nIHR5cGUgYW5kIHRoZSBzZWNvbmQgYmxhbWVzIHRoZSBkZWNsYXJhdGlvbiBvZiB0aGUgdHlwZVxuICogd2l0aCB3aGljaCB0aGUgdXNhZ2UgZGlzYWdyZWVzLiBOb3RlIHRoYXQgdGhlc2UgY291bGQgb2NjdXIgaW4gZGlmZmVyZW50XG4gKiBmaWxlcy5cbiAqL1xuXG4vLyBVc2UgYGF0b20kUmFuZ2UgfCB2b2lkYCByYXRoZXIgdGhhbiBgP2F0b20kUmFuZ2VgIHRvIGV4Y2x1ZGUgYG51bGxgLCBzbyB0aGF0IHRoZSB0eXBlIGlzXG4vLyBjb21wYXRpYmxlIHdpdGggdGhlIGByYW5nZWAgcHJvcGVydHksIHdoaWNoIGlzIGFuIG9wdGlvbmFsIHByb3BlcnR5IHJhdGhlciB0aGFuIGEgbnVsbGFibGVcbi8vIHByb3BlcnR5LlxuZnVuY3Rpb24gZXh0cmFjdFJhbmdlKG1lc3NhZ2U6IE1lc3NhZ2VDb21wb25lbnQpOiBhdG9tJFJhbmdlIHwgdm9pZCB7XG4gIC8vIEl0J3MgdW5jbGVhciB3aHkgdGhlIDEtYmFzZWQgdG8gMC1iYXNlZCBpbmRleGluZyB3b3JrcyB0aGUgd2F5IHRoYXQgaXRcbiAgLy8gZG9lcywgYnV0IHRoaXMgaGFzIHRoZSBkZXNpcmVkIGVmZmVjdCBpbiB0aGUgVUksIGluIHByYWN0aWNlLlxuICBjb25zdCByYW5nZSA9IG1lc3NhZ2UucmFuZ2U7XG4gIGlmIChyYW5nZSA9PSBudWxsKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFJhbmdlKFxuICAgICAgW3JhbmdlLnN0YXJ0LmxpbmUgLSAxLCByYW5nZS5zdGFydC5jb2x1bW4gLSAxXSxcbiAgICAgIFtyYW5nZS5lbmQubGluZSAtIDEsIHJhbmdlLmVuZC5jb2x1bW5dXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBleHRyYWN0UGF0aChtZXNzYWdlOiBNZXNzYWdlQ29tcG9uZW50KTogTnVjbGlkZVVyaSB8IHZvaWQge1xuICByZXR1cm4gbWVzc2FnZS5yYW5nZSA9PSBudWxsID8gdW5kZWZpbmVkIDogbWVzc2FnZS5yYW5nZS5maWxlO1xufVxuXG4vLyBBIHRyYWNlIG9iamVjdCBpcyB2ZXJ5IHNpbWlsYXIgdG8gYW4gZXJyb3Igb2JqZWN0LlxuZnVuY3Rpb24gZmxvd01lc3NhZ2VUb1RyYWNlKG1lc3NhZ2U6IE1lc3NhZ2VDb21wb25lbnQpOiBUcmFjZSB7XG4gIHJldHVybiB7XG4gICAgdHlwZTogJ1RyYWNlJyxcbiAgICB0ZXh0OiBtZXNzYWdlWydkZXNjciddLFxuICAgIGZpbGVQYXRoOiBleHRyYWN0UGF0aChtZXNzYWdlKSxcbiAgICByYW5nZTogZXh0cmFjdFJhbmdlKG1lc3NhZ2UpLFxuICB9O1xufVxuXG5mdW5jdGlvbiBmbG93TWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2UoZGlhZ25vc3RpYzogRGlhZ25vc3RpYykge1xuICBjb25zdCBmbG93TWVzc2FnZSA9IGRpYWdub3N0aWMubWVzc2FnZUNvbXBvbmVudHNbMF07XG5cbiAgLy8gVGhlIEZsb3cgdHlwZSBkb2VzIG5vdCBjYXB0dXJlIHRoaXMsIGJ1dCB0aGUgZmlyc3QgbWVzc2FnZSBhbHdheXMgaGFzIGEgcGF0aCwgYW5kIHRoZVxuICAvLyBkaWFnbm9zdGljcyBwYWNrYWdlIHJlcXVpcmVzIGEgRmlsZURpYWdub3N0aWNNZXNzYWdlIHRvIGhhdmUgYSBwYXRoLlxuICBjb25zdCBwYXRoID0gZXh0cmFjdFBhdGgoZmxvd01lc3NhZ2UpO1xuICBpbnZhcmlhbnQocGF0aCAhPSBudWxsLCAnRXhwZWN0ZWQgcGF0aCB0byBub3QgYmUgbnVsbCBvciB1bmRlZmluZWQnKTtcblxuICBjb25zdCBkaWFnbm9zdGljTWVzc2FnZTogRmlsZURpYWdub3N0aWNNZXNzYWdlID0ge1xuICAgIHNjb3BlOiAnZmlsZScsXG4gICAgcHJvdmlkZXJOYW1lOiAnRmxvdycsXG4gICAgdHlwZTogZGlhZ25vc3RpY1snbGV2ZWwnXSA9PT0gJ2Vycm9yJyA/ICdFcnJvcicgOiAnV2FybmluZycsXG4gICAgdGV4dDogZmxvd01lc3NhZ2VbJ2Rlc2NyJ10sXG4gICAgZmlsZVBhdGg6IHBhdGgsXG4gICAgcmFuZ2U6IGV4dHJhY3RSYW5nZShmbG93TWVzc2FnZSksXG4gIH07XG5cbiAgLy8gV2hlbiB0aGUgbWVzc2FnZSBpcyBhbiBhcnJheSB3aXRoIG11bHRpcGxlIGVsZW1lbnRzLCB0aGUgc2Vjb25kIGVsZW1lbnRcbiAgLy8gb253YXJkcyBjb21wcmlzZSB0aGUgdHJhY2UgZm9yIHRoZSBlcnJvci5cbiAgaWYgKGRpYWdub3N0aWMubWVzc2FnZUNvbXBvbmVudHMubGVuZ3RoID4gMSkge1xuICAgIGRpYWdub3N0aWNNZXNzYWdlLnRyYWNlID0gZGlhZ25vc3RpYy5tZXNzYWdlQ29tcG9uZW50cy5zbGljZSgxKS5tYXAoZmxvd01lc3NhZ2VUb1RyYWNlKTtcbiAgfVxuXG4gIHJldHVybiBkaWFnbm9zdGljTWVzc2FnZTtcbn1cblxuY2xhc3MgRmxvd0RpYWdub3N0aWNzUHJvdmlkZXIge1xuICBfcHJvdmlkZXJCYXNlOiBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZTtcbiAgX2J1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZTtcbiAgX3JlcXVlc3RTZXJpYWxpemVyOiBSZXF1ZXN0U2VyaWFsaXplcjtcblxuICAvKipcbiAgICAqIE1hcHMgZmxvdyByb290IHRvIHRoZSBzZXQgb2YgZmlsZSBwYXRocyB1bmRlciB0aGF0IHJvb3QgZm9yIHdoaWNoIHdlIGhhdmVcbiAgICAqIGV2ZXIgcmVwb3J0ZWQgZGlhZ25vc3RpY3MuXG4gICAgKi9cbiAgX2Zsb3dSb290VG9GaWxlUGF0aHM6IE1hcDxOdWNsaWRlVXJpLCBTZXQ8TnVjbGlkZVVyaT4+O1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHNob3VsZFJ1bk9uVGhlRmx5OiBib29sZWFuLFxuICAgIGJ1c3lTaWduYWxQcm92aWRlcjogQnVzeVNpZ25hbFByb3ZpZGVyQmFzZSxcbiAgICBQcm92aWRlckJhc2U/OiB0eXBlb2YgRGlhZ25vc3RpY3NQcm92aWRlckJhc2UgPSBEaWFnbm9zdGljc1Byb3ZpZGVyQmFzZSxcbiAgKSB7XG4gICAgdGhpcy5fYnVzeVNpZ25hbFByb3ZpZGVyID0gYnVzeVNpZ25hbFByb3ZpZGVyO1xuICAgIGNvbnN0IHV0aWxzT3B0aW9ucyA9IHtcbiAgICAgIGdyYW1tYXJTY29wZXM6IG5ldyBTZXQoSlNfR1JBTU1BUlMpLFxuICAgICAgc2hvdWxkUnVuT25UaGVGbHksXG4gICAgICBvblRleHRFZGl0b3JFdmVudDogZWRpdG9yID0+IHRoaXMuX3J1bkRpYWdub3N0aWNzKGVkaXRvciksXG4gICAgICBvbk5ld1VwZGF0ZVN1YnNjcmliZXI6IGNhbGxiYWNrID0+IHRoaXMuX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjayksXG4gICAgfTtcbiAgICB0aGlzLl9wcm92aWRlckJhc2UgPSBuZXcgUHJvdmlkZXJCYXNlKHV0aWxzT3B0aW9ucyk7XG4gICAgdGhpcy5fcmVxdWVzdFNlcmlhbGl6ZXIgPSBuZXcgUmVxdWVzdFNlcmlhbGl6ZXIoKTtcbiAgICB0aGlzLl9mbG93Um9vdFRvRmlsZVBhdGhzID0gbmV3IE1hcCgpO1xuICB9XG5cbiAgX3J1bkRpYWdub3N0aWNzKHRleHRFZGl0b3I6IFRleHRFZGl0b3IpOiB2b2lkIHtcbiAgICB0aGlzLl9idXN5U2lnbmFsUHJvdmlkZXIucmVwb3J0QnVzeShcbiAgICAgICdGbG93OiBXYWl0aW5nIGZvciBkaWFnbm9zdGljcycsXG4gICAgICAoKSA9PiB0aGlzLl9ydW5EaWFnbm9zdGljc0ltcGwodGV4dEVkaXRvciksXG4gICAgKS5jYXRjaChlID0+IGxvZ2dlci5lcnJvcihlKSk7XG4gIH1cblxuICBAdHJhY2tUaW1pbmcoJ2Zsb3cucnVuLWRpYWdub3N0aWNzJylcbiAgYXN5bmMgX3J1bkRpYWdub3N0aWNzSW1wbCh0ZXh0RWRpdG9yOiBUZXh0RWRpdG9yKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgY29uc3QgZmlsZSA9IHRleHRFZGl0b3IuZ2V0UGF0aCgpO1xuICAgIGlmICghZmlsZSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGN1cnJlbnRDb250ZW50cyA9IHRleHRFZGl0b3IuaXNNb2RpZmllZCgpID8gdGV4dEVkaXRvci5nZXRUZXh0KCkgOiBudWxsO1xuXG4gICAgY29uc3QgZmxvd1NlcnZpY2UgPSBnZXRGbG93U2VydmljZUJ5TnVjbGlkZVVyaShmaWxlKTtcbiAgICBpbnZhcmlhbnQoZmxvd1NlcnZpY2UpO1xuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IHRoaXMuX3JlcXVlc3RTZXJpYWxpemVyLnJ1bihcbiAgICAgIGZsb3dTZXJ2aWNlLmZsb3dGaW5kRGlhZ25vc3RpY3MoZmlsZSwgY3VycmVudENvbnRlbnRzKVxuICAgICk7XG4gICAgaWYgKHJlc3VsdC5zdGF0dXMgPT09ICdvdXRkYXRlZCcpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgZGlhZ25vc3RpY3M6ID9EaWFnbm9zdGljcyA9IHJlc3VsdC5yZXN1bHQ7XG4gICAgaWYgKCFkaWFnbm9zdGljcykge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCB7Zmxvd1Jvb3QsIG1lc3NhZ2VzfSA9IGRpYWdub3N0aWNzO1xuXG4gICAgY29uc3QgcGF0aHNUb0ludmFsaWRhdGUgPSB0aGlzLl9nZXRQYXRoc1RvSW52YWxpZGF0ZShmbG93Um9vdCk7XG4gICAgLypcbiAgICAgKiBUT0RPIENvbnNpZGVyIG9wdGltaXppbmcgZm9yIHRoZSBjb21tb24gY2FzZSBvZiBvbmx5IGEgc2luZ2xlIGZsb3cgcm9vdFxuICAgICAqIGJ5IGludmFsaWRhdGluZyBhbGwgaW5zdGVhZCBvZiBlbnVtZXJhdGluZyB0aGUgZmlsZXMuXG4gICAgICovXG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlSW52YWxpZGF0aW9uKHtzY29wZTogJ2ZpbGUnLCBmaWxlUGF0aHM6IHBhdGhzVG9JbnZhbGlkYXRlfSk7XG5cbiAgICBjb25zdCBwYXRoc0ZvclJvb3QgPSBuZXcgU2V0KCk7XG4gICAgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5zZXQoZmxvd1Jvb3QsIHBhdGhzRm9yUm9vdCk7XG4gICAgZm9yIChjb25zdCBtZXNzYWdlIG9mIG1lc3NhZ2VzKSB7XG4gICAgICAvKlxuICAgICAgICogRWFjaCBtZXNzYWdlIGNvbnNpc3RzIG9mIHNldmVyYWwgZGlmZmVyZW50IGNvbXBvbmVudHMsIGVhY2ggd2l0aCBpdHNcbiAgICAgICAqIG93biB0ZXh0IGFuZCBwYXRoLlxuICAgICAgICovXG4gICAgICBmb3IgKGNvbnN0IG1lc3NhZ2VDb21wb25lbnQgb2YgbWVzc2FnZS5tZXNzYWdlQ29tcG9uZW50cykge1xuICAgICAgICBpZiAobWVzc2FnZUNvbXBvbmVudC5yYW5nZSAhPSBudWxsKSB7XG4gICAgICAgICAgcGF0aHNGb3JSb290LmFkZChtZXNzYWdlQ29tcG9uZW50LnJhbmdlLmZpbGUpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnB1Ymxpc2hNZXNzYWdlVXBkYXRlKHRoaXMuX3Byb2Nlc3NEaWFnbm9zdGljcyhtZXNzYWdlcywgZmlsZSkpO1xuICB9XG5cbiAgX2dldFBhdGhzVG9JbnZhbGlkYXRlKGZsb3dSb290OiBOdWNsaWRlVXJpKTogQXJyYXk8TnVjbGlkZVVyaT4ge1xuICAgIGNvbnN0IGZpbGVQYXRocyA9IHRoaXMuX2Zsb3dSb290VG9GaWxlUGF0aHMuZ2V0KGZsb3dSb290KTtcbiAgICBpZiAoIWZpbGVQYXRocykge1xuICAgICAgcmV0dXJuIFtdO1xuICAgIH1cbiAgICByZXR1cm4gYXJyYXkuZnJvbShmaWxlUGF0aHMpO1xuICB9XG5cbiAgX3JlY2VpdmVkTmV3VXBkYXRlU3Vic2NyaWJlcihjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogdm9pZCB7XG4gICAgLy8gRXZlcnkgdGltZSB3ZSBnZXQgYSBuZXcgc3Vic2NyaWJlciwgd2UgbmVlZCB0byBwdXNoIHJlc3VsdHMgdG8gdGhlbS4gVGhpc1xuICAgIC8vIGxvZ2ljIGlzIGNvbW1vbiB0byBhbGwgcHJvdmlkZXJzIGFuZCBzaG91bGQgYmUgYWJzdHJhY3RlZCBvdXQgKHQ3ODEzMDY5KVxuICAgIC8vXG4gICAgLy8gT25jZSB3ZSBwcm92aWRlIGFsbCBkaWFnbm9zdGljcywgaW5zdGVhZCBvZiBqdXN0IHRoZSBjdXJyZW50IGZpbGUsIHdlIGNhblxuICAgIC8vIHByb2JhYmx5IHJlbW92ZSB0aGUgYWN0aXZlVGV4dEVkaXRvciBwYXJhbWV0ZXIuXG4gICAgY29uc3QgYWN0aXZlVGV4dEVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBpZiAoYWN0aXZlVGV4dEVkaXRvcikge1xuICAgICAgY29uc3QgbWF0Y2hlc0dyYW1tYXIgPSBKU19HUkFNTUFSUy5pbmRleE9mKGFjdGl2ZVRleHRFZGl0b3IuZ2V0R3JhbW1hcigpLnNjb3BlTmFtZSkgIT09IC0xO1xuICAgICAgaWYgKG1hdGNoZXNHcmFtbWFyKSB7XG4gICAgICAgIHRoaXMuX3J1bkRpYWdub3N0aWNzKGFjdGl2ZVRleHRFZGl0b3IpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHNldFJ1bk9uVGhlRmx5KHJ1bk9uVGhlRmx5OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLnNldFJ1bk9uVGhlRmx5KHJ1bk9uVGhlRmx5KTtcbiAgfVxuXG4gIG9uTWVzc2FnZVVwZGF0ZShjYWxsYmFjazogTWVzc2FnZVVwZGF0ZUNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlVXBkYXRlKGNhbGxiYWNrKTtcbiAgfVxuXG4gIG9uTWVzc2FnZUludmFsaWRhdGlvbihjYWxsYmFjazogTWVzc2FnZUludmFsaWRhdGlvbkNhbGxiYWNrKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9wcm92aWRlckJhc2Uub25NZXNzYWdlSW52YWxpZGF0aW9uKGNhbGxiYWNrKTtcbiAgfVxuXG4gIGRpc3Bvc2UoKSB7XG4gICAgdGhpcy5fcHJvdmlkZXJCYXNlLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9wcm9jZXNzRGlhZ25vc3RpY3MoXG4gICAgZGlhZ25vc3RpY3M6IEFycmF5PERpYWdub3N0aWM+LFxuICAgIGN1cnJlbnRGaWxlOiBzdHJpbmdcbiAgKTogRGlhZ25vc3RpY1Byb3ZpZGVyVXBkYXRlIHtcblxuICAgIC8vIGNvbnZlcnQgYXJyYXkgbWVzc2FnZXMgdG8gRXJyb3IgT2JqZWN0cyB3aXRoIFRyYWNlc1xuICAgIGNvbnN0IGZpbGVEaWFnbm9zdGljcyA9IGRpYWdub3N0aWNzLm1hcChmbG93TWVzc2FnZVRvRGlhZ25vc3RpY01lc3NhZ2UpO1xuXG4gICAgY29uc3QgZmlsZVBhdGhUb01lc3NhZ2VzID0gbmV3IE1hcCgpO1xuXG4gICAgLy8gVGhpcyBpbnZhbGlkYXRlcyB0aGUgZXJyb3JzIGluIHRoZSBjdXJyZW50IGZpbGUuIElmIEZsb3csIHdoZW4gcnVubmluZyBpbiB0aGlzIHJvb3QsIGhhc1xuICAgIC8vIHJlcG9ydGVkIGVycm9ycyBmb3IgdGhpcyBmaWxlLCB0aGlzIGludmFsaWRhdGlvbiBpcyBub3QgbmVjZXNzYXJ5IGJlY2F1c2UgdGhlIHBhdGggd2lsbCBiZVxuICAgIC8vIGV4cGxpY2l0bHkgaW52YWxpZGF0ZWQuIEhvd2V2ZXIsIGlmIEZsb3cgaGFzIHJlcG9ydGVkIGFuIGVycm9yIGluIHRoaXMgcm9vdCBmcm9tIGFub3RoZXIgcm9vdFxuICAgIC8vIChhcyBzb21ldGltZXMgaGFwcGVucyB3aGVuIEZsb3cgcm9vdHMgY29udGFpbiBzeW1saW5rcyB0byBvdGhlciBGbG93IHJvb3RzKSwgYW5kIGl0IGFsc28gZG9lc1xuICAgIC8vIG5vdCByZXBvcnQgdGhhdCBzYW1lIGVycm9yIHdoZW4gcnVubmluZyBpbiB0aGlzIEZsb3cgcm9vdCwgdGhlbiB3ZSB3YW50IHRoZSBlcnJvciB0b1xuICAgIC8vIGRpc2FwcGVhciB3aGVuIHRoaXMgZmlsZSBpcyBvcGVuZWQuXG4gICAgLy9cbiAgICAvLyBUaGlzIGlzbid0IGEgcGVyZmVjdCBzb2x1dGlvbiwgc2luY2UgaXQgY2FuIHN0aWxsIGxlYXZlIGRpYWdub3N0aWNzIHVwIGluIG90aGVyIGZpbGVzLCBidXRcbiAgICAvLyB0aGlzIGlzIGEgY29ybmVyIGNhc2UgYW5kIGRvaW5nIHRoaXMgaXMgc3RpbGwgYmV0dGVyIHRoYW4gZG9pbmcgbm90aGluZy5cbiAgICAvL1xuICAgIC8vIEkgdGhpbmsgdGhhdCB3aGVuZXZlciB0aGlzIGhhcHBlbnMsIGl0J3MgYSBidWcgaW4gRmxvdy4gSXQgc2VlbXMgc3RyYW5nZSBmb3IgRmxvdyB0byByZXBvcnRcbiAgICAvLyBlcnJvcnMgaW4gb25lIHBsYWNlIHdoZW4gcnVuIGZyb20gb25lIHJvb3QsIGFuZCBub3QgcmVwb3J0IGVycm9ycyBpbiB0aGF0IHNhbWUgcGxhY2Ugd2hlbiBydW5cbiAgICAvLyBmcm9tIGFub3RoZXIgcm9vdC4gQnV0IHN1Y2ggaXMgbGlmZS5cbiAgICBmaWxlUGF0aFRvTWVzc2FnZXMuc2V0KGN1cnJlbnRGaWxlLCBbXSk7XG5cbiAgICBmb3IgKGNvbnN0IGRpYWdub3N0aWMgb2YgZmlsZURpYWdub3N0aWNzKSB7XG4gICAgICBjb25zdCBwYXRoID0gZGlhZ25vc3RpY1snZmlsZVBhdGgnXTtcbiAgICAgIGxldCBkaWFnbm9zdGljQXJyYXkgPSBmaWxlUGF0aFRvTWVzc2FnZXMuZ2V0KHBhdGgpO1xuICAgICAgaWYgKCFkaWFnbm9zdGljQXJyYXkpIHtcbiAgICAgICAgZGlhZ25vc3RpY0FycmF5ID0gW107XG4gICAgICAgIGZpbGVQYXRoVG9NZXNzYWdlcy5zZXQocGF0aCwgZGlhZ25vc3RpY0FycmF5KTtcbiAgICAgIH1cbiAgICAgIGRpYWdub3N0aWNBcnJheS5wdXNoKGRpYWdub3N0aWMpO1xuICAgIH1cblxuICAgIHJldHVybiB7IGZpbGVQYXRoVG9NZXNzYWdlcyB9O1xuICB9XG5cbiAgaW52YWxpZGF0ZVByb2plY3RQYXRoKHByb2plY3RQYXRoOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCBwYXRoc1RvSW52YWxpZGF0ZSA9IG5ldyBTZXQoKTtcbiAgICBmb3IgKGNvbnN0IGZsb3dSb290RW50cnkgb2YgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocykge1xuICAgICAgY29uc3QgW2Zsb3dSb290LCBmaWxlUGF0aHNdID0gZmxvd1Jvb3RFbnRyeTtcbiAgICAgIGlmICghZmxvd1Jvb3Quc3RhcnRzV2l0aChwcm9qZWN0UGF0aCkpIHtcbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG4gICAgICBmb3IgKGNvbnN0IGZpbGVQYXRoIG9mIGZpbGVQYXRocykge1xuICAgICAgICBwYXRoc1RvSW52YWxpZGF0ZS5hZGQoZmlsZVBhdGgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fZmxvd1Jvb3RUb0ZpbGVQYXRocy5kZWxldGUoZmxvd1Jvb3QpO1xuICAgIH1cbiAgICB0aGlzLl9wcm92aWRlckJhc2UucHVibGlzaE1lc3NhZ2VJbnZhbGlkYXRpb24oe1xuICAgICAgc2NvcGU6ICdmaWxlJyxcbiAgICAgIGZpbGVQYXRoczogYXJyYXkuZnJvbShwYXRoc1RvSW52YWxpZGF0ZSksXG4gICAgfSk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGbG93RGlhZ25vc3RpY3NQcm92aWRlcjtcbiJdfQ==