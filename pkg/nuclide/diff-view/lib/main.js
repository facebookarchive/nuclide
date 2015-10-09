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

// To add a View as an Atom workspace pane, we return `DiffViewElement` which extends `HTMLElement`.
// This pattetn is also followed with atom's TextEditor.
function createView(entryPath: string): HTMLElement {
  if (activeDiffView) {
    activateFilePath(entryPath);
    return activeDiffView.element;
  }

  var React = require('react-for-atom');
  var DiffViewElement = require('./DiffViewElement');
  var DiffViewComponent = require('./DiffViewComponent');
  var DiffViewModel = require('./DiffViewModel');

  var diffModel = new DiffViewModel(uiProviders);
  var hostElement = new DiffViewElement().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
  var component = React.render(
    <DiffViewComponent diffModel={diffModel}/>,
    hostElement,
  );
  activeDiffView = {
    model: diffModel,
    component,
    element: hostElement,
  };
  activateFilePath(entryPath);

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

function activateFilePath(filePath: string): void {
  if (!filePath.length || !activeDiffView) {
    // The Diff View could be opened with no path at all.
    return;
  }
  activeDiffView.model.activateFile(filePath);
}

function projectsContainPath(checkPath: string): boolean {
  var {isRemote} = require('nuclide-remote-uri');
  var {Directory} = require('atom');
  return atom.project.getDirectories().some(directory => {
    var directoryPath = directory.getPath();
    if (!checkPath.startsWith(directoryPath)) {
      return false;
    }
    // If the remote directory hasn't yet loaded.
    if (isRemote(checkPath) && directory instanceof Directory) {
      return false;
    }
    return true;
  });
}

module.exports = {

  activate(state: ?any): void {
    subscriptions = new CompositeDisposable();
    // Listen for menu item workspace diff view open command.
    subscriptions.add(atom.commands.add(
      'atom-workspace',
      'nuclide-diff-view:open',
      () => atom.workspace.open(NUCLIDE_DIFF_VIEW_URI)
    ));
    // Listen for in-editor context menu item diff view open command.
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

    function getTargetFromEvent(event) {
      return event.currentTarget.classList.contains('name')
        ? event.currentTarget
        : event.currentTarget.querySelector('.name');
    }

    // Listen for file tree context menu file item events to open the diff view.
    subscriptions.add(atom.commands.add(
      '.entry.file.list-item',
      'nuclide-diff-view:open-context',
      (event) => {
        var target = getTargetFromEvent(event);
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + (target.dataset.path || ''));
      }
    ));
    subscriptions.add(atom.contextMenu.add({
      '.entry.file.list-item': [
        {type: 'separator'},
        {
          label: 'Open in Diff View',
          command: 'nuclide-diff-view:open-context',
        },
        {type: 'separator'},
      ],
    }));

    // Listen for file tree context menu directory item events to open the diff view.
    subscriptions.add(atom.commands.add(
      '.entry.directory.list-item',
      'nuclide-diff-view:open-context',
      (event) => {
        var target = getTargetFromEvent(event);
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + (target.dataset.path || ''));
      }
    ));
    subscriptions.add(atom.contextMenu.add({
      '.entry.directory.list-item': [
        {type: 'separator'},
        {
          label: 'Open in Diff View',
          command: 'nuclide-diff-view:open-context',
        },
        {type: 'separator'},
      ],
    }));

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        return createView(uri.slice(NUCLIDE_DIFF_VIEW_URI.length));
      }
    }));

    if (!state || !state.activeFilePath) {
      return;
    }

    // Wait for all source control providers to register.
    subscriptions.add(atom.packages.onDidActivateInitialPackages(() => {
      var {activeFilePath} = state;

      // If it's a local directory, it must be loaded with packages activation.
      if (projectsContainPath(activeFilePath)) {
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + activeFilePath);
        return;
      }
      // If it's a remote directory, it should come on a path change event.
      var changePathsSubscription = atom.project.onDidChangePaths(() => {
        // try/catch here because in case of any error, Atom stops dispatching events to the
        // rest of the listeners, which can stop the remote editing from being functional.
        try {
          if (projectsContainPath(activeFilePath)) {
            atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + activeFilePath);
            changePathsSubscription.dispose();
            subscriptions.remove(changePathsSubscription);
          }
        } catch (e) {
          getLogger().error('DiffView restore error', e);
        }
      });
      subscriptions.add(changePathsSubscription);
    }));
  },

  serialize(): ?Object {
    if (!activeDiffView) {
      return {};
    }
    var {filePath} = activeDiffView.model.getActiveFileState();
    return {
      activeFilePath: filePath,
    };
  },

  deactivate(): void {
    uiProviders.splice(0);
    if (subscriptions) {
      subscriptions.dispose();
      subscriptions = null;
    }
    activeDiffView = null;
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
