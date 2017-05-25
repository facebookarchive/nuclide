/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {Range, TextEditor} from 'atom';
import CodeFormatManager from '../lib/CodeFormatManager';

describe('CodeFormatManager', () => {
  it('formats an editor on request', () => {
    waitsForPromise(async () => {
      const manager = new CodeFormatManager();
      manager.addProvider({
        selector: 'text.plain.null-grammar',
        inclusionPriority: 1,
        formatCode: () =>
          Promise.resolve([
            {
              oldRange: new Range([0, 0], [0, 3]),
              oldText: 'abc',
              newText: 'def',
            },
          ]),
      });

      const textEditor = new TextEditor();
      textEditor.setText('abc');
      const result = await manager._formatCodeInTextEditor(textEditor);
      expect(result).toBe(true);
      expect(textEditor.getText()).toBe('def');
    });
  });
});
