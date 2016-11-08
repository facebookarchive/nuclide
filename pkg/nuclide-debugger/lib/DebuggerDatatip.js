'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debuggerDatatip = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

let debuggerDatatip = exports.debuggerDatatip = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (model, editor, position) {
    if (model.getStore().getDebuggerMode() !== (_DebuggerStore || _load_DebuggerStore()).DebuggerMode.PAUSED) {
      return null;
    }
    const activeEditor = atom.workspace.getActiveTextEditor();
    if (activeEditor == null) {
      return null;
    }
    const evaluationExpression = yield getEvaluationExpression(model, editor, position);
    if (evaluationExpression == null) {
      return null;
    }
    const expression = evaluationExpression.expression,
          range = evaluationExpression.range;

    if (expression == null) {
      return null;
    }
    const watchExpressionStore = model.getWatchExpressionStore();
    const evaluation = watchExpressionStore.evaluateWatchExpression(expression);
    // Avoid creating a datatip if the evaluation fails
    const evaluationResult = yield evaluation.take(1).toPromise();
    if (evaluationResult === null) {
      return null;
    }
    const propStream = evaluation.filter(function (result) {
      return result != null;
    }).map(function (result) {
      return { expression: expression, evaluationResult: result, watchExpressionStore: watchExpressionStore };
    });
    return {
      component: (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(propStream, (_DebuggerDatatipComponent || _load_DebuggerDatatipComponent()).DebuggerDatatipComponent),
      pinnable: true,
      range: range
    };
  });

  return function debuggerDatatip(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

var _range;

function _load_range() {
  return _range = require('../../commons-atom/range');
}

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('../../nuclide-ui/bindObservableAsProps');
}

var _DebuggerStore;

function _load_DebuggerStore() {
  return _DebuggerStore = require('./DebuggerStore');
}

var _DebuggerDatatipComponent;

function _load_DebuggerDatatipComponent() {
  return _DebuggerDatatipComponent = require('./DebuggerDatatipComponent');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DEFAULT_WORD_REGEX = /\w+/gi;
function defaultGetEvaluationExpression(editor, position) {
  const extractedIdentifier = (0, (_range || _load_range()).wordAtPosition)(editor, position, DEFAULT_WORD_REGEX);
  if (extractedIdentifier == null) {
    return Promise.resolve(null);
  }
  const wordMatch = extractedIdentifier.wordMatch,
        range = extractedIdentifier.range;

  var _wordMatch = _slicedToArray(wordMatch, 1);

  const expression = _wordMatch[0];

  return Promise.resolve({
    expression: expression,
    range: range
  });
}

function getEvaluationExpression(model, editor, position) {
  var _editor$getGrammar = editor.getGrammar();

  const scopeName = _editor$getGrammar.scopeName;

  const allProviders = model.getStore().getEvaluationExpressionProviders();
  let matchingProvider = null;
  for (const provider of allProviders) {
    const providerGrammars = provider.selector.split(/, ?/);
    if (providerGrammars.indexOf(scopeName) !== -1) {
      matchingProvider = provider;
      break;
    }
  }
  return matchingProvider === null ? defaultGetEvaluationExpression(editor, position) : matchingProvider.getEvaluationExpression(editor, position);
}