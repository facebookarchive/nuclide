'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HomeFragments} from '../../home-interfaces';
import type HomePaneItemType from './HomePaneItem';

const BASE_ITEM_URI = 'nuclide-home://';

const {CompositeDisposable, Disposable} = require('atom');
const featureConfig = require('../../feature-config');

let disposables: ?CompositeDisposable = null;
let paneItem: ?HomePaneItemType;

let currentConfig = {};
const allHomeFragments: Set<HomeFragments> = new Set();

function activate(): void {
  disposables = new CompositeDisposable();
  disposables.add(
    featureConfig.onDidChange('nuclide-home', (event) => {
      currentConfig = event.newValue;
      considerDisplayingHome();
    }),
    atom.workspace.addOpener(getHomePaneItem),
    atom.commands.add('atom-workspace', 'nuclide-home:toggle-pane', togglePane),
  );
  currentConfig = featureConfig.get('nuclide-home');
  considerDisplayingHome();
}

function setHomeFragments(homeFragments: HomeFragments): Disposable {
  allHomeFragments.add(homeFragments);
  if (paneItem) {
    paneItem.setHomeFragments(allHomeFragments);
  }
  return new Disposable(() => {
    allHomeFragments.delete(homeFragments);
    if (paneItem) {
      paneItem.setHomeFragments(allHomeFragments);
    }
  });
}

function togglePane() {
  featureConfig.set('nuclide-home.showHome', !featureConfig.get('nuclide-home.showHome'));
}

function considerDisplayingHome() {
  if (currentConfig.showHome) {
    if (!paneItem) {
      atom.workspace.open(BASE_ITEM_URI, {searchAllPanes: true});
    }
  } else {
    if (paneItem) {
      const pane = atom.workspace.paneForItem(paneItem);
      if (pane) {
        pane.destroyItem(paneItem);
      }
      paneItem = null;
    }
  }
}

function getHomePaneItem(uri: string): ?HomePaneItemType {
  if (!uri.startsWith(BASE_ITEM_URI)) {
    return;
  }
  const HomePaneItem = require('./HomePaneItem');
  paneItem = new HomePaneItem().initialize(uri, allHomeFragments);
  return paneItem;
}

function deactivate(): void {
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
}

module.exports = {
  activate,
  setHomeFragments,
  deactivate,

  // TODO: This shouldn't actually be exported. We do so just because it requires access to module
  //       state and we want to access it in the deserializer module.
  _getHomePaneItem: getHomePaneItem,
};
