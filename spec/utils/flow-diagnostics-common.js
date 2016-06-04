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
  dispatchKeyboardEvent,
} from '../../pkg/nuclide-integration-test-helpers';

import {
  doGutterDiagnosticsExist,
  waitsForGutterDiagnostics,
  expectGutterDiagnosticToContain,
  waitsForStatusBarItem,
  clickStatusBarItem,
  isDiagnosticsPanelShowing,
  getPanelDiagnosticElements,
} from './diagnostics-common';

import {setup} from './flow-common';

export function runTest(context: TestContext) {
  it('tests for flow ', () => {
    const textEditorPromise = setup(context);
    let textEditor: atom$TextEditor;

    waitsForStatusBarItem();
    runs(() => {
      clickStatusBarItem();
      expect(isDiagnosticsPanelShowing()).toBeTruthy();
    });

    waitsForPromise(async () => {
      textEditor = await textEditorPromise;
      // Change `bar` to `baz`
      textEditor.setTextInBufferRange(new Range([14, 12], [14, 13]), 'z');

      expect(doGutterDiagnosticsExist()).toBeFalsy();

      dispatchKeyboardEvent('s', document.activeElement, {cmd: true});
    });

    waitsForGutterDiagnostics();

    runs(() => {
      // This may need to be updated if Flow changes error text
      const expectedGutterText = 'property `baz`\nProperty not found in\nFoo';
      expectGutterDiagnosticToContain(expectedGutterText);

      // The text is rendered slightly differently in the gutter and the panel
      const expectedPanelText = 'property `baz` Property not found in Foo';

      const diagnosticElements = getPanelDiagnosticElements();
      expect(diagnosticElements.length).toBe(1);
      const diagnosticElement = diagnosticElements[0];
      expect(diagnosticElement.innerText).toContain(expectedPanelText);

      textEditor.setCursorBufferPosition([0, 0]);
      diagnosticElement.click();
    });

    waitsFor(() => {
      return textEditor.getCursorBufferPosition().isEqual([14, 0]);
    });
  });
}
