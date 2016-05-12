'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Observable} from 'rxjs';
import {atomEventDebounce} from '../pkg/nuclide-atom-helpers';
import {Point} from 'atom';

import {
  activateAllPackages,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
} from '../pkg/nuclide-integration-test-helpers';

// Shorter than the default so the tests don't run long.
const DEBOUNCE_INTERVAL = 10;
const PACKAGE_LOAD_TIMEOUT = 30000; // milliseconds

describe('editorScrollTopDebounced', () => {
  let editor: atom$TextEditor = (null: any);
  let editorScroll: Observable<void> = (null: any);
  const LINES: number = 1000;

  it('debounces scroll event', () => {
    const mockText = Array(LINES)
                      .fill('MOCK LINE\n')
                      .reduce((a, b) => a.concat(b));

    waitsForPromise({timeout: PACKAGE_LOAD_TIMEOUT}, async () => {
      jasmineIntegrationTestSetup();
      await activateAllPackages();
    });

    waitsForPromise(async() => {
      editor = await atom.workspace.open();
      editor.setText(mockText);

      editorScroll = atomEventDebounce.editorScrollTopDebounced(editor, DEBOUNCE_INTERVAL);

      const eventsPromise = editorScroll
        .takeUntil(Observable.of(null).delay(500))
        .toArray()
        .toPromise();

      editor.scrollToBufferPosition(new Point(LINES / 2, 0));
      editor.scrollToBufferPosition(new Point(0, 0));
      editor.scrollToBufferPosition(new Point(LINES - 1, 0));
      editor.scrollToBufferPosition(new Point(LINES / 4, 0));

      expect((await eventsPromise).length).toBe(1);
      deactivateAllPackages();
    });
  });
});
