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

import {describeRemotableTest} from './utils/remotable-tests';
import {waitsForRepositoryReady} from './utils/diff-view-utils';
import {generateHgRepo2Fixture} from '../pkg/nuclide-test-helpers';
import invariant from 'assert';

describeRemotableTest('Diff View Toolbar Button Test', (context: TestContext) => {

  let repoPath: string = (null: any);
  let filePath: string = (null: any);

  beforeEach(() => {
    waitsForPromise({timeout: 20000}, async () => {
      // Copy mercurial project to temporary directory.
      repoPath = await generateHgRepo2Fixture();
      await context.setProject(repoPath);
      // Open the test.txt file in the repo.
      filePath = context.getProjectRelativePath('test.txt');
      await atom.workspace.open(filePath);
    });
  });

  it('tests diff files count', () => {
    const textEditor = atom.workspace.getActiveTextEditor();
    invariant(textEditor, 'no active text editor!');

    function getDiffViewToolBarCount() {
      const el = document.querySelector('.diff-view-count');
      return el ? el.dataset.count : null;
    }

    waitsFor('diff-count element to register in the toolbar', 30000, () => {
      return getDiffViewToolBarCount() != null;
    });

    waitsForPromise(
      {label: 'repository ready'},
      () => waitsForRepositoryReady(filePath),
    );

    runs(() => {
      // Initially we have no changed files so the diff view tool-bar counter should be empty.
      expect(getDiffViewToolBarCount()).toEqual('');
      textEditor.setText('cg');
    });

    // local saves are synchronous, while remote saves return a promise.
    // Wrapping the result in a promise would wait for saving, regardless of the environment.
    waitsForPromise(() => Promise.resolve(textEditor.save()));

    waitsFor('uncommited file changes tool-bar counter to update', 10000, () => {
      return getDiffViewToolBarCount();
    });

    runs(() => {
      expect(getDiffViewToolBarCount()).toEqual('1');
    });
  });
});
