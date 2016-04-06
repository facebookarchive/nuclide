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
} from '../pkg/nuclide-integration-test-helpers';

describe('nuclide-distraction-free-mode', () => {
  it('hides and shows things as expected', () => {
    waitsForPromise({timeout: 60000}, async () => {
      // Configure some jasmine specific things for integration testing.
      jasmineIntegrationTestSetup();
      // Activate nuclide packages.
      await activateAllPackages();

      const commandTarget = atom.views.getView(atom.workspace);

      atom.commands.dispatch(commandTarget, 'nuclide-outline-view:show');
      expect(isOutlineViewVisible()).toBeTruthy();

      atom.commands.dispatch(commandTarget, 'nuclide-distraction-free-mode:toggle');
      expect(isOutlineViewVisible()).toBeFalsy();

      atom.commands.dispatch(commandTarget, 'nuclide-distraction-free-mode:toggle');
      expect(isOutlineViewVisible()).toBeTruthy();

      // Deactivate nuclide packages.
      deactivateAllPackages();
    });
  });
});

function isOutlineViewVisible(): boolean {
  return document.querySelector('.nuclide-outline-view') != null;
}
