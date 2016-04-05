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

var passesGK = _asyncToGenerator(function* () {
  try {
    var _require = require('../../fb-gatekeeper');

    var gatekeeper = _require.gatekeeper;

    return Boolean((yield gatekeeper.asyncIsGkEnabled(GK_DEBUGGER_DATATIPS, GK_TIMEOUT)));
  } catch (e) {
    return false;
  }
});

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
  if (!(yield passesGK())) {
    return null;
  }
  if (!model.getStore().getDebuggerMode() === _DebuggerStore.DebuggerMode.PAUSED) {
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
  var evaluationResult = yield model.getBridge().evaluateOnSelectedCallFrame(expression);
  if (evaluationResult == null) {
    return null;
  }
  var resultType = evaluationResult._type;
  var value = evaluationResult.value;
  var description = evaluationResult._description;

  var displayValue = resultType === 'object' ? description : value;
  return {
    component: _reactForAtom.React.createElement(
      'div',
      null,
      expression,
      ' = ',
      displayValue
    ),
    pinnable: false,
    range: range
  };
});

exports.debuggerDatatip = debuggerDatatip;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _reactForAtom = require('react-for-atom');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _DebuggerStore = require('./DebuggerStore');

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
//# sourceMappingURL=data:application/json;base64,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QVU7O01BQUssWUFBWTtLQUFPO0FBQ25ELFlBQVEsRUFBRSxLQUFLO0FBQ2YsU0FBSyxFQUFMLEtBQUs7R0FDTixDQUFDO0NBQ0g7Ozs7Ozs0QkFwR00sZ0JBQWdCOztrQ0FDYSw0QkFBNEI7OzZCQUNyQyxpQkFBaUI7O0FBRTVDLElBQU0sb0JBQW9CLEdBQUcsMkJBQTJCLENBQUM7QUFDekQsSUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDOztBQVl4QixJQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQztBQUNuQyxTQUFTLDhCQUE4QixDQUNyQyxNQUF1QixFQUN2QixRQUFvQixFQUNtQjtBQUN2QyxNQUFNLG1CQUFtQixHQUFHLCtDQUFzQixNQUFNLEVBQUUsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFDeEYsTUFBSSxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDL0IsV0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDO0dBQzlCO01BRUMsU0FBUyxHQUVQLG1CQUFtQixDQUZyQixTQUFTO01BQ1QsS0FBSyxHQUNILG1CQUFtQixDQURyQixLQUFLOztrQ0FFYyxTQUFTOztNQUF2QixVQUFVOztBQUNqQixTQUFPLE9BQU8sQ0FBQyxPQUFPLENBQUM7QUFDckIsY0FBVSxFQUFWLFVBQVU7QUFDVixTQUFLLEVBQUwsS0FBSztHQUNOLENBQUMsQ0FBQztDQUNKIiwiZmlsZSI6IkRlYnVnZ2VyRGF0YXRpcC5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtcbiAgTnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uLFxufSBmcm9tICcuLi8uLi9udWNsaWRlLWRlYnVnZ2VyLWludGVyZmFjZXMvc2VydmljZSc7XG5pbXBvcnQgdHlwZSB7RGF0YXRpcH0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kYXRhdGlwLWludGVyZmFjZXMnO1xuaW1wb3J0IHR5cGUgRGVidWdnZXJNb2RlbCBmcm9tICcuL0RlYnVnZ2VyTW9kZWwnO1xuaW1wb3J0IHR5cGUge0V2YWx1YXRpb25SZXN1bHR9IGZyb20gJy4vQnJpZGdlJztcblxuaW1wb3J0IHtcbiAgUmVhY3QsXG59IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7ZXh0cmFjdFdvcmRBdFBvc2l0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge0RlYnVnZ2VyTW9kZX0gZnJvbSAnLi9EZWJ1Z2dlclN0b3JlJztcblxuY29uc3QgR0tfREVCVUdHRVJfREFUQVRJUFMgPSAnbnVjbGlkZV9kZWJ1Z2dlcl9kYXRhdGlwcyc7XG5jb25zdCBHS19USU1FT1VUID0gMTAwMDtcbmFzeW5jIGZ1bmN0aW9uIHBhc3Nlc0dLKCk6IFByb21pc2U8Ym9vbGVhbj4ge1xuICB0cnkge1xuICAgIGNvbnN0IHtnYXRla2VlcGVyfSA9IHJlcXVpcmUoJy4uLy4uL2ZiLWdhdGVrZWVwZXInKTtcbiAgICByZXR1cm4gQm9vbGVhbihcbiAgICAgIGF3YWl0IGdhdGVrZWVwZXIuYXN5bmNJc0drRW5hYmxlZChHS19ERUJVR0dFUl9EQVRBVElQUywgR0tfVElNRU9VVClcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59XG5cbmNvbnN0IERFRkFVTFRfV09SRF9SRUdFWCA9IC9cXHcrL2dpO1xuZnVuY3Rpb24gZGVmYXVsdEdldEV2YWx1YXRpb25FeHByZXNzaW9uKFxuICBlZGl0b3I6IGF0b20kVGV4dEVkaXRvcixcbiAgcG9zaXRpb246IGF0b20kUG9pbnQsXG4pOiBQcm9taXNlPD9OdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb24+IHtcbiAgY29uc3QgZXh0cmFjdGVkSWRlbnRpZmllciA9IGV4dHJhY3RXb3JkQXRQb3NpdGlvbihlZGl0b3IsIHBvc2l0aW9uLCBERUZBVUxUX1dPUkRfUkVHRVgpO1xuICBpZiAoZXh0cmFjdGVkSWRlbnRpZmllciA9PSBudWxsKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShudWxsKTtcbiAgfVxuICBjb25zdCB7XG4gICAgd29yZE1hdGNoLFxuICAgIHJhbmdlLFxuICB9ID0gZXh0cmFjdGVkSWRlbnRpZmllcjtcbiAgY29uc3QgW2V4cHJlc3Npb25dID0gd29yZE1hdGNoO1xuICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHtcbiAgICBleHByZXNzaW9uLFxuICAgIHJhbmdlLFxuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gZ2V0RXZhbHVhdGlvbkV4cHJlc3Npb24oXG4gIG1vZGVsOiBEZWJ1Z2dlck1vZGVsLFxuICBlZGl0b3I6IFRleHRFZGl0b3IsXG4gIHBvc2l0aW9uOiBhdG9tJFBvaW50LFxuKTogUHJvbWlzZTw/TnVjbGlkZUV2YWx1YXRpb25FeHByZXNzaW9uPiB7XG4gIGNvbnN0IHtzY29wZU5hbWV9ID0gZWRpdG9yLmdldEdyYW1tYXIoKTtcbiAgY29uc3QgYWxsUHJvdmlkZXJzID0gbW9kZWwuZ2V0U3RvcmUoKS5nZXRFdmFsdWF0aW9uRXhwcmVzc2lvblByb3ZpZGVycygpO1xuICBsZXQgbWF0Y2hpbmdQcm92aWRlciA9IG51bGw7XG4gIGZvciAoY29uc3QgcHJvdmlkZXIgb2YgYWxsUHJvdmlkZXJzKSB7XG4gICAgY29uc3QgcHJvdmlkZXJHcmFtbWFycyA9IHByb3ZpZGVyLnNlbGVjdG9yLnNwbGl0KC8sID8vKTtcbiAgICBpZiAocHJvdmlkZXJHcmFtbWFycy5pbmRleE9mKHNjb3BlTmFtZSkgIT09IC0xKSB7XG4gICAgICBtYXRjaGluZ1Byb3ZpZGVyID0gcHJvdmlkZXI7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgY29uc3QgZXhwcmVzc2lvbkdldHRlciA9IG1hdGNoaW5nUHJvdmlkZXIgPT09IG51bGxcbiAgICA/IGRlZmF1bHRHZXRFdmFsdWF0aW9uRXhwcmVzc2lvblxuICAgIDogbWF0Y2hpbmdQcm92aWRlci5nZXRFdmFsdWF0aW9uRXhwcmVzc2lvbjtcbiAgcmV0dXJuIGV4cHJlc3Npb25HZXR0ZXIoZWRpdG9yLCBwb3NpdGlvbik7XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBkZWJ1Z2dlckRhdGF0aXAoXG4gIG1vZGVsOiBEZWJ1Z2dlck1vZGVsLFxuICBlZGl0b3I6IFRleHRFZGl0b3IsXG4gIHBvc2l0aW9uOiBhdG9tJFBvaW50LFxuKTogUHJvbWlzZTw/RGF0YXRpcD4ge1xuICBpZiAoIWF3YWl0IHBhc3Nlc0dLKCkpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBpZiAoIW1vZGVsLmdldFN0b3JlKCkuZ2V0RGVidWdnZXJNb2RlKCkgPT09IERlYnVnZ2VyTW9kZS5QQVVTRUQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBhY3RpdmVFZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gIGlmIChhY3RpdmVFZGl0b3IgPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IGV2YWx1YXRpb25FeHByZXNzaW9uID0gYXdhaXQgZ2V0RXZhbHVhdGlvbkV4cHJlc3Npb24obW9kZWwsIGVkaXRvciwgcG9zaXRpb24pO1xuICBpZiAoZXZhbHVhdGlvbkV4cHJlc3Npb24gPT0gbnVsbCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGNvbnN0IHtcbiAgICBleHByZXNzaW9uLFxuICAgIHJhbmdlLFxuICB9ID0gZXZhbHVhdGlvbkV4cHJlc3Npb247XG4gIGlmIChleHByZXNzaW9uID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBldmFsdWF0aW9uUmVzdWx0OiA/RXZhbHVhdGlvblJlc3VsdCA9XG4gICAgYXdhaXQgbW9kZWwuZ2V0QnJpZGdlKCkuZXZhbHVhdGVPblNlbGVjdGVkQ2FsbEZyYW1lKGV4cHJlc3Npb24pO1xuICBpZiAoZXZhbHVhdGlvblJlc3VsdCA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3Qge1xuICAgIF90eXBlOiByZXN1bHRUeXBlLFxuICAgIHZhbHVlLFxuICAgIF9kZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXG4gIH0gPSBldmFsdWF0aW9uUmVzdWx0O1xuICBjb25zdCBkaXNwbGF5VmFsdWUgPSByZXN1bHRUeXBlID09PSAnb2JqZWN0JyA/IGRlc2NyaXB0aW9uIDogdmFsdWU7XG4gIHJldHVybiB7XG4gICAgY29tcG9uZW50OiA8ZGl2PntleHByZXNzaW9ufSA9IHtkaXNwbGF5VmFsdWV9PC9kaXY+LFxuICAgIHBpbm5hYmxlOiBmYWxzZSxcbiAgICByYW5nZSxcbiAgfTtcbn1cbiJdfQ==