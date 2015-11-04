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

import {CompositeDisposable} from 'atom';
import invariant from 'assert';

let diffViewModel: ?DiffViewModel = null;
let activeDiffView: ?{
  component: ReactComponent;
  element: HTMLElement;
}  = null;

// This url style is the one Atom uses for the welcome and settings pages.
const NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
const uiProviders = [];

let subscriptions: ?CompositeDisposable = null;
let toolBar: ?any = null;
let changeCountElement: ?HTMLElement = null;
let logger = null;

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

  const React = require('react-for-atom');
  const DiffViewElement = require('./DiffViewElement');
  const DiffViewComponent = require('./DiffViewComponent');

  const diffModel = getDiffViewModel();
  const hostElement = new DiffViewElement().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
  const component = React.render(
    <DiffViewComponent diffModel={diffModel}/>,
    hostElement,
  );
  activeDiffView = {
    component,
    element: hostElement,
  };
  activateFilePath(entryPath);

  const destroySubscription = hostElement.onDidDestroy(() => {
    React.unmountComponentAtNode(hostElement);
    destroySubscription.dispose();
    invariant(subscriptions);
    subscriptions.remove(destroySubscription);
    activeDiffView = null;
  });

  invariant(subscriptions);
  subscriptions.add(destroySubscription);

  const {track} = require('nuclide-analytics');
  track('diff-view-open');

  return hostElement;
}

function getDiffViewModel(): DiffViewModel {
  if (!diffViewModel) {
    const DiffViewModel = require('./DiffViewModel');
    diffViewModel = new DiffViewModel(uiProviders);
    invariant(subscriptions);
    subscriptions.add(diffViewModel);
  }
  return diffViewModel;
}

function activateFilePath(filePath: string): void {
  if (!filePath.length || !diffViewModel) {
    // The Diff View could be opened with no path at all.
    return;
  }
  diffViewModel.activateFile(filePath);
}

function projectsContainPath(checkPath: string): boolean {
  const {isRemote} = require('nuclide-remote-uri');
  const {Directory} = require('atom');
  return atom.project.getDirectories().some(directory => {
    const directoryPath = directory.getPath();
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

function updateToolbarCount(diffViewButton: HTMLElement, count: number): void {
  if (!changeCountElement) {
    changeCountElement = document.createElement('span');
    changeCountElement.className = 'diff-view-count';
    diffViewButton.appendChild(changeCountElement);
  }
  if (count > 0) {
    diffViewButton.classList.add('positive-count');
  } else {
    diffViewButton.classList.remove('positive-count');
  }
  const React = require('react-for-atom');
  const DiffCountComponent = require('./DiffCountComponent');
  React.render(<DiffCountComponent count={count}/>, changeCountElement);
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
        const editor = atom.workspace.getActiveTextEditor();
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
      '.nuclide-file-tree .entry.file.list-item',
      'nuclide-diff-view:open-context',
      (event) => {
        const target = getTargetFromEvent(event);
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + (target.dataset.path || ''));
      }
    ));
    subscriptions.add(atom.contextMenu.add({
      '.nuclide-file-tree .entry.file.list-item': [
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
      '.nuclide-file-tree .entry.directory.list-item',
      'nuclide-diff-view:open-context',
      (event) => {
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI);
      }
    ));
    subscriptions.add(atom.contextMenu.add({
      '.nuclide-file-tree .entry.directory.list-item': [
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
      invariant(state);
      const {activeFilePath} = state;

      // If it's a local directory, it must be loaded with packages activation.
      if (projectsContainPath(activeFilePath)) {
        atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + activeFilePath);
        return;
      }
      // If it's a remote directory, it should come on a path change event.
      const changePathsSubscription = atom.project.onDidChangePaths(() => {
        // try/catch here because in case of any error, Atom stops dispatching events to the
        // rest of the listeners, which can stop the remote editing from being functional.
        try {
          if (projectsContainPath(activeFilePath)) {
            atom.workspace.open(NUCLIDE_DIFF_VIEW_URI + activeFilePath);
            changePathsSubscription.dispose();
            invariant(subscriptions);
            subscriptions.remove(changePathsSubscription);
          }
        } catch (e) {
          getLogger().error('DiffView restore error', e);
        }
      });
      invariant(subscriptions);
      subscriptions.add(changePathsSubscription);
    }));
  },

  consumeToolBar(getToolBar: (group: string) => Object): void {
    toolBar = getToolBar('nuclide-diff-view');
    const button = toolBar.addButton({
      icon: 'git-branch',
      callback: 'nuclide-diff-view:open',
      tooltip: 'Open Diff View',
      priority: 300,
    })[0];
    const diffModel = getDiffViewModel();
    updateToolbarCount(button, diffModel.getFileChanges().size);
    invariant(subscriptions);
    subscriptions.add(diffModel.onDidChangeStatus(fileChanges => {
      updateToolbarCount(button, fileChanges.size);
    }));
  },

  getHomeFragments(): HomeFragments {
    const React = require('react-for-atom');
    return {
      feature: {
        title: 'Diff View',
        icon: 'git-branch',
        description: (
          <span>
            Launches an editable side-by-side view of the output of the Mercurial
            <code>hg diff</code> command, showing pending changes to be committed.
          </span>
        ),
        command: 'nuclide-diff-view:open',
      },
      priority: 3,
    };
  },

  serialize(): ?Object {
    if (!activeDiffView || !diffViewModel) {
      return {};
    }
    const {filePath} = diffViewModel.getActiveFileState();
    return {
      activeFilePath: filePath,
    };
  },

  deactivate(): void {
    uiProviders.splice(0);
    if (subscriptions != null) {
      subscriptions.dispose();
      subscriptions = null;
    }
    if (diffViewModel != null) {
      diffViewModel.dispose();
      diffViewModel = null;
    }
    activeDiffView = null;
    if (toolBar != null) {
      toolBar.removeItems();
      toolBar = null;
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
