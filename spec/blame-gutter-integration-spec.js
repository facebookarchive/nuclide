'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TestContext} from './utils/remotable-tests';

import {generateHgRepo2Fixture} from '../pkg/nuclide-test-helpers';
import {describeRemotableTest} from './utils/remotable-tests';

describeRemotableTest('Blame gutter integration test', (context: TestContext) => {
  it('renders the blame gutter', () => {
    let textEditorView: HTMLElement = (null: any);
    let blameGutter: HTMLElement = (null: any);
    let blameEntries: Array<HTMLElement> = (null: any);

    waitsForPromise({timeout: 60000}, async () => {
      // Copy mercurial project to temporary directory.
      const repoPath = await generateHgRepo2Fixture();
      // Add this directory as a new project in atom.
      await context.setProject(repoPath);
      // Open the test.txt file in the repo.
      const filePath = context.getProjectRelativePath('test.txt');
      const textEditor = await atom.workspace.open(filePath);
      textEditorView = atom.views.getView(textEditor);
      // Simulate 'Toggle blame' click in context menu.
      atom.commands.dispatch(textEditorView, 'nuclide-blame:toggle-blame');
    });

    waitsFor('gutter blame UI to show up', 10000, () => {
      blameGutter = textEditorView.querySelector(
        'atom-text-editor /deep/ [gutter-name=nuclide-blame]',
      );
      return blameGutter;
    });

    waitsFor('blame information to populate', 10000, () => {
      blameEntries = Array.from(blameGutter.querySelectorAll('.blame-decoration'));
      return blameEntries.length;
    });

    runs(() => {
      expect(blameEntries.length).toBe(6);

      const blameLines = blameEntries.map(blameEntry => {
        return Array.from(blameEntry.querySelectorAll('span')).map(spans => spans.innerHTML);
      });

      expect(blameLines.every(blameLine => blameLine[0] === process.env.USER)).toBeTruthy();
      expect(blameLines[0][1]).toEqual(blameLines[1][1]);
      expect(blameLines[0][1]).toEqual(blameLines[2][1]);
      expect(blameLines[0][1]).toEqual(blameLines[3][1]);
      expect(blameLines[0][1]).not.toEqual(blameLines[4][1]);
      expect(blameLines[4][1]).toEqual(blameLines[5][1]);
    });
  });
});
