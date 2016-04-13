'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHint} from '../../nuclide-type-hint-interfaces';

import {getHackLanguageForUri} from './HackLanguage';
import {getIdentifierAndRange} from './utils';
import {trackTiming} from '../../nuclide-analytics';

module.exports = class TypeHintProvider {

  @trackTiming('hack.typeHint')
  typeHint(editor: atom$TextEditor, position: atom$Point): Promise<?TypeHint> {
    return typeHintFromEditor(editor, position);
  }

};

async function typeHintFromEditor(
  editor: atom$TextEditor,
  position: atom$Point
): Promise<?TypeHint> {
  const filePath = editor.getPath();
  const hackLanguage = await getHackLanguageForUri(filePath);
  if (!hackLanguage || !filePath) {
    return null;
  }

  const match = getIdentifierAndRange(editor, position);
  if (match == null) {
    return null;
  }

  const contents = editor.getText();

  const type = await hackLanguage.getType(
    filePath, contents, match.id, position.row + 1, position.column + 1);
  if (!type || type === '_') {
    return null;
  } else {
    return {
      hint: type,
      range: match.range,
    };
  }
}
