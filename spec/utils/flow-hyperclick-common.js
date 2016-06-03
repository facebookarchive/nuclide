'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TestContext} from './remotable-tests';

import {
  dispatchKeyboardEvent,
  waitsForFilePosition,
} from '../../pkg/nuclide-integration-test-helpers';

import {setup} from './flow-common';

export function runTest(context: TestContext) {
  it('tests flow hyperclick example', () => {
    const editorPromise = setup(context);

    waitsForPromise(async () => {
      const textEditor: atom$TextEditor = await editorPromise;
      textEditor.setCursorBufferPosition([14, 13]);
      // shortcut key for hyperclick:confirm-cursor
      dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
    });

    waitsForFilePosition('Foo.js', 11, 2);
  });
}
