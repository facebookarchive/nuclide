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
import type {Datatip} from '../../nuclide-datatip-interfaces';
import type DebuggerModel from './DebuggerModel';
import type {EvaluationResult} from './Bridge';

import Rx from 'rx';
import {extractWordAtPosition} from '../../nuclide-atom-helpers';
import {injectObservableAsProps} from '../../nuclide-ui/lib/HOC';
import {DebuggerMode} from './DebuggerStore';
import {DebuggerDatatipComponent} from './DebuggerDatatipComponent';

const GK_DEBUGGER_DATATIPS = 'nuclide_debugger_datatips';
const GK_TIMEOUT = 1000;
async function passesGK(): Promise<boolean> {
  try {
    const {gatekeeper} = require('../../fb-gatekeeper');
    return Boolean(
      await gatekeeper.asyncIsGkEnabled(GK_DEBUGGER_DATATIPS, GK_TIMEOUT)
    );
  } catch (e) {
    return false;
  }
}

const DEFAULT_WORD_REGEX = /\w+/gi;
function defaultGetEvaluationExpression(
  editor: atom$TextEditor,
  position: atom$Point,
): Promise<?NuclideEvaluationExpression> {
  const extractedIdentifier = extractWordAtPosition(editor, position, DEFAULT_WORD_REGEX);
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
  if (!await passesGK()) {
    return null;
  }
  if (!model.getStore().getDebuggerMode() === DebuggerMode.PAUSED) {
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
  const evaluationResult: ?EvaluationResult =
    await model.getBridge().evaluateOnSelectedCallFrame(expression);
  if (evaluationResult == null) {
    return null;
  }
  const propStream = Rx.Observable.just({expression, evaluationResult});
  return {
    component: injectObservableAsProps(
      propStream,
      DebuggerDatatipComponent,
    ),
    pinnable: false,
    range,
  };
}
