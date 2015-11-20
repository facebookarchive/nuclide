'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HomeFragments} from 'nuclide-home-interfaces';
import type HomePaneItemType from './HomePaneItem';

var BASE_ITEM_URI = 'nuclide-home://';

var {CompositeDisposable, Disposable} = require('atom');

var disposables: ?CompositeDisposable = null;
var paneItem: ?HomePaneItemType;

var currentConfig = {};
var allHomeFragments: Set<HomeFragments> = new Set();

function activate(): void {
  disposables = new CompositeDisposable();
  disposables.add(
    atom.config.onDidChange('nuclide-home', (event) => {
      currentConfig = event.newValue;
      considerDisplayingHome();
    }),
    atom.workspace.addOpener(getHomePaneItem),
    atom.commands.add('atom-workspace', 'nuclide-home:toggle-pane', togglePane),
  );
  currentConfig = atom.config.get('nuclide-home');
  considerDisplayingHome();
}

var config = {
  showHome: {
    type: 'boolean',
    default: true,
    description: 'Show the home pane (by default shown on first startup).',
  },
};

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
  atom.config.set('nuclide-home.showHome', !atom.config.get('nuclide-home.showHome'));
}

function considerDisplayingHome() {
  if (currentConfig.showHome) {
    if (!paneItem) {
      atom.workspace.open(BASE_ITEM_URI, {searchAllPanes: true});
    }
  } else {
    if (paneItem) {
      var pane = atom.workspace.paneForItem(paneItem);
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
  var HomePaneItem = require('./HomePaneItem');
  paneItem = new HomePaneItem().initialize(uri, allHomeFragments);
  return paneItem;
}

function deactivate(): void {
  if (disposables) {
    disposables.dispose();
    disposables = null;
  }
}

atom.deserializers.add({
  name: 'HomePaneItem',
  deserialize: state => getHomePaneItem(state.uri),
});

module.exports = {
  activate,
  config,
  setHomeFragments,
  deactivate,
};
