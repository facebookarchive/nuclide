'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {CommitModeType, DiffModeType, UIProvider} from './types';
import type {DiffEntityOptions} from './DiffViewModel';
import type FileTreeContextMenu from '../../nuclide-file-tree/lib/FileTreeContextMenu';
import type {HomeFragments} from '../../nuclide-home/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {GetToolBar} from '../../commons-atom/suda-tool-bar';
import type {NuxTourModel} from '../../nuclide-nux/lib/NuxModel';
import type {RegisterNux, TriggerNux} from '../../nuclide-nux/lib/main';

import {CompositeDisposable, Disposable} from 'atom';
import {React, ReactDOM} from 'react-for-atom';
import invariant from 'assert';
import url from 'url';
import uiTreePath from '../../commons-atom/ui-tree-path';
import {repositoryForPath} from '../../nuclide-hg-git-bridge';
import {DiffMode, CommitMode} from './constants';
import DiffViewElement from './DiffViewElement';
import DiffViewComponent from './DiffViewComponent';
import DiffViewModel from './DiffViewModel';
import {track} from '../../nuclide-analytics';

type SerializedDiffViewState = {
  visible: false,
} | {
  visible: true,
  activeFilePath: NuclideUri,
  viewMode: DiffModeType,
  commitMode: CommitModeType,
};

let diffViewModel: ?DiffViewModel = null;
let activeDiffView: ?{
  component: React.Component<any, any, any>,
  element: HTMLElement,
} = null;

let tryTriggerNuxService: ?TriggerNux;

// This url style is the one Atom uses for the welcome and settings pages.
const NUCLIDE_DIFF_VIEW_URI = 'atom://nuclide/diff-view';
const DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY = 1000;
const COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1100;
const AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY = 1200;
const PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY = 1300;

// Diff View NUX constants.
export const NUX_DIFF_VIEW_ID = 4368;
const NUX_DIFF_VIEW_NAME = 'nuclide_diff_view_nux';
const NUX_DIFF_VIEW_GK = 'mp_nuclide_diff_view_nux';

const uiProviders: Array<UIProvider> = [];

let subscriptions: ?CompositeDisposable = null;
let cwdApi: ?CwdApi = null;

function formatDiffViewUrl(diffEntityOptions_?: ?DiffEntityOptions): string {
  let diffEntityOptions = diffEntityOptions_;
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
// This pattern is also followed with atom's TextEditor.
function createView(
  diffEntityOptions: DiffEntityOptions,
  // A bound instance of the triggerNuxService that will try to trigger the Diff View NUX
  triggerNuxService: () => void,
): HTMLElement {
  if (activeDiffView) {
    activateDiffPath(diffEntityOptions);
    return activeDiffView.element;
  }

  const diffModel = getDiffViewModel();
  diffModel.activate();
  const hostElement = new DiffViewElement().initialize(diffModel, NUCLIDE_DIFF_VIEW_URI);
  const component = ReactDOM.render(
    <DiffViewComponent
      diffModel={diffModel}
      tryTriggerNux={triggerNuxService}
    />,
    hostElement,
  );
  activeDiffView = {
    component,
    element: hostElement,
  };
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
  subscriptions.add(
    new Disposable(() => { hostElement.destroy(); }),
    destroySubscription,
  );


  track('diff-view-open');

  return hostElement;
}

function getDiffViewModel(): DiffViewModel {
  if (diffViewModel == null) {
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
  if (!diffEntityOptions.file && !diffEntityOptions.directory && cwdApi != null) {
    const directory = cwdApi.getCwd();
    if (directory != null) {
      diffEntityOptions.directory = directory.getPath();
    }
  }
  diffViewModel.diffEntity(diffEntityOptions);
}

function diffActivePath(diffOptions?: Object): void {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    atom.workspace.open(formatDiffViewUrl(diffOptions));
  } else {
    atom.workspace.open(formatDiffViewUrl({
      file: editor.getPath() || '',
      ...diffOptions,
    }));
  }
}

function isActiveEditorDiffable(): boolean {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    return false;
  }
  return isPathDiffable(editor.getPath());
}

function shouldDisplayDiffTreeItem(contextMenu: FileTreeContextMenu): boolean {
  const node = contextMenu.getSingleSelectedNode();
  return node != null && isPathDiffable(node.uri);
}

function isPathDiffable(filePath: ?string): boolean {
  if (filePath == null || filePath.length === 0) {
    return false;
  }
  const repository = repositoryForPath(filePath);
  return repository != null && repository.getType() === 'hg';
}

// Listen for file tree context menu file item events to open the diff view.
function addFileTreeCommands(commandName: string, diffOptions?: Object): void {
  invariant(subscriptions);
  subscriptions.add(atom.commands.add(
    '.tree-view .entry.file.list-item',
    commandName,
    event => {
      const filePath = uiTreePath(event);
      atom.workspace.open(formatDiffViewUrl({
        file: filePath || '',
        ...diffOptions,
      }));
    },
  ));

  subscriptions.add(atom.commands.add(
    '.tree-view .entry.directory.list-nested-item > .list-item',
    commandName,
    event => {
      const directoryPath = uiTreePath(event);
      atom.workspace.open(formatDiffViewUrl({
        directory: directoryPath || '',
        ...diffOptions,
      }));
    },
  ));
}

function addActivePathCommands(commandName: string, diffOptions?: Object) {
  invariant(subscriptions);

  function onTargetCommand(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    diffActivePath(diffOptions);
  }

  subscriptions.add(atom.commands.add(
    'atom-workspace',
    commandName,
    onTargetCommand,
  ));
  // Listen for in-editor context menu item diff view open command.
  subscriptions.add(atom.commands.add(
    'atom-text-editor',
    commandName,
    onTargetCommand,
  ));
}

export function activate(state: ?SerializedDiffViewState): void {
  subscriptions = new CompositeDisposable();
  // Listen for menu item workspace diff view open command.
  addActivePathCommands('nuclide-diff-view:open');
  addActivePathCommands('nuclide-diff-view:commit', {
    viewMode: DiffMode.COMMIT_MODE,
    commitMode: CommitMode.COMMIT,
  });
  addActivePathCommands('nuclide-diff-view:amend', {
    viewMode: DiffMode.COMMIT_MODE,
    commitMode: CommitMode.AMEND,
  });
  addActivePathCommands('nuclide-diff-view:publish', {
    viewMode: DiffMode.PUBLISH_MODE,
  });

  // Context Menu Items.
  subscriptions.add(atom.contextMenu.add({
    'atom-text-editor': [
      {type: 'separator'},
      {
        label: 'Source Control',
        submenu: [
          {
            label: 'Open in Diff View',
            command: 'nuclide-diff-view:open',
          },
          {
            label: 'Commit',
            command: 'nuclide-diff-view:commit',
          },
          {
            label: 'Amend',
            command: 'nuclide-diff-view:amend',
          },
          {
            label: 'Publish to Phabricator',
            command: 'nuclide-diff-view:publish',
          },
        ],
        shouldDisplay() {
          return isActiveEditorDiffable();
        },
      },
      {type: 'separator'},
    ],
  }));

  // Listen for switching to editor mode for the active file.
  subscriptions.add(atom.commands.add(
    'nuclide-diff-view',
    'nuclide-diff-view:switch-to-editor',
    () => {
      const diffModel = getDiffViewModel();
      const {filePath} = diffModel.getState();
      if (filePath != null && filePath.length) {
        atom.workspace.open(filePath);
      }
    },
  ));

  addFileTreeCommands('nuclide-diff-view:open-context');
  addFileTreeCommands('nuclide-diff-view:commit-context', {
    viewMode: DiffMode.COMMIT_MODE,
    commitMode: CommitMode.COMMIT,
  });
  addFileTreeCommands('nuclide-diff-view:amend-context', {
    viewMode: DiffMode.COMMIT_MODE,
    commitMode: CommitMode.AMEND,
  });
  addFileTreeCommands('nuclide-diff-view:publish-context', {
    viewMode: DiffMode.PUBLISH_MODE,
  });

  // The Diff View will open its main UI in a tab, like Atom's preferences and welcome pages.
  subscriptions.add(atom.workspace.addOpener(uri => {
    if (uri.startsWith(NUCLIDE_DIFF_VIEW_URI)) {
      if (!require('semver').gte(atom.getVersion(), '1.6.1')) {
        throw new Error(
          'Outdated Atom version<br/>\n' +
          '**Nuclide\'s Diff View require Atom 1.6.1 or later**',
        );
      }
      const {query: diffEntityOptions} = url.parse(uri, true);
      return createView(
        (diffEntityOptions: any),
        this.triggerNux.bind(this, NUX_DIFF_VIEW_ID),
      );
    }
  }));

  if (state == null || !state.visible) {
    return;
  }

  const {activeFilePath, viewMode, commitMode} = state;

  // Wait for the source control providers to be ready:
  const restorationSubscriptions = new CompositeDisposable(
    // If it's a local directory, or if "nuclide-hg-repository" was activated
    // after "nuclide-diff-view":
    atom.packages.serviceHub.consume('atom.repository-provider', '^0.1.0', () => {
      tryRestoreActiveDiffView();
    }),
    // If it's a remote directory, it should come on a path change event:
    atom.project.onDidChangePaths(() => {
      tryRestoreActiveDiffView();
    }),
  );
  subscriptions.add(restorationSubscriptions);

  function tryRestoreActiveDiffView() {
    // If there is no repository ready, it may be because it's a remote file,
    // or because "nuclide-hg-repository" hasn't loaded yet.
    const canRestoreActiveDiffView = activeFilePath ?
      isPathDiffable(activeFilePath) :
      atom.project.getDirectories().some(directory => {
        return isPathDiffable(directory.getPath());
      });
    if (canRestoreActiveDiffView) {
      restorationSubscriptions.dispose();
      invariant(subscriptions);
      subscriptions.remove(restorationSubscriptions);
      atom.workspace.open(formatDiffViewUrl({
        file: activeFilePath,
        viewMode,
        commitMode,
      }));
    }
  }
}

export function consumeToolBar(getToolBar: GetToolBar): IDisposable {
  const toolBar = getToolBar('nuclide-diff-view');
  const button = toolBar.addButton({
    icon: 'git-branch',
    callback: 'nuclide-diff-view:open',
    tooltip: 'Open Diff View',
    priority: 300,
  }).element;
  button.classList.add('diff-view-count');

  const diffModel = getDiffViewModel();
  let lastCount = null;
  const updateToolbarCount = () => {
    const count = diffModel.getState().dirtyFileChanges.size;
    if (count !== lastCount) {
      button.classList.toggle('positive-count', count > 0);
      button.classList.toggle('max-count', count > 99);
      button.dataset.count = count === 0 ? '' : (count > 99 ? '99+' : String(count));
      lastCount = count;
    }
  };
  updateToolbarCount();

  const toolBarSubscriptions = new CompositeDisposable(
    diffModel.onDidUpdateState(() => { updateToolbarCount(); }),
    new Disposable(() => { toolBar.removeItems(); }),
  );
  invariant(subscriptions);
  subscriptions.add(toolBarSubscriptions);
  return toolBarSubscriptions;
}

export function getHomeFragments(): HomeFragments {
  return {
    feature: {
      title: 'Diff View',
      icon: 'git-branch',
      description: (
        <span>
          Launches an editable side-by-side compare view across mercurial dirty and commits
          changes, allowing committing and pushing changes to phabricator.
        </span>
      ),
      command: 'nuclide-diff-view:open',
    },
    priority: 3,
  };
}

export function serialize(): SerializedDiffViewState {
  if (!activeDiffView || !diffViewModel) {
    return {
      visible: false,
    };
  }
  const {commitMode, filePath, viewMode} = diffViewModel.getState();
  return {
    visible: true,
    activeFilePath: filePath,
    viewMode,
    commitMode,
  };
}

export function deactivate(): void {
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
}

/**
 * The diff-view package can consume providers that return React components to
 * be rendered inline.
 * A uiProvider must have a method composeUiElements with the following spec:
 * @param filePath The path of the file the diff view is opened for
 * @return An array of InlineComments (defined above) to be rendered into the
 *         diff view
 */
export function consumeUIProvider(provider: UIProvider) {
  uiProviders.push(provider);
  if (diffViewModel != null) {
    diffViewModel.setUiProviders(uiProviders);
  }
  return;
}

export function consumeCwdApi(api: CwdApi): void {
  cwdApi = api;
}

export function addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
  invariant(subscriptions);
  const menuItemDescriptions = new CompositeDisposable();
  menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu(
    {
      label: 'Open in Diff View',
      command: 'nuclide-diff-view:open-context',
      shouldDisplay() {
        return shouldDisplayDiffTreeItem(contextMenu);
      },
    },
    DIFF_VIEW_FILE_TREE_CONTEXT_MENU_PRIORITY,
  ));
  menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu(
    {
      label: 'Commit',
      command: 'nuclide-diff-view:commit-context',
      shouldDisplay() {
        return shouldDisplayDiffTreeItem(contextMenu);
      },
    },
    COMMIT_FILE_TREE_CONTEXT_MENU_PRIORITY,
  ));
  menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu(
    {
      label: 'Amend',
      command: 'nuclide-diff-view:amend-context',
      shouldDisplay() {
        return shouldDisplayDiffTreeItem(contextMenu);
      },
    },
    AMEND_FILE_TREE_CONTEXT_MENU_PRIORITY,
  ));
  menuItemDescriptions.add(contextMenu.addItemToSourceControlMenu(
    {
      label: 'Publish to Phabricator',
      command: 'nuclide-diff-view:publish-context',
      shouldDisplay() {
        return shouldDisplayDiffTreeItem(contextMenu);
      },
    },
    PUBLISH_FILE_TREE_CONTEXT_MENU_PRIORITY,
  ));

  subscriptions.add(menuItemDescriptions);

  // We don't need to dispose of the menuItemDescriptions when the provider is disabled -
  // it needs to be handled by the provider itself. We only should remove it from the list
  // of the disposables we maintain.
  return new Disposable(() => {
    if (subscriptions != null) {
      subscriptions.remove(menuItemDescriptions);
    }
  });
}

export function __getActiveDiffView() {
  return activeDiffView;
}

export function triggerNux(nuxID: number): void {
  if (tryTriggerNuxService != null) {
    tryTriggerNuxService(nuxID);
  }
}

export function tryTriggerNux(nuxID: number): void {
  if (tryTriggerNuxService != null) {
    tryTriggerNuxService(nuxID);
  }
}

export function consumeRegisterNuxService(addNewNux: RegisterNux): IDisposable {
  const disposable = addNewNux(_createDiffViewNux());
  invariant(subscriptions != null);
  subscriptions.add(disposable);
  return disposable;
}

export function consumeTriggerNuxService(triggerNuxService: TriggerNux): void {
  tryTriggerNuxService = triggerNuxService;
}

function _createDiffViewNux(): NuxTourModel {

  const diffViewFilesNux = {
    content: 'View the list of newly added and modified files.',
    selector: '.nuclide-diff-view-tree',
    position: 'top',
  };

  const diffViewTimelineNux = {
    content: 'Compare, commit and amend revisions!',
    selector: '.nuclide-diff-timeline',
    position: 'top',
  };

  const diffViewEditButtonNux = {
    content: 'Want to make changes? Click here to open the file in an editor.',
    selector: '.nuclide-diff-view-goto-editor-button',
    position: 'left',
  };

  const diffViewPhabricatorNux = {
    content: 'Publish your changes to Phabricator without leaving Nuclide!',
    selector: '.nuclide-diff-timeline .revision-timeline-wrap .btn',
    position: 'bottom',
  };

  const diffViewNuxTour = {
    id: NUX_DIFF_VIEW_ID,
    name: NUX_DIFF_VIEW_NAME,
    gatekeeperID: NUX_DIFF_VIEW_GK,
    nuxList: [
      diffViewFilesNux,
      diffViewTimelineNux,
      diffViewEditButtonNux,
      diffViewPhabricatorNux,
    ],
  };

  return diffViewNuxTour;
}
