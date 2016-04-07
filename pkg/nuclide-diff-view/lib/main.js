'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DiffViewModelType, {DiffEntityOptions} from './DiffViewModel';
import type FileTreeContextMenu from '../../nuclide-file-tree/lib/FileTreeContextMenu';
import type {HomeFragments} from '../../nuclide-home-interfaces';
import type OutputService from '../../nuclide-console/lib/OutputService';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {
  UIProvider,
} from '../../nuclide-diff-ui-provider-interfaces';

import {CompositeDisposable, Directory} from 'atom';
import invariant from 'assert';
import url from 'url';
import nuclideFeatures from '../../../lib/nuclideFeatures';
import {getFileTreePathFromTargetEvent} from './utils';
import {getLogger} from '../../nuclide-logging';

let diffViewModel: ?DiffViewModelType = null;
let activeDiffView: ?{
  component: ReactComponent;
  element: HTMLElement;
}  = null;

// This url style is the one Atom uses for the welcome and settings pages.
const NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
const DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY = 1000;
const uiProviders: Array<UIProvider> = [];

let subscriptions: ?CompositeDisposable = null;
let toolBar: ?any = null;
let changeCountElement: ?HTMLElement = null;
let cwdApi: ?CwdApi = null;

function formatDiffViewUrl(diffEntityOptions?: ?DiffEntityOptions): string {
  if (diffEntityOptions == null) {
    diffEntityOptions = {file: ''};
  }
  return url.format({
    protocol: 'atom',
    host: 'nuclide',
    pathname: 'diff-view',
    slashes: true,
    query: diffEntityOptions,
  });
}


// To add a View as an Atom workspace pane, we return `DiffViewElement` which extends `HTMLElement`.
// This pattetn is also followed with atom's TextEditor.
function createView(diffEntityOptions: DiffEntityOptions): HTMLElement {
  if (activeDiffView) {
    activateDiffPath(diffEntityOptions);
    return activeDiffView.element;
  }

  const {
    React,
    ReactDOM,
  } = require('react-for-atom');
  const DiffViewElement = require('./DiffViewElement');
  const DiffViewComponent = require('./DiffViewComponent');

  const diffModel = getDiffViewModel();
  const hostElement = new DiffViewElement().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
  const component = ReactDOM.render(
    <DiffViewComponent diffModel={diffModel} />,
    hostElement,
  );
  activeDiffView = {
    component,
    element: hostElement,
  };
  diffModel.activate();
  activateDiffPath(diffEntityOptions);

  const destroySubscription = hostElement.onDidDestroy(() => {
    ReactDOM.unmountComponentAtNode(hostElement);
    diffModel.deactivate();
    destroySubscription.dispose();
    invariant(subscriptions);
    subscriptions.remove(destroySubscription);
    activeDiffView = null;
  });

  invariant(subscriptions);
  subscriptions.add(destroySubscription);

  const {track} = require('../../nuclide-analytics');
  track('diff-view-open');

  return hostElement;
}

function getDiffViewModel(): DiffViewModelType {
  if (diffViewModel == null) {
    const DiffViewModel = require('./DiffViewModel');
    diffViewModel = new DiffViewModel();
    diffViewModel.setUiProviders(uiProviders);
    invariant(subscriptions);
    subscriptions.add(diffViewModel);
  }
  return diffViewModel;
}

function activateDiffPath(diffEntityOptions: DiffEntityOptions): void {
  if (diffViewModel == null) {
    return;
  }
  let validDiffEntityOptions = null;
  if (diffEntityOptions.file || diffEntityOptions.directory) {
    validDiffEntityOptions = diffEntityOptions;
  } else if (cwdApi != null) {
    const directory = cwdApi.getCwd();
    if (directory != null) {
      validDiffEntityOptions = {directory: directory.getPath()};
    }
  }
  if (validDiffEntityOptions != null) {
    diffViewModel.diffEntity(validDiffEntityOptions);
  }
}

function projectsContainPath(checkPath: string): boolean {
  const {isRemote} = require('../../nuclide-remote-uri');
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
  const {
    React,
    ReactDOM,
  } = require('react-for-atom');
  const DiffCountComponent = require('./DiffCountComponent');
  ReactDOM.render(<DiffCountComponent count={count} />, changeCountElement);
}

function diffActiveTextEditor(): void {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    atom.workspace.open(formatDiffViewUrl());
  } else {
    atom.workspace.open(formatDiffViewUrl({file: editor.getPath() || ''}));
  }
}

module.exports = {

  activate(state: ?any): void {
    subscriptions = new CompositeDisposable();
    // Listen for menu item workspace diff view open command.
    subscriptions.add(atom.commands.add(
      'atom-workspace',
      'nuclide-diff-view:open',
      diffActiveTextEditor,
    ));
    // Listen for in-editor context menu item diff view open command.
    subscriptions.add(atom.commands.add(
      'atom-text-editor',
      'nuclide-diff-view:open',
      diffActiveTextEditor,
    ));

    // Listen for switching to editor mode for the active file.
    subscriptions.add(atom.commands.add(
      'nuclide-diff-view',
      'nuclide-diff-view:switch-to-editor',
      () => {
        const diffModel = getDiffViewModel();
        const {filePath} = diffModel.getActiveFileState();
        if (filePath != null && filePath.length) {
          atom.workspace.open(filePath);
        }
      }
    ));

    // Listen for file tree context menu file item events to open the diff view.
    subscriptions.add(atom.commands.add(
      '.tree-view .entry.file.list-item',
      'nuclide-diff-view:open-context',
      event => {
        const filePath = getFileTreePathFromTargetEvent(event);
        atom.workspace.open(formatDiffViewUrl({file: filePath || ''}));
      }
    ));

    // Listen for file tree context menu directory item events to open the diff view.
    subscriptions.add(atom.commands.add(
      '.tree-view .entry.directory.list-nested-item > .list-item',
      'nuclide-diff-view:open-context',
      event => {
        const directoryPath = getFileTreePathFromTargetEvent(event);
        atom.workspace.open(formatDiffViewUrl({directory: directoryPath || ''}));
      }
    ));

    // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
    subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
        const {query: diffEntityOptions} = url.parse(uri, true);
        return createView((diffEntityOptions: any));
      }
    }));

    if (!state || !state.activeFilePath) {
      return;
    }

    // Wait for all source control providers to register.
    subscriptions.add(nuclideFeatures.onDidActivateInitialFeatures(() => {
      invariant(state);
      const {activeFilePath} = state;

      // If it's a local directory, it must be loaded with packages activation.
      if (projectsContainPath(activeFilePath)) {
        atom.workspace.open(formatDiffViewUrl({file: activeFilePath}));
        return;
      }
      // If it's a remote directory, it should come on a path change event.
      // The change handler is delayed to break the race with the `DiffViewModel` subscription.
      const changePathsSubscription = atom.project.onDidChangePaths(() => setTimeout(() => {
        // try/catch here because in case of any error, Atom stops dispatching events to the
        // rest of the listeners, which can stop the remote editing from being functional.
        try {
          if (projectsContainPath(activeFilePath)) {
            atom.workspace.open(formatDiffViewUrl({file: activeFilePath}));
            changePathsSubscription.dispose();
            invariant(subscriptions);
            subscriptions.remove(changePathsSubscription);
          }
        } catch (e) {
          getLogger().error('DiffView restore error', e);
        }
      }, 10));
      invariant(subscriptions);
      subscriptions.add(changePathsSubscription);
    }));
  },

  consumeOutputService(api: OutputService): IDisposable {
    return api.registerOutputProvider({
      source: 'diff view',
      messages: getDiffViewModel().getMessages(),
    });
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
    updateToolbarCount(button, diffModel.getState().dirtyFileChanges.size);
    invariant(subscriptions);
    subscriptions.add(diffModel.onDidUpdateState(() => {
      updateToolbarCount(button, diffModel.getState().dirtyFileChanges.size);
    }));
  },

  getHomeFragments(): HomeFragments {
    const {React} = require('react-for-atom');
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

  /**
   * The diff-view package can consume providers that return React components to
   * be rendered inline.
   * A uiProvider must have a method composeUiElements with the following spec:
   * @param filePath The path of the file the diff view is opened for
   * @return An array of InlineComments (defined above) to be rendered into the
   *         diff view
   */
  consumeUIProvider(provider: UIProvider) {
    uiProviders.push(provider);
    if (diffViewModel != null) {
      diffViewModel.setUiProviders(uiProviders);
    }
    return;
  },

  consumeCwdApi(api: CwdApi): void {
    cwdApi = api;
  },

  addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
    invariant(subscriptions);
    const menuItemDescriptions = new CompositeDisposable();
    menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu(
      {
        label: 'Open in Diff View',
        command: 'nuclide-diff-view:open-context',
      },
      DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY,
    ));
    subscriptions.add(menuItemDescriptions);
    return menuItemDescriptions;
  },

  get __testDiffView() {
    return activeDiffView;
  },
};
