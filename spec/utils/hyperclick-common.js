'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';

import {
  dispatchKeyboardEvent,
  waitsForFilePosition,
} from '../../pkg/nuclide-integration-test-helpers';

// Checks that a hyperclick event in the current editor at the given position causes a navigation to
// the given end file and position. For use within Jasmine.
export function waitsForHyperclickResult(
  startPosition: [number, number],
  endFile: string,
  endPosition: [number, number],
): void {
  runs(() => {
    const currentEditor = atom.workspace.getActiveTextEditor();
    invariant(currentEditor != null);
    currentEditor.setCursorBufferPosition(startPosition);
    // shortcut key for hyperclick:confirm-cursor
    dispatchKeyboardEvent('enter', document.activeElement, {cmd: true, alt: true});
  });

  waitsForFilePosition(endFile, ...endPosition);
}
