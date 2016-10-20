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
  deactivateAllPackages,
  jasmineIntegrationTestSetup,
} from './utils/integration-test-helpers';
import {sleep} from '../pkg/commons-node/promise';
import {spyOnDefault, unspyOnDefault} from '../pkg/nuclide-test-helpers';

describe('side-bar', () => {
  beforeEach(() => {
    runs(() => {
      // Ensure the test passes all GKs, the one for the source-control-side-bar in particular.
      spyOnDefault(
        require.resolve('../pkg/commons-node/passesGK'),
      ).andReturn(Promise.resolve(true));
      jasmineIntegrationTestSetup();
    });
    waitsForPromise(activateAllPackages);
  });

  afterEach(() => {
    deactivateAllPackages();
    unspyOnDefault(require.resolve('../pkg/commons-node/passesGK'));
  });

  it('renders options for each of its clients, responds to registered commands', () => {
    // file-tree is the first client, it should show up first
    expect(document.querySelector('.left.tool-panel:last-child .nuclide-file-tree')).toExist();

    atom.commands.dispatch(
      atom.views.getView(atom.workspace),
      'nuclide-source-control-side-bar:toggle',
    );

    // Give the client views a change to register.
    waitsForPromise(() => sleep(500));

    runs(() => {
      const tabTitleContent = (
        (document.querySelector(
          '.left.tool-panel:last-child .nuclide-tabs .tab:last-child .title span',
        ): any): HTMLSelectElement
      );
      // Selected option should be the source-control-side-bar, titled "Source Control"
      expect(String(tabTitleContent.innerText).trim()).toBe('Source Control');
    });

    let panel;
    waitsFor(() => {
      panel = document.querySelector('.left.tool-panel:last-child .nuclide-ui-panel-component');
      return panel != null;
    }, 'the side-bar panel to render');

    runs(() => {
      expect(panel.getAttribute('hidden')).toBeNull();

      // The source-control-side-bar was toggled above, toggling again hides the side-bar
      atom.commands.dispatch(
        atom.views.getView(atom.workspace),
        'nuclide-source-control-side-bar:toggle',
      );
    });

    waitsFor(() => {
      return panel.getAttribute('hidden') != null;
    }, 'the panel to be hidden with the `[hidden]`');
  });
});
