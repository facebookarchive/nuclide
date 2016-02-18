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
        _FileSystemActions2['default'].openDuplicateDialog(_this.revealNodeKey.bind(_this));
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
      var rootNode = this._store.getSingleSelectedNode();
      if (rootNode != null && rootNode.isRoot) {
        atom.project.removePath(rootNode.nodePath);
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
//# sourceMappingURL=data:application/json;base64,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Q0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLGtCQUFrQixDQUFDLFlBQVksRUFBRSxDQUFDLENBQUM7T0FDekQ7S0FDRjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFdBQUssSUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ2pFLGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7QUFDRCxVQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7S0FDN0I7OztXQUVRLHFCQUE0QjtBQUNuQyxhQUFPO0FBQ0wsWUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO09BQy9CLENBQUM7S0FDSDs7O1NBem1CRyxrQkFBa0I7OztBQTRtQnhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0V4cG9ydFN0b3JlRGF0YX0gZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RVZFTlRfSEFORExFUl9TRUxFQ1RPUn0gIGZyb20gJy4vRmlsZVRyZWVDb25zdGFudHMnO1xuaW1wb3J0IEZpbGVTeXN0ZW1BY3Rpb25zIGZyb20gJy4vRmlsZVN5c3RlbUFjdGlvbnMnO1xuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuL0ZpbGVUcmVlQWN0aW9ucyc7XG5pbXBvcnQgRmlsZVRyZWVDb250ZXh0TWVudSBmcm9tICcuL0ZpbGVUcmVlQ29udGV4dE1lbnUnO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7aXNUZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG50eXBlIEZpbGVUcmVlTm9kZURhdGEgPSB7XG4gIG5vZGVLZXk6IHN0cmluZyxcbiAgcm9vdEtleTogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgRmlsZVRyZWVDb250cm9sbGVyU3RhdGUgPSB7XG4gIHRyZWU6IEV4cG9ydFN0b3JlRGF0YSxcbn07XG5cbmNsYXNzIEZpbGVUcmVlQ29udHJvbGxlciB7XG4gIF9hY3Rpb25zOiBGaWxlVHJlZUFjdGlvbnM7XG4gIF9jb250ZXh0TWVudTogRmlsZVRyZWVDb250ZXh0TWVudTtcbiAgX3JlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+O1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIElEaXNwb3NhYmxlPjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlKSB7XG4gICAgdGhpcy5fYWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gSW5pdGlhbCByb290IGRpcmVjdG9yaWVzXG4gICAgdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCk7XG4gICAgLy8gU3Vic2VxdWVudCByb290IGRpcmVjdG9yaWVzIHVwZGF0ZWQgb24gY2hhbmdlXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB0aGlzLl91cGRhdGVSb290RGlyZWN0b3JpZXMoKSlcbiAgICApO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgIC8vIFBhc3MgdW5kZWZpbmVkIHNvIHRoZSBkZWZhdWx0IHBhcmFtZXRlciBnZXRzIHVzZWQuXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtdGV4dC1lZGl0b3InOiB0aGlzLl9yZXZlYWxUZXh0RWRpdG9yLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtYWN0aXZlLWZpbGUnOiB0aGlzLnJldmVhbEFjdGl2ZUZpbGUuYmluZCh0aGlzLCB1bmRlZmluZWQpLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoRVZFTlRfSEFORExFUl9TRUxFQ1RPUiwge1xuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiB0aGlzLl9tb3ZlRG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXVwJzogdGhpcy5fbW92ZVVwLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogdGhpcy5fbW92ZVRvVG9wLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogdGhpcy5fbW92ZVRvQm90dG9tLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuQWRkRmlsZURpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRmlsZVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZm9sZGVyJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5BZGRGb2xkZXJEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbERpcmVjdG9yeVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1jb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIHRydWUpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWNvbGxhcHNlLWFsbCc6IHRoaXMuX2NvbGxhcHNlQWxsLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb3B5LWZ1bGwtcGF0aCc6IHRoaXMuX2NvcHlGdWxsUGF0aC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6ZXhwYW5kLWRpcmVjdG9yeSc6IHRoaXMuX2V4cGFuZFNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1leHBhbmQtZGlyZWN0b3J5JzogdGhpcy5fZXhwYW5kU2VsZWN0aW9uLmJpbmQodGhpcywgdHJ1ZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5JzogdGhpcy5fb3BlblNlbGVjdGVkRW50cnkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktdXAnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1kb3duJzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1sZWZ0JzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0TGVmdC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUnOiB0aGlzLl9kZWxldGVTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZS1wcm9qZWN0LWZvbGRlci1zZWxlY3Rpb24nOlxuICAgICAgICAgIHRoaXMuX3JlbW92ZVJvb3RGb2xkZXJTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbmFtZS1zZWxlY3Rpb24nOiAoKSA9PiBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuUmVuYW1lRGlhbG9nKCksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpkdXBsaWNhdGUtc2VsZWN0aW9uJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5EdXBsaWNhdGVEaWFsb2codGhpcy5yZXZlYWxOb2RlS2V5LmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6c2VhcmNoLWluLWRpcmVjdG9yeSc6IHRoaXMuX3NlYXJjaEluRGlyZWN0b3J5LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcic6IHRoaXMuX3Nob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcyksXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnW2lzPVwidGFicy10YWJcIl0nLCB7XG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtdGFiLWZpbGUnOiB0aGlzLl9yZXZlYWxUYWJGaWxlT25DbGljay5iaW5kKHRoaXMpLFxuICAgICAgfSlcbiAgICApO1xuICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS50cmVlKSB7XG4gICAgICB0aGlzLl9zdG9yZS5sb2FkRGF0YShzdGF0ZS50cmVlKTtcbiAgICB9XG4gICAgdGhpcy5fY29udGV4dE1lbnUgPSBuZXcgRmlsZVRyZWVDb250ZXh0TWVudSgpO1xuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxGaWxlUGF0aChmaWxlUGF0aDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChmaWxlUGF0aCAhPSBudWxsKSB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxEaXJlY3RvcnlQYXRoKHBhdGg6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAocGF0aCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShwYXRoKSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgcmVtb3RlLXByb2plY3RzIHBhY2thZ2UgaGFzbid0IGxvYWRlZCB5ZXQgcmVtb3RlIGRpcmVjdG9yaWVzIHdpbGwgYmUgaW5zdGFudGlhdGVkIGFzXG4gICAgLy8gbG9jYWwgZGlyZWN0b3JpZXMgYnV0IHdpdGggaW52YWxpZCBwYXRocy4gV2UgbmVlZCB0byBleGNsdWRlIHRob3NlLlxuICAgIGNvbnN0IHJvb3REaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcihkaXJlY3RvcnkgPT4gKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmlzVmFsaWREaXJlY3RvcnkoZGlyZWN0b3J5KVxuICAgICkpO1xuICAgIGNvbnN0IHJvb3RLZXlzID0gcm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKTtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFJvb3RLZXlzKHJvb3RLZXlzKTtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVJlcG9zaXRvcmllcyhyb290RGlyZWN0b3JpZXMpO1xuICB9XG5cbiAgX3JldmVhbFRleHRFZGl0b3IoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yRWxlbWVudCA9ICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50KTtcbiAgICBpZiAoXG4gICAgICBlZGl0b3JFbGVtZW50ID09IG51bGxcbiAgICAgIHx8IHR5cGVvZiBlZGl0b3JFbGVtZW50LmdldE1vZGVsICE9PSAnZnVuY3Rpb24nXG4gICAgICB8fCAhaXNUZXh0RWRpdG9yKGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRQYXRoKCk7XG4gICAgdGhpcy5fcmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldmVhbCB0aGUgZmlsZSB0aGF0IGN1cnJlbnRseSBoYXMgZm9jdXMgaW4gdGhlIGZpbGUgdHJlZS4gSWYgc2hvd0lmSGlkZGVuIGlzIGZhbHNlLFxuICAgKiB0aGlzIHdpbGwgZW5xdWV1ZSBhIHBlbmRpbmcgcmV2ZWFsIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZpbGUgdHJlZSBpcyBzaG93biBhZ2Fpbi5cbiAgICovXG4gIHJldmVhbEFjdGl2ZUZpbGUoc2hvd0lmSGlkZGVuPzogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IgIT0gbnVsbCA/IGVkaXRvci5nZXRQYXRoKCkgOiBudWxsO1xuICAgIHRoaXMuX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoLCBzaG93SWZIaWRkZW4pO1xuICB9XG5cbiAgX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoOiA/c3RyaW5nLCBzaG93SWZIaWRkZW4/OiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzaG93SWZIaWRkZW4pIHtcbiAgICAgIC8vIEVuc3VyZSB0aGUgZmlsZSB0cmVlIGlzIHZpc2libGUgYmVmb3JlIHRyeWluZyB0byByZXZlYWwgYSBmaWxlIGluIGl0LiBFdmVuIGlmIHRoZSBjdXJyZW50bHlcbiAgICAgIC8vIGFjdGl2ZSBwYW5lIGlzIG5vdCBhbiBvcmRpbmFyeSBlZGl0b3IsIHdlIHN0aWxsIGF0IGxlYXN0IHdhbnQgdG8gc2hvdyB0aGUgdHJlZS5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTp0b2dnbGUnLFxuICAgICAgICB7ZGlzcGxheTogdHJ1ZX1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUmV2ZWFsIHRoZSBmaWxlIG9mIGEgZ2l2ZW4gdGFiIGJhc2VkIG9uIHRoZSBwYXRoIHN0b3JlZCBvbiB0aGUgRE9NLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtZWFudCB0byBiZSB0cmlnZ2VyZWQgYnkgdGhlIGNvbnRleHQtbWVudSBjbGljay5cbiAgICovXG4gIF9yZXZlYWxUYWJGaWxlT25DbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCB0YWIgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEVsZW1lbnQpO1xuICAgIGNvbnN0IHRpdGxlID0gdGFiLnF1ZXJ5U2VsZWN0b3IoJy50aXRsZVtkYXRhLXBhdGhdJyk7XG4gICAgaWYgKCF0aXRsZSkge1xuICAgICAgLy8gY2FuIG9ubHkgcmV2ZWFsIGl0IGlmIHdlIGZpbmQgdGhlIGZpbGUgcGF0aFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGl0bGUuZGF0YXNldC5wYXRoO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnRvZ2dsZScsXG4gICAgICB7ZGlzcGxheTogdHJ1ZX1cbiAgICApO1xuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICByZXZlYWxOb2RlS2V5KG5vZGVLZXk6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIW5vZGVLZXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleTogP3N0cmluZyA9IHRoaXMuX3N0b3JlLmdldFJvb3RGb3JLZXkobm9kZUtleSk7XG4gICAgaWYgKCFyb290S2V5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgbGV0IGtleSA9IG5vZGVLZXk7XG4gICAgd2hpbGUgKGtleSAhPSBudWxsICYmIGtleSAhPT0gcm9vdEtleSkge1xuICAgICAgc3RhY2sucHVzaChrZXkpO1xuICAgICAga2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShrZXkpO1xuICAgIH1cbiAgICAvLyBXZSB3YW50IHRoZSBzdGFjayB0byBiZSBbcGFyZW50S2V5LCAuLi4sIG5vZGVLZXldLlxuICAgIHN0YWNrLnJldmVyc2UoKTtcbiAgICBzdGFjay5mb3JFYWNoKChjaGlsZEtleSwgaSkgPT4ge1xuICAgICAgY29uc3QgcGFyZW50S2V5ID0gKGkgPT09IDApID8gcm9vdEtleSA6IHN0YWNrW2kgLSAxXTtcbiAgICAgIHRoaXMuX2FjdGlvbnMuZW5zdXJlQ2hpbGROb2RlKHJvb3RLZXksIHBhcmVudEtleSwgY2hpbGRLZXkpO1xuICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lcyk7XG4gIH1cblxuICBzZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxhcHNlcyBhbGwgc2VsZWN0ZWQgZGlyZWN0b3J5IG5vZGVzLiBJZiB0aGUgc2VsZWN0aW9uIGlzIGEgc2luZ2xlIGZpbGUgb3IgYSBzaW5nbGUgY29sbGFwc2VkXG4gICAqIGRpcmVjdG9yeSwgdGhlIHNlbGVjdGlvbiBpcyBzZXQgdG8gdGhlIGRpcmVjdG9yeSdzIHBhcmVudC5cbiAgICovXG4gIF9jb2xsYXBzZVNlbGVjdGlvbihkZWVwOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGNvbnN0IGZpcnN0U2VsZWN0ZWROb2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGlmIChzZWxlY3RlZE5vZGVzLnNpemUgPT09IDFcbiAgICAgICYmICFmaXJzdFNlbGVjdGVkTm9kZS5pc1Jvb3RcbiAgICAgICYmICEoZmlyc3RTZWxlY3RlZE5vZGUuaXNDb250YWluZXIgJiYgZmlyc3RTZWxlY3RlZE5vZGUuaXNFeHBhbmRlZCgpKSkge1xuICAgICAgLypcbiAgICAgICAqIFNlbGVjdCB0aGUgcGFyZW50IG9mIHRoZSBzZWxlY3Rpb24gaWYgdGhlIGZvbGxvd2luZyBjcml0ZXJpYSBhcmUgbWV0OlxuICAgICAgICogICAqIE9ubHkgMSBub2RlIGlzIHNlbGVjdGVkXG4gICAgICAgKiAgICogVGhlIG5vZGUgaXMgbm90IGEgcm9vdFxuICAgICAgICogICAqIFRoZSBub2RlIGlzIG5vdCBhbiBleHBhbmRlZCBkaXJlY3RvcnlcbiAgICAgICAqL1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkoZmlyc3RTZWxlY3RlZE5vZGUubm9kZUtleSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIC8vIE9ubHkgZGlyZWN0b3JpZXMgY2FuIGJlIGV4cGFuZGVkLiBTa2lwIG5vbi1kaXJlY3Rvcnkgbm9kZXMuXG4gICAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGVEZWVwKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZShub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9jb2xsYXBzZUFsbCgpOiB2b2lkIHtcbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgcm9vdEtleXMuZm9yRWFjaChyb290S2V5ID0+IHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlRGVlcChyb290S2V5LCByb290S2V5KSk7XG4gIH1cblxuICBfZGVsZXRlU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGlmIChub2Rlcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdFBhdGhzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZS5pc1Jvb3QpO1xuICAgIGlmIChyb290UGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRQYXRocyA9IG5vZGVzLm1hcChub2RlID0+IG5vZGUubm9kZVBhdGgpO1xuICAgICAgY29uc3QgbWVzc2FnZSA9ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoZSBmb2xsb3dpbmcgJyArXG4gICAgICAgICAgKG5vZGVzLnNpemUgPiAxID8gJ2l0ZW1zPycgOiAnaXRlbT8nKTtcbiAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAnRGVsZXRlJzogKCkgPT4geyB0aGlzLl9hY3Rpb25zLmRlbGV0ZVNlbGVjdGVkTm9kZXMoKTsgfSxcbiAgICAgICAgICAnQ2FuY2VsJzogKCkgPT4ge30sXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogYFlvdSBhcmUgZGVsZXRpbmc6JHtvcy5FT0x9JHtzZWxlY3RlZFBhdGhzLmpvaW4ob3MuRU9MKX1gLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgaWYgKHJvb3RQYXRocy5zaXplID09PSAxKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBgVGhlIHJvb3QgZGlyZWN0b3J5ICcke3Jvb3RQYXRocy5maXJzdCgpLm5vZGVOYW1lfScgY2FuJ3QgYmUgcmVtb3ZlZC5gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgcm9vdFBhdGhOYW1lcyA9IHJvb3RQYXRocy5tYXAobm9kZSA9PiBgJyR7bm9kZS5ub2RlTmFtZX0nYCkuam9pbignLCAnKTtcbiAgICAgICAgbWVzc2FnZSA9IGBUaGUgcm9vdCBkaXJlY3RvcmllcyAke3Jvb3RQYXRoTmFtZXN9IGNhbid0IGJlIHJlbW92ZWQuYDtcbiAgICAgIH1cblxuICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgYnV0dG9uczogWydPSyddLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIHNlbGVjdGVkIGRpcmVjdG9yeSBub2Rlcy5cbiAgICovXG4gIF9leHBhbmRTZWxlY3Rpb24oZGVlcDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgLy8gT25seSBkaXJlY3RvcmllcyBjYW4gYmUgZXhwYW5kZWQuIFNraXAgbm9uLWRpcmVjdG9yeSBub2Rlcy5cbiAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZURlZXAobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9tb3ZlRG93bigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFNlbGVjdGVkS2V5ID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChsYXN0U2VsZWN0ZWRLZXkgPT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gc2VsZWN0aW9uIHlldCwgc28gbW92ZSB0byB0aGUgdG9wIG9mIHRoZSB0cmVlLlxuICAgICAgdGhpcy5fbW92ZVRvVG9wKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBhcmVudEtleTtcbiAgICBsZXQgcm9vdEtleTtcbiAgICBsZXQgc2libGluZ0tleXM7XG4gICAgY29uc3QgaXNSb290ID0gdGhpcy5fc3RvcmUuaXNSb290S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgcm9vdEtleSA9IGxhc3RTZWxlY3RlZEtleTtcbiAgICAgIC8vIE90aGVyIHJvb3RzIGFyZSB0aGlzIHJvb3QncyBzaWJsaW5nc1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgICByb290S2V5ID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEZvcktleShsYXN0U2VsZWN0ZWRLZXkpO1xuXG4gICAgICBpbnZhcmlhbnQocm9vdEtleSAmJiBwYXJlbnRLZXkpO1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcm9vdCBkb2VzIG5vdCBleGlzdCBvciBpZiB0aGlzIGlzIGV4cGVjdGVkIHRvIGhhdmUgYSBwYXJlbnQgYnV0IGRvZXNuJ3QgKHJvb3RzIGRvXG4gICAgLy8gbm90IGhhdmUgcGFyZW50cyksIG5vdGhpbmcgY2FuIGJlIGRvbmUuIEV4aXQuXG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCB8fCAoIWlzUm9vdCAmJiBwYXJlbnRLZXkgPT0gbnVsbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChcbiAgICAgIEZpbGVUcmVlSGVscGVycy5pc0RpcktleShsYXN0U2VsZWN0ZWRLZXkpICYmXG4gICAgICB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHJvb3RLZXksIGxhc3RTZWxlY3RlZEtleSkgJiZcbiAgICAgIGNoaWxkcmVuLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIC8vIERpcmVjdG9yeSBpcyBleHBhbmRlZCBhbmQgaXQgaGFzIGNoaWxkcmVuLiBTZWxlY3QgZmlyc3QgY2hpbGQuIEV4aXQuXG4gICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgY2hpbGRyZW5bMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdLZXlzLmluZGV4T2YobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIGNvbnN0IG1heEluZGV4ID0gc2libGluZ0tleXMubGVuZ3RoIC0gMTtcblxuICAgICAgaWYgKGluZGV4IDwgbWF4SW5kZXgpIHtcbiAgICAgICAgY29uc3QgbmV4dFNpYmxpbmdLZXkgPSBzaWJsaW5nS2V5c1tpbmRleCArIDFdO1xuXG4gICAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgbmV4dCBzZWxlY3RlZCBpdGVtIGlzIGFub3RoZXIgcm9vdCwgc2V0IGByb290S2V5YCB0byBpdCBzbyB0cmFja0FuZFNlbGVjdCBmaW5kc1xuICAgICAgICAgIC8vIHRoYXQgW3Jvb3RLZXksIHJvb3RLZXldIHR1cGxlLlxuICAgICAgICAgIHJvb3RLZXkgPSBuZXh0U2libGluZ0tleTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaGFzIGEgbmV4dCBzaWJsaW5nLlxuICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgc2libGluZ0tleXNbaW5kZXggKyAxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZWFyZXN0QW5jZXN0b3JTaWJsaW5nID0gdGhpcy5fZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcocm9vdEtleSwgbGFzdFNlbGVjdGVkS2V5KTtcblxuICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBib3R0b21tb3N0IG5vZGUgb2YgdGhlIHRyZWUsIHRoZXJlIHdvbid0IGJlIGFueXRoaW5nIHRvIHNlbGVjdC5cbiAgICAgICAgLy8gVm9pZCByZXR1cm4gc2lnbmlmaWVzIG5vIG5leHQgbm9kZSB3YXMgZm91bmQuXG4gICAgICAgIGlmIChuZWFyZXN0QW5jZXN0b3JTaWJsaW5nICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUobmVhcmVzdEFuY2VzdG9yU2libGluZy5yb290S2V5LCBuZWFyZXN0QW5jZXN0b3JTaWJsaW5nLm5vZGVLZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX21vdmVVcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFNlbGVjdGVkS2V5ID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChsYXN0U2VsZWN0ZWRLZXkgPT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gc2VsZWN0aW9uLiBNb3ZlIHRvIHRoZSBib3R0b20gb2YgdGhlIHRyZWUuXG4gICAgICB0aGlzLl9tb3ZlVG9Cb3R0b20oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGFyZW50S2V5O1xuICAgIGxldCByb290S2V5O1xuICAgIGxldCBzaWJsaW5nS2V5cztcbiAgICBjb25zdCBpc1Jvb3QgPSB0aGlzLl9zdG9yZS5pc1Jvb3RLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoaXNSb290KSB7XG4gICAgICByb290S2V5ID0gbGFzdFNlbGVjdGVkS2V5O1xuICAgICAgLy8gT3RoZXIgcm9vdHMgYXJlIHRoaXMgcm9vdCdzIHNpYmxpbmdzXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIHJvb3RLZXkgPSB0aGlzLl9zdG9yZS5nZXRSb290Rm9yS2V5KGxhc3RTZWxlY3RlZEtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSByb290IGRvZXMgbm90IGV4aXN0IG9yIGlmIHRoaXMgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhIHBhcmVudCBidXQgZG9lc24ndCAocm9vdHMgZG9cbiAgICAvLyBub3QgaGF2ZSBwYXJlbnRzKSwgbm90aGluZyBjYW4gYmUgZG9uZS4gRXhpdC5cbiAgICBpZiAocm9vdEtleSA9PSBudWxsIHx8ICghaXNSb290ICYmIHBhcmVudEtleSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgaWYgKCFpc1Jvb3QgJiYgcGFyZW50S2V5ICE9IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgY2hpbGQuIEl0IGhhcyBhIHBhcmVudC4gU2VsZWN0IHRoZSBwYXJlbnQuXG4gICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgICAgfVxuICAgICAgLy8gVGhpcyBpcyB0aGUgcm9vdCBhbmQvb3IgdGhlIHRvcCBvZiB0aGUgdHJlZSAoaGFzIG5vIHBhcmVudCkuIE5vdGhpbmcgZWxzZSB0byB0cmF2ZXJzZS5cbiAgICAgIC8vIEV4aXQuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzU2libGluZ0tleSA9IHNpYmxpbmdLZXlzW2luZGV4IC0gMV07XG5cbiAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgLy8gSWYgdHJhdmVyc2luZyB1cCB0byBhIGRpZmZlcmVudCByb290LCB0aGUgcm9vdEtleSBtdXN0IGJlY29tZSB0aGF0IG5ldyByb290IHRvIGNoZWNrXG4gICAgICAgIC8vIGV4cGFuZGVkIGtleXMgaW4gaXQuXG4gICAgICAgIHJvb3RLZXkgPSBwcmV2aW91c1NpYmxpbmdLZXk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShcbiAgICAgICAgcm9vdEtleSxcbiAgICAgICAgdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleSwgcHJldmlvdXNTaWJsaW5nS2V5KVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfbW92ZVRvVG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXlzWzBdLCByb290S2V5c1swXSk7XG4gIH1cblxuICBfbW92ZVRvQm90dG9tKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3QgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50IG9mIHRoZSBsYXN0IHJvb3Qgbm9kZS5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgY29uc3QgbGFzdFJvb3RLZXkgPSByb290S2V5c1tyb290S2V5cy5sZW5ndGggLSAxXTtcbiAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUoXG4gICAgICBsYXN0Um9vdEtleSxcbiAgICAgIHRoaXMuX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KGxhc3RSb290S2V5LCBsYXN0Um9vdEtleSlcbiAgICApO1xuICB9XG5cbiAgLypcbiAgICogUmV0dXJucyB0aGUgbG93ZXJtb3N0IGRlc2NlbmRhbnQgd2hlbiBjb25zaWRlcmVkIGluIGZpbGUgc3lzdGVtIG9yZGVyIHdpdGggZXhwYW5kYWJsZVxuICAgKiBkaXJlY3Rvcmllcy4gRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqICAgQSA+XG4gICAqICAgICBCID5cbiAgICogICAgIEMgPlxuICAgKiAgICAgICBFLnR4dFxuICAgKiAgICAgRC5mb29cbiAgICpcbiAgICogICA+IF9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShBKVxuICAgKiAgIEQuZm9vXG4gICAqXG4gICAqIFRob3VnaCBBIGhhcyBtb3JlIGRlZXBseS1uZXN0ZWQgZGVzY2VuZGFudHMgdGhhbiBELmZvbywgbGlrZSBFLnR4dCwgRC5mb28gaXMgbG93ZXJtb3N0IHdoZW5cbiAgICogY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlci5cbiAgICovXG4gIF9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCEoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KG5vZGVLZXkpICYmIHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQocm9vdEtleSwgbm9kZUtleSkpKSB7XG4gICAgICAvLyBJZiBgbm9kZUtleWAgaXMgbm90IGFuIGV4cGFuZGVkIGRpcmVjdG9yeSB0aGVyZSBhcmUgbm8gbW9yZSBkZXNjZW5kYW50cyB0byB0cmF2ZXJzZS4gUmV0dXJuXG4gICAgICAvLyB0aGUgYG5vZGVLZXlgLlxuICAgICAgcmV0dXJuIG5vZGVLZXk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChjaGlsZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGhhcyBubyBjaGlsZHJlbiwgdGhlIGRpcmVjdG9yeSBpdHNlbGYgaXMgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50LlxuICAgICAgcmV0dXJuIG5vZGVLZXk7XG4gICAgfVxuXG4gICAgLy8gVGhlcmUncyBhdCBsZWFzdCBvbmUgY2hpbGQuIFJlY3Vyc2UgZG93biB0aGUgbGFzdCBjaGlsZC5cbiAgICByZXR1cm4gdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleSwgY2hpbGRLZXlzW2NoaWxkS2V5cy5sZW5ndGggLSAxXSk7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm5zIHRoZSBuZWFyZXN0IFwiYW5jZXN0b3Igc2libGluZ1wiIHdoZW4gY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlciB3aXRoIGV4cGFuZGFibGVcbiAgICogZGlyZWN0b3JpZXMuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiAgIEEgPlxuICAgKiAgICAgQiA+XG4gICAqICAgICAgIEMgPlxuICAgKiAgICAgICAgIEUudHh0XG4gICAqICAgRC5mb29cbiAgICpcbiAgICogICA+IF9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhFLnR4dClcbiAgICogICBELmZvb1xuICAgKi9cbiAgX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogP0ZpbGVUcmVlTm9kZURhdGEge1xuICAgIGxldCBwYXJlbnRLZXk7XG4gICAgbGV0IHNpYmxpbmdLZXlzO1xuICAgIGNvbnN0IGlzUm9vdCA9IHJvb3RLZXkgPT09IG5vZGVLZXk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgLy8gYHJvb3RLZXkgPT09IG5vZGVLZXlgIG1lYW5zIHRoaXMgaGFzIHJlY3Vyc2VkIHRvIGEgcm9vdC4gYG5vZGVLZXlgIGlzIGEgcm9vdCBrZXkuXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobm9kZUtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihub2RlS2V5KTtcbiAgICBpZiAoaW5kZXggPCAoc2libGluZ0tleXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZ0tleXNbaW5kZXggKyAxXTtcbiAgICAgIC8vIElmIHRyYXZlcnNpbmcgYWNyb3NzIHJvb3RzLCB0aGUgbmV4dCBzaWJsaW5nIGlzIGFsc28gdGhlIG5leHQgcm9vdC4gUmV0dXJuIGl0IGFzIHRoZSBuZXh0XG4gICAgICAvLyByb290IGtleSBhcyB3ZWxsIGFzIHRoZSBuZXh0IG5vZGUga2V5LlxuICAgICAgcmV0dXJuIGlzUm9vdFxuICAgICAgICA/IHtub2RlS2V5OiBuZXh0U2libGluZywgcm9vdEtleTogbmV4dFNpYmxpbmd9XG4gICAgICAgIDoge25vZGVLZXk6IG5leHRTaWJsaW5nLCByb290S2V5fTtcbiAgICB9IGVsc2UgaWYgKHBhcmVudEtleSAhPSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBhIHBhcmVudCB0byByZWN1cnNlLiBSZXR1cm4gaXRzIG5lYXJlc3QgYW5jZXN0b3Igc2libGluZy5cbiAgICAgIHJldHVybiB0aGlzLl9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBgcGFyZW50S2V5YCBpcyBudWxsLCBub2RlS2V5IGlzIGEgcm9vdCBhbmQgaGFzIG1vcmUgcGFyZW50cyB0byByZWN1cnNlLiBSZXR1cm4gYG51bGxgIHRvXG4gICAgICAvLyBzaWduaWZ5IG5vIGFwcHJvcHJpYXRlIGtleSB3YXMgZm91bmQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnkoKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgLy8gT25seSBwZXJmb3JtIHRoZSBkZWZhdWx0IGFjdGlvbiBpZiBhIHNpbmdsZSBub2RlIGlzIHNlbGVjdGVkLlxuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aW9ucy5jb25maXJtTm9kZShzaW5nbGVTZWxlY3RlZE5vZGUucm9vdEtleSwgc2luZ2xlU2VsZWN0ZWROb2RlLm5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KG9yaWVudGF0aW9uOiBhdG9tJFBhbmVTcGxpdE9yaWVudGF0aW9uLCBzaWRlOiBhdG9tJFBhbmVTcGxpdFNpZGUpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAvLyBPbmx5IHBlcmZvcm0gdGhlIGRlZmF1bHQgYWN0aW9uIGlmIGEgc2luZ2xlIG5vZGUgaXMgc2VsZWN0ZWQuXG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsICYmICFzaW5nbGVTZWxlY3RlZE5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgIC8vIGZvcjogaXMgdGhpcyBmZWF0dXJlIHVzZWQgZW5vdWdoIHRvIGp1c3RpZnkgdW5jb2xsYXBzaW5nP1xuICAgICAgdHJhY2soJ2ZpbGV0cmVlLXNwbGl0LWZpbGUnLCB7XG4gICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICBzaWRlLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9hY3Rpb25zLm9wZW5TZWxlY3RlZEVudHJ5U3BsaXQoXG4gICAgICAgIHNpbmdsZVNlbGVjdGVkTm9kZS5ub2RlS2V5LFxuICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgc2lkZSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCd2ZXJ0aWNhbCcsICdiZWZvcmUnKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bigpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCd2ZXJ0aWNhbCcsICdhZnRlcicpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRMZWZ0KCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ2hvcml6b250YWwnLCAnYmVmb3JlJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0KCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ2hvcml6b250YWwnLCAnYWZ0ZXInKTtcbiAgfVxuXG4gIF9yZW1vdmVSb290Rm9sZGVyU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKHJvb3ROb2RlICE9IG51bGwgJiYgcm9vdE5vZGUuaXNSb290KSB7XG4gICAgICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aChyb290Tm9kZS5ub2RlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX3NlYXJjaEluRGlyZWN0b3J5KGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIC8vIERpc3BhdGNoIGEgY29tbWFuZCB0byBzaG93IHRoZSBgUHJvamVjdEZpbmRWaWV3YC4gVGhpcyBvcGVucyB0aGUgdmlldyBhbmQgZm9jdXNlcyB0aGUgc2VhcmNoXG4gICAgLy8gYm94LlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAoKGV2ZW50LnRhcmdldDogYW55KTogSFRNTEVsZW1lbnQpLFxuICAgICAgJ3Byb2plY3QtZmluZDpzaG93LWluLWN1cnJlbnQtZGlyZWN0b3J5J1xuICAgICk7XG4gIH1cblxuICBfc2hvd0luRmlsZU1hbmFnZXIoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIC8vIE9ubHkgYWxsb3cgcmV2ZWFsaW5nIGEgc2luZ2xlIGRpcmVjdG9yeS9maWxlIGF0IGEgdGltZS4gUmV0dXJuIG90aGVyd2lzZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihub2RlLm5vZGVQYXRoKTtcbiAgfVxuXG4gIF9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBTZWxlY3QgdGhlIG5vZGUgYmVmb3JlIHRyYWNraW5nIGl0IGJlY2F1c2Ugc2V0dGluZyBhIG5ldyBzZWxlY3Rpb24gY2xlYXJzIHRoZSB0cmFja2VkIG5vZGUuXG4gICAgdGhpcy5fYWN0aW9ucy5zZWxlY3RTaW5nbGVOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VHJhY2tlZE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBfY29weUZ1bGxQYXRoKCk6IHZvaWQge1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCkge1xuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoc2luZ2xlU2VsZWN0ZWROb2RlLmdldExvY2FsUGF0aCgpKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGZvciAoY29uc3QgZGlzcG9zYWJsZSBvZiB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5LnZhbHVlcygpKSB7XG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fc3RvcmUucmVzZXQoKTtcbiAgICB0aGlzLl9jb250ZXh0TWVudS5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogRmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICB0cmVlOiB0aGlzLl9zdG9yZS5leHBvcnREYXRhKCksXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQ29udHJvbGxlcjtcbiJdfQ==