"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.debuggerDatatip = debuggerDatatip;

function _bindObservableAsProps() {
  const data = require("../../../../nuclide-commons-ui/bindObservableAsProps");

  _bindObservableAsProps = function () {
    return data;
  };

  return data;
}

function _evaluationExpression() {
  const data = require("./evaluationExpression");

  _evaluationExpression = function () {
    return data;
  };

  return data;
}

function _constants() {
  const data = require("./constants");

  _constants = function () {
    return data;
  };

  return data;
}

function _DebuggerDatatipComponent() {
  const data = _interopRequireDefault(require("./ui/DebuggerDatatipComponent"));

  _DebuggerDatatipComponent = function () {
    return data;
  };

  return data;
}

function _utils() {
  const data = require("./utils");

  _utils = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict-local
 * @format
 */
async function debuggerDatatip(service, editor, position) {
  if (service.getDebuggerMode() !== _constants().DebuggerMode.PAUSED) {
    return null;
  }

  const activeEditor = atom.workspace.getActiveTextEditor();

  if (activeEditor == null) {
    return null;
  }

  const evaluationExpression = (0, _evaluationExpression().getDefaultEvaluationExpression)(editor, position);

  if (evaluationExpression == null) {
    return null;
  }

  const {
    expression,
    range
  } = evaluationExpression;
  const {
    focusedProcess,
    focusedStackFrame
  } = service.viewModel;

  if (expression == null || focusedProcess == null) {
    // TODO respect session.capabilities.supportsEvaluateForHovers
    // and fallback to scopes variables resolution.
    return null;
  }

  const propStream = (0, _utils().expressionAsEvaluationResultStream)(service.createExpression(expression), focusedProcess, focusedStackFrame, 'hover').map(evaluationResult => ({
    expression,
    evaluationResult
  }));
  return {
    component: (0, _bindObservableAsProps().bindObservableAsProps)(propStream, _DebuggerDatatipComponent().default),
    range
  };
}