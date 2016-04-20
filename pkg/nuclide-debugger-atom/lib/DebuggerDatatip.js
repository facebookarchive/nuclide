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

var getEvaluationExpression = _asyncToGenerator(function* (model, editor, position) {
  var _editor$getGrammar = editor.getGrammar();

  var scopeName = _editor$getGrammar.scopeName;

  var allProviders = model.getStore().getEvaluationExpressionProviders();
  var matchingProvider = null;
  for (var provider of allProviders) {
    var providerGrammars = provider.selector.split(/, ?/);
    if (providerGrammars.indexOf(scopeName) !== -1) {
      matchingProvider = provider;
      break;
    }
  }
  var expressionGetter = matchingProvider === null ? defaultGetEvaluationExpression : matchingProvider.getEvaluationExpression;
  return expressionGetter(editor, position);
});

var debuggerDatatip = _asyncToGenerator(function* (model, editor, position) {
  if (!(yield (0, _nuclideCommons.passesGK)(GK_DEBUGGER_DATATIPS, GK_TIMEOUT))) {
    return null;
  }
  if (model.getStore().getDebuggerMode() !== _DebuggerStore.DebuggerMode.PAUSED) {
    return null;
  }
  var activeEditor = atom.workspace.getActiveTextEditor();
  if (activeEditor == null) {
    return null;
  }
  var evaluationExpression = yield getEvaluationExpression(model, editor, position);
  if (evaluationExpression == null) {
    return null;
  }
  var expression = evaluationExpression.expression;
  var range = evaluationExpression.range;

  if (expression == null) {
    return null;
  }
  var evaluation = model.getWatchExpressionStore().evaluateWatchExpression(expression);
  // Avoid creating a datatip if the evaluation fails
  var evaluationResult = yield evaluation.take(1).toPromise();
  if (evaluationResult === null) {
    return null;
  }
  var propStream = evaluation.filter(function (result) {
    return result != null;
  }).map(function (result) {
    return { expression: expression, evaluationResult: result };
  });
  return {
    component: (0, _nuclideUiLibHOC.injectObservableAsProps)(propStream, _DebuggerDatatipComponent.DebuggerDatatipComponent),
    pinnable: true,
    range: range
  };
});

exports.debuggerDatatip = debuggerDatatip;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _nuclideUiLibHOC = require('../../nuclide-ui/lib/HOC');

var _DebuggerStore = require('./DebuggerStore');

var _DebuggerDatatipComponent = require('./DebuggerDatatipComponent');

var _nuclideCommons = require('../../nuclide-commons');

var GK_DEBUGGER_DATATIPS = 'nuclide_debugger_datatips';
var GK_TIMEOUT = 1000;

var DEFAULT_WORD_REGEX = /\w+/gi;
function defaultGetEvaluationExpression(editor, position) {
  var extractedIdentifier = (0, _nuclideAtomHelpers.extractWordAtPosition)(editor, position, DEFAULT_WORD_REGEX);
  if (extractedIdentifier == null) {
    return Promise.resolve(null);
  }
  var wordMatch = extractedIdentifier.wordMatch;
  var range = extractedIdentifier.range;

  var _wordMatch = _slicedToArray(wordMatch, 1);

  var expression = _wordMatch[0];

  return Promise.resolve({
    expression: expression,
    range: range
  });
}
//# sourceMappingURL=data:application/json;base64,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QUM1Qyx1QkFBdUI7O0FBRTlDLElBQU0sb0JBQW9CLEdBQUcsMkJBQTJCLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQUV4QixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztBQUNuQyxTQUFTLDhCQUE4QixDQUNyQyxNQUF1QixFQUN2QixRQUFvQixFQUNtQjtBQUN2QyxNQUFNLG1CQUFtQixHQUFHLCtDQUFzQixNQUFNLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDeEYsTUFBSSxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDL0IsV0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzlCO01BRUMsU0FBUyxHQUVQLG1CQUFtQixDQUZyQixTQUFTO01BQ1QsS0FBSyxHQUNILG1CQUFtQixDQURyQixLQUFLOztrQ0FFYyxTQUFTOztNQUF2QixVQUFVOztBQUNqQixTQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDckIsY0FBVSxFQUFWLFVBQVU7QUFDVixTQUFLLEVBQUwsS0FBSztHQUNOLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IkRlYnVnZ2VyRGF0YXRpcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgdHlwZSB7RGF0YXRpcH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kYXRhdGlwLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJNb2RlbCBmcm9tICcuL0RlYnVnZ2VyTW9kZWwnO1xuaW1wb3J0IHR5cGUge0V2YWx1YXRpb25SZXN1bHR9IGZyb20gJy4vQnJpZGdlJztcblxuaW1wb3J0IHtleHRyYWN0V29yZEF0UG9zaXRpb259IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcbmltcG9ydCB7aW5qZWN0T2JzZXJ2YWJsZUFzUHJvcHN9IGZyb20gJy4uLy4uL251Y2xpZGUtdWkvbGliL0hPQyc7XG5pbXBvcnQge0RlYnVnZ2VyTW9kZX0gZnJvbSAnLi9EZWJ1Z2dlclN0b3JlJztcbmltcG9ydCB7RGVidWdnZXJEYXRhdGlwQ29tcG9uZW50fSBmcm9tICcuL0RlYnVnZ2VyRGF0YXRpcENvbXBvbmVudCc7XG5pbXBvcnQge3Bhc3Nlc0dLfSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuXG5jb25zdCBHS19ERUJVR0dFUl9EQVRBVElQUyA9ICdudWNsaWRlX2RlYnVnZ2VyX2RhdGF0aXBzJztcbmNvbnN0IEdLX1RJTUVPVVQgPSAxMDAwO1xuXG5jb25zdCBERUZBVUxUX1dPUkRfUkVHRVggPSAvXFx3Ky9naTtcbmZ1bmN0aW9uIGRlZmF1bHRHZXRFdmFsdWF0aW9uRXhwcmVzc2lvbihcbiAgZWRpdG9yOiBhdG9tJFRleHRFZGl0b3IsXG4gIHBvc2l0aW9uOiBhdG9tJFBvaW50LFxuKTogUHJvbWlzZTw/TnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uPiB7XG4gIGNvbnN0IGV4dHJhY3RlZElkZW50aWZpZXIgPSBleHRyYWN0V29yZEF0UG9zaXRpb24oZWRpdG9yLCBwb3NpdGlvbiwgREVGQVVMVF9XT1JEX1JFR0VYKTtcbiAgaWYgKGV4dHJhY3RlZElkZW50aWZpZXIgPT0gbnVsbCkge1xuICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUobnVsbCk7XG4gIH1cbiAgY29uc3Qge1xuICAgIHdvcmRNYXRjaCxcbiAgICByYW5nZSxcbiAgfSA9IGV4dHJhY3RlZElkZW50aWZpZXI7XG4gIGNvbnN0IFtleHByZXNzaW9uXSA9IHdvcmRNYXRjaDtcbiAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh7XG4gICAgZXhwcmVzc2lvbixcbiAgICByYW5nZSxcbiAgfSk7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGdldEV2YWx1YXRpb25FeHByZXNzaW9uKFxuICBtb2RlbDogRGVidWdnZXJNb2RlbCxcbiAgZWRpdG9yOiBUZXh0RWRpdG9yLFxuICBwb3NpdGlvbjogYXRvbSRQb2ludCxcbik6IFByb21pc2U8P051Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvbj4ge1xuICBjb25zdCB7c2NvcGVOYW1lfSA9IGVkaXRvci5nZXRHcmFtbWFyKCk7XG4gIGNvbnN0IGFsbFByb3ZpZGVycyA9IG1vZGVsLmdldFN0b3JlKCkuZ2V0RXZhbHVhdGlvbkV4cHJlc3Npb25Qcm92aWRlcnMoKTtcbiAgbGV0IG1hdGNoaW5nUHJvdmlkZXIgPSBudWxsO1xuICBmb3IgKGNvbnN0IHByb3ZpZGVyIG9mIGFsbFByb3ZpZGVycykge1xuICAgIGNvbnN0IHByb3ZpZGVyR3JhbW1hcnMgPSBwcm92aWRlci5zZWxlY3Rvci5zcGxpdCgvLCA/Lyk7XG4gICAgaWYgKHByb3ZpZGVyR3JhbW1hcnMuaW5kZXhPZihzY29wZU5hbWUpICE9PSAtMSkge1xuICAgICAgbWF0Y2hpbmdQcm92aWRlciA9IHByb3ZpZGVyO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGNvbnN0IGV4cHJlc3Npb25HZXR0ZXIgPSBtYXRjaGluZ1Byb3ZpZGVyID09PSBudWxsXG4gICAgPyBkZWZhdWx0R2V0RXZhbHVhdGlvbkV4cHJlc3Npb25cbiAgICA6IG1hdGNoaW5nUHJvdmlkZXIuZ2V0RXZhbHVhdGlvbkV4cHJlc3Npb247XG4gIHJldHVybiBleHByZXNzaW9uR2V0dGVyKGVkaXRvciwgcG9zaXRpb24pO1xufVxuXG5leHBvcnQgYXN5bmMgZnVuY3Rpb24gZGVidWdnZXJEYXRhdGlwKFxuICBtb2RlbDogRGVidWdnZXJNb2RlbCxcbiAgZWRpdG9yOiBUZXh0RWRpdG9yLFxuICBwb3NpdGlvbjogYXRvbSRQb2ludCxcbik6IFByb21pc2U8P0RhdGF0aXA+IHtcbiAgaWYgKCFhd2FpdCBwYXNzZXNHSyhHS19ERUJVR0dFUl9EQVRBVElQUywgR0tfVElNRU9VVCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAobW9kZWwuZ2V0U3RvcmUoKS5nZXREZWJ1Z2dlck1vZGUoKSAhPT0gRGVidWdnZXJNb2RlLlBBVVNFRCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGFjdGl2ZUVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgaWYgKGFjdGl2ZUVkaXRvciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgZXZhbHVhdGlvbkV4cHJlc3Npb24gPSBhd2FpdCBnZXRFdmFsdWF0aW9uRXhwcmVzc2lvbihtb2RlbCwgZWRpdG9yLCBwb3NpdGlvbik7XG4gIGlmIChldmFsdWF0aW9uRXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3Qge1xuICAgIGV4cHJlc3Npb24sXG4gICAgcmFuZ2UsXG4gIH0gPSBldmFsdWF0aW9uRXhwcmVzc2lvbjtcbiAgaWYgKGV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGV2YWx1YXRpb24gPSBtb2RlbC5nZXRXYXRjaEV4cHJlc3Npb25TdG9yZSgpLmV2YWx1YXRlV2F0Y2hFeHByZXNzaW9uKGV4cHJlc3Npb24pO1xuICAvLyBBdm9pZCBjcmVhdGluZyBhIGRhdGF0aXAgaWYgdGhlIGV2YWx1YXRpb24gZmFpbHNcbiAgY29uc3QgZXZhbHVhdGlvblJlc3VsdDogP0V2YWx1YXRpb25SZXN1bHQgPSBhd2FpdCBldmFsdWF0aW9uLnRha2UoMSkudG9Qcm9taXNlKCk7XG4gIGlmIChldmFsdWF0aW9uUmVzdWx0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgcHJvcFN0cmVhbSA9IGV2YWx1YXRpb25cbiAgICAuZmlsdGVyKHJlc3VsdCA9PiByZXN1bHQgIT0gbnVsbClcbiAgICAubWFwKHJlc3VsdCA9PiAoe2V4cHJlc3Npb24sIGV2YWx1YXRpb25SZXN1bHQ6IHJlc3VsdH0pKTtcbiAgcmV0dXJuIHtcbiAgICBjb21wb25lbnQ6IGluamVjdE9ic2VydmFibGVBc1Byb3BzKFxuICAgICAgcHJvcFN0cmVhbSxcbiAgICAgIERlYnVnZ2VyRGF0YXRpcENvbXBvbmVudCxcbiAgICApLFxuICAgIHBpbm5hYmxlOiB0cnVlLFxuICAgIHJhbmdlLFxuICB9O1xufVxuIl19