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
var uiProviders = [];
var uriComponentMap = {};

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
  uriComponentMap[model.getURI()] = component;
  // TODO(most): unmount component on tab close.

  var {track} = require('nuclide-analytics');
  track('diff-view-open');

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
          return getLogger().warn('No active text editor for diff view!');
        }
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + editor.getPath());
      }
    ));

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        var filePath = uri.slice(NUCLIDE_DIFF_VIEW_URI.length);
        var model = new DiffViewModel(uri, filePath, uiProviders);
        return model.fetchDiffState().then(() => {
          return createView(model);
        }, (err) => {
          var errorMessge = 'Cannot open diff view for file: ' + filePath + '<br/>Error: ' + err.message;
          getLogger().error(errorMessge);
          atom.notifications.addError(errorMessge);
        });
      }
    }));

    subscriptions.add(atom.workspace.onDidOpen(event => {
      if (event.uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        var component = uriComponentMap[event.uri];
        component.updateDiffMarkers();
      }
    }));
  },

  serialize(): ?any {
    // TODO(most): Return the state of the diff view here, so, we can restore it on reload or restart.
  },

  deactivate(): void {
    uiProviders.splice(0);
    uriComponentMap = {};
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
  },

  /** The diff-view package can consume providers that return React components to
   * be rendered inline.
   * A uiProvider must have a method composeUiElements with the following spec:
   * @param filePath The path of the file the diff view is opened for
   * @return An array of InlineComments (defined above) to be rendered into the
   *         diff view
   */
  consumeProvider(provider) {
    uiProviders.push(provider);
  },
};
