Object.defineProperty(exports, '__esModule', {
  value: true
});

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

exports.activate = activate;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;
exports.deactivate = deactivate;
exports.createHgRepositoryProvider = createHgRepositoryProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _assert2;

function _assert() {
  return _assert2 = _interopRequireDefault(require('assert'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _nuclideHgGitBridge2;

function _nuclideHgGitBridge() {
  return _nuclideHgGitBridge2 = require('../../nuclide-hg-git-bridge');
}

var _actions2;

function _actions() {
  return _actions2 = require('./actions');
}

var HG_ADD_TREE_CONTEXT_MENU_PRIORITY = 400;
var HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1050;

var subscriptions = null;

// A file is revertable if it's changed or added.
// A file is addable if it's untracked.
// A directory is revertable if it contains changed files.
function shouldDisplayActionTreeItem(contextMenu, action) {
  var node = contextMenu.getSingleSelectedNode();
  if (node == null || node.repo == null || node.repo.getType() !== 'hg') {
    return false;
  }
  var hgRepository = node.repo;
  if (action === 'Revert') {
    return hgRepository.isStatusModified(node.vcsStatusCode) || hgRepository.isStatusAdded(node.vcsStatusCode);
  } else if (action === 'Add') {
    return hgRepository.isStatusUntracked(node.vcsStatusCode);
  } else {
    return false;
  }
}

function getActivePathAndHgRepository() {
  var editor = atom.workspace.getActiveTextEditor();
  if (editor == null || !editor.getPath()) {
    return null;
  }
  var filePath = editor.getPath() || '';
  var repository = (0, (_nuclideHgGitBridge2 || _nuclideHgGitBridge()).repositoryForPath)(filePath);
  if (repository == null || repository.getType() !== 'hg') {
    return null;
  }
  var hgRepository = repository;
  return {
    repository: hgRepository,
    activePath: filePath
  };
}

function isActivePathRevertable() {
  var activeRepositoryInfo = getActivePathAndHgRepository();
  if (activeRepositoryInfo == null) {
    return false;
  }
  var repository = activeRepositoryInfo.repository;
  var activePath = activeRepositoryInfo.activePath;

  return repository.isPathModified(activePath);
}

function isActivePathAddable() {
  var activeRepositoryInfo = getActivePathAndHgRepository();
  if (activeRepositoryInfo == null) {
    return false;
  }
  var repository = activeRepositoryInfo.repository;
  var activePath = activeRepositoryInfo.activePath;

  return repository.isPathUntracked(activePath);
}

function activate(state) {
  subscriptions = new (_atom2 || _atom()).CompositeDisposable();

  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-hg-repository:revert', function (event) {
    var editorElement = event.target;
    (0, (_actions2 || _actions()).revertPath)(editorElement.getModel().getPath());
  }));

  subscriptions.add(atom.commands.add('atom-text-editor', 'nuclide-hg-repository:add', function (event) {
    var editorElement = event.target;
    (0, (_actions2 || _actions()).addPath)(editorElement.getModel().getPath());
  }));

  // Text editor context menu items.
  subscriptions.add(atom.contextMenu.add({
    'atom-text-editor': [{ type: 'separator' }, {
      label: 'Source Control',
      submenu: [{
        label: 'Revert',
        command: 'nuclide-hg-repository:revert',
        shouldDisplay: function shouldDisplay() {
          return isActivePathRevertable();
        }
      }, {
        label: 'Add to Mercurial',
        command: 'nuclide-hg-repository:revert',
        shouldDisplay: function shouldDisplay() {
          return isActivePathAddable();
        }
      }],
      shouldDisplay: function shouldDisplay() {
        return getActivePathAndHgRepository() != null;
      }
    }, { type: 'separator' }]
  }));
}

function addItemsToFileTreeContextMenu(contextMenu) {
  (0, (_assert2 || _assert()).default)(subscriptions);

  var revertContextDisposable = contextMenu.addItemToSourceControlMenu({
    label: 'Revert',
    callback: function callback() {
      // TODO(most): support reverting multiple nodes at once.
      var revertNode = contextMenu.getSingleSelectedNode();
      (0, (_actions2 || _actions()).revertPath)(revertNode == null ? null : revertNode.uri);
    },
    shouldDisplay: function shouldDisplay() {
      return shouldDisplayActionTreeItem(contextMenu, 'Revert');
    }
  }, HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY);
  subscriptions.add(revertContextDisposable);

  var addContextDisposable = contextMenu.addItemToSourceControlMenu({
    label: 'Add to Mercurial',
    callback: function callback() {
      // TODO(most): support adding multiple nodes at once.
      var addNode = contextMenu.getSingleSelectedNode();
      (0, (_actions2 || _actions()).addPath)(addNode == null ? null : addNode.uri);
    },
    shouldDisplay: function shouldDisplay() {
      return shouldDisplayActionTreeItem(contextMenu, 'Add');
    }
  }, HG_ADD_TREE_CONTEXT_MENU_PRIORITY);
  subscriptions.add(addContextDisposable);

  return new (_atom2 || _atom()).Disposable(function () {
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
  var _require = require('./HgRepositoryProvider');

  var HgRepositoryProvider = _require.HgRepositoryProvider;

  return new HgRepositoryProvider();
}