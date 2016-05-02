'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type FileTreeContextMenu from '../../nuclide-file-tree/lib/FileTreeContextMenu';
import type {
  HgRepositoryClient,
  HgRepositoryClientAsync,
} from '../../nuclide-hg-repository-client';
import type {NuclideUri} from '../../nuclide-remote-uri';

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import {repositoryForPath} from '../../nuclide-hg-git-bridge';
import {track} from '../../nuclide-analytics';

const HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1050;
let subscriptions: ?CompositeDisposable = null;

// A file is revertable if it's changed.
// A directory is revertable if it contains changed files.
function shouldDisplayRevertTreeItem(contextMenu: FileTreeContextMenu): boolean {
  const node = contextMenu.getSingleSelectedNode();
  if (node == null || node.repo == null || node.repo.getType() !== 'hg') {
    return false;
  }
  const hgRepository: HgRepositoryClient = (node.repo: any);
  return hgRepository.isStatusModified(node.vcsStatusCode);
}

function isActivePathRevertable(): boolean {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null || !editor.getPath()) {
    return false;
  }
  const filePath = editor.getPath() || '';
  const repository = repositoryForPath(filePath);
  if (repository == null || repository.getType() !== 'hg') {
    return false;
  }
  const hgRepository: HgRepositoryClient = (repository : any);
  return hgRepository.isPathModified(filePath);
}

function revertActivePath(): void {
  const editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    atom.notifications.addError('No active text editor to revert!');
  } else {
    revertPath(editor.getPath());
  }
}

async function revertPath(nodePath: ?NuclideUri): Promise<void> {
  if (nodePath == null || nodePath.length === 0) {
    atom.notifications.addError('Cannot revert an empty path!');
    return;
  }
  const repository = repositoryForPath(nodePath);
  if (repository == null || repository.getType() !== 'hg') {
    atom.notifications.addError('Cannot revert a non-mercurial repository path');
    return;
  }
  track('hg-repository-revert', {nodePath});
  const hgRepositoryAsync: HgRepositoryClientAsync = (repository : any).async;
  try {
    await hgRepositoryAsync.checkoutHead(nodePath);
    atom.notifications.addSuccess(
      `Reverted \`${repository.relativize(nodePath)}\` successfully.`
    );
  } catch (error) {
    atom.notifications.addError(
      `Failed to revert \`${repository.relativize(nodePath)}\``,
      {detail: error.message},
    );
  }
}

export function activate(state: any): void {
  subscriptions = new CompositeDisposable();

  subscriptions.add(atom.commands.add(
    'atom-workspace',
    'nuclide-hg-repository:revert',
    revertActivePath,
  ));

  // Text editor context menu items.
  subscriptions.add(atom.contextMenu.add({
    'atom-text-editor': [
      {type: 'separator'},
      {
        label: 'Source Control',
        submenu: [
          {
            label: 'Revert',
            command: 'nuclide-hg-repository:revert',
          },
        ],
        shouldDisplay() {
          return isActivePathRevertable();
        },
      },
      {type: 'separator'},
    ],
  }));
}

export function addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
  invariant(subscriptions);

  const contextDisposable = contextMenu.addItemToSourceControlMenu(
    {
      label: 'Revert',
      callback() {
        // TODO(most): support reverting multiple nodes at once.
        const revertNode = contextMenu.getSingleSelectedNode();
        revertPath(revertNode == null ? null : revertNode.uri);
      },
      shouldDisplay() {
        return shouldDisplayRevertTreeItem(contextMenu);
      },
    },
    HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY,
  );

  subscriptions.add(contextDisposable);

  return new Disposable(() => {
    if (subscriptions != null) {
      subscriptions.remove(contextDisposable);
    }
  });
}

export function deactivate(state: any): void {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}

export function createHgRepositoryProvider() {
  const {HgRepositoryProvider} = require('./HgRepositoryProvider');
  return new HgRepositoryProvider();
}
