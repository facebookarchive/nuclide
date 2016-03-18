'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Datatip} from '../../nuclide-datatip-interfaces';
import type DebuggerModel from './DebuggerModel';
import type {EvaluationResult} from './Bridge';

import {
  React,
} from 'react-for-atom';
import {extractWordAtPosition} from '../../nuclide-atom-helpers';
import {DebuggerMode} from './DebuggerStore';

const SKIP_DATATIP = true;
const WORD_REGEX = /\$\w+/gi;
export async function debuggerDatatip(
  model: DebuggerModel,
  editor: TextEditor,
  position: atom$Point,
): Promise<?Datatip> {
  if (SKIP_DATATIP) {
    // TODO replace with GK check.
    return null;
  }
  if (!model.getStore().getDebuggerMode() === DebuggerMode.PAUSED) {
    return null;
  }
  const activeEditor = atom.workspace.getActiveTextEditor();
  if (activeEditor == null) {
    return null;
  }
  // TODO get the identfier range under the cursor from the appropriate language provider.
  const extractedIdentifier = extractWordAtPosition(editor, position, WORD_REGEX);
  if (extractedIdentifier == null) {
    return null;
  }
  const {
    wordMatch,
    range,
  } = extractedIdentifier;
  const word = wordMatch[0];
  if (word == null) {
    return null;
  }
  const evaluationResult: ?EvaluationResult =
    await model.getBridge().evaluateOnSelectedCallFrame(word);
  if (evaluationResult == null) {
    return null;
  }
  const {
    _type: resultType,
    value,
    _description: description,
  } = evaluationResult;
  const displayValue = resultType === 'object' ? description : value;
  return {
    component: <div>{word} = {displayValue}</div>,
    pinnable: false,
    range,
  };
}
