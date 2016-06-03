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
} from './diagnostics-common';

import {setup} from './flow-common';

export function runTest(context: TestContext) {
  it('tests for flow ', () => {
    const textEditorPromise = setup(context);

    waitsForPromise(async () => {
      const textEditor = await textEditorPromise;
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
