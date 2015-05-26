'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var hack = require('./hack');

class CodeFormatProvider {

  formatCode(editor: TextEditor, range: Range): Promise<string> {
    return hack.formatSourceFromEditor(editor, range);
  }

}

module.exports = CodeFormatProvider;
