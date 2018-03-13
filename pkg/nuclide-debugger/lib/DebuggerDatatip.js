'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debuggerDatatip = undefined;

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

let debuggerDatatip = exports.debuggerDatatip = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (model, editor, position) {
    if (model.getDebuggerMode() !== (_constants || _load_constants()).DebuggerMode.PAUSED) {
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
    const { expression, range } = evaluationExpression;
    if (expression == null) {
      return null;
    }
    const evaluation = model.evaluateWatchExpression(expression);
    const propStream = evaluation.map(function (result) {
      return {
        expression,
        evaluationResult: result,
        model
      };
    });
    return {
      component: (0, (_bindObservableAsProps || _load_bindObservableAsProps()).bindObservableAsProps)(propStream, (_DebuggerDatatipComponent || _load_DebuggerDatatipComponent()).DebuggerDatatipComponent),
      pinnable: true,
      range
    };
  });

  return function debuggerDatatip(_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

var _bindObservableAsProps;

function _load_bindObservableAsProps() {
  return _bindObservableAsProps = require('nuclide-commons-ui/bindObservableAsProps');
}

var _nuclideDebuggerCommon;

function _load_nuclideDebuggerCommon() {
  return _nuclideDebuggerCommon = require('nuclide-debugger-common');
}

var _constants;

function _load_constants() {
  return _constants = require('./constants');
}

var _DebuggerDatatipComponent;

function _load_DebuggerDatatipComponent() {
  return _DebuggerDatatipComponent = require('./DebuggerDatatipComponent');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getEvaluationExpression(model, editor, position) {
  const { scopeName } = editor.getGrammar();
  const allProviders = model.getEvaluationExpressionProviders();
  let matchingProvider = null;
  for (const provider of allProviders) {
    const providerGrammars = provider.selector.split(/, ?/);
    if (providerGrammars.indexOf(scopeName) !== -1) {
      matchingProvider = provider;
      break;
    }
  }
  return matchingProvider == null ? Promise.resolve((0, (_nuclideDebuggerCommon || _load_nuclideDebuggerCommon()).getDefaultEvaluationExpression)(editor, position)) : matchingProvider.getEvaluationExpression(editor, position);
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */