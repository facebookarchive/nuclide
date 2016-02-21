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

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _FileTreeConstants = require('./FileTreeConstants');

var _FileSystemActions = require('./FileSystemActions');

var _FileSystemActions2 = _interopRequireDefault(_FileSystemActions);

var _FileTreeActions = require('./FileTreeActions');

var _FileTreeActions2 = _interopRequireDefault(_FileTreeActions);

var _FileTreeContextMenu = require('./FileTreeContextMenu');

var _FileTreeContextMenu2 = _interopRequireDefault(_FileTreeContextMenu);

var _FileTreeHelpers = require('./FileTreeHelpers');

var _FileTreeHelpers2 = _interopRequireDefault(_FileTreeHelpers);

var _FileTreeStore = require('./FileTreeStore');

var _FileTreeStore2 = _interopRequireDefault(_FileTreeStore);

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _analytics = require('../../analytics');

var _atomHelpers = require('../../atom-helpers');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var FileTreeController = (function () {
  function FileTreeController(state) {
    var _this = this;

    _classCallCheck(this, FileTreeController);

    this._actions = _FileTreeActions2['default'].getInstance();
    this._store = _FileTreeStore2['default'].getInstance();
    this._repositories = new _immutable2['default'].Set();
    this._subscriptionForRepository = new _immutable2['default'].Map();
    this._subscriptions = new _atom.CompositeDisposable();
    // Initial root directories
    this._updateRootDirectories();
    // Subsequent root directories updated on change
    this._subscriptions.add(atom.project.onDidChangePaths(function () {
      return _this._updateRootDirectories();
    }));

    this._subscriptions.add(atom.commands.add('atom-workspace', {
      // Pass undefined so the default parameter gets used.
      'nuclide-file-tree:reveal-text-editor': this._revealTextEditor.bind(this),
      'nuclide-file-tree:reveal-active-file': this.revealActiveFile.bind(this, undefined)
    }));
    this._subscriptions.add(atom.commands.add(_FileTreeConstants.EVENT_HANDLER_SELECTOR, {
      'core:move-down': this._moveDown.bind(this),
      'core:move-up': this._moveUp.bind(this),
      'core:move-to-top': this._moveToTop.bind(this),
      'core:move-to-bottom': this._moveToBottom.bind(this),
      'nuclide-file-tree:add-file': function nuclideFileTreeAddFile() {
        _FileSystemActions2['default'].openAddFileDialog(_this._openAndRevealFilePath.bind(_this));
      },
      'nuclide-file-tree:add-folder': function nuclideFileTreeAddFolder() {
        _FileSystemActions2['default'].openAddFolderDialog(_this._openAndRevealDirectoryPath.bind(_this));
      },
      'nuclide-file-tree:collapse-directory': this._collapseSelection.bind(this, /*deep*/false),
      'nuclide-file-tree:recursive-collapse-directory': this._collapseSelection.bind(this, true),
      'nuclide-file-tree:recursive-collapse-all': this._collapseAll.bind(this),
      'nuclide-file-tree:copy-full-path': this._copyFullPath.bind(this),
      'nuclide-file-tree:expand-directory': this._expandSelection.bind(this, /*deep*/false),
      'nuclide-file-tree:recursive-expand-directory': this._expandSelection.bind(this, true),
      'nuclide-file-tree:open-selected-entry': this._openSelectedEntry.bind(this),
      'nuclide-file-tree:open-selected-entry-up': this._openSelectedEntrySplitUp.bind(this),
      'nuclide-file-tree:open-selected-entry-down': this._openSelectedEntrySplitDown.bind(this),
      'nuclide-file-tree:open-selected-entry-left': this._openSelectedEntrySplitLeft.bind(this),
      'nuclide-file-tree:open-selected-entry-right': this._openSelectedEntrySplitRight.bind(this),
      'nuclide-file-tree:remove': this._deleteSelection.bind(this),
      'nuclide-file-tree:remove-project-folder-selection': this._removeRootFolderSelection.bind(this),
      'nuclide-file-tree:rename-selection': function nuclideFileTreeRenameSelection() {
        return _FileSystemActions2['default'].openRenameDialog();
      },
      'nuclide-file-tree:duplicate-selection': function nuclideFileTreeDuplicateSelection() {
        _FileSystemActions2['default'].openDuplicateDialog(_this._openAndRevealFilePath.bind(_this));
      },
      'nuclide-file-tree:search-in-directory': this._searchInDirectory.bind(this),
      'nuclide-file-tree:show-in-file-manager': this._showInFileManager.bind(this)
    }));
    this._subscriptions.add(atom.commands.add('[is="tabs-tab"]', {
      'nuclide-file-tree:reveal-tab-file': this._revealTabFileOnClick.bind(this)
    }));
    if (state && state.tree) {
      this._store.loadData(state.tree);
    }
    this._contextMenu = new _FileTreeContextMenu2['default']();
  }

  _createClass(FileTreeController, [{
    key: '_openAndRevealFilePath',
    value: function _openAndRevealFilePath(filePath) {
      if (filePath != null) {
        atom.workspace.open(filePath);
        this.revealNodeKey(filePath);
      }
    }
  }, {
    key: '_openAndRevealDirectoryPath',
    value: function _openAndRevealDirectoryPath(path) {
      if (path != null) {
        this.revealNodeKey(_FileTreeHelpers2['default'].dirPathToKey(path));
      }
    }
  }, {
    key: '_updateRootDirectories',
    value: function _updateRootDirectories() {
      // If the remote-projects package hasn't loaded yet remote directories will be instantiated as
      // local directories but with invalid paths. We need to exclude those.
      var rootDirectories = atom.project.getDirectories().filter(function (directory) {
        return _FileTreeHelpers2['default'].isValidDirectory(directory);
      });
      var rootKeys = rootDirectories.map(function (directory) {
        return _FileTreeHelpers2['default'].dirPathToKey(directory.getPath());
      });
      this._actions.setRootKeys(rootKeys);
      this._actions.updateRepositories(rootDirectories);
    }
  }, {
    key: '_revealTextEditor',
    value: function _revealTextEditor(event) {
      var editorElement = event.target;
      if (editorElement == null || typeof editorElement.getModel !== 'function' || !(0, _atomHelpers.isTextEditor)(editorElement.getModel())) {
        return;
      }

      var filePath = editorElement.getModel().getPath();
      this._revealFilePath(filePath);
    }

    /**
     * Reveal the file that currently has focus in the file tree. If showIfHidden is false,
     * this will enqueue a pending reveal to be executed when the file tree is shown again.
     */
  }, {
    key: 'revealActiveFile',
    value: function revealActiveFile() {
      var showIfHidden = arguments.length <= 0 || arguments[0] === undefined ? true : arguments[0];

      var editor = atom.workspace.getActiveTextEditor();
      var filePath = editor != null ? editor.getPath() : null;
      this._revealFilePath(filePath, showIfHidden);
    }
  }, {
    key: '_revealFilePath',
    value: function _revealFilePath(filePath) {
      var showIfHidden = arguments.length <= 1 || arguments[1] === undefined ? true : arguments[1];

      if (showIfHidden) {
        // Ensure the file tree is visible before trying to reveal a file in it. Even if the currently
        // active pane is not an ordinary editor, we still at least want to show the tree.
        atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-file-tree:toggle', { display: true });
      }

      if (!filePath) {
        return;
      }

      this.revealNodeKey(filePath);
    }

    /**
     * Reveal the file of a given tab based on the path stored on the DOM.
     * This method is meant to be triggered by the context-menu click.
     */
  }, {
    key: '_revealTabFileOnClick',
    value: function _revealTabFileOnClick(event) {
      var tab = event.currentTarget;
      var title = tab.querySelector('.title[data-path]');
      if (!title) {
        // can only reveal it if we find the file path
        return;
      }

      var filePath = title.dataset.path;
      atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-file-tree:toggle', { display: true });
      this.revealNodeKey(filePath);
    }
  }, {
    key: 'revealNodeKey',
    value: function revealNodeKey(nodeKey) {
      var _this2 = this;

      if (!nodeKey) {
        return;
      }
      var rootKey = this._store.getRootForKey(nodeKey);
      if (!rootKey) {
        return;
      }
      var stack = [];
      var key = nodeKey;
      while (key != null && key !== rootKey) {
        stack.push(key);
        key = _FileTreeHelpers2['default'].getParentKey(key);
      }
      // We want the stack to be [parentKey, ..., nodeKey].
      stack.reverse();
      stack.forEach(function (childKey, i) {
        var parentKey = i === 0 ? rootKey : stack[i - 1];
        _this2._actions.ensureChildNode(rootKey, parentKey, childKey);
        _this2._actions.expandNode(rootKey, parentKey);
      });
      this._selectAndTrackNode(rootKey, nodeKey);
    }
  }, {
    key: 'setExcludeVcsIgnoredPaths',
    value: function setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths) {
      this._actions.setExcludeVcsIgnoredPaths(excludeVcsIgnoredPaths);
    }
  }, {
    key: 'setHideIgnoredNames',
    value: function setHideIgnoredNames(hideIgnoredNames) {
      this._actions.setHideIgnoredNames(hideIgnoredNames);
    }
  }, {
    key: 'setIgnoredNames',
    value: function setIgnoredNames(ignoredNames) {
      this._actions.setIgnoredNames(ignoredNames);
    }
  }, {
    key: 'setUsePreviewTabs',
    value: function setUsePreviewTabs(usePreviewTabs) {
      this._actions.setUsePreviewTabs(usePreviewTabs);
    }

    /**
     * Collapses all selected directory nodes. If the selection is a single file or a single collapsed
     * directory, the selection is set to the directory's parent.
     */
  }, {
    key: '_collapseSelection',
    value: function _collapseSelection() {
      var _this3 = this;

      var deep = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var selectedNodes = this._store.getSelectedNodes();
      var firstSelectedNode = selectedNodes.first();
      if (selectedNodes.size === 1 && !firstSelectedNode.isRoot && !(firstSelectedNode.isContainer && firstSelectedNode.isExpanded())) {
        /*
         * Select the parent of the selection if the following criteria are met:
         *   * Only 1 node is selected
         *   * The node is not a root
         *   * The node is not an expanded directory
         */
        this.revealNodeKey(_FileTreeHelpers2['default'].getParentKey(firstSelectedNode.nodeKey));
      } else {
        selectedNodes.forEach(function (node) {
          // Only directories can be expanded. Skip non-directory nodes.
          if (!node.isContainer) {
            return;
          }

          if (deep) {
            _this3._actions.collapseNodeDeep(node.rootKey, node.nodeKey);
          } else {
            _this3._actions.collapseNode(node.rootKey, node.nodeKey);
          }
        });
      }
    }
  }, {
    key: '_collapseAll',
    value: function _collapseAll() {
      var _this4 = this;

      var rootKeys = this._store.getRootKeys();
      rootKeys.forEach(function (rootKey) {
        return _this4._actions.collapseNodeDeep(rootKey, rootKey);
      });
    }
  }, {
    key: '_deleteSelection',
    value: function _deleteSelection() {
      var _this5 = this;

      var nodes = this._store.getSelectedNodes();
      if (nodes.size === 0) {
        return;
      }

      var rootPaths = nodes.filter(function (node) {
        return node.isRoot;
      });
      if (rootPaths.size === 0) {
        var selectedPaths = nodes.map(function (node) {
          return node.nodePath;
        });
        var message = 'Are you sure you want to delete the following ' + (nodes.size > 1 ? 'items?' : 'item?');
        atom.confirm({
          buttons: {
            'Delete': function Delete() {
              _this5._actions.deleteSelectedNodes();
            },
            'Cancel': function Cancel() {}
          },
          detailedMessage: 'You are deleting:' + _os2['default'].EOL + selectedPaths.join(_os2['default'].EOL),
          message: message
        });
      } else {
        var message = undefined;
        if (rootPaths.size === 1) {
          message = 'The root directory \'' + rootPaths.first().nodeName + '\' can\'t be removed.';
        } else {
          var rootPathNames = rootPaths.map(function (node) {
            return '\'' + node.nodeName + '\'';
          }).join(', ');
          message = 'The root directories ' + rootPathNames + ' can\'t be removed.';
        }

        atom.confirm({
          buttons: ['OK'],
          message: message
        });
      }
    }

    /**
     * Expands all selected directory nodes.
     */
  }, {
    key: '_expandSelection',
    value: function _expandSelection(deep) {
      var _this6 = this;

      this._store.getSelectedNodes().forEach(function (node) {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        if (deep) {
          _this6._actions.expandNodeDeep(node.rootKey, node.nodeKey);
        } else {
          _this6._actions.expandNode(node.rootKey, node.nodeKey);
        }
      });
    }
  }, {
    key: '_moveDown',
    value: function _moveDown() {
      if (this._store.isEmpty()) {
        return;
      }

      var lastSelectedKey = this._store.getSelectedKeys().last();
      if (lastSelectedKey == null) {
        // There is no selection yet, so move to the top of the tree.
        this._moveToTop();
        return;
      }

      var parentKey = undefined;
      var rootKey = undefined;
      var siblingKeys = undefined;
      var isRoot = this._store.isRootKey(lastSelectedKey);
      if (isRoot) {
        rootKey = lastSelectedKey;
        // Other roots are this root's siblings
        siblingKeys = this._store.getRootKeys();
      } else {
        parentKey = _FileTreeHelpers2['default'].getParentKey(lastSelectedKey);
        rootKey = this._store.getRootForKey(lastSelectedKey);

        (0, _assert2['default'])(rootKey && parentKey);
        siblingKeys = this._store.getCachedChildKeys(rootKey, parentKey);
      }

      // If the root does not exist or if this is expected to have a parent but doesn't (roots do
      // not have parents), nothing can be done. Exit.
      if (rootKey == null || !isRoot && parentKey == null) {
        return;
      }

      var children = this._store.getCachedChildKeys(rootKey, lastSelectedKey);
      if (_FileTreeHelpers2['default'].isDirKey(lastSelectedKey) && this._store.isExpanded(rootKey, lastSelectedKey) && children.length > 0) {
        // Directory is expanded and it has children. Select first child. Exit.
        this._selectAndTrackNode(rootKey, children[0]);
      } else {
        var index = siblingKeys.indexOf(lastSelectedKey);
        var maxIndex = siblingKeys.length - 1;

        if (index < maxIndex) {
          var nextSiblingKey = siblingKeys[index + 1];

          if (isRoot) {
            // If the next selected item is another root, set `rootKey` to it so trackAndSelect finds
            // that [rootKey, rootKey] tuple.
            rootKey = nextSiblingKey;
          }

          // This has a next sibling.
          this._selectAndTrackNode(rootKey, siblingKeys[index + 1]);
        } else {
          var nearestAncestorSibling = this._findNearestAncestorSibling(rootKey, lastSelectedKey);

          // If this is the bottommost node of the tree, there won't be anything to select.
          // Void return signifies no next node was found.
          if (nearestAncestorSibling != null) {
            this._selectAndTrackNode(nearestAncestorSibling.rootKey, nearestAncestorSibling.nodeKey);
          }
        }
      }
    }
  }, {
    key: '_moveUp',
    value: function _moveUp() {
      if (this._store.isEmpty()) {
        return;
      }

      var lastSelectedKey = this._store.getSelectedKeys().last();
      if (lastSelectedKey == null) {
        // There is no selection. Move to the bottom of the tree.
        this._moveToBottom();
        return;
      }

      var parentKey = undefined;
      var rootKey = undefined;
      var siblingKeys = undefined;
      var isRoot = this._store.isRootKey(lastSelectedKey);
      if (isRoot) {
        rootKey = lastSelectedKey;
        // Other roots are this root's siblings
        siblingKeys = this._store.getRootKeys();
      } else {
        parentKey = _FileTreeHelpers2['default'].getParentKey(lastSelectedKey);
        rootKey = this._store.getRootForKey(lastSelectedKey);

        (0, _assert2['default'])(rootKey && parentKey);
        siblingKeys = this._store.getCachedChildKeys(rootKey, parentKey);
      }

      // If the root does not exist or if this is expected to have a parent but doesn't (roots do
      // not have parents), nothing can be done. Exit.
      if (rootKey == null || !isRoot && parentKey == null) {
        return;
      }

      var index = siblingKeys.indexOf(lastSelectedKey);
      if (index === 0) {
        if (!isRoot && parentKey != null) {
          // This is the first child. It has a parent. Select the parent.
          this._selectAndTrackNode(rootKey, parentKey);
        }
        // This is the root and/or the top of the tree (has no parent). Nothing else to traverse.
        // Exit.
      } else {
          var previousSiblingKey = siblingKeys[index - 1];

          if (isRoot) {
            // If traversing up to a different root, the rootKey must become that new root to check
            // expanded keys in it.
            rootKey = previousSiblingKey;
          }

          this._selectAndTrackNode(rootKey, this._findLowermostDescendantKey(rootKey, previousSiblingKey));
        }
    }
  }, {
    key: '_moveToTop',
    value: function _moveToTop() {
      if (this._store.isEmpty()) {
        return;
      }

      var rootKeys = this._store.getRootKeys();
      this._selectAndTrackNode(rootKeys[0], rootKeys[0]);
    }
  }, {
    key: '_moveToBottom',
    value: function _moveToBottom() {
      if (this._store.isEmpty()) {
        return;
      }

      // Select the lowermost descendant of the last root node.
      var rootKeys = this._store.getRootKeys();
      var lastRootKey = rootKeys[rootKeys.length - 1];
      this._selectAndTrackNode(lastRootKey, this._findLowermostDescendantKey(lastRootKey, lastRootKey));
    }

    /*
     * Returns the lowermost descendant when considered in file system order with expandable
     * directories. For example:
     *
     *   A >
     *     B >
     *     C >
     *       E.txt
     *     D.foo
     *
     *   > _findLowermostDescendantKey(A)
     *   D.foo
     *
     * Though A has more deeply-nested descendants than D.foo, like E.txt, D.foo is lowermost when
     * considered in file system order.
     */
  }, {
    key: '_findLowermostDescendantKey',
    value: function _findLowermostDescendantKey(rootKey, nodeKey) {
      if (!(_FileTreeHelpers2['default'].isDirKey(nodeKey) && this._store.isExpanded(rootKey, nodeKey))) {
        // If `nodeKey` is not an expanded directory there are no more descendants to traverse. Return
        // the `nodeKey`.
        return nodeKey;
      }

      var childKeys = this._store.getCachedChildKeys(rootKey, nodeKey);
      if (childKeys.length === 0) {
        // If the directory has no children, the directory itself is the lowermost descendant.
        return nodeKey;
      }

      // There's at least one child. Recurse down the last child.
      return this._findLowermostDescendantKey(rootKey, childKeys[childKeys.length - 1]);
    }

    /*
     * Returns the nearest "ancestor sibling" when considered in file system order with expandable
     * directories. For example:
     *
     *   A >
     *     B >
     *       C >
     *         E.txt
     *   D.foo
     *
     *   > _findNearestAncestorSibling(E.txt)
     *   D.foo
     */
  }, {
    key: '_findNearestAncestorSibling',
    value: function _findNearestAncestorSibling(rootKey, nodeKey) {
      var parentKey = undefined;
      var siblingKeys = undefined;
      var isRoot = rootKey === nodeKey;
      if (isRoot) {
        // `rootKey === nodeKey` means this has recursed to a root. `nodeKey` is a root key.
        siblingKeys = this._store.getRootKeys();
      } else {
        parentKey = _FileTreeHelpers2['default'].getParentKey(nodeKey);

        (0, _assert2['default'])(rootKey && parentKey);
        siblingKeys = this._store.getCachedChildKeys(rootKey, parentKey);
      }

      var index = siblingKeys.indexOf(nodeKey);
      if (index < siblingKeys.length - 1) {
        var nextSibling = siblingKeys[index + 1];
        // If traversing across roots, the next sibling is also the next root. Return it as the next
        // root key as well as the next node key.
        return isRoot ? { nodeKey: nextSibling, rootKey: nextSibling } : { nodeKey: nextSibling, rootKey: rootKey };
      } else if (parentKey != null) {
        // There is a parent to recurse. Return its nearest ancestor sibling.
        return this._findNearestAncestorSibling(rootKey, parentKey);
      } else {
        // If `parentKey` is null, nodeKey is a root and has more parents to recurse. Return `null` to
        // signify no appropriate key was found.
        return null;
      }
    }
  }, {
    key: '_openSelectedEntry',
    value: function _openSelectedEntry() {
      var singleSelectedNode = this._store.getSingleSelectedNode();
      // Only perform the default action if a single node is selected.
      if (singleSelectedNode != null) {
        this._actions.confirmNode(singleSelectedNode.rootKey, singleSelectedNode.nodeKey);
      }
    }
  }, {
    key: '_openSelectedEntrySplit',
    value: function _openSelectedEntrySplit(orientation, side) {
      var singleSelectedNode = this._store.getSingleSelectedNode();
      // Only perform the default action if a single node is selected.
      if (singleSelectedNode != null && !singleSelectedNode.isContainer) {
        // for: is this feature used enough to justify uncollapsing?
        (0, _analytics.track)('filetree-split-file', {
          orientation: orientation,
          side: side
        });
        this._actions.openSelectedEntrySplit(singleSelectedNode.nodeKey, orientation, side);
      }
    }
  }, {
    key: '_openSelectedEntrySplitUp',
    value: function _openSelectedEntrySplitUp() {
      this._openSelectedEntrySplit('vertical', 'before');
    }
  }, {
    key: '_openSelectedEntrySplitDown',
    value: function _openSelectedEntrySplitDown() {
      this._openSelectedEntrySplit('vertical', 'after');
    }
  }, {
    key: '_openSelectedEntrySplitLeft',
    value: function _openSelectedEntrySplitLeft() {
      this._openSelectedEntrySplit('horizontal', 'before');
    }
  }, {
    key: '_openSelectedEntrySplitRight',
    value: function _openSelectedEntrySplitRight() {
      this._openSelectedEntrySplit('horizontal', 'after');
    }
  }, {
    key: '_removeRootFolderSelection',
    value: function _removeRootFolderSelection() {
      var _this7 = this;

      var rootNode = this._store.getSingleSelectedNode();
      if (rootNode != null && rootNode.isRoot) {
        (function () {
          // close all the files associated with the project before closing
          var projectEditors = atom.workspace.getTextEditors();
          var roots = _this7._store.getRootKeys();
          projectEditors.forEach(function (editor) {
            var path = editor.getPath();
            // if the path of the editor is not null AND
            // is part of the currently selected root that would be removed AND
            // is not part of any other open root, then close the file.
            if (path != null && path.startsWith(rootNode.nodePath) && roots.filter(function (root) {
              return path.startsWith(root);
            }).length === 1) {
              atom.workspace.paneForURI(path).destroyItem(editor);
            }
          });
          // actually close the project
          atom.project.removePath(rootNode.nodePath);
        })();
      }
    }
  }, {
    key: '_searchInDirectory',
    value: function _searchInDirectory(event) {
      // Dispatch a command to show the `ProjectFindView`. This opens the view and focuses the search
      // box.
      atom.commands.dispatch(event.target, 'project-find:show-in-current-directory');
    }
  }, {
    key: '_showInFileManager',
    value: function _showInFileManager() {
      var node = this._store.getSingleSelectedNode();
      if (node == null) {
        // Only allow revealing a single directory/file at a time. Return otherwise.
        return;
      }
      _shell2['default'].showItemInFolder(node.nodePath);
    }
  }, {
    key: '_selectAndTrackNode',
    value: function _selectAndTrackNode(rootKey, nodeKey) {
      // Select the node before tracking it because setting a new selection clears the tracked node.
      this._actions.selectSingleNode(rootKey, nodeKey);
      this._actions.setTrackedNode(rootKey, nodeKey);
    }
  }, {
    key: '_copyFullPath',
    value: function _copyFullPath() {
      var singleSelectedNode = this._store.getSingleSelectedNode();
      if (singleSelectedNode != null) {
        atom.clipboard.write(singleSelectedNode.getLocalPath());
      }
    }
  }, {
    key: 'destroy',
    value: function destroy() {
      this._subscriptions.dispose();
      for (var disposable of this._subscriptionForRepository.values()) {
        disposable.dispose();
      }
      this._store.reset();
      this._contextMenu.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        tree: this._store.exportData()
      };
    }
  }]);

  return FileTreeController;
})();

module.exports = FileTreeController;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBYWtDLE1BQU07O2lDQUNGLHFCQUFxQjs7aUNBQzdCLHFCQUFxQjs7OzsrQkFDdkIsbUJBQW1COzs7O21DQUNmLHVCQUF1Qjs7OzsrQkFDM0IsbUJBQW1COzs7OzZCQUNyQixpQkFBaUI7Ozs7eUJBQ3JCLFdBQVc7Ozs7eUJBQ2IsaUJBQWlCOzsyQkFDVixvQkFBb0I7O2tCQUVoQyxJQUFJOzs7O3FCQUNELE9BQU87Ozs7c0JBRUgsUUFBUTs7OztJQVd4QixrQkFBa0I7QUFRWCxXQVJQLGtCQUFrQixDQVFWLEtBQStCLEVBQUU7OzswQkFSekMsa0JBQWtCOztBQVNwQixRQUFJLENBQUMsUUFBUSxHQUFHLDZCQUFnQixXQUFXLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsTUFBTSxHQUFHLDJCQUFjLFdBQVcsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztBQUN6QyxRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0RCxRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDOztBQUVoRCxRQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzs7QUFFOUIsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFBTSxNQUFLLHNCQUFzQixFQUFFO0tBQUEsQ0FBQyxDQUNuRSxDQUFDOztBQUVGLFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsRUFBRTs7QUFFbEMsNENBQXNDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDekUsNENBQXNDLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDO0tBQ3BGLENBQUMsQ0FDSCxDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyw0Q0FBeUI7QUFDeEMsc0JBQWdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzNDLG9CQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3ZDLHdCQUFrQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM5QywyQkFBcUIsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDcEQsa0NBQTRCLEVBQUUsa0NBQU07QUFDbEMsdUNBQWtCLGlCQUFpQixDQUFDLE1BQUssc0JBQXNCLENBQUMsSUFBSSxPQUFNLENBQUMsQ0FBQztPQUM3RTtBQUNELG9DQUE4QixFQUFFLG9DQUFNO0FBQ3BDLHVDQUFrQixtQkFBbUIsQ0FBQyxNQUFLLDJCQUEyQixDQUFDLElBQUksT0FBTSxDQUFDLENBQUM7T0FDcEY7QUFDRCw0Q0FBc0MsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVyxLQUFLLENBQUM7QUFDMUYsc0RBQWdELEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO0FBQzFGLGdEQUEwQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN4RSx3Q0FBa0MsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDakUsMENBQW9DLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVcsS0FBSyxDQUFDO0FBQ3RGLG9EQUE4QyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztBQUN0Riw2Q0FBdUMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUMzRSxnREFBMEMsRUFDeEMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDM0Msa0RBQTRDLEVBQzFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzdDLGtEQUE0QyxFQUMxQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM3QyxtREFBNkMsRUFDM0MsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDOUMsZ0NBQTBCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUQseURBQW1ELEVBQ2pELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzVDLDBDQUFvQyxFQUFFO2VBQU0sK0JBQWtCLGdCQUFnQixFQUFFO09BQUE7QUFDaEYsNkNBQXVDLEVBQUUsNkNBQU07QUFDN0MsdUNBQWtCLG1CQUFtQixDQUFDLE1BQUssc0JBQXNCLENBQUMsSUFBSSxPQUFNLENBQUMsQ0FBQztPQUMvRTtBQUNELDZDQUF1QyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzNFLDhDQUF3QyxFQUFFLElBQUksQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQzdFLENBQUMsQ0FDSCxDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGlCQUFpQixFQUFFO0FBQ25DLHlDQUFtQyxFQUFFLElBQUksQ0FBQyxxQkFBcUIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQzNFLENBQUMsQ0FDSCxDQUFDO0FBQ0YsUUFBSSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksRUFBRTtBQUN2QixVQUFJLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDbEM7QUFDRCxRQUFJLENBQUMsWUFBWSxHQUFHLHNDQUF5QixDQUFDO0dBQy9DOztlQTNFRyxrQkFBa0I7O1dBNkVBLGdDQUFDLFFBQWlCLEVBQVE7QUFDOUMsVUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlCLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDOUI7S0FDRjs7O1dBRTBCLHFDQUFDLElBQWEsRUFBUTtBQUMvQyxVQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyw2QkFBZ0IsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDeEQ7S0FDRjs7O1dBRXFCLGtDQUFTOzs7QUFHN0IsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBQSxTQUFTO2VBQ3BFLDZCQUFnQixnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7T0FDNUMsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FDbEMsVUFBQSxTQUFTO2VBQUksNkJBQWdCLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7T0FBQSxDQUMvRCxDQUFDO0FBQ0YsVUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUNuRDs7O1dBRWdCLDJCQUFDLEtBQVksRUFBUTtBQUNwQyxVQUFNLGFBQWEsR0FBSyxLQUFLLENBQUMsTUFBTSxBQUErQixDQUFDO0FBQ3BFLFVBQ0UsYUFBYSxJQUFJLElBQUksSUFDbEIsT0FBTyxhQUFhLENBQUMsUUFBUSxLQUFLLFVBQVUsSUFDNUMsQ0FBQywrQkFBYSxhQUFhLENBQUMsUUFBUSxFQUFFLENBQUMsRUFDMUM7QUFDQSxlQUFPO09BQ1I7O0FBRUQsVUFBTSxRQUFRLEdBQUcsYUFBYSxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQ3BELFVBQUksQ0FBQyxlQUFlLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDaEM7Ozs7Ozs7O1dBTWUsNEJBQXNDO1VBQXJDLFlBQXNCLHlEQUFHLElBQUk7O0FBQzVDLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsbUJBQW1CLEVBQUUsQ0FBQztBQUNwRCxVQUFNLFFBQVEsR0FBRyxNQUFNLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxPQUFPLEVBQUUsR0FBRyxJQUFJLENBQUM7QUFDMUQsVUFBSSxDQUFDLGVBQWUsQ0FBQyxRQUFRLEVBQUUsWUFBWSxDQUFDLENBQUM7S0FDOUM7OztXQUVjLHlCQUFDLFFBQWlCLEVBQXVDO1VBQXJDLFlBQXNCLHlEQUFHLElBQUk7O0FBQzlELFVBQUksWUFBWSxFQUFFOzs7QUFHaEIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsMEJBQTBCLEVBQzFCLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUNoQixDQUFDO09BQ0g7O0FBRUQsVUFBSSxDQUFDLFFBQVEsRUFBRTtBQUNiLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzlCOzs7Ozs7OztXQU1vQiwrQkFBQyxLQUFZLEVBQVE7QUFDeEMsVUFBTSxHQUFHLEdBQUssS0FBSyxDQUFDLGFBQWEsQUFBZ0IsQ0FBQztBQUNsRCxVQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDckQsVUFBSSxDQUFDLEtBQUssRUFBRTs7QUFFVixlQUFPO09BQ1I7O0FBRUQsVUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDcEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQ3BCLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsRUFDbEMsMEJBQTBCLEVBQzFCLEVBQUMsT0FBTyxFQUFFLElBQUksRUFBQyxDQUNoQixDQUFDO0FBQ0YsVUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQztLQUM5Qjs7O1dBRVksdUJBQUMsT0FBZ0IsRUFBUTs7O0FBQ3BDLFVBQUksQ0FBQyxPQUFPLEVBQUU7QUFDWixlQUFPO09BQ1I7QUFDRCxVQUFNLE9BQWdCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDNUQsVUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLGVBQU87T0FDUjtBQUNELFVBQU0sS0FBSyxHQUFHLEVBQUUsQ0FBQztBQUNqQixVQUFJLEdBQUcsR0FBRyxPQUFPLENBQUM7QUFDbEIsYUFBTyxHQUFHLElBQUksSUFBSSxJQUFJLEdBQUcsS0FBSyxPQUFPLEVBQUU7QUFDckMsYUFBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNoQixXQUFHLEdBQUcsNkJBQWdCLFlBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztPQUN6Qzs7QUFFRCxXQUFLLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDaEIsV0FBSyxDQUFDLE9BQU8sQ0FBQyxVQUFDLFFBQVEsRUFBRSxDQUFDLEVBQUs7QUFDN0IsWUFBTSxTQUFTLEdBQUcsQUFBQyxDQUFDLEtBQUssQ0FBQyxHQUFJLE9BQU8sR0FBRyxLQUFLLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ3JELGVBQUssUUFBUSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzVELGVBQUssUUFBUSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDOUMsQ0FBQyxDQUFDO0FBQ0gsVUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztLQUM1Qzs7O1dBRXdCLG1DQUFDLHNCQUErQixFQUFRO0FBQy9ELFVBQUksQ0FBQyxRQUFRLENBQUMseUJBQXlCLENBQUMsc0JBQXNCLENBQUMsQ0FBQztLQUNqRTs7O1dBRWtCLDZCQUFDLGdCQUF5QixFQUFRO0FBQ25ELFVBQUksQ0FBQyxRQUFRLENBQUMsbUJBQW1CLENBQUMsZ0JBQWdCLENBQUMsQ0FBQztLQUNyRDs7O1dBRWMseUJBQUMsWUFBMkIsRUFBUTtBQUNqRCxVQUFJLENBQUMsUUFBUSxDQUFDLGVBQWUsQ0FBQyxZQUFZLENBQUMsQ0FBQztLQUM3Qzs7O1dBRWdCLDJCQUFDLGNBQXVCLEVBQVE7QUFDL0MsVUFBSSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNqRDs7Ozs7Ozs7V0FNaUIsOEJBQThCOzs7VUFBN0IsSUFBYSx5REFBRyxLQUFLOztBQUN0QyxVQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUM7QUFDckQsVUFBTSxpQkFBaUIsR0FBRyxhQUFhLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDaEQsVUFBSSxhQUFhLENBQUMsSUFBSSxLQUFLLENBQUMsSUFDdkIsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLElBQ3pCLEVBQUUsaUJBQWlCLENBQUMsV0FBVyxJQUFJLGlCQUFpQixDQUFDLFVBQVUsRUFBRSxDQUFBLEFBQUMsRUFBRTs7Ozs7OztBQU92RSxZQUFJLENBQUMsYUFBYSxDQUFDLDZCQUFnQixZQUFZLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztPQUM3RSxNQUFNO0FBQ0wscUJBQWEsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7O0FBRTVCLGNBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLG1CQUFPO1dBQ1I7O0FBRUQsY0FBSSxJQUFJLEVBQUU7QUFDUixtQkFBSyxRQUFRLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDNUQsTUFBTTtBQUNMLG1CQUFLLFFBQVEsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDeEQ7U0FDRixDQUFDLENBQUM7T0FDSjtLQUNGOzs7V0FFVyx3QkFBUzs7O0FBQ25CLFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDM0MsY0FBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLE9BQU87ZUFBSSxPQUFLLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDO09BQUEsQ0FBQyxDQUFDO0tBQy9FOzs7V0FFZSw0QkFBUzs7O0FBQ3ZCLFVBQU0sS0FBSyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUM3QyxVQUFJLEtBQUssQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO0FBQ3BCLGVBQU87T0FDUjs7QUFFRCxVQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLFVBQUEsSUFBSTtlQUFJLElBQUksQ0FBQyxNQUFNO09BQUEsQ0FBQyxDQUFDO0FBQ3BELFVBQUksU0FBUyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDeEIsWUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7aUJBQUksSUFBSSxDQUFDLFFBQVE7U0FBQSxDQUFDLENBQUM7QUFDdkQsWUFBTSxPQUFPLEdBQUcsZ0RBQWdELElBQzNELEtBQUssQ0FBQyxJQUFJLEdBQUcsQ0FBQyxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUEsQUFBQyxDQUFDO0FBQzFDLFlBQUksQ0FBQyxPQUFPLENBQUM7QUFDWCxpQkFBTyxFQUFFO0FBQ1Asb0JBQVEsRUFBRSxrQkFBTTtBQUFFLHFCQUFLLFFBQVEsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO2FBQUU7QUFDeEQsb0JBQVEsRUFBRSxrQkFBTSxFQUFFO1dBQ25CO0FBQ0QseUJBQWUsd0JBQXNCLGdCQUFHLEdBQUcsR0FBRyxhQUFhLENBQUMsSUFBSSxDQUFDLGdCQUFHLEdBQUcsQ0FBQyxBQUFFO0FBQzFFLGlCQUFPLEVBQVAsT0FBTztTQUNSLENBQUMsQ0FBQztPQUNKLE1BQU07QUFDTCxZQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osWUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtBQUN4QixpQkFBTyw2QkFBMEIsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLFFBQVEsMEJBQXFCLENBQUM7U0FDbEYsTUFBTTtBQUNMLGNBQU0sYUFBYSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsVUFBQSxJQUFJOzBCQUFRLElBQUksQ0FBQyxRQUFRO1dBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUM3RSxpQkFBTyw2QkFBMkIsYUFBYSx3QkFBb0IsQ0FBQztTQUNyRTs7QUFFRCxZQUFJLENBQUMsT0FBTyxDQUFDO0FBQ1gsaUJBQU8sRUFBRSxDQUFDLElBQUksQ0FBQztBQUNmLGlCQUFPLEVBQVAsT0FBTztTQUNSLENBQUMsQ0FBQztPQUNKO0tBQ0Y7Ozs7Ozs7V0FLZSwwQkFBQyxJQUFhLEVBQVE7OztBQUNwQyxVQUFJLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSSxFQUFJOztBQUU3QyxZQUFJLENBQUMsSUFBSSxDQUFDLFdBQVcsRUFBRTtBQUNyQixpQkFBTztTQUNSOztBQUVELFlBQUksSUFBSSxFQUFFO0FBQ1IsaUJBQUssUUFBUSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUMxRCxNQUFNO0FBQ0wsaUJBQUssUUFBUSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztTQUN0RDtPQUNGLENBQUMsQ0FBQztLQUNKOzs7V0FFUSxxQkFBUztBQUNoQixVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDekIsZUFBTztPQUNSOztBQUVELFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0QsVUFBSSxlQUFlLElBQUksSUFBSSxFQUFFOztBQUUzQixZQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7QUFDbEIsZUFBTztPQUNSOztBQUVELFVBQUksU0FBUyxZQUFBLENBQUM7QUFDZCxVQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osVUFBSSxXQUFXLFlBQUEsQ0FBQztBQUNoQixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN0RCxVQUFJLE1BQU0sRUFBRTtBQUNWLGVBQU8sR0FBRyxlQUFlLENBQUM7O0FBRTFCLG1CQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUN6QyxNQUFNO0FBQ0wsaUJBQVMsR0FBRyw2QkFBZ0IsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzFELGVBQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFckQsaUNBQVUsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLG1CQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDbEU7Ozs7QUFJRCxVQUFJLE9BQU8sSUFBSSxJQUFJLElBQUssQ0FBQyxNQUFNLElBQUksU0FBUyxJQUFJLElBQUksQUFBQyxFQUFFO0FBQ3JELGVBQU87T0FDUjs7QUFFRCxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQztBQUMxRSxVQUNFLDZCQUFnQixRQUFRLENBQUMsZUFBZSxDQUFDLElBQ3pDLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsSUFDaEQsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQ25COztBQUVBLFlBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7T0FDaEQsTUFBTTtBQUNMLFlBQU0sS0FBSyxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDbkQsWUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUM7O0FBRXhDLFlBQUksS0FBSyxHQUFHLFFBQVEsRUFBRTtBQUNwQixjQUFNLGNBQWMsR0FBRyxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDOztBQUU5QyxjQUFJLE1BQU0sRUFBRTs7O0FBR1YsbUJBQU8sR0FBRyxjQUFjLENBQUM7V0FDMUI7OztBQUdELGNBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNELE1BQU07QUFDTCxjQUFNLHNCQUFzQixHQUFHLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsZUFBZSxDQUFDLENBQUM7Ozs7QUFJMUYsY0FBSSxzQkFBc0IsSUFBSSxJQUFJLEVBQUU7QUFDbEMsZ0JBQUksQ0FBQyxtQkFBbUIsQ0FBQyxzQkFBc0IsQ0FBQyxPQUFPLEVBQUUsc0JBQXNCLENBQUMsT0FBTyxDQUFDLENBQUM7V0FDMUY7U0FDRjtPQUNGO0tBQ0Y7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3pCLGVBQU87T0FDUjs7QUFFRCxVQUFNLGVBQWUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGVBQWUsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQzdELFVBQUksZUFBZSxJQUFJLElBQUksRUFBRTs7QUFFM0IsWUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO0FBQ3JCLGVBQU87T0FDUjs7QUFFRCxVQUFJLFNBQVMsWUFBQSxDQUFDO0FBQ2QsVUFBSSxPQUFPLFlBQUEsQ0FBQztBQUNaLFVBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxTQUFTLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDdEQsVUFBSSxNQUFNLEVBQUU7QUFDVixlQUFPLEdBQUcsZUFBZSxDQUFDOztBQUUxQixtQkFBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDekMsTUFBTTtBQUNMLGlCQUFTLEdBQUcsNkJBQWdCLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUMxRCxlQUFPLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxhQUFhLENBQUMsZUFBZSxDQUFDLENBQUM7O0FBRXJELGlDQUFVLE9BQU8sSUFBSSxTQUFTLENBQUMsQ0FBQztBQUNoQyxtQkFBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLFNBQVMsQ0FBQyxDQUFDO09BQ2xFOzs7O0FBSUQsVUFBSSxPQUFPLElBQUksSUFBSSxJQUFLLENBQUMsTUFBTSxJQUFJLFNBQVMsSUFBSSxJQUFJLEFBQUMsRUFBRTtBQUNyRCxlQUFPO09BQ1I7O0FBRUQsVUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNuRCxVQUFJLEtBQUssS0FBSyxDQUFDLEVBQUU7QUFDZixZQUFJLENBQUMsTUFBTSxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7O0FBRWhDLGNBQUksQ0FBQyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7U0FDOUM7OztPQUdGLE1BQU07QUFDTCxjQUFNLGtCQUFrQixHQUFHLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRWxELGNBQUksTUFBTSxFQUFFOzs7QUFHVixtQkFBTyxHQUFHLGtCQUFrQixDQUFDO1dBQzlCOztBQUVELGNBQUksQ0FBQyxtQkFBbUIsQ0FDdEIsT0FBTyxFQUNQLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsa0JBQWtCLENBQUMsQ0FDOUQsQ0FBQztTQUNIO0tBQ0Y7OztXQUVTLHNCQUFTO0FBQ2pCLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUN6QixlQUFPO09BQ1I7O0FBRUQsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQyxVQUFJLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFWSx5QkFBUztBQUNwQixVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDekIsZUFBTztPQUNSOzs7QUFHRCxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNDLFVBQU0sV0FBVyxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO0FBQ2xELFVBQUksQ0FBQyxtQkFBbUIsQ0FDdEIsV0FBVyxFQUNYLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLENBQzNELENBQUM7S0FDSDs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FrQjBCLHFDQUFDLE9BQWUsRUFBRSxPQUFlLEVBQVU7QUFDcEUsVUFBSSxFQUFFLDZCQUFnQixRQUFRLENBQUMsT0FBTyxDQUFDLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFBLEFBQUMsRUFBRTs7O0FBR3BGLGVBQU8sT0FBTyxDQUFDO09BQ2hCOztBQUVELFVBQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ25FLFVBQUksU0FBUyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUU7O0FBRTFCLGVBQU8sT0FBTyxDQUFDO09BQ2hCOzs7QUFHRCxhQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLFNBQVMsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUNuRjs7Ozs7Ozs7Ozs7Ozs7Ozs7V0FlMEIscUNBQUMsT0FBZSxFQUFFLE9BQWUsRUFBcUI7QUFDL0UsVUFBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLFVBQUksV0FBVyxZQUFBLENBQUM7QUFDaEIsVUFBTSxNQUFNLEdBQUcsT0FBTyxLQUFLLE9BQU8sQ0FBQztBQUNuQyxVQUFJLE1BQU0sRUFBRTs7QUFFVixtQkFBVyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7T0FDekMsTUFBTTtBQUNMLGlCQUFTLEdBQUcsNkJBQWdCLFlBQVksQ0FBQyxPQUFPLENBQUMsQ0FBQzs7QUFFbEQsaUNBQVUsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLG1CQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDbEU7O0FBRUQsVUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUMzQyxVQUFJLEtBQUssR0FBSSxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQUFBQyxFQUFFO0FBQ3BDLFlBQU0sV0FBVyxHQUFHLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7OztBQUczQyxlQUFPLE1BQU0sR0FDVCxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFdBQVcsRUFBQyxHQUM1QyxFQUFDLE9BQU8sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFQLE9BQU8sRUFBQyxDQUFDO09BQ3JDLE1BQU0sSUFBSSxTQUFTLElBQUksSUFBSSxFQUFFOztBQUU1QixlQUFPLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDN0QsTUFBTTs7O0FBR0wsZUFBTyxJQUFJLENBQUM7T0FDYjtLQUNGOzs7V0FFaUIsOEJBQVM7QUFDekIsVUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0FBRS9ELFVBQUksa0JBQWtCLElBQUksSUFBSSxFQUFFO0FBQzlCLFlBQUksQ0FBQyxRQUFRLENBQUMsV0FBVyxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztPQUNuRjtLQUNGOzs7V0FFc0IsaUNBQUMsV0FBc0MsRUFBRSxJQUF3QixFQUFRO0FBQzlGLFVBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDOztBQUUvRCxVQUFJLGtCQUFrQixJQUFJLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLFdBQVcsRUFBRTs7QUFFakUsOEJBQU0scUJBQXFCLEVBQUU7QUFDM0IscUJBQVcsRUFBWCxXQUFXO0FBQ1gsY0FBSSxFQUFKLElBQUk7U0FDTCxDQUFDLENBQUM7QUFDSCxZQUFJLENBQUMsUUFBUSxDQUFDLHNCQUFzQixDQUNsQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQzFCLFdBQVcsRUFDWCxJQUFJLENBQ0wsQ0FBQztPQUNIO0tBQ0Y7OztXQUV3QixxQ0FBUztBQUNoQyxVQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxDQUFDO0tBQ3BEOzs7V0FFMEIsdUNBQVM7QUFDbEMsVUFBSSxDQUFDLHVCQUF1QixDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsQ0FBQztLQUNuRDs7O1dBRTBCLHVDQUFTO0FBQ2xDLFVBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDdEQ7OztXQUUyQix3Q0FBUztBQUNuQyxVQUFJLENBQUMsdUJBQXVCLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFeUIsc0NBQVM7OztBQUNqQyxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDckQsVUFBSSxRQUFRLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7OztBQUV2QyxjQUFNLGNBQWMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxDQUFDO0FBQ3ZELGNBQU0sS0FBSyxHQUFHLE9BQUssTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ3hDLHdCQUFjLENBQUMsT0FBTyxDQUFDLFVBQUEsTUFBTSxFQUFJO0FBQy9CLGdCQUFNLElBQUksR0FBRyxNQUFNLENBQUMsT0FBTyxFQUFFLENBQUM7Ozs7QUFJOUIsZ0JBQ0UsSUFBSSxJQUFJLElBQUksSUFDWixJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsSUFDbEMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxVQUFBLElBQUk7cUJBQUksSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUM7YUFBQSxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsRUFDeEQ7QUFDQSxrQkFBSSxDQUFDLFNBQVMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2FBQ3JEO1dBQ0YsQ0FBQyxDQUFDOztBQUVILGNBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQzs7T0FDNUM7S0FDRjs7O1dBRWlCLDRCQUFDLEtBQVksRUFBUTs7O0FBR3JDLFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUNsQixLQUFLLENBQUMsTUFBTSxFQUNkLHdDQUF3QyxDQUN6QyxDQUFDO0tBQ0g7OztXQUVpQiw4QkFBUztBQUN6QixVQUFNLElBQUksR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDakQsVUFBSSxJQUFJLElBQUksSUFBSSxFQUFFOztBQUVoQixlQUFPO09BQ1I7QUFDRCx5QkFBTSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7S0FDdkM7OztXQUVrQiw2QkFBQyxPQUFlLEVBQUUsT0FBZSxFQUFROztBQUUxRCxVQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUMsQ0FBQztBQUNqRCxVQUFJLENBQUMsUUFBUSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDaEQ7OztXQUVZLHlCQUFTO0FBQ3BCLFVBQU0sa0JBQWtCLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQy9ELFVBQUksa0JBQWtCLElBQUksSUFBSSxFQUFFO0FBQzlCLFlBQUksQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7T0FDekQ7S0FDRjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFdBQUssSUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ2pFLGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7QUFDRCxVQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVRLHFCQUE0QjtBQUNuQyxhQUFPO0FBQ0wsWUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO09BQy9CLENBQUM7S0FDSDs7O1NBMW5CRyxrQkFBa0I7OztBQTZuQnhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0V4cG9ydFN0b3JlRGF0YX0gZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RVZFTlRfSEFORExFUl9TRUxFQ1RPUn0gIGZyb20gJy4vRmlsZVRyZWVDb25zdGFudHMnO1xuaW1wb3J0IEZpbGVTeXN0ZW1BY3Rpb25zIGZyb20gJy4vRmlsZVN5c3RlbUFjdGlvbnMnO1xuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuL0ZpbGVUcmVlQWN0aW9ucyc7XG5pbXBvcnQgRmlsZVRyZWVDb250ZXh0TWVudSBmcm9tICcuL0ZpbGVUcmVlQ29udGV4dE1lbnUnO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7aXNUZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG50eXBlIEZpbGVUcmVlTm9kZURhdGEgPSB7XG4gIG5vZGVLZXk6IHN0cmluZztcbiAgcm9vdEtleTogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgRmlsZVRyZWVDb250cm9sbGVyU3RhdGUgPSB7XG4gIHRyZWU6IEV4cG9ydFN0b3JlRGF0YTtcbn07XG5cbmNsYXNzIEZpbGVUcmVlQ29udHJvbGxlciB7XG4gIF9hY3Rpb25zOiBGaWxlVHJlZUFjdGlvbnM7XG4gIF9jb250ZXh0TWVudTogRmlsZVRyZWVDb250ZXh0TWVudTtcbiAgX3JlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+O1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIElEaXNwb3NhYmxlPjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlKSB7XG4gICAgdGhpcy5fYWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gSW5pdGlhbCByb290IGRpcmVjdG9yaWVzXG4gICAgdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCk7XG4gICAgLy8gU3Vic2VxdWVudCByb290IGRpcmVjdG9yaWVzIHVwZGF0ZWQgb24gY2hhbmdlXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB0aGlzLl91cGRhdGVSb290RGlyZWN0b3JpZXMoKSlcbiAgICApO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgIC8vIFBhc3MgdW5kZWZpbmVkIHNvIHRoZSBkZWZhdWx0IHBhcmFtZXRlciBnZXRzIHVzZWQuXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtdGV4dC1lZGl0b3InOiB0aGlzLl9yZXZlYWxUZXh0RWRpdG9yLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtYWN0aXZlLWZpbGUnOiB0aGlzLnJldmVhbEFjdGl2ZUZpbGUuYmluZCh0aGlzLCB1bmRlZmluZWQpLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoRVZFTlRfSEFORExFUl9TRUxFQ1RPUiwge1xuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiB0aGlzLl9tb3ZlRG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXVwJzogdGhpcy5fbW92ZVVwLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogdGhpcy5fbW92ZVRvVG9wLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogdGhpcy5fbW92ZVRvQm90dG9tLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuQWRkRmlsZURpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRmlsZVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZm9sZGVyJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5BZGRGb2xkZXJEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbERpcmVjdG9yeVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1jb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIHRydWUpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWNvbGxhcHNlLWFsbCc6IHRoaXMuX2NvbGxhcHNlQWxsLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb3B5LWZ1bGwtcGF0aCc6IHRoaXMuX2NvcHlGdWxsUGF0aC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6ZXhwYW5kLWRpcmVjdG9yeSc6IHRoaXMuX2V4cGFuZFNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1leHBhbmQtZGlyZWN0b3J5JzogdGhpcy5fZXhwYW5kU2VsZWN0aW9uLmJpbmQodGhpcywgdHJ1ZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5JzogdGhpcy5fb3BlblNlbGVjdGVkRW50cnkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktdXAnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1kb3duJzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1sZWZ0JzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0TGVmdC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUnOiB0aGlzLl9kZWxldGVTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZS1wcm9qZWN0LWZvbGRlci1zZWxlY3Rpb24nOlxuICAgICAgICAgIHRoaXMuX3JlbW92ZVJvb3RGb2xkZXJTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbmFtZS1zZWxlY3Rpb24nOiAoKSA9PiBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuUmVuYW1lRGlhbG9nKCksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpkdXBsaWNhdGUtc2VsZWN0aW9uJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5EdXBsaWNhdGVEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbEZpbGVQYXRoLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6c2VhcmNoLWluLWRpcmVjdG9yeSc6IHRoaXMuX3NlYXJjaEluRGlyZWN0b3J5LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcic6IHRoaXMuX3Nob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcyksXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnW2lzPVwidGFicy10YWJcIl0nLCB7XG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtdGFiLWZpbGUnOiB0aGlzLl9yZXZlYWxUYWJGaWxlT25DbGljay5iaW5kKHRoaXMpLFxuICAgICAgfSlcbiAgICApO1xuICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS50cmVlKSB7XG4gICAgICB0aGlzLl9zdG9yZS5sb2FkRGF0YShzdGF0ZS50cmVlKTtcbiAgICB9XG4gICAgdGhpcy5fY29udGV4dE1lbnUgPSBuZXcgRmlsZVRyZWVDb250ZXh0TWVudSgpO1xuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxGaWxlUGF0aChmaWxlUGF0aDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChmaWxlUGF0aCAhPSBudWxsKSB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxEaXJlY3RvcnlQYXRoKHBhdGg6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAocGF0aCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShwYXRoKSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgcmVtb3RlLXByb2plY3RzIHBhY2thZ2UgaGFzbid0IGxvYWRlZCB5ZXQgcmVtb3RlIGRpcmVjdG9yaWVzIHdpbGwgYmUgaW5zdGFudGlhdGVkIGFzXG4gICAgLy8gbG9jYWwgZGlyZWN0b3JpZXMgYnV0IHdpdGggaW52YWxpZCBwYXRocy4gV2UgbmVlZCB0byBleGNsdWRlIHRob3NlLlxuICAgIGNvbnN0IHJvb3REaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcihkaXJlY3RvcnkgPT4gKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmlzVmFsaWREaXJlY3RvcnkoZGlyZWN0b3J5KVxuICAgICkpO1xuICAgIGNvbnN0IHJvb3RLZXlzID0gcm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKTtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFJvb3RLZXlzKHJvb3RLZXlzKTtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVJlcG9zaXRvcmllcyhyb290RGlyZWN0b3JpZXMpO1xuICB9XG5cbiAgX3JldmVhbFRleHRFZGl0b3IoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yRWxlbWVudCA9ICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50KTtcbiAgICBpZiAoXG4gICAgICBlZGl0b3JFbGVtZW50ID09IG51bGxcbiAgICAgIHx8IHR5cGVvZiBlZGl0b3JFbGVtZW50LmdldE1vZGVsICE9PSAnZnVuY3Rpb24nXG4gICAgICB8fCAhaXNUZXh0RWRpdG9yKGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRQYXRoKCk7XG4gICAgdGhpcy5fcmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldmVhbCB0aGUgZmlsZSB0aGF0IGN1cnJlbnRseSBoYXMgZm9jdXMgaW4gdGhlIGZpbGUgdHJlZS4gSWYgc2hvd0lmSGlkZGVuIGlzIGZhbHNlLFxuICAgKiB0aGlzIHdpbGwgZW5xdWV1ZSBhIHBlbmRpbmcgcmV2ZWFsIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZpbGUgdHJlZSBpcyBzaG93biBhZ2Fpbi5cbiAgICovXG4gIHJldmVhbEFjdGl2ZUZpbGUoc2hvd0lmSGlkZGVuPzogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IgIT0gbnVsbCA/IGVkaXRvci5nZXRQYXRoKCkgOiBudWxsO1xuICAgIHRoaXMuX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoLCBzaG93SWZIaWRkZW4pO1xuICB9XG5cbiAgX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoOiA/c3RyaW5nLCBzaG93SWZIaWRkZW4/OiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzaG93SWZIaWRkZW4pIHtcbiAgICAgIC8vIEVuc3VyZSB0aGUgZmlsZSB0cmVlIGlzIHZpc2libGUgYmVmb3JlIHRyeWluZyB0byByZXZlYWwgYSBmaWxlIGluIGl0LiBFdmVuIGlmIHRoZSBjdXJyZW50bHlcbiAgICAgIC8vIGFjdGl2ZSBwYW5lIGlzIG5vdCBhbiBvcmRpbmFyeSBlZGl0b3IsIHdlIHN0aWxsIGF0IGxlYXN0IHdhbnQgdG8gc2hvdyB0aGUgdHJlZS5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTp0b2dnbGUnLFxuICAgICAgICB7ZGlzcGxheTogdHJ1ZX1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUmV2ZWFsIHRoZSBmaWxlIG9mIGEgZ2l2ZW4gdGFiIGJhc2VkIG9uIHRoZSBwYXRoIHN0b3JlZCBvbiB0aGUgRE9NLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtZWFudCB0byBiZSB0cmlnZ2VyZWQgYnkgdGhlIGNvbnRleHQtbWVudSBjbGljay5cbiAgICovXG4gIF9yZXZlYWxUYWJGaWxlT25DbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCB0YWIgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEVsZW1lbnQpO1xuICAgIGNvbnN0IHRpdGxlID0gdGFiLnF1ZXJ5U2VsZWN0b3IoJy50aXRsZVtkYXRhLXBhdGhdJyk7XG4gICAgaWYgKCF0aXRsZSkge1xuICAgICAgLy8gY2FuIG9ubHkgcmV2ZWFsIGl0IGlmIHdlIGZpbmQgdGhlIGZpbGUgcGF0aFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGl0bGUuZGF0YXNldC5wYXRoO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnRvZ2dsZScsXG4gICAgICB7ZGlzcGxheTogdHJ1ZX1cbiAgICApO1xuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICByZXZlYWxOb2RlS2V5KG5vZGVLZXk6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIW5vZGVLZXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleTogP3N0cmluZyA9IHRoaXMuX3N0b3JlLmdldFJvb3RGb3JLZXkobm9kZUtleSk7XG4gICAgaWYgKCFyb290S2V5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgbGV0IGtleSA9IG5vZGVLZXk7XG4gICAgd2hpbGUgKGtleSAhPSBudWxsICYmIGtleSAhPT0gcm9vdEtleSkge1xuICAgICAgc3RhY2sucHVzaChrZXkpO1xuICAgICAga2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShrZXkpO1xuICAgIH1cbiAgICAvLyBXZSB3YW50IHRoZSBzdGFjayB0byBiZSBbcGFyZW50S2V5LCAuLi4sIG5vZGVLZXldLlxuICAgIHN0YWNrLnJldmVyc2UoKTtcbiAgICBzdGFjay5mb3JFYWNoKChjaGlsZEtleSwgaSkgPT4ge1xuICAgICAgY29uc3QgcGFyZW50S2V5ID0gKGkgPT09IDApID8gcm9vdEtleSA6IHN0YWNrW2kgLSAxXTtcbiAgICAgIHRoaXMuX2FjdGlvbnMuZW5zdXJlQ2hpbGROb2RlKHJvb3RLZXksIHBhcmVudEtleSwgY2hpbGRLZXkpO1xuICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lcyk7XG4gIH1cblxuICBzZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxhcHNlcyBhbGwgc2VsZWN0ZWQgZGlyZWN0b3J5IG5vZGVzLiBJZiB0aGUgc2VsZWN0aW9uIGlzIGEgc2luZ2xlIGZpbGUgb3IgYSBzaW5nbGUgY29sbGFwc2VkXG4gICAqIGRpcmVjdG9yeSwgdGhlIHNlbGVjdGlvbiBpcyBzZXQgdG8gdGhlIGRpcmVjdG9yeSdzIHBhcmVudC5cbiAgICovXG4gIF9jb2xsYXBzZVNlbGVjdGlvbihkZWVwOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGNvbnN0IGZpcnN0U2VsZWN0ZWROb2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGlmIChzZWxlY3RlZE5vZGVzLnNpemUgPT09IDFcbiAgICAgICYmICFmaXJzdFNlbGVjdGVkTm9kZS5pc1Jvb3RcbiAgICAgICYmICEoZmlyc3RTZWxlY3RlZE5vZGUuaXNDb250YWluZXIgJiYgZmlyc3RTZWxlY3RlZE5vZGUuaXNFeHBhbmRlZCgpKSkge1xuICAgICAgLypcbiAgICAgICAqIFNlbGVjdCB0aGUgcGFyZW50IG9mIHRoZSBzZWxlY3Rpb24gaWYgdGhlIGZvbGxvd2luZyBjcml0ZXJpYSBhcmUgbWV0OlxuICAgICAgICogICAqIE9ubHkgMSBub2RlIGlzIHNlbGVjdGVkXG4gICAgICAgKiAgICogVGhlIG5vZGUgaXMgbm90IGEgcm9vdFxuICAgICAgICogICAqIFRoZSBub2RlIGlzIG5vdCBhbiBleHBhbmRlZCBkaXJlY3RvcnlcbiAgICAgICAqL1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkoZmlyc3RTZWxlY3RlZE5vZGUubm9kZUtleSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIC8vIE9ubHkgZGlyZWN0b3JpZXMgY2FuIGJlIGV4cGFuZGVkLiBTa2lwIG5vbi1kaXJlY3Rvcnkgbm9kZXMuXG4gICAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGVEZWVwKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZShub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9jb2xsYXBzZUFsbCgpOiB2b2lkIHtcbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgcm9vdEtleXMuZm9yRWFjaChyb290S2V5ID0+IHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlRGVlcChyb290S2V5LCByb290S2V5KSk7XG4gIH1cblxuICBfZGVsZXRlU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGlmIChub2Rlcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdFBhdGhzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZS5pc1Jvb3QpO1xuICAgIGlmIChyb290UGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRQYXRocyA9IG5vZGVzLm1hcChub2RlID0+IG5vZGUubm9kZVBhdGgpO1xuICAgICAgY29uc3QgbWVzc2FnZSA9ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoZSBmb2xsb3dpbmcgJyArXG4gICAgICAgICAgKG5vZGVzLnNpemUgPiAxID8gJ2l0ZW1zPycgOiAnaXRlbT8nKTtcbiAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAnRGVsZXRlJzogKCkgPT4geyB0aGlzLl9hY3Rpb25zLmRlbGV0ZVNlbGVjdGVkTm9kZXMoKTsgfSxcbiAgICAgICAgICAnQ2FuY2VsJzogKCkgPT4ge30sXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogYFlvdSBhcmUgZGVsZXRpbmc6JHtvcy5FT0x9JHtzZWxlY3RlZFBhdGhzLmpvaW4ob3MuRU9MKX1gLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgaWYgKHJvb3RQYXRocy5zaXplID09PSAxKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBgVGhlIHJvb3QgZGlyZWN0b3J5ICcke3Jvb3RQYXRocy5maXJzdCgpLm5vZGVOYW1lfScgY2FuJ3QgYmUgcmVtb3ZlZC5gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgcm9vdFBhdGhOYW1lcyA9IHJvb3RQYXRocy5tYXAobm9kZSA9PiBgJyR7bm9kZS5ub2RlTmFtZX0nYCkuam9pbignLCAnKTtcbiAgICAgICAgbWVzc2FnZSA9IGBUaGUgcm9vdCBkaXJlY3RvcmllcyAke3Jvb3RQYXRoTmFtZXN9IGNhbid0IGJlIHJlbW92ZWQuYDtcbiAgICAgIH1cblxuICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgYnV0dG9uczogWydPSyddLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIHNlbGVjdGVkIGRpcmVjdG9yeSBub2Rlcy5cbiAgICovXG4gIF9leHBhbmRTZWxlY3Rpb24oZGVlcDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgLy8gT25seSBkaXJlY3RvcmllcyBjYW4gYmUgZXhwYW5kZWQuIFNraXAgbm9uLWRpcmVjdG9yeSBub2Rlcy5cbiAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZURlZXAobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9tb3ZlRG93bigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFNlbGVjdGVkS2V5ID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChsYXN0U2VsZWN0ZWRLZXkgPT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gc2VsZWN0aW9uIHlldCwgc28gbW92ZSB0byB0aGUgdG9wIG9mIHRoZSB0cmVlLlxuICAgICAgdGhpcy5fbW92ZVRvVG9wKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBhcmVudEtleTtcbiAgICBsZXQgcm9vdEtleTtcbiAgICBsZXQgc2libGluZ0tleXM7XG4gICAgY29uc3QgaXNSb290ID0gdGhpcy5fc3RvcmUuaXNSb290S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgcm9vdEtleSA9IGxhc3RTZWxlY3RlZEtleTtcbiAgICAgIC8vIE90aGVyIHJvb3RzIGFyZSB0aGlzIHJvb3QncyBzaWJsaW5nc1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgICByb290S2V5ID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEZvcktleShsYXN0U2VsZWN0ZWRLZXkpO1xuXG4gICAgICBpbnZhcmlhbnQocm9vdEtleSAmJiBwYXJlbnRLZXkpO1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcm9vdCBkb2VzIG5vdCBleGlzdCBvciBpZiB0aGlzIGlzIGV4cGVjdGVkIHRvIGhhdmUgYSBwYXJlbnQgYnV0IGRvZXNuJ3QgKHJvb3RzIGRvXG4gICAgLy8gbm90IGhhdmUgcGFyZW50cyksIG5vdGhpbmcgY2FuIGJlIGRvbmUuIEV4aXQuXG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCB8fCAoIWlzUm9vdCAmJiBwYXJlbnRLZXkgPT0gbnVsbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChcbiAgICAgIEZpbGVUcmVlSGVscGVycy5pc0RpcktleShsYXN0U2VsZWN0ZWRLZXkpICYmXG4gICAgICB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHJvb3RLZXksIGxhc3RTZWxlY3RlZEtleSkgJiZcbiAgICAgIGNoaWxkcmVuLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIC8vIERpcmVjdG9yeSBpcyBleHBhbmRlZCBhbmQgaXQgaGFzIGNoaWxkcmVuLiBTZWxlY3QgZmlyc3QgY2hpbGQuIEV4aXQuXG4gICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgY2hpbGRyZW5bMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdLZXlzLmluZGV4T2YobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIGNvbnN0IG1heEluZGV4ID0gc2libGluZ0tleXMubGVuZ3RoIC0gMTtcblxuICAgICAgaWYgKGluZGV4IDwgbWF4SW5kZXgpIHtcbiAgICAgICAgY29uc3QgbmV4dFNpYmxpbmdLZXkgPSBzaWJsaW5nS2V5c1tpbmRleCArIDFdO1xuXG4gICAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgbmV4dCBzZWxlY3RlZCBpdGVtIGlzIGFub3RoZXIgcm9vdCwgc2V0IGByb290S2V5YCB0byBpdCBzbyB0cmFja0FuZFNlbGVjdCBmaW5kc1xuICAgICAgICAgIC8vIHRoYXQgW3Jvb3RLZXksIHJvb3RLZXldIHR1cGxlLlxuICAgICAgICAgIHJvb3RLZXkgPSBuZXh0U2libGluZ0tleTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaGFzIGEgbmV4dCBzaWJsaW5nLlxuICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgc2libGluZ0tleXNbaW5kZXggKyAxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZWFyZXN0QW5jZXN0b3JTaWJsaW5nID0gdGhpcy5fZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcocm9vdEtleSwgbGFzdFNlbGVjdGVkS2V5KTtcblxuICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBib3R0b21tb3N0IG5vZGUgb2YgdGhlIHRyZWUsIHRoZXJlIHdvbid0IGJlIGFueXRoaW5nIHRvIHNlbGVjdC5cbiAgICAgICAgLy8gVm9pZCByZXR1cm4gc2lnbmlmaWVzIG5vIG5leHQgbm9kZSB3YXMgZm91bmQuXG4gICAgICAgIGlmIChuZWFyZXN0QW5jZXN0b3JTaWJsaW5nICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUobmVhcmVzdEFuY2VzdG9yU2libGluZy5yb290S2V5LCBuZWFyZXN0QW5jZXN0b3JTaWJsaW5nLm5vZGVLZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX21vdmVVcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFNlbGVjdGVkS2V5ID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChsYXN0U2VsZWN0ZWRLZXkgPT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gc2VsZWN0aW9uLiBNb3ZlIHRvIHRoZSBib3R0b20gb2YgdGhlIHRyZWUuXG4gICAgICB0aGlzLl9tb3ZlVG9Cb3R0b20oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGFyZW50S2V5O1xuICAgIGxldCByb290S2V5O1xuICAgIGxldCBzaWJsaW5nS2V5cztcbiAgICBjb25zdCBpc1Jvb3QgPSB0aGlzLl9zdG9yZS5pc1Jvb3RLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoaXNSb290KSB7XG4gICAgICByb290S2V5ID0gbGFzdFNlbGVjdGVkS2V5O1xuICAgICAgLy8gT3RoZXIgcm9vdHMgYXJlIHRoaXMgcm9vdCdzIHNpYmxpbmdzXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIHJvb3RLZXkgPSB0aGlzLl9zdG9yZS5nZXRSb290Rm9yS2V5KGxhc3RTZWxlY3RlZEtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSByb290IGRvZXMgbm90IGV4aXN0IG9yIGlmIHRoaXMgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhIHBhcmVudCBidXQgZG9lc24ndCAocm9vdHMgZG9cbiAgICAvLyBub3QgaGF2ZSBwYXJlbnRzKSwgbm90aGluZyBjYW4gYmUgZG9uZS4gRXhpdC5cbiAgICBpZiAocm9vdEtleSA9PSBudWxsIHx8ICghaXNSb290ICYmIHBhcmVudEtleSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgaWYgKCFpc1Jvb3QgJiYgcGFyZW50S2V5ICE9IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgY2hpbGQuIEl0IGhhcyBhIHBhcmVudC4gU2VsZWN0IHRoZSBwYXJlbnQuXG4gICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgICAgfVxuICAgICAgLy8gVGhpcyBpcyB0aGUgcm9vdCBhbmQvb3IgdGhlIHRvcCBvZiB0aGUgdHJlZSAoaGFzIG5vIHBhcmVudCkuIE5vdGhpbmcgZWxzZSB0byB0cmF2ZXJzZS5cbiAgICAgIC8vIEV4aXQuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzU2libGluZ0tleSA9IHNpYmxpbmdLZXlzW2luZGV4IC0gMV07XG5cbiAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgLy8gSWYgdHJhdmVyc2luZyB1cCB0byBhIGRpZmZlcmVudCByb290LCB0aGUgcm9vdEtleSBtdXN0IGJlY29tZSB0aGF0IG5ldyByb290IHRvIGNoZWNrXG4gICAgICAgIC8vIGV4cGFuZGVkIGtleXMgaW4gaXQuXG4gICAgICAgIHJvb3RLZXkgPSBwcmV2aW91c1NpYmxpbmdLZXk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShcbiAgICAgICAgcm9vdEtleSxcbiAgICAgICAgdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleSwgcHJldmlvdXNTaWJsaW5nS2V5KVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfbW92ZVRvVG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXlzWzBdLCByb290S2V5c1swXSk7XG4gIH1cblxuICBfbW92ZVRvQm90dG9tKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3QgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50IG9mIHRoZSBsYXN0IHJvb3Qgbm9kZS5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgY29uc3QgbGFzdFJvb3RLZXkgPSByb290S2V5c1tyb290S2V5cy5sZW5ndGggLSAxXTtcbiAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUoXG4gICAgICBsYXN0Um9vdEtleSxcbiAgICAgIHRoaXMuX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KGxhc3RSb290S2V5LCBsYXN0Um9vdEtleSlcbiAgICApO1xuICB9XG5cbiAgLypcbiAgICogUmV0dXJucyB0aGUgbG93ZXJtb3N0IGRlc2NlbmRhbnQgd2hlbiBjb25zaWRlcmVkIGluIGZpbGUgc3lzdGVtIG9yZGVyIHdpdGggZXhwYW5kYWJsZVxuICAgKiBkaXJlY3Rvcmllcy4gRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqICAgQSA+XG4gICAqICAgICBCID5cbiAgICogICAgIEMgPlxuICAgKiAgICAgICBFLnR4dFxuICAgKiAgICAgRC5mb29cbiAgICpcbiAgICogICA+IF9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShBKVxuICAgKiAgIEQuZm9vXG4gICAqXG4gICAqIFRob3VnaCBBIGhhcyBtb3JlIGRlZXBseS1uZXN0ZWQgZGVzY2VuZGFudHMgdGhhbiBELmZvbywgbGlrZSBFLnR4dCwgRC5mb28gaXMgbG93ZXJtb3N0IHdoZW5cbiAgICogY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlci5cbiAgICovXG4gIF9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCEoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KG5vZGVLZXkpICYmIHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQocm9vdEtleSwgbm9kZUtleSkpKSB7XG4gICAgICAvLyBJZiBgbm9kZUtleWAgaXMgbm90IGFuIGV4cGFuZGVkIGRpcmVjdG9yeSB0aGVyZSBhcmUgbm8gbW9yZSBkZXNjZW5kYW50cyB0byB0cmF2ZXJzZS4gUmV0dXJuXG4gICAgICAvLyB0aGUgYG5vZGVLZXlgLlxuICAgICAgcmV0dXJuIG5vZGVLZXk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChjaGlsZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGhhcyBubyBjaGlsZHJlbiwgdGhlIGRpcmVjdG9yeSBpdHNlbGYgaXMgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50LlxuICAgICAgcmV0dXJuIG5vZGVLZXk7XG4gICAgfVxuXG4gICAgLy8gVGhlcmUncyBhdCBsZWFzdCBvbmUgY2hpbGQuIFJlY3Vyc2UgZG93biB0aGUgbGFzdCBjaGlsZC5cbiAgICByZXR1cm4gdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleSwgY2hpbGRLZXlzW2NoaWxkS2V5cy5sZW5ndGggLSAxXSk7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm5zIHRoZSBuZWFyZXN0IFwiYW5jZXN0b3Igc2libGluZ1wiIHdoZW4gY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlciB3aXRoIGV4cGFuZGFibGVcbiAgICogZGlyZWN0b3JpZXMuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiAgIEEgPlxuICAgKiAgICAgQiA+XG4gICAqICAgICAgIEMgPlxuICAgKiAgICAgICAgIEUudHh0XG4gICAqICAgRC5mb29cbiAgICpcbiAgICogICA+IF9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhFLnR4dClcbiAgICogICBELmZvb1xuICAgKi9cbiAgX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogP0ZpbGVUcmVlTm9kZURhdGEge1xuICAgIGxldCBwYXJlbnRLZXk7XG4gICAgbGV0IHNpYmxpbmdLZXlzO1xuICAgIGNvbnN0IGlzUm9vdCA9IHJvb3RLZXkgPT09IG5vZGVLZXk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgLy8gYHJvb3RLZXkgPT09IG5vZGVLZXlgIG1lYW5zIHRoaXMgaGFzIHJlY3Vyc2VkIHRvIGEgcm9vdC4gYG5vZGVLZXlgIGlzIGEgcm9vdCBrZXkuXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobm9kZUtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihub2RlS2V5KTtcbiAgICBpZiAoaW5kZXggPCAoc2libGluZ0tleXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZ0tleXNbaW5kZXggKyAxXTtcbiAgICAgIC8vIElmIHRyYXZlcnNpbmcgYWNyb3NzIHJvb3RzLCB0aGUgbmV4dCBzaWJsaW5nIGlzIGFsc28gdGhlIG5leHQgcm9vdC4gUmV0dXJuIGl0IGFzIHRoZSBuZXh0XG4gICAgICAvLyByb290IGtleSBhcyB3ZWxsIGFzIHRoZSBuZXh0IG5vZGUga2V5LlxuICAgICAgcmV0dXJuIGlzUm9vdFxuICAgICAgICA/IHtub2RlS2V5OiBuZXh0U2libGluZywgcm9vdEtleTogbmV4dFNpYmxpbmd9XG4gICAgICAgIDoge25vZGVLZXk6IG5leHRTaWJsaW5nLCByb290S2V5fTtcbiAgICB9IGVsc2UgaWYgKHBhcmVudEtleSAhPSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBhIHBhcmVudCB0byByZWN1cnNlLiBSZXR1cm4gaXRzIG5lYXJlc3QgYW5jZXN0b3Igc2libGluZy5cbiAgICAgIHJldHVybiB0aGlzLl9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBgcGFyZW50S2V5YCBpcyBudWxsLCBub2RlS2V5IGlzIGEgcm9vdCBhbmQgaGFzIG1vcmUgcGFyZW50cyB0byByZWN1cnNlLiBSZXR1cm4gYG51bGxgIHRvXG4gICAgICAvLyBzaWduaWZ5IG5vIGFwcHJvcHJpYXRlIGtleSB3YXMgZm91bmQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnkoKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgLy8gT25seSBwZXJmb3JtIHRoZSBkZWZhdWx0IGFjdGlvbiBpZiBhIHNpbmdsZSBub2RlIGlzIHNlbGVjdGVkLlxuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aW9ucy5jb25maXJtTm9kZShzaW5nbGVTZWxlY3RlZE5vZGUucm9vdEtleSwgc2luZ2xlU2VsZWN0ZWROb2RlLm5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KG9yaWVudGF0aW9uOiBhdG9tJFBhbmVTcGxpdE9yaWVudGF0aW9uLCBzaWRlOiBhdG9tJFBhbmVTcGxpdFNpZGUpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAvLyBPbmx5IHBlcmZvcm0gdGhlIGRlZmF1bHQgYWN0aW9uIGlmIGEgc2luZ2xlIG5vZGUgaXMgc2VsZWN0ZWQuXG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsICYmICFzaW5nbGVTZWxlY3RlZE5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgIC8vIGZvcjogaXMgdGhpcyBmZWF0dXJlIHVzZWQgZW5vdWdoIHRvIGp1c3RpZnkgdW5jb2xsYXBzaW5nP1xuICAgICAgdHJhY2soJ2ZpbGV0cmVlLXNwbGl0LWZpbGUnLCB7XG4gICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICBzaWRlLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9hY3Rpb25zLm9wZW5TZWxlY3RlZEVudHJ5U3BsaXQoXG4gICAgICAgIHNpbmdsZVNlbGVjdGVkTm9kZS5ub2RlS2V5LFxuICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgc2lkZSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCd2ZXJ0aWNhbCcsICdiZWZvcmUnKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bigpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCd2ZXJ0aWNhbCcsICdhZnRlcicpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRMZWZ0KCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ2hvcml6b250YWwnLCAnYmVmb3JlJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0KCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ2hvcml6b250YWwnLCAnYWZ0ZXInKTtcbiAgfVxuXG4gIF9yZW1vdmVSb290Rm9sZGVyU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKHJvb3ROb2RlICE9IG51bGwgJiYgcm9vdE5vZGUuaXNSb290KSB7XG4gICAgICAvLyBjbG9zZSBhbGwgdGhlIGZpbGVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvamVjdCBiZWZvcmUgY2xvc2luZ1xuICAgICAgY29uc3QgcHJvamVjdEVkaXRvcnMgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpO1xuICAgICAgY29uc3Qgcm9vdHMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgICAgcHJvamVjdEVkaXRvcnMuZm9yRWFjaChlZGl0b3IgPT4ge1xuICAgICAgICBjb25zdCBwYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgLy8gaWYgdGhlIHBhdGggb2YgdGhlIGVkaXRvciBpcyBub3QgbnVsbCBBTkRcbiAgICAgICAgLy8gaXMgcGFydCBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHJvb3QgdGhhdCB3b3VsZCBiZSByZW1vdmVkIEFORFxuICAgICAgICAvLyBpcyBub3QgcGFydCBvZiBhbnkgb3RoZXIgb3BlbiByb290LCB0aGVuIGNsb3NlIHRoZSBmaWxlLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgcGF0aCAhPSBudWxsICYmXG4gICAgICAgICAgcGF0aC5zdGFydHNXaXRoKHJvb3ROb2RlLm5vZGVQYXRoKSAmJlxuICAgICAgICAgIHJvb3RzLmZpbHRlcihyb290ID0+IHBhdGguc3RhcnRzV2l0aChyb290KSkubGVuZ3RoID09PSAxXG4gICAgICAgICkge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkocGF0aCkuZGVzdHJveUl0ZW0oZWRpdG9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBhY3R1YWxseSBjbG9zZSB0aGUgcHJvamVjdFxuICAgICAgYXRvbS5wcm9qZWN0LnJlbW92ZVBhdGgocm9vdE5vZGUubm9kZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIF9zZWFyY2hJbkRpcmVjdG9yeShldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBEaXNwYXRjaCBhIGNvbW1hbmQgdG8gc2hvdyB0aGUgYFByb2plY3RGaW5kVmlld2AuIFRoaXMgb3BlbnMgdGhlIHZpZXcgYW5kIGZvY3VzZXMgdGhlIHNlYXJjaFxuICAgIC8vIGJveC5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgKChldmVudC50YXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KSxcbiAgICAgICdwcm9qZWN0LWZpbmQ6c2hvdy1pbi1jdXJyZW50LWRpcmVjdG9yeSdcbiAgICApO1xuICB9XG5cbiAgX3Nob3dJbkZpbGVNYW5hZ2VyKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAvLyBPbmx5IGFsbG93IHJldmVhbGluZyBhIHNpbmdsZSBkaXJlY3RvcnkvZmlsZSBhdCBhIHRpbWUuIFJldHVybiBvdGhlcndpc2UuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIobm9kZS5ub2RlUGF0aCk7XG4gIH1cblxuICBfc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gU2VsZWN0IHRoZSBub2RlIGJlZm9yZSB0cmFja2luZyBpdCBiZWNhdXNlIHNldHRpbmcgYSBuZXcgc2VsZWN0aW9uIGNsZWFycyB0aGUgdHJhY2tlZCBub2RlLlxuICAgIHRoaXMuX2FjdGlvbnMuc2VsZWN0U2luZ2xlTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFRyYWNrZWROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgX2NvcHlGdWxsUGF0aCgpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwpIHtcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNpbmdsZVNlbGVjdGVkTm9kZS5nZXRMb2NhbFBhdGgoKSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IGRpc3Bvc2FibGUgb2YgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeS52YWx1ZXMoKSkge1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3N0b3JlLnJlc2V0KCk7XG4gICAgdGhpcy5fY29udGV4dE1lbnUuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IEZpbGVUcmVlQ29udHJvbGxlclN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHJlZTogdGhpcy5fc3RvcmUuZXhwb3J0RGF0YSgpLFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZUNvbnRyb2xsZXI7XG4iXX0=