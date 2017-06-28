'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.activate = activate;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;
exports.deactivate = deactivate;
exports.createHgRepositoryProvider = createHgRepositoryProvider;

var _registerGrammar;

function _load_registerGrammar() {
  return _registerGrammar = _interopRequireDefault(require('../../commons-atom/register-grammar'));
}

var _atom = require('atom');

var _nuclideVcsBase;

function _load_nuclideVcsBase() {
  return _nuclideVcsBase = require('../../nuclide-vcs-base');
}

var _HgRepositoryProvider;

function _load_HgRepositoryProvider() {
  return _HgRepositoryProvider = _interopRequireDefault(require('./HgRepositoryProvider'));
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
  const node = contextMenu.getSingleSelectedNode();
  if (node == null || node.repo == null || node.repo.getType() !== 'hg') {
    return false;
  }
  const hgRepository = node.repo;
  if (action === 'Revert') {
    return hgRepository.isStatusModified(node.vcsStatusCode) || hgRepository.isStatusAdded(node.vcsStatusCode);
  } else if (action === 'Add') {
    return hgRepository.isStatusUntracked(node.vcsStatusCode);
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
  const repository = (0, (_nuclideVcsBase || _load_nuclideVcsBase()).repositoryForPath)(filePath);
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
  const { repository, activePath } = activeRepositoryInfo;
  return repository.isPathModified(activePath);
}

function isActivePathAddable() {
  const activeRepositoryInfo = getActivePathAndHgRepository();
  if (activeRepositoryInfo == null) {
    return false;
  }
  const { repository, activePath } = activeRepositoryInfo;
  return repository.isPathUntracked(activePath);
}

function activate(state) {
  subscriptions = new _atom.CompositeDisposable();

  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-hg-repository:revert', event => {
    const editorElement = event.currentTarget;
    (0, (_nuclideVcsBase || _load_nuclideVcsBase()).revertPath)(editorElement.getModel().getPath());
  }));

  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-hg-repository:confirm-and-revert', event => {
    const editorElement = event.currentTarget;
    (0, (_nuclideVcsBase || _load_nuclideVcsBase()).confirmAndRevertPath)(editorElement.getModel().getPath());
  }));

  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-hg-repository:add', event => {
    const editorElement = event.currentTarget;
    (0, (_nuclideVcsBase || _load_nuclideVcsBase()).addPath)(editorElement.getModel().getPath());
  }));

  // Text editor context menu items.
  subscriptions.add(atom.contextMenu.add({
    'atom-text-editor': [{ type: 'separator' }, {
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
    }, { type: 'separator' }]
  }));

  (0, (_registerGrammar || _load_registerGrammar()).default)('source.ini', ['.hgrc']);
}

function addItemsToFileTreeContextMenu(contextMenu) {
  if (!subscriptions) {
    throw new Error('Invariant violation: "subscriptions"');
  }

  const revertContextDisposable = contextMenu.addItemToSourceControlMenu({
    label: 'Revert',
    callback() {
      // TODO(most): support reverting multiple nodes at once.
      const revertNode = contextMenu.getSingleSelectedNode();
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).confirmAndRevertPath)(revertNode == null ? null : revertNode.uri);
    },
    shouldDisplay() {
      return shouldDisplayActionTreeItem(contextMenu, 'Revert');
    }
  }, HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY);
  subscriptions.add(revertContextDisposable);

  const addContextDisposable = contextMenu.addItemToSourceControlMenu({
    label: 'Add to Mercurial',
    callback() {
      // TODO(most): support adding multiple nodes at once.
      const addNode = contextMenu.getSingleSelectedNode();
      (0, (_nuclideVcsBase || _load_nuclideVcsBase()).addPath)(addNode == null ? null : addNode.uri);
    },
    shouldDisplay() {
      return shouldDisplayActionTreeItem(contextMenu, 'Add');
    }
  }, HG_ADD_TREE_CONTEXT_MENU_PRIORITY);
  subscriptions.add(addContextDisposable);

  return new _atom.Disposable(() => {
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
  return new (_HgRepositoryProvider || _load_HgRepositoryProvider()).default();
}