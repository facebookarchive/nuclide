'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {formatSourceFromEditor} from './hack';
import {trackTiming} from '../../nuclide-analytics';

class CodeFormatProvider {

  @trackTiming('hack.formatCode')
  formatCode(editor: atom$TextEditor, range: atom$Range): Promise<string> {
    return formatSourceFromEditor(editor, range);
  }

}

module.exports = CodeFormatProvider;
