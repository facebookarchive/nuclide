"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;
exports.deactivate = deactivate;
exports.createHgRepositoryProvider = createHgRepositoryProvider;
exports.createHgAdditionalLogFilesProvider = createHgAdditionalLogFilesProvider;

function _collection() {
  const data = require("../../../modules/nuclide-commons/collection");

  _collection = function () {
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

function _registerGrammar() {
  const data = _interopRequireDefault(require("../../commons-atom/register-grammar"));

  _registerGrammar = function () {
    return data;
  };

  return data;
}

function _nuclideVcsBase() {
  const data = require("../../nuclide-vcs-base");

  _nuclideVcsBase = function () {
    return data;
  };

  return data;
}

function _HgRepositoryProvider() {
  const data = _interopRequireDefault(require("./HgRepositoryProvider"));

  _HgRepositoryProvider = function () {
    return data;
  };

  return data;
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
const HG_ADD_TREE_CONTEXT_MENU_PRIORITY = 400;
const HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1050;
let subscriptions = null;

// A file is revertable if it's changed or added.
// A file is addable if it's untracked.
// A directory is revertable if it contains changed files.
function shouldDisplayActionTreeItem(contextMenu, action) {
  if (action === 'Revert') {
    const node = contextMenu.getSingleSelectedNode();

    if (node == null || node.repo == null || node.repo.getType() !== 'hg') {
      return false;
    } else {
      const hgRepository = node.repo;
      return hgRepository.isStatusModified(node.vcsStatusCode) || hgRepository.isStatusAdded(node.vcsStatusCode);
    }
  } else if (action === 'Add') {
    const nodes = contextMenu.getSelectedNodes();
    return nodes.every(node => {
      if (node.repo == null || node.repo.getType() !== 'hg' || // $FlowFixMe(>=0.68.0) Flow suppress (T27187857)
      typeof node.repo.isStatusUntracked !== 'function') {
        return false;
      }

      return node.repo.isStatusUntracked(node.vcsStatusCode);
    });
  } else {
    return false;
  }
}

function getActivePathAndHgRepository() {
  const editor = atom.workspace.getActiveTextEditor();

  if (editor == null || !editor.getPath()) {
    return null;
  }

  const filePath = editor.getPath() || '';
  const repository = (0, _nuclideVcsBase().repositoryForPath)(filePath);

  if (repository == null || repository.getType() !== 'hg') {
    return null;
  }

  const hgRepository = repository;
  return {
    repository: hgRepository,
    activePath: filePath
  };
}

function isActivePathRevertable() {
  const activeRepositoryInfo = getActivePathAndHgRepository();

  if (activeRepositoryInfo == null) {
    return false;
  }

  const {
    repository,
    activePath
  } = activeRepositoryInfo;
  return repository.isPathModified(activePath);
}

function isActivePathAddable() {
  const activeRepositoryInfo = getActivePathAndHgRepository();

  if (activeRepositoryInfo == null) {
    return false;
  }

  const {
    repository,
    activePath
  } = activeRepositoryInfo;
  return repository.isPathUntracked(activePath);
}

function activate(state) {
  subscriptions = new (_UniversalDisposable().default)();
  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-hg-repository:confirm-and-revert', event => {
    const editorElement = event.currentTarget;
    (0, _nuclideVcsBase().confirmAndRevertPath)(editorElement.getModel().getPath());
  }));
  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-hg-repository:add', event => {
    const editorElement = event.currentTarget;
    (0, _nuclideVcsBase().addPath)(editorElement.getModel().getPath());
  })); // Text editor context menu items.

  subscriptions.add(atom.contextMenu.add({
    'atom-text-editor': [{
      type: 'separator'
    }, {
      label: 'Source Control',
      submenu: [{
        label: 'Revert',
        command: 'nuclide-hg-repository:confirm-and-revert',

        shouldDisplay() {
          return isActivePathRevertable();
        }

      }, {
        label: 'Add to Mercurial',
        command: 'nuclide-hg-repository:add',

        shouldDisplay() {
          return isActivePathAddable();
        }

      }],

      shouldDisplay() {
        return getActivePathAndHgRepository() != null;
      }

    }, {
      type: 'separator'
    }]
  }));
  (0, _registerGrammar().default)('source.ini', ['.hgrc']);
}

function addItemsToFileTreeContextMenu(contextMenu) {
  if (!subscriptions) {
    throw new Error("Invariant violation: \"subscriptions\"");
  }

  const revertContextDisposable = contextMenu.addItemToSourceControlMenu({
    label: 'Revert',

    callback() {
      // TODO(most): support reverting multiple nodes at once.
      const revertNode = contextMenu.getSingleSelectedNode();
      (0, _nuclideVcsBase().confirmAndRevertPath)(revertNode == null ? null : revertNode.uri);
    },

    shouldDisplay() {
      return shouldDisplayActionTreeItem(contextMenu, 'Revert');
    }

  }, HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY);
  subscriptions.add(revertContextDisposable);
  const addContextDisposable = contextMenu.addItemToSourceControlMenu({
    label: 'Add to Mercurial',

    callback() {
      const nodes = contextMenu.getSelectedNodes();

      for (const addNode of nodes) {
        (0, _nuclideVcsBase().addPath)(addNode == null ? null : addNode.uri);
      }
    },

    shouldDisplay() {
      return shouldDisplayActionTreeItem(contextMenu, 'Add');
    }

  }, HG_ADD_TREE_CONTEXT_MENU_PRIORITY);
  subscriptions.add(addContextDisposable);
  return new (_UniversalDisposable().default)(() => {
    if (subscriptions != null) {
      subscriptions.remove(revertContextDisposable);
      subscriptions.remove(addContextDisposable);
    }
  });
}

function deactivate(state) {
  if (subscriptions != null) {
    subscriptions.dispose();
    subscriptions = null;
  }
}

function createHgRepositoryProvider() {
  return new (_HgRepositoryProvider().default)();
}

async function getAllHgAdditionalLogFiles(deadline) {
  // Atom provides one repository object per project.
  const repositories = atom.project.getRepositories(); // We want to avoid duplication in the case where two different projects both
  // are served by the same repository path.
  // Start by transforming into an array of [path, HgRepositoryClient] pairs.

  const hgRepositories = (0, _collection().arrayCompact)(repositories.map(r => r != null && r.getType() === 'hg' ? [r.getWorkingDirectory(), r] : null)); // For each repository path, arbitrarily pick just the first of the
  // HgRepositoryClients that serves that path.

  const uniqueRepositories = Array.from((0, _collection().mapTransform)((0, _collection().collect)(hgRepositories), (clients, dir) => clients[0]).values());
  const results = await Promise.all(uniqueRepositories.map(r => r.getAdditionalLogFiles(deadline)));
  return (0, _collection().arrayFlatten)(results);
}

function createHgAdditionalLogFilesProvider() {
  return {
    id: 'hg',
    getAdditionalLogFiles: getAllHgAdditionalLogFiles
  };
}