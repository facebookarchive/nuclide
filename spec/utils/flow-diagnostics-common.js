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

import {Range} from 'atom';

import {
  busySignal,
  copyFixture,
  dispatchKeyboardEvent,
} from '../../pkg/nuclide-integration-test-helpers';

import {
  doGutterDiagnosticsExist,
  waitsForGutterDiagnostics,
  expectGutterDiagnosticToContain,
} from './diagnostics-common';

export function runTest(context: TestContext) {
  it('tests for flow ', () => {
    let textEditor: atom$TextEditor = (null : any);

    waitsForPromise({timeout: 240000}, async () => {
      const flowProjectPath = await copyFixture('flow_project_1');

      // Add this directory as an atom project.
      await context.setProject(flowProjectPath);
      // Open a file in the flow project we copied, and get reference to the editor's HTML.
      textEditor = await atom.workspace.open(context.getProjectRelativePath('main.js'));
    });

    waitsFor('spinner to start', 10000, () => {
      return busySignal.isBusy();
    });

    waitsFor('spinner to stop', 30000, () => {
      return !busySignal.isBusy();
    });

    runs(() => {
      // Change `bar` to `baz`
      textEditor.setTextInBufferRange(new Range([14, 12], [14, 13]), 'z');

      expect(doGutterDiagnosticsExist()).toBeFalsy();

      dispatchKeyboardEvent('s', document.activeElement, {cmd: true});
    });

    waitsForGutterDiagnostics();

    runs(() => {
      // This may need to be updated if Flow changes error text
      const expectedText = 'property `baz`\nProperty not found in\nFoo';
      expectGutterDiagnosticToContain(expectedText);
    });
  });
}
