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

import invariant from 'assert';

export function doGutterDiagnosticsExist(): boolean {
  return getGutterElement() != null;
}

export function waitsForGutterDiagnostics(): void {
  waitsFor('error to appear', 10000, () => {
    return getGutterElement() != null;
  });
}

export function expectGutterDiagnosticToContain(message: string): void {
  const gutterElement = getGutterElement();
  invariant(gutterElement != null);
  gutterElement.dispatchEvent(new MouseEvent('mouseenter'));

  const popupElement = getPopupElement();
  invariant(popupElement != null);

  expect(popupElement.innerText).toContain(message);
}

function getGutterElement(): ?HTMLElement {
  return atom.views.getView(atom.workspace).querySelector(
    'atom-workspace /deep/ .nuclide-diagnostics-gutter-ui-gutter-error'
  );
}

function getPopupElement(): ?HTMLElement {
  return document.querySelector('.nuclide-diagnostics-gutter-ui-popup');
}
