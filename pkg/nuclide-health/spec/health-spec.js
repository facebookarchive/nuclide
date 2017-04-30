/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import nuclideUri from '../../commons-node/nuclideUri';
import invariant from 'assert';

const openHealthPane = () => {
  atom.commands.dispatch(
    atom.views.getView(atom.workspace),
    'nuclide-health:toggle',
    {visible: true},
  );
};

function findHealthPaneAndItem(): {pane: ?atom$Pane, item: ?Object} {
  for (const pane of atom.workspace.getPanes()) {
    for (const item of pane.getItems()) {
      if (item.getTitle() === 'Health') {
        return {pane, item};
      }
    }
  }
  return {pane: null, item: null};
}

describe('Health', () => {
  beforeEach(() => {
    waitsForPromise(
      {label: 'workspace views to load', timeout: 10000},
      async () => {
        jasmine.unspy(window, 'setTimeout');
        const WORKSPACE_VIEW_DIRS = [
          nuclideUri.dirname(
            require.resolve('../../nuclide-workspace-views/package.json'),
          ),
          nuclideUri.dirname(
            require.resolve(
              '../../nuclide-workspace-view-locations/package.json',
            ),
          ),
        ];
        await Promise.all([
          ...WORKSPACE_VIEW_DIRS.map(dir => atom.packages.activatePackage(dir)),
          atom.packages.activatePackage(nuclideUri.join(__dirname, '..')),
        ]);
      },
    );
  });

  it('contains stats after its first refresh', () => {
    let element;
    runs(() => {
      openHealthPane();
      const {item} = findHealthPaneAndItem();
      invariant(item != null);
      expect(item.getTitle()).toEqual('Health');
      element = atom.views.getView(item);
    });
    waitsFor(() => element.innerHTML.trim() !== '', 500);
    runs(() => {
      expect(element.innerHTML).toContain('Stats');
      expect(element.innerHTML).toContain('CPU');
      expect(element.innerHTML).toContain('Heap');
      expect(element.innerHTML).toContain('Memory');
      expect(element.innerHTML).toContain('Handles');
      expect(element.innerHTML).toContain('Event loop');
    });
  });

  it('disappears when closed', () => {
    openHealthPane();
    const {pane, item} = findHealthPaneAndItem();
    invariant(item != null);
    invariant(pane != null);
    pane.activateItem(item);
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:close');
    expect(findHealthPaneAndItem().item).toBeFalsy();
  });
});
