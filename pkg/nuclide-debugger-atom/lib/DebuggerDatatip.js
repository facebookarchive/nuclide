'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  NuclideEvaluationExpression,
} from '../../nuclide-debugger-interfaces/service';
import type {Datatip} from '../../nuclide-datatip/lib/types';
import type DebuggerModel from './DebuggerModel';
import type {EvaluationResult} from './Bridge';

import wordAtPosition from '../../commons-atom/word-at-position';
import {bindObservableAsProps} from '../../nuclide-ui/lib/bindObservableAsProps';
import {DebuggerMode} from './DebuggerStore';
import {DebuggerDatatipComponent} from './DebuggerDatatipComponent';
import passesGK from '../../commons-node/passesGK';

const GK_DEBUGGER_DATATIPS = 'nuclide_debugger_datatips';

const DEFAULT_WORD_REGEX = /\w+/gi;
function defaultGetEvaluationExpression(
  editor: atom$TextEditor,
  position: atom$Point,
): Promise<?NuclideEvaluationExpression> {
  const extractedIdentifier = wordAtPosition(editor, position, DEFAULT_WORD_REGEX);
  if (extractedIdentifier == null) {
    return Promise.resolve(null);
  }
  const {
    wordMatch,
    range,
  } = extractedIdentifier;
  const [expression] = wordMatch;
  return Promise.resolve({
    expression,
    range,
  });
}

async function getEvaluationExpression(
  model: DebuggerModel,
  editor: TextEditor,
  position: atom$Point,
): Promise<?NuclideEvaluationExpression> {
  const {scopeName} = editor.getGrammar();
  const allProviders = model.getStore().getEvaluationExpressionProviders();
  let matchingProvider = null;
  for (const provider of allProviders) {
    const providerGrammars = provider.selector.split(/, ?/);
    if (providerGrammars.indexOf(scopeName) !== -1) {
      matchingProvider = provider;
      break;
    }
  }
  const expressionGetter = matchingProvider === null
    ? defaultGetEvaluationExpression
    : matchingProvider.getEvaluationExpression;
  return expressionGetter(editor, position);
}

export async function debuggerDatatip(
  model: DebuggerModel,
  editor: TextEditor,
  position: atom$Point,
): Promise<?Datatip> {
  if (!await passesGK(GK_DEBUGGER_DATATIPS, 0)) {
    return null;
  }
  if (model.getStore().getDebuggerMode() !== DebuggerMode.PAUSED) {
    return null;
  }
  const activeEditor = atom.workspace.getActiveTextEditor();
  if (activeEditor == null) {
    return null;
  }
  const evaluationExpression = await getEvaluationExpression(model, editor, position);
  if (evaluationExpression == null) {
    return null;
  }
  const {
    expression,
    range,
  } = evaluationExpression;
  if (expression == null) {
    return null;
  }
  const watchExpressionStore = model.getWatchExpressionStore();
  const evaluation = watchExpressionStore.evaluateWatchExpression(expression);
  // Avoid creating a datatip if the evaluation fails
  const evaluationResult: ?EvaluationResult = await evaluation.take(1).toPromise();
  if (evaluationResult === null) {
    return null;
  }
  const propStream = evaluation
    .filter(result => result != null)
    .map(result => ({expression, evaluationResult: result, watchExpressionStore}));
  return {
    component: bindObservableAsProps(
      propStream,
      DebuggerDatatipComponent,
    ),
    pinnable: true,
    range,
  };
}
