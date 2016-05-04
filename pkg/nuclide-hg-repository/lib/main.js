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

var revertPath = _asyncToGenerator(function* (nodePath) {
  if (nodePath == null || nodePath.length === 0) {
    atom.notifications.addError('Cannot revert an empty path!');
    return;
  }
  var repository = (0, _nuclideHgGitBridge.repositoryForPath)(nodePath);
  if (repository == null || repository.getType() !== 'hg') {
    atom.notifications.addError('Cannot revert a non-mercurial repository path');
    return;
  }
  (0, _nuclideAnalytics.track)('hg-repository-revert', { nodePath: nodePath });
  var hgRepositoryAsync = repository.async;
  try {
    yield hgRepositoryAsync.checkoutHead(nodePath);
    atom.notifications.addSuccess('Reverted `' + repository.relativize(nodePath) + '` successfully.');
  } catch (error) {
    atom.notifications.addError('Failed to revert `' + repository.relativize(nodePath) + '`', { detail: error.message });
  }
});

exports.activate = activate;
exports.addItemsToFileTreeContextMenu = addItemsToFileTreeContextMenu;
exports.deactivate = deactivate;
exports.createHgRepositoryProvider = createHgRepositoryProvider;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _atom = require('atom');

var _nuclideHgGitBridge = require('../../nuclide-hg-git-bridge');

var _nuclideAnalytics = require('../../nuclide-analytics');

var HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY = 1050;
var subscriptions = null;

// A file is revertable if it's changed.
// A directory is revertable if it contains changed files.
function shouldDisplayRevertTreeItem(contextMenu) {
  var node = contextMenu.getSingleSelectedNode();
  if (node == null || node.repo == null || node.repo.getType() !== 'hg') {
    return false;
  }
  var hgRepository = node.repo;
  return hgRepository.isStatusModified(node.vcsStatusCode);
}

function isActivePathRevertable() {
  var editor = atom.workspace.getActiveTextEditor();
  if (editor == null || !editor.getPath()) {
    return false;
  }
  var filePath = editor.getPath() || '';
  var repository = (0, _nuclideHgGitBridge.repositoryForPath)(filePath);
  if (repository == null || repository.getType() !== 'hg') {
    return false;
  }
  var hgRepository = repository;
  return hgRepository.isPathModified(filePath);
}

function revertActivePath() {
  var editor = atom.workspace.getActiveTextEditor();
  if (editor == null) {
    atom.notifications.addError('No active text editor to revert!');
  } else {
    revertPath(editor.getPath());
  }
}

function activate(state) {
  subscriptions = new _atom.CompositeDisposable();

  subscriptions.add(atom.commands.add('atom-workspace', 'nuclide-hg-repository:revert', revertActivePath));

  // Text editor context menu items.
  subscriptions.add(atom.contextMenu.add({
    'atom-text-editor': [{ type: 'separator' }, {
      label: 'Source Control',
      submenu: [{
        label: 'Revert',
        command: 'nuclide-hg-repository:revert'
      }],
      shouldDisplay: function shouldDisplay() {
        return isActivePathRevertable();
      }
    }, { type: 'separator' }]
  }));
}

function addItemsToFileTreeContextMenu(contextMenu) {
  (0, _assert2.default)(subscriptions);

  var contextDisposable = contextMenu.addItemToSourceControlMenu({
    label: 'Revert',
    callback: function callback() {
      // TODO(most): support reverting multiple nodes at once.
      var revertNode = contextMenu.getSingleSelectedNode();
      revertPath(revertNode == null ? null : revertNode.uri);
    },
    shouldDisplay: function shouldDisplay() {
      return shouldDisplayRevertTreeItem(contextMenu);
    }
  }, HG_REVERT_FILE_TREE_CONTEXT_MENU_PRIORITY);

  subscriptions.add(contextDisposable);

  return new _atom.Disposable(function () {
    if (subscriptions != null) {
      subscriptions.remove(contextDisposable);
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