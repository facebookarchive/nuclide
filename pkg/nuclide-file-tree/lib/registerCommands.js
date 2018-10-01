"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = registerCommands;

function _FileTreeConstants() {
  const data = require("./FileTreeConstants");

  _FileTreeConstants = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("./redux/Selectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function Actions() {
  const data = _interopRequireWildcard(require("./redux/Actions"));

  Actions = function () {
    return data;
  };

  return data;
}

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

function _getElementFilePath() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons-atom/getElementFilePath"));

  _getElementFilePath = function () {
    return data;
  };

  return data;
}

function _UniversalDisposable() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/UniversalDisposable"));

  _UniversalDisposable = function () {
    return data;
  };

  return data;
}

var _electron = require("electron");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */
const VALID_FILTER_CHARS = '!#./0123456789-:;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '_abcdefghijklmnopqrstuvwxyz~';

function registerCommands(store) {
  const disposables = new (_UniversalDisposable().default)(); // Subsequent root directories updated on change

  disposables.add(atom.project.onDidChangePaths(() => {
    store.dispatch(Actions().updateRootDirectories());
  }), atom.commands.add('atom-workspace', {
    'tree-view:reveal-active-file': event => {
      revealActiveFile(event, store);
    },
    'tree-view:recursive-collapse-all': () => {
      store.dispatch(Actions().collapseAll());
    },
    'tree-view:add-file-relative': () => {
      store.dispatch(Actions().openAddFileDialogRelative(filePath => {
        store.dispatch(Actions().openAndRevealFilePath(filePath));
      }));
    }
  }));
  const letterKeyBindings = {
    'tree-view:remove-letter': () => {
      if (!Selectors().usePrefixNav(store.getState())) {
        return;
      }

      store.dispatch(Actions().removeFilterLetter());
    },
    'tree-view:clear-filter': () => {
      store.dispatch(Actions().clearFilter());
    }
  };

  for (let i = 0, c = VALID_FILTER_CHARS.charCodeAt(0); i < VALID_FILTER_CHARS.length; i++, c = VALID_FILTER_CHARS.charCodeAt(i)) {
    const char = String.fromCharCode(c);

    letterKeyBindings[`tree-view:go-to-letter-${char}`] = () => {
      if (!Selectors().usePrefixNav(store.getState())) {
        return;
      }

      store.dispatch(Actions().addFilterLetter(char));
    };
  }

  disposables.add(atom.commands.add(_FileTreeConstants().COMMANDS_SELECTOR, Object.assign({
    'core:move-down': () => {
      store.dispatch(Actions().moveSelectionDown());
    },
    'core:move-up': () => {
      store.dispatch(Actions().moveSelectionUp());
    },
    'core:move-to-top': () => {
      store.dispatch(Actions().moveSelectionToTop());
    },
    'core:move-to-bottom': () => {
      store.dispatch(Actions().moveSelectionToBottom());
    },
    'core:select-up': () => {
      store.dispatch(Actions().rangeSelectUp());
    },
    'core:select-down': () => {
      store.dispatch(Actions().rangeSelectDown());
    },
    'tree-view:add-file': () => {
      store.dispatch(Actions().openAddFileDialog(filePath => {
        store.dispatch(Actions().openAndRevealFilePath(filePath));
      }));
    },
    'tree-view:add-folder': () => {
      store.dispatch(Actions().openAddFolderDialog(filePath => {
        store.dispatch(Actions().openAndRevealDirectoryPath(filePath));
      }));
    },
    'tree-view:collapse-directory': () => {
      store.dispatch(Actions().collapseSelection(false));
    },
    'tree-view:recursive-collapse-directory': () => {
      store.dispatch(Actions().collapseSelection(true));
    },
    'tree-view:expand-directory': () => {
      store.dispatch(Actions().expandSelection(false));
    },
    'tree-view:recursive-expand-directory': () => {
      store.dispatch(Actions().expandSelection(true));
    },
    'tree-view:open-selected-entry': () => {
      store.dispatch(Actions().openSelectedEntry());
    },
    'tree-view:open-selected-entry-up': () => {
      store.dispatch(Actions().openSelectedEntrySplitUp());
    },
    'tree-view:open-selected-entry-down': () => {
      store.dispatch(Actions().openSelectedEntrySplitDown());
    },
    'tree-view:open-selected-entry-left': () => {
      store.dispatch(Actions().openSelectedEntrySplitLeft());
    },
    'tree-view:open-selected-entry-right': () => {
      store.dispatch(Actions().openSelectedEntrySplitRight());
    },
    'tree-view:remove': () => {
      store.dispatch(Actions().deleteSelection());
    },
    'core:delete': () => {
      store.dispatch(Actions().deleteSelection());
    },
    'tree-view:remove-project-folder-selection': () => {
      store.dispatch(Actions().removeRootFolderSelection());
    },
    'tree-view:rename-selection': () => {
      store.dispatch(Actions().openRenameDialog());
    },
    'tree-view:duplicate-selection': () => {
      store.dispatch(Actions().openDuplicateDialog(filePaths => {
        store.dispatch(Actions().openAndRevealFilePaths(filePaths));
      }));
    },
    'tree-view:copy-selection': () => {
      store.dispatch(Actions().copyFilenamesWithDir());
    },
    'tree-view:paste-selection': () => {
      store.dispatch(Actions().openPasteDialog());
    },
    'tree-view:search-in-directory': event => {
      searchInDirectory(event, store);
    },
    'tree-view:set-current-working-root': () => {
      store.dispatch(Actions().setCwdToSelection());
    }
  }, letterKeyBindings)), atom.commands.add('atom-workspace', {
    // eslint-disable-next-line nuclide-internal/atom-apis
    'file:copy-full-path': copyFullPath,
    // eslint-disable-next-line nuclide-internal/atom-apis
    'file:show-in-file-manager': showInFileManager
  }));
  return disposables;
}

function copyFullPath(event) {
  const path = (0, _getElementFilePath().default)(event.target, true);

  if (path == null) {
    return;
  }

  const parsed = _nuclideUri().default.parse(path);

  atom.clipboard.write(parsed.path);
}

function revealActiveFile(event, store) {
  let path = (0, _getElementFilePath().default)(event.target, true);

  if (path == null) {
    // If there's no path attached to the element element or active text edtior,
    // check if the Currently active pane resembles a text editor.
    const paneItem = atom.workspace.getActivePaneItem(); // hacky, but covers at LEAST ImageEditor

    if (paneItem != null && typeof paneItem.getPath === 'function') {
      path = paneItem.getPath();
    }

    if (path == null) {
      return;
    }
  }

  store.dispatch(Actions().revealFilePath(path));
}

function searchInDirectory(event, store) {
  const targetElement = event.target; // If the event was sent to the entire tree, rather then a single element - attempt to derive
  // the path to work on from the current selection.

  if (targetElement.classList.contains('nuclide-file-tree')) {
    const node = Selectors().getSingleSelectedNode(store.getState());

    if (node == null) {
      return;
    }

    let path = node.uri;

    if (!node.isContainer) {
      if (!node.parent) {
        throw new Error("Invariant violation: \"node.parent\"");
      }

      path = node.parent.uri;
    } // What we see here is an unfortunate example of "DOM as an API" paradigm :-(
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
    temporaryElement.appendChild(pathChild); // Must attach to the workspace-view, otherwise the handler won't be found

    const workspaceView = atom.views.getView(atom.workspace);
    workspaceView.appendChild(temporaryElement);
    atom.commands.dispatch(temporaryElement, 'project-find:show-in-current-directory'); // Cleaning for the workspace-view

    workspaceView.removeChild(temporaryElement);
  } else {
    atom.commands.dispatch(targetElement, 'project-find:show-in-current-directory');
  }
}

function showInFileManager(event) {
  const path = (0, _getElementFilePath().default)(event.target, true);

  if (path == null || _nuclideUri().default.isRemote(path)) {
    return;
  }

  _electron.shell.showItemInFolder(path);
}