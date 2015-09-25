'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var BASE_ITEM_URI = 'nuclide-home://';

var {CompositeDisposable} = require('atom');

var disposables: ?CompositeDisposable = null;
var paneItem: ?HTMLElement;

var currentConfig = {};

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
    default: false,
    description: 'Show the home pane (by default shown on first startup).',
  },
};

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

function getHomePaneItem(uri: string): ?HTMLElement {
  if (!uri.startsWith(BASE_ITEM_URI)) {
    return;
  }
  var HomePaneItem = require('./HomePaneItem');
  paneItem = new HomePaneItem().initialize(uri);
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
  togglePane,
  deactivate,
};
