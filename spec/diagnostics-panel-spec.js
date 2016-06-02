'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {
  activateAllPackages,
  jasmineIntegrationTestSetup,
  deactivateAllPackages,
  dispatchKeyboardEvent,
} from '../pkg/nuclide-integration-test-helpers';

// Returns the parent element of .nuclide-diagnostics-ui, which is helpful for determining
// whether the diagnostics panel is shown or hidden
function getDiagnosticsPanelNode(view: HTMLElement): ?HTMLElement {
  const rootNode = view.querySelector('.nuclide-diagnostics-ui');
  return (rootNode == null)
    ? null
    : ((rootNode.parentElement: any): ?HTMLElement);
}

function isDiagnosticsPanelShowing(view: HTMLElement): boolean {
  const rootNode = getDiagnosticsPanelNode(view);
  if (rootNode == null) {
    return false;
  }
  return (rootNode.style.getPropertyValue('display') !== 'none');
}

describe('Diagnostics panel integration test', () => {
  // This test asserts that the gutter icon for the diagnostics panel is loaded when
  // atom starts, and then checks that the diagnostics panel both loads and hides when
  //    (a) the gutter icon is clicked
  //    (b) the keyboard shortcut is pressed
  it('shows the gutter icon when package activated, \
  and shows UI when icon or keyboard shortcut pressed', () => {
    let workspaceView: HTMLElement = (null : any);
    let gutterIcon: HTMLElement = (null : any);

    waitsForPromise(async () => {
      // Configure some jasmine specific things for integration testing.
      jasmineIntegrationTestSetup();
      // Activate nuclide packages.
      await activateAllPackages();

      // Get the workspace that will contain the diagnostics icon in the bottom toolbar
      workspaceView = atom.views.getView(atom.workspace);
    });

    waitsFor('gutter icon to load in the DOM', 10000, () => {
      // Does the DOM element with that class exist?
      gutterIcon = workspaceView.querySelector('.nuclide-diagnostics-highlight-group');
      if (gutterIcon == null) {
        return false;
      }
      return (gutterIcon.children.length !== 0);
    });

    runs(() => {
      // Try showing the diagnostics UI by clicking the button
      gutterIcon.click();
    });

    waitsFor('diagnostics panel to load in the DOM', 10000, () => {
      // Did the diagnostics panel appear?
      return isDiagnosticsPanelShowing(workspaceView);
    });

    runs(() => {
      // Click gutter icon again to hide it
      gutterIcon.click();
    });

    waitsFor('diagnostics panel to have style `display: none` in the DOM', 10000, () => {
      // Did the diagnostics panel hide?
      return !isDiagnosticsPanelShowing(workspaceView);
    });

    runs(() => {
      // Now show the panel with the keyboard shortcut
      dispatchKeyboardEvent('d', document.activeElement, {alt: true, shift: true});
    });

    waitsFor('diagnostics panel to remove style `display: none` in the DOM', 10000, () => {
      // Did the diagnostics panel appear?
      return isDiagnosticsPanelShowing(workspaceView);
    });

    runs(() => {
      // Now hide the panel with the keyboard shortcut
      dispatchKeyboardEvent('d', document.activeElement, {alt: true, shift: true});
    });

    waitsFor('diagnostics panel to have style `display: none` in the DOM', 10000, () => {
      // Did the diagnostics panel hide?
      return !isDiagnosticsPanelShowing(workspaceView);
    });

    runs(() => {
      // Deactivate nuclide packages.
      deactivateAllPackages();
    });
  });
});
