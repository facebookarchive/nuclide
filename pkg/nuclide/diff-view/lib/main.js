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

// This url style is the one Atom uses for the welcome and settings pages.
const NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';

var subscriptions: ?CompositeDisposable = null;

var logger = null;

function getLogger() {
  return logger || (logger = require('nuclide-logging').getLogger());
}

// To add a view as a tab, we can either extend {View} from space-pen-views
// and carry over the jQuery overhead or extend HTMLElement, like Atom's text-editor-element.
function createView (model): HTMLElement {
  var React = require('react-for-atom');
  var DiffViewElement = require('./DiffViewElement');
  var DiffViewComponent = require('./DiffViewComponent');

  var hostElement = new DiffViewElement().initialize(model);
  var component = React.render(<DiffViewComponent model={model} />, hostElement);
  // TODO(most): unmount component on tab close.
  return hostElement;
}

module.exports = {

  activate(state: ?any): void {
    subscriptions = new CompositeDisposable();

    var DiffViewModel = require('./DiffViewModel');

    subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-diff-view:open',
      () => {
        var editor = atom.workspace.getActiveTextEditor();
        if (!editor) {
          return logger.warn('No active text editor for diff view!');
        }
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + editor.getPath());
      }
    ));

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        var filePath = uri.slice(NUCLIDE_DIFF_VIEW_URI.length);
        var model = new DiffViewModel(uri, filePath);
        return model.fetchDiffState().then(() => {
          return createView(model);
        }, (err) => {
          var errorMessge = 'Cannot open diff view for file: ' + filePath + '<br/>Error: ' + err.message;
          getLogger().error(errorMessge);
          atom.notifications.addError(errorMessge);
        });
      }
    }));
  },

  serialize(): ?any {
    // TODO(most): Return the state of the diff view here, so, we can restore it on reload or restart.
  },

  deactivate(): void {
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },
};
