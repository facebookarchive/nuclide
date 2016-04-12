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
//# sourceMappingURL=data:application/json;base64,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QUFVLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSxFQUFDO0dBQUMsQ0FBQyxDQUFDO0FBQzNELFNBQU87QUFDTCxhQUFTLEVBQUUsOENBQ1QsVUFBVSxxREFFWDtBQUNELFlBQVEsRUFBRSxJQUFJO0FBQ2QsU0FBSyxFQUFMLEtBQUs7R0FDTixDQUFDO0NBQ0g7Ozs7OztrQ0F0R21DLDRCQUE0Qjs7K0JBQzFCLDBCQUEwQjs7NkJBQ3JDLGlCQUFpQjs7d0NBQ0wsNEJBQTRCOztBQUVuRSxJQUFNLG9CQUFvQixHQUFHLDJCQUEyQixDQUFDO0FBQ3pELElBQU0sVUFBVSxHQUFHLElBQUksQ0FBQzs7QUFZeEIsSUFBTSxrQkFBa0IsR0FBRyxPQUFPLENBQUM7QUFDbkMsU0FBUyw4QkFBOEIsQ0FDckMsTUFBdUIsRUFDdkIsUUFBb0IsRUFDbUI7QUFDdkMsTUFBTSxtQkFBbUIsR0FBRywrQ0FBc0IsTUFBTSxFQUFFLFFBQVEsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBQ3hGLE1BQUksbUJBQW1CLElBQUksSUFBSSxFQUFFO0FBQy9CLFdBQU8sT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztHQUM5QjtNQUVDLFNBQVMsR0FFUCxtQkFBbUIsQ0FGckIsU0FBUztNQUNULEtBQUssR0FDSCxtQkFBbUIsQ0FEckIsS0FBSzs7a0NBRWMsU0FBUzs7TUFBdkIsVUFBVTs7QUFDakIsU0FBTyxPQUFPLENBQUMsT0FBTyxDQUFDO0FBQ3JCLGNBQVUsRUFBVixVQUFVO0FBQ1YsU0FBSyxFQUFMLEtBQUs7R0FDTixDQUFDLENBQUM7Q0FDSiIsImZpbGUiOiJEZWJ1Z2dlckRhdGF0aXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7XG4gIE51Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvbixcbn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1kZWJ1Z2dlci1pbnRlcmZhY2VzL3NlcnZpY2UnO1xuaW1wb3J0IHR5cGUge0RhdGF0aXB9IGZyb20gJy4uLy4uL251Y2xpZGUtZGF0YXRpcC1pbnRlcmZhY2VzJztcbmltcG9ydCB0eXBlIERlYnVnZ2VyTW9kZWwgZnJvbSAnLi9EZWJ1Z2dlck1vZGVsJztcbmltcG9ydCB0eXBlIHtFdmFsdWF0aW9uUmVzdWx0fSBmcm9tICcuL0JyaWRnZSc7XG5cbmltcG9ydCB7ZXh0cmFjdFdvcmRBdFBvc2l0aW9ufSBmcm9tICcuLi8uLi9udWNsaWRlLWF0b20taGVscGVycyc7XG5pbXBvcnQge2luamVjdE9ic2VydmFibGVBc1Byb3BzfSBmcm9tICcuLi8uLi9udWNsaWRlLXVpL2xpYi9IT0MnO1xuaW1wb3J0IHtEZWJ1Z2dlck1vZGV9IGZyb20gJy4vRGVidWdnZXJTdG9yZSc7XG5pbXBvcnQge0RlYnVnZ2VyRGF0YXRpcENvbXBvbmVudH0gZnJvbSAnLi9EZWJ1Z2dlckRhdGF0aXBDb21wb25lbnQnO1xuXG5jb25zdCBHS19ERUJVR0dFUl9EQVRBVElQUyA9ICdudWNsaWRlX2RlYnVnZ2VyX2RhdGF0aXBzJztcbmNvbnN0IEdLX1RJTUVPVVQgPSAxMDAwO1xuYXN5bmMgZnVuY3Rpb24gcGFzc2VzR0soKTogUHJvbWlzZTxib29sZWFuPiB7XG4gIHRyeSB7XG4gICAgY29uc3Qge2dhdGVrZWVwZXJ9ID0gcmVxdWlyZSgnLi4vLi4vZmItZ2F0ZWtlZXBlcicpO1xuICAgIHJldHVybiBCb29sZWFuKFxuICAgICAgYXdhaXQgZ2F0ZWtlZXBlci5hc3luY0lzR2tFbmFibGVkKEdLX0RFQlVHR0VSX0RBVEFUSVBTLCBHS19USU1FT1VUKVxuICAgICk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn1cblxuY29uc3QgREVGQVVMVF9XT1JEX1JFR0VYID0gL1xcdysvZ2k7XG5mdW5jdGlvbiBkZWZhdWx0R2V0RXZhbHVhdGlvbkV4cHJlc3Npb24oXG4gIGVkaXRvcjogYXRvbSRUZXh0RWRpdG9yLFxuICBwb3NpdGlvbjogYXRvbSRQb2ludCxcbik6IFByb21pc2U8P051Y2xpZGVFdmFsdWF0aW9uRXhwcmVzc2lvbj4ge1xuICBjb25zdCBleHRyYWN0ZWRJZGVudGlmaWVyID0gZXh0cmFjdFdvcmRBdFBvc2l0aW9uKGVkaXRvciwgcG9zaXRpb24sIERFRkFVTFRfV09SRF9SRUdFWCk7XG4gIGlmIChleHRyYWN0ZWRJZGVudGlmaWVyID09IG51bGwpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKG51bGwpO1xuICB9XG4gIGNvbnN0IHtcbiAgICB3b3JkTWF0Y2gsXG4gICAgcmFuZ2UsXG4gIH0gPSBleHRyYWN0ZWRJZGVudGlmaWVyO1xuICBjb25zdCBbZXhwcmVzc2lvbl0gPSB3b3JkTWF0Y2g7XG4gIHJldHVybiBQcm9taXNlLnJlc29sdmUoe1xuICAgIGV4cHJlc3Npb24sXG4gICAgcmFuZ2UsXG4gIH0pO1xufVxuXG5hc3luYyBmdW5jdGlvbiBnZXRFdmFsdWF0aW9uRXhwcmVzc2lvbihcbiAgbW9kZWw6IERlYnVnZ2VyTW9kZWwsXG4gIGVkaXRvcjogVGV4dEVkaXRvcixcbiAgcG9zaXRpb246IGF0b20kUG9pbnQsXG4pOiBQcm9taXNlPD9OdWNsaWRlRXZhbHVhdGlvbkV4cHJlc3Npb24+IHtcbiAgY29uc3Qge3Njb3BlTmFtZX0gPSBlZGl0b3IuZ2V0R3JhbW1hcigpO1xuICBjb25zdCBhbGxQcm92aWRlcnMgPSBtb2RlbC5nZXRTdG9yZSgpLmdldEV2YWx1YXRpb25FeHByZXNzaW9uUHJvdmlkZXJzKCk7XG4gIGxldCBtYXRjaGluZ1Byb3ZpZGVyID0gbnVsbDtcbiAgZm9yIChjb25zdCBwcm92aWRlciBvZiBhbGxQcm92aWRlcnMpIHtcbiAgICBjb25zdCBwcm92aWRlckdyYW1tYXJzID0gcHJvdmlkZXIuc2VsZWN0b3Iuc3BsaXQoLywgPy8pO1xuICAgIGlmIChwcm92aWRlckdyYW1tYXJzLmluZGV4T2Yoc2NvcGVOYW1lKSAhPT0gLTEpIHtcbiAgICAgIG1hdGNoaW5nUHJvdmlkZXIgPSBwcm92aWRlcjtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBjb25zdCBleHByZXNzaW9uR2V0dGVyID0gbWF0Y2hpbmdQcm92aWRlciA9PT0gbnVsbFxuICAgID8gZGVmYXVsdEdldEV2YWx1YXRpb25FeHByZXNzaW9uXG4gICAgOiBtYXRjaGluZ1Byb3ZpZGVyLmdldEV2YWx1YXRpb25FeHByZXNzaW9uO1xuICByZXR1cm4gZXhwcmVzc2lvbkdldHRlcihlZGl0b3IsIHBvc2l0aW9uKTtcbn1cblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGRlYnVnZ2VyRGF0YXRpcChcbiAgbW9kZWw6IERlYnVnZ2VyTW9kZWwsXG4gIGVkaXRvcjogVGV4dEVkaXRvcixcbiAgcG9zaXRpb246IGF0b20kUG9pbnQsXG4pOiBQcm9taXNlPD9EYXRhdGlwPiB7XG4gIGlmICghYXdhaXQgcGFzc2VzR0soKSkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGlmIChtb2RlbC5nZXRTdG9yZSgpLmdldERlYnVnZ2VyTW9kZSgpICE9PSBEZWJ1Z2dlck1vZGUuUEFVU0VEKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgYWN0aXZlRWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICBpZiAoYWN0aXZlRWRpdG9yID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBldmFsdWF0aW9uRXhwcmVzc2lvbiA9IGF3YWl0IGdldEV2YWx1YXRpb25FeHByZXNzaW9uKG1vZGVsLCBlZGl0b3IsIHBvc2l0aW9uKTtcbiAgaWYgKGV2YWx1YXRpb25FeHByZXNzaW9uID09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCB7XG4gICAgZXhwcmVzc2lvbixcbiAgICByYW5nZSxcbiAgfSA9IGV2YWx1YXRpb25FeHByZXNzaW9uO1xuICBpZiAoZXhwcmVzc2lvbiA9PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgY29uc3QgZXZhbHVhdGlvbiA9IG1vZGVsLmdldFdhdGNoRXhwcmVzc2lvblN0b3JlKCkuZXZhbHVhdGVXYXRjaEV4cHJlc3Npb24oZXhwcmVzc2lvbik7XG4gIC8vIEF2b2lkIGNyZWF0aW5nIGEgZGF0YXRpcCBpZiB0aGUgZXZhbHVhdGlvbiBmYWlsc1xuICBjb25zdCBldmFsdWF0aW9uUmVzdWx0OiA/RXZhbHVhdGlvblJlc3VsdCA9IGF3YWl0IGV2YWx1YXRpb24udGFrZSgxKS50b1Byb21pc2UoKTtcbiAgaWYgKGV2YWx1YXRpb25SZXN1bHQgPT09IG51bGwpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBjb25zdCBwcm9wU3RyZWFtID0gZXZhbHVhdGlvblxuICAgIC5maWx0ZXIocmVzdWx0ID0+IHJlc3VsdCAhPSBudWxsKVxuICAgIC5tYXAocmVzdWx0ID0+ICh7ZXhwcmVzc2lvbiwgZXZhbHVhdGlvblJlc3VsdDogcmVzdWx0fSkpO1xuICByZXR1cm4ge1xuICAgIGNvbXBvbmVudDogaW5qZWN0T2JzZXJ2YWJsZUFzUHJvcHMoXG4gICAgICBwcm9wU3RyZWFtLFxuICAgICAgRGVidWdnZXJEYXRhdGlwQ29tcG9uZW50LFxuICAgICksXG4gICAgcGlubmFibGU6IHRydWUsXG4gICAgcmFuZ2UsXG4gIH07XG59XG4iXX0=