/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import type {
  NuclideEvaluationExpression,
  NuclideEvaluationExpressionProvider,
} from 'nuclide-debugger-common';
import type {Datatip} from 'atom-ide-ui';
import type {IDebugService} from './types';

import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {getDefaultEvaluationExpression} from 'nuclide-debugger-common';
import {DebuggerMode} from './constants';
import DebuggerDatatipComponent from './ui/DebuggerDatatipComponent';
import {expressionAsEvaluationResultStream} from './utils';

function getEvaluationExpression(
  providers: Set<NuclideEvaluationExpressionProvider>,
  editor: TextEditor,
  position: atom$Point,
): Promise<?NuclideEvaluationExpression> {
  const {scopeName} = editor.getGrammar();
  let matchingProvider = null;
  for (const provider of providers) {
    const providerGrammars = provider.selector.split(/, ?/);
    if (providerGrammars.indexOf(scopeName) !== -1) {
      matchingProvider = provider;
      break;
    }
  }
  return matchingProvider == null
    ? Promise.resolve(getDefaultEvaluationExpression(editor, position))
    : matchingProvider.getEvaluationExpression(editor, position);
}

export async function debuggerDatatip(
  providers: Set<NuclideEvaluationExpressionProvider>,
  service: IDebugService,
  editor: TextEditor,
  position: atom$Point,
): Promise<?Datatip> {
  if (service.getDebuggerMode() !== DebuggerMode.PAUSED) {
    return null;
  }
  const activeEditor = atom.workspace.getActiveTextEditor();
  if (activeEditor == null) {
    return null;
  }
  const evaluationExpression = await getEvaluationExpression(
    providers,
    editor,
    position,
  );
  if (evaluationExpression == null) {
    return null;
  }
  const {expression, range} = evaluationExpression;
  const {focusedProcess, focusedStackFrame} = service.viewModel;
  if (expression == null || focusedProcess == null) {
    // TODO respect session.capabilities.supportsEvaluateForHovers
    // and fallback to scopes variables resolution.
    return null;
  }
  const propStream = expressionAsEvaluationResultStream(
    service.createExpression(expression),
    focusedProcess,
    focusedStackFrame,
    'hover',
  ).map(evaluationResult => ({
    expression,
    evaluationResult,
  }));
  return {
    component: bindObservableAsProps(propStream, DebuggerDatatipComponent),
    range,
  };
}
