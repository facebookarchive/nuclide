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

var activeDiffView: ?{
  model: DiffViewModel;
  component: ReactComponent;
  element: HTMLElement;
}  = null;

// This url style is the one Atom uses for the welcome and settings pages.
var NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';

var subscriptions: ?CompositeDisposable = null;

var logger = null;
var uiProviders = [];

function getLogger() {
  return logger || (logger = require('nuclide-logging').getLogger());
}

// To add a view as a tab, we can either extend {View} from space-pen-views
// and carry over the jQuery overhead or extend HTMLElement, like Atom's text-editor-element.
function createView(uri: string): HTMLElement {
  var filePath = uri.slice(NUCLIDE_DIFF_VIEW_URI.length);
  if (activeDiffView) {
    activeDiffView.model.activateFile(filePath);
    return activeDiffView.element;
  }

  var React = require('react-for-atom');
  var DiffViewElement = require('./DiffViewElement');
  var DiffViewComponent = require('./DiffViewComponent');
  var DiffViewModel = require('./DiffViewModel');

  var diffModel = new DiffViewModel(filePath, uiProviders);
  var hostElement = new DiffViewElement().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
  var component = React.render(
    <DiffViewComponent diffModel={diffModel} initialFilePath={filePath}/>,
    hostElement,
  );
  activeDiffView = {
    model: diffModel,
    component,
    element: hostElement,
  };

  var destroySubscription = diffModel.onDidDestroy(() => {
    React.unmountComponentAtNode(hostElement);
    destroySubscription.dispose();
    subscriptions.remove(destroySubscription);
    activeDiffView = null;
  });

  subscriptions.add(destroySubscription);

  var {track} = require('nuclide-analytics');
  track('diff-view-open');

  return hostElement;
}

module.exports = {

  activate(state: ?any): void {
    subscriptions = new CompositeDisposable();

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
        return createView(uri);
      }
    }));
  },

  serialize(): ?any {
    // TODO(most): Return the state of the diff view here, so, we can restore it on reload or restart.
  },

  deactivate(): void {
    uiProviders.splice(0);
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
    // TODO(most): Fix UI rendering and re-introduce: t8174332
    // uiProviders.push(provider);
    return;
  },
};
