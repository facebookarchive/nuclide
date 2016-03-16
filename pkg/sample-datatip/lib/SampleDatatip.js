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

import {React} from 'react-for-atom';

const {extractWordAtPosition} = require('../../nuclide-atom-helpers');

const WORD_REGEX = /\w+/gi;

export async function datatip(editor: TextEditor, position: atom$Point): Promise<?Datatip> {
  const extractedWord = extractWordAtPosition(editor, position, WORD_REGEX);
  if (extractedWord == null) {
    return null;
  }
  const {
    wordMatch,
    range,
  } = extractedWord;
  const word = wordMatch[0] == null ? 'N/A' : wordMatch[0];
  return {
    component: <div>I am a Datatip for "{word}"</div>,
    range,
  };
}
