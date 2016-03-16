'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {codeHighlightFromEditor} from './hack';

export default class CodeHighlightProvider {
  highlight(editor: atom$TextEditor, position: atom$Point): Promise<Array<atom$Range>> {
    return codeHighlightFromEditor(editor, position);
  }
}
