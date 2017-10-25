/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @flow
 * @format
 */

import os from 'os';
import nuclideUri from 'nuclide-commons/nuclideUri';

import {CodeActionManager} from '../lib/CodeActionManager';

describe('CodeActionManager', () => {
  let manager;
  let provider;
  let delegate;
  let editor;
  beforeEach(() => {
    jasmine.useMockClock();
    waitsForPromise(async () => {
      editor = await atom.workspace.open(
        nuclideUri.join(os.tmpdir(), 'test.txt'),
      );
      editor.setText('abc\ndef\nghi');

      manager = new CodeActionManager();
      provider = {
        priority: 1,
        grammarScopes: ['text.plain.null-grammar'],
        async getCodeActions(_e, _r, _d) {
          return [];
        },
      };
      delegate = {
        clearMessages: () => {},
        setAllMessages: _messages => {},
      };
      manager._linterDelegate = delegate;
      manager.addProvider(provider);
    });
  });

  it('finds code actions on highlight change and updates linter', () => {
    const actions = [
      {
        apply() {},
        async getTitle() {
          return 'Mock action';
        },
        dispose() {},
      },
    ];
    const spyActions = spyOn(provider, 'getCodeActions').andReturn(actions);
    const spyLinter = spyOn(delegate, 'setAllMessages');

    runs(() => {
      advanceClock(1); // trigger debounce
      editor.selectAll();
      advanceClock(501);
    });

    waitsFor(
      () => spyLinter.wasCalled,
      'should have called setAllMessages',
      750,
    );

    runs(() => {
      expect(spyActions).toHaveBeenCalled();
      expect(spyLinter).toHaveBeenCalled();
      expect(
        (spyLinter.mostRecentCall.args: any)[0][0].solutions.length,
      ).toEqual(1);
    });
  });
});
