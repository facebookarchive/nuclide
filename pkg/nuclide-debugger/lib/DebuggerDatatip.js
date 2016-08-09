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
  if (!(yield (0, (_commonsNodePassesGK2 || _commonsNodePassesGK()).default)(GK_DEBUGGER_DATATIPS, 0))) {
    return null;
  }
  if (model.getStore().getDebuggerMode() !== (_DebuggerStore2 || _DebuggerStore()).DebuggerMode.PAUSED) {
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
  var watchExpressionStore = model.getWatchExpressionStore();
  var evaluation = watchExpressionStore.evaluateWatchExpression(expression);
  // Avoid creating a datatip if the evaluation fails
  var evaluationResult = yield evaluation.take(1).toPromise();
  if (evaluationResult === null) {
    return null;
  }
  var propStream = evaluation.filter(function (result) {
    return result != null;
  }).map(function (result) {
    return { expression: expression, evaluationResult: result, watchExpressionStore: watchExpressionStore };
  });
  return {
    component: (0, (_nuclideUiLibBindObservableAsProps2 || _nuclideUiLibBindObservableAsProps()).bindObservableAsProps)(propStream, (_DebuggerDatatipComponent2 || _DebuggerDatatipComponent()).DebuggerDatatipComponent),
    pinnable: true,
    range: range
  };
});

exports.debuggerDatatip = debuggerDatatip;

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _commonsAtomRange2;

function _commonsAtomRange() {
  return _commonsAtomRange2 = require('../../commons-atom/range');
}

var _nuclideUiLibBindObservableAsProps2;

function _nuclideUiLibBindObservableAsProps() {
  return _nuclideUiLibBindObservableAsProps2 = require('../../nuclide-ui/lib/bindObservableAsProps');
}

var _DebuggerStore2;

function _DebuggerStore() {
  return _DebuggerStore2 = require('./DebuggerStore');
}

var _DebuggerDatatipComponent2;

function _DebuggerDatatipComponent() {
  return _DebuggerDatatipComponent2 = require('./DebuggerDatatipComponent');
}

var _commonsNodePassesGK2;

function _commonsNodePassesGK() {
  return _commonsNodePassesGK2 = _interopRequireDefault(require('../../commons-node/passesGK'));
}

var GK_DEBUGGER_DATATIPS = 'nuclide_debugger_datatips';

var DEFAULT_WORD_REGEX = /\w+/gi;
function defaultGetEvaluationExpression(editor, position) {
  var extractedIdentifier = (0, (_commonsAtomRange2 || _commonsAtomRange()).wordAtPosition)(editor, position, DEFAULT_WORD_REGEX);
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