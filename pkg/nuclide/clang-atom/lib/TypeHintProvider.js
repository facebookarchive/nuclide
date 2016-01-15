'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TypeHint} from '../../type-hint-interfaces';

import {Point, Range} from 'atom';
import {trackTiming} from '../../analytics';
import {getDeclaration} from './libclang';

// Types longer than this will be truncated.
const MAX_LENGTH = 256;

export class TypeHintProvider {

  @trackTiming('nuclide-clang-atom.typeHint')
  async typeHint(editor: atom$TextEditor, position: atom$Point): Promise<?TypeHint> {
    const decl = await getDeclaration(editor, position.row, position.column);
    if (decl == null) {
      return null;
    }
    const {type, extent} = decl;
    if (type == null || type.trim() === '') {
      return null;
    }
    let hint = type;
    if (type.length > MAX_LENGTH) {
      hint = type.substr(0, MAX_LENGTH) + '...';
    }
    return {
      hint,
      range: new Range(
        new Point(extent.start.line, extent.start.column),
        new Point(extent.end.line, extent.end.column),
      ),
    };
  }

}
