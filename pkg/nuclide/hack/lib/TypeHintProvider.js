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

import {typeHintFromEditor} from './hack';
import {trackTiming} from '../../analytics';

module.exports = class TypeHintProvider {

  @trackTiming('hack.typeHint')
  typeHint(editor: atom$TextEditor, position: atom$Point): Promise<?TypeHint> {
    return typeHintFromEditor(editor, position);
  }

};
