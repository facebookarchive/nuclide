'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const featureConfig = require('../../feature-config');
const path = require('path');

const BASE_ITEM_URI = 'atom://nuclide/gadgets/nuclide-home';
const CONFIG_KEY = 'nuclide-home.showHome';

function findHomePaneAndItem(): {pane: ?atom$Pane, item: ?Object} {
  const pane = atom.workspace.paneForURI(BASE_ITEM_URI);
  const item = pane ? pane.itemForURI(BASE_ITEM_URI) : null;
  return {pane, item};
}

describe('Home', () => {

  beforeEach(() => {
    waitsForPromise(async () => {
      jasmine.unspy(window, 'setTimeout');
      // $FlowIssue https://github.com/facebook/flow/issues/620
      const config = require('../package.json').nuclide.config;
      // $UPFixMe: With UP, the default settings are set by the loader, but
      // I don't have a good way to do that just for tests (yet).
      Object.keys(config).forEach(k =>
        featureConfig.setSchema(`nuclide-home.${k}`, config[k])
      );
      await Promise.all([
        atom.packages.activatePackage(path.join(__dirname, '..')),
        atom.packages.activatePackage(path.join(__dirname, '..', '..', 'gadgets')),
      ]);
    });
  });

  it('does not appear by default', () => {
    expect(findHomePaneAndItem().item).toBeTruthy();
  });

  it('appears when opened by URI, persisting into config', () => {
    waitsForPromise(async () => {
      await atom.workspace.open(BASE_ITEM_URI);
      const {item} = findHomePaneAndItem();
      expect(item).toBeTruthy();
      if (item) {
        expect(item.getTitle()).toEqual('Home');
        expect(item.element.innerHTML).toContain('Welcome to Nuclide');
        expect(featureConfig.get(CONFIG_KEY)).toBeTruthy();
      }
    });
  });

  it('disappears when closed, persisting into config', () => {
    waitsForPromise(async () => {
      await atom.workspace.open(BASE_ITEM_URI);
      const {pane, item} = findHomePaneAndItem();
      expect(item).toBeTruthy();
      if (pane && item) {
        pane.activateItem(item);
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'core:close');
        expect(findHomePaneAndItem().item).toBeFalsy();
        expect(featureConfig.get(CONFIG_KEY)).toBeFalsy();
      }
    });
  });

});
