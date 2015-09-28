'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BASE_ITEM_URI = 'nuclide-health://';

function findHealthPaneAndItem(): {pane: ?atom$Pane, item: ?Object} {
  var pane = atom.workspace.paneForURI(BASE_ITEM_URI);
  var item = pane ? pane.itemForURI(BASE_ITEM_URI) : null;
  return {pane, item};
}

function sleep(ms: number): Promise {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, ms);
  });
}

describe('Health', () => {

  beforeEach(() => {
    waitsForPromise(async () => {
      jasmine.unspy(window, 'setTimeout');
      await atom.packages.activatePackage('nuclide-health');
    });
  });

  it('appears when opened by URI and contains stats after its first refresh', () => {
    waitsForPromise(async () => {
      await atom.workspace.open(BASE_ITEM_URI);
      var {item} = findHealthPaneAndItem();
      expect(item).toBeTruthy();
      if (item) {
        expect(item.getTitle()).toEqual('Health');
        var interval = atom.config.get('nuclide-health.viewTimeout');
        expect(typeof interval).toEqual('number');

        if (typeof interval === 'number') {
          // Flow considers atom config items to be mixed.
          await sleep((interval + 1) * 1000);
          // An extra second should be enough for this test not to be flakey.
          expect(item.innerHTML).toContain('Stats');
          expect(item.innerHTML).toContain('CPU');
          expect(item.innerHTML).toContain('Heap');
          expect(item.innerHTML).toContain('Memory');
          expect(item.innerHTML).toContain('Key latency');
          expect(item.innerHTML).toContain('Handles');
          expect(item.innerHTML).toContain('Event loop');
        }
      }
    });
  });

  it('disappears when closed', () => {
    waitsForPromise(async () => {
      await atom.workspace.open(BASE_ITEM_URI);
      var {pane, item} = findHealthPaneAndItem();
      expect(item).toBeTruthy();
      if (pane && item) {
        pane.activateItem(item);
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:close');
        expect(findHealthPaneAndItem().item).toBeFalsy();
      }
    });
  });

});
