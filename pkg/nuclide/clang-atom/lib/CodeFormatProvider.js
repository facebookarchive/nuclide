'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {trackOperationTiming} from '../../analytics';
import {array} from '../../commons';
import {GRAMMAR_SET} from './constants';
import {getLogger} from '../../logging';

import libclang from './libclang';

module.exports = {
  selector: array.from(GRAMMAR_SET).join(', '),
  inclusionPriority: 1,
  formatEntireFile(editor: atom$TextEditor, range: atom$Range): Promise<{
    newCursor: number;
    formatted: string;
  }> {
    return trackOperationTiming('nuclide-clang-atom.formatCode', async () => {
      try {
        return await libclang.formatCode(editor, range);
      } catch (e) {
        getLogger().error('Could not run clang-format:', e);
        atom.notifications.addError(
          'Could not run clang-format.<br>Ensure it is installed and in your $PATH.'
        );
        throw e;
      }
    });
  },
};
