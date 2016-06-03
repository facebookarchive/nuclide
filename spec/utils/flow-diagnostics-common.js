'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* global MouseEvent */

import type {TestContext} from './remotable-tests';

import {Range} from 'atom';
import invariant from 'assert';

import {
  busySignal,
  copyFixture,
  dispatchKeyboardEvent,
} from '../../pkg/nuclide-integration-test-helpers';

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

      expect(getGutterElement()).toBeNull();

      dispatchKeyboardEvent('s', document.activeElement, {cmd: true});
    });

    let gutterElement: ?HTMLElement = null;

    waitsFor('error to appear', 10000, () => {
      gutterElement = getGutterElement();
      return gutterElement != null;
    });

    runs(() => {
      invariant(gutterElement != null);
      gutterElement.dispatchEvent(new MouseEvent('mouseenter'));

      const popupElement = getPopupElement();
      invariant(popupElement != null);

      // This may need to be updated if Flow changes error text
      const expectedText = 'property `baz`\nProperty not found in\nFoo';
      expect(popupElement.innerText).toContain(expectedText);
    });
  });
}

function getGutterElement(): ?HTMLElement {
  return atom.views.getView(atom.workspace).querySelector(
    'atom-workspace /deep/ .nuclide-diagnostics-gutter-ui-gutter-error'
  );
}

function getPopupElement(): ?HTMLElement {
  return document.querySelector('.nuclide-diagnostics-gutter-ui-popup');
}
