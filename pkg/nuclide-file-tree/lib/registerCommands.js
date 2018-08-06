/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {Store} from '../redux/types';

import {COMMANDS_SELECTOR} from './FileTreeConstants';
import FileTreeActions from './FileTreeActions';
import * as Selectors from './FileTreeSelectors';
import nuclideUri from 'nuclide-commons/nuclideUri';
import getElementFilePath from 'nuclide-commons-atom/getElementFilePath';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';

import {shell} from 'electron';

import invariant from 'assert';

const VALID_FILTER_CHARS =
  '!#./0123456789-:;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
  '_abcdefghijklmnopqrstuvwxyz~';

export default function registerCommands(
  store: Store,
  actions: FileTreeActions,
): IDisposable {
  const disposables = new UniversalDisposable();

  // Subsequent root directories updated on change
  disposables.add(
    atom.project.onDidChangePaths(() => {
      actions.updateRootDirectories();
    }),
    atom.commands.add('atom-workspace', {
      'tree-view:reveal-active-file': (event: Event) => {
        revealActiveFile(event, actions);
      },
      'tree-view:recursive-collapse-all': () => {
        actions.collapseAll();
      },
      'tree-view:add-file-relative': () => {
        actions.openAddFileDialogRelative(filePath => {
          actions.openAndRevealFilePath(filePath);
        });
      },
    }),
  );
  const letterKeyBindings = {
    'tree-view:remove-letter': () => {
      if (!store.getState().usePrefixNav()) {
        return;
      }
      actions.removeFilterLetter();
    },
    'tree-view:clear-filter': () => actions.clearFilter(),
  };
  for (
    let i = 0, c = VALID_FILTER_CHARS.charCodeAt(0);
    i < VALID_FILTER_CHARS.length;
    i++, c = VALID_FILTER_CHARS.charCodeAt(i)
  ) {
    const char = String.fromCharCode(c);
    letterKeyBindings[`tree-view:go-to-letter-${char}`] = () => {
      if (!store.getState().usePrefixNav()) {
        return;
      }
      actions.addFilterLetter(char);
    };
  }
  disposables.add(
    atom.commands.add(COMMANDS_SELECTOR, {
      'core:move-down': () => {
        actions.moveSelectionDown();
      },
      'core:move-up': () => {
        actions.moveSelectionUp();
      },
      'core:move-to-top': () => {
        actions.moveSelectionToTop();
      },
      'core:move-to-bottom': () => {
        actions.moveSelectionToBottom();
      },
      'core:select-up': () => {
        actions.rangeSelectUp();
      },
      'core:select-down': () => {
        actions.rangeSelectDown();
      },
      'tree-view:add-file': () => {
        actions.openAddFileDialog(filePath => {
          actions.openAndRevealFilePath(filePath);
        });
      },
      'tree-view:add-folder': () => {
        actions.openAddFolderDialog(filePath => {
          actions.openAndRevealDirectoryPath(filePath);
        });
      },
      'tree-view:collapse-directory': () => {
        actions.collapseSelection(false);
      },
      'tree-view:recursive-collapse-directory': () => {
        actions.collapseSelection(true);
      },
      'tree-view:expand-directory': () => {
        actions.expandSelection(false);
      },
      'tree-view:recursive-expand-directory': () => {
        actions.expandSelection(true);
      },
      'tree-view:open-selected-entry': () => {
        actions.openSelectedEntry();
      },
      'tree-view:open-selected-entry-up': () => {
        actions.openSelectedEntrySplitUp();
      },
      'tree-view:open-selected-entry-down': () => {
        actions.openSelectedEntrySplitDown();
      },
      'tree-view:open-selected-entry-left': () => {
        actions.openSelectedEntrySplitLeft();
      },
      'tree-view:open-selected-entry-right': () => {
        actions.openSelectedEntrySplitRight();
      },
      'tree-view:remove': () => {
        actions.deleteSelection();
      },
      'core:delete': () => {
        actions.deleteSelection();
      },
      'tree-view:remove-project-folder-selection': () => {
        actions.removeRootFolderSelection();
      },
      'tree-view:rename-selection': () => {
        actions.openRenameDialog();
      },
      'tree-view:duplicate-selection': () => {
        actions.openDuplicateDialog(filePaths => {
          actions.openAndRevealFilePaths(filePaths);
        });
      },
      'tree-view:copy-selection': () => {
        actions.copyFilenamesWithDir();
      },
      'tree-view:paste-selection': () => {
        actions.openPasteDialog();
      },
      'tree-view:search-in-directory': (event: Event) => {
        searchInDirectory(event, store);
      },
      'tree-view:set-current-working-root': () => {
        actions.setCwdToSelection();
      },
      ...letterKeyBindings,
    }),
    atom.commands.add('atom-workspace', {
      // eslint-disable-next-line nuclide-internal/atom-apis
      'file:copy-full-path': copyFullPath,
      // eslint-disable-next-line nuclide-internal/atom-apis
      'file:show-in-file-manager': showInFileManager,
    }),
  );

  return disposables;
}

function copyFullPath(event: Event): void {
  const path = getElementFilePath(((event.target: any): HTMLElement), true);
  if (path == null) {
    return;
  }
  const parsed = nuclideUri.parse(path);
  atom.clipboard.write(parsed.path);
}

function revealActiveFile(event: Event, actions: FileTreeActions): void {
  let path = getElementFilePath(((event.target: any): HTMLElement), true);

  if (path == null) {
    // If there's no path attached to the element element or active text edtior,
    // check if the Currently active pane resembles a text editor.
    const paneItem = atom.workspace.getActivePaneItem();
    // hacky, but covers at LEAST ImageEditor
    if (paneItem != null && typeof paneItem.getPath === 'function') {
      path = paneItem.getPath();
    }
    if (path == null) {
      return;
    }
  }

  actions.revealFilePath(path);
}

function searchInDirectory(event: Event, store: Store): void {
  const targetElement = ((event.target: any): HTMLElement);
  // If the event was sent to the entire tree, rather then a single element - attempt to derive
  // the path to work on from the current selection.
  if (targetElement.classList.contains('nuclide-file-tree')) {
    const node = Selectors.getSingleSelectedNode(store.getState());
    if (node == null) {
      return;
    }

    let path = node.uri;
    if (!node.isContainer) {
      invariant(node.parent);
      path = node.parent.uri;
    }

    // What we see here is an unfortunate example of "DOM as an API" paradigm :-(
    // Atom's handler for the "show-in-current-directory" command is context sensitive
    // and it derives the context from the custom "data-path" attribute. The attribute must
    // be present on a child of a closest element having a ".directory" class.
    // See: https://github.com/atom/find-and-replace/blob/v0.208.1/lib/project-find-view.js#L356-L360
    // We will just temporarily create a proper element for the event handler to work on
    // and remove it immediately afterwards.
    const temporaryElement = document.createElement('div');
    temporaryElement.classList.add('directory');
    const pathChild = document.createElement('div');
    pathChild.dataset.path = path;
    temporaryElement.appendChild(pathChild);

    // Must attach to the workspace-view, otherwise the handler won't be found
    const workspaceView = atom.views.getView(atom.workspace);
    workspaceView.appendChild(temporaryElement);

    atom.commands.dispatch(
      temporaryElement,
      'project-find:show-in-current-directory',
    );

    // Cleaning for the workspace-view
    workspaceView.removeChild(temporaryElement);
  } else {
    atom.commands.dispatch(
      targetElement,
      'project-find:show-in-current-directory',
    );
  }
}

function showInFileManager(event: Event): void {
  const path = getElementFilePath(((event.target: any): HTMLElement), true);
  if (path == null || nuclideUri.isRemote(path)) {
    return;
  }
  shell.showItemInFolder(path);
}
