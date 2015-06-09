'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var {CompositeDisposable} = require('atom');

var loadController: () => Promise<FileTreeController>;
var fileTreeController: ?FileTreeController = null;
var subscriptions: ?CompositeDisposable = null;

// Unload 'tree-view' so we can control whether it is activated or not.
//
// Running the code in the global scope here ensures that it's called before
// 'tree-view' is activated. This allows us to unload it before it's activated,
// ensuring it has minimal impact on startup time.
var loadSubscription = atom.packages.onDidLoadInitialPackages(() => {
  if (atom.packages.isPackageLoaded('tree-view')) {
    atom.packages.unloadPackage('tree-view');
  }
  loadSubscription.dispose();
  loadSubscription = null;
});

module.exports = {
  activate(state: ?FileTreeControllerState): void {
    // We need to check if the package is already disabled, otherwise Atom will
    // add it to the 'core.disabledPackages' config multiple times.
    if (!atom.packages.isPackageDisabled('tree-view')) {
      atom.packages.disablePackage('tree-view');
    }

    // Show the file tree by default.
    state = state || {};
    state.panel = state.panel || {isVisible: true};

    /**
     * Lazily load the FileTreeController, to minimize startup time.
     */
    loadController = async () => {
      if (!fileTreeController) {
        var FileTreeController = require('./FileTreeController');
        fileTreeController = new FileTreeController(state);
      }
      return fileTreeController;
    };

    subscriptions = new CompositeDisposable();
    subscriptions.add(atom.commands.add(
        'atom-workspace',
        {
          'nuclide-file-tree:toggle': async () => (await loadController()).toggle(),
          'nuclide-file-tree:show': async () => (await loadController()).setVisible(true),
          'nuclide-file-tree:reveal-active-file': async () => (await loadController()).revealActiveFile(),
        }));

    if (state.panel.isVisible) {
      loadController();
    }
  },

  getController(): () => Promise<FileTreeController> {
    return loadController;
  },

  deactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
    if (fileTreeController) {
      fileTreeController.destroy();
      fileTreeController = null;
    }

    // The user most likely wants either `nuclide-file-tree` or `tree-view` at
    // any given point. If `nuclide-file-tree` is disabled, we should re-enable
    // `tree-view` so they can still browse files.
    //
    // If the user only ever wants to use `nuclide-file-tree`, we still need to
    // enable `tree-view` on shutdown. Otherwise, disabling `nuclide-file-tree`
    // and reloading Atom would keep `tree-view` disabled.
    atom.packages.enablePackage('tree-view');
  },

  serialize(): ?FileTreeControllerState {
    if (fileTreeController) {
      return fileTreeController.serialize();
    }
  }
};
