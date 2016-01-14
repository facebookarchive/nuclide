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

var _get = function get(_x3, _x4, _x5) { var _again = true; _function: while (_again) { var object = _x3, property = _x4, receiver = _x5; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x3 = parent; _x4 = property; _x5 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _atom = require('atom');

var _FileTreeConstants = require('./FileTreeConstants');

var _FileSystemActions = require('./FileSystemActions');

var _FileSystemActions2 = _interopRequireDefault(_FileSystemActions);

var _componentsFileTree = require('../components/FileTree');

var _componentsFileTree2 = _interopRequireDefault(_componentsFileTree);

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

var _uiPanel = require('../../ui/panel');

var _reactForAtom = require('react-for-atom');

var _reactForAtom2 = _interopRequireDefault(_reactForAtom);

var _analytics = require('../../analytics');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var PropTypes = _reactForAtom2['default'].PropTypes;

var FileTreeController = (function () {
  _createClass(FileTreeController, null, [{
    key: 'INITIAL_WIDTH',
    value: 240,
    enumerable: true
  }]);

  function FileTreeController(state) {
    var _this = this;

    _classCallCheck(this, FileTreeController);

    var _extends2 = _extends({ panel: { width: FileTreeController.INITIAL_WIDTH } }, state);

    var panel = _extends2.panel;

    // show the file tree by default
    this._isVisible = panel.isVisible != null ? panel.isVisible : true;
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
    this._initializePanel();
    // Initial render
    this._render(panel.width);
    // Subsequent renders happen on changes to data store
    this._subscriptions.add(this._store.subscribe(function () {
      return _this._render();
    }));
    this._subscriptions.add(atom.commands.add('atom-workspace', {
      // Pass undefined so the default parameter gets used.
      'nuclide-file-tree:reveal-active-file': this.revealActiveFile.bind(this, undefined),
      'nuclide-file-tree:toggle': this.toggleVisibility.bind(this),
      'nuclide-file-tree:toggle-focus': this.toggleTreeFocus.bind(this)
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

    this._revealActiveFilePending = false;
  }

  _createClass(FileTreeController, [{
    key: '_initializePanel',
    value: function _initializePanel() {
      this._panelElement = document.createElement('div');
      this._panelElement.style.height = '100%';
      this._panel = atom.workspace.addLeftPanel({
        item: this._panelElement,
        visible: this._isVisible
      });
    }
  }, {
    key: '_render',
    value: function _render(initialWidth) {
      this._fileTreePanel = _reactForAtom2['default'].render(_reactForAtom2['default'].createElement(FileTreePanel, {
        initialWidth: initialWidth,
        store: this._store
      }), this._panelElement);
    }
  }, {
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
    key: '_setVisibility',
    value: function _setVisibility(shouldBeVisible) {
      if (shouldBeVisible) {
        this._panel.show();
        this.focusTree();
      } else {
        if (this._treeHasFocus()) {
          // If the file tree has focus, blur it because it will be hidden when the panel is hidden.
          this.blurTree();
        }
        this._panel.hide();
      }
      this._isVisible = shouldBeVisible;
    }

    /**
     * "Blurs" the tree, which is done by activating the active pane in
     * [Atom's tree-view]{@link https://github.com/atom/tree-view/blob/v0.188.0/lib/tree-view.coffee#L187}.
     */
  }, {
    key: 'blurTree',
    value: function blurTree() {
      atom.workspace.getActivePane().activate();
    }
  }, {
    key: 'focusTree',
    value: function focusTree() {
      this._fileTreePanel.getFileTree().focus();
    }

    /**
     * Returns `true` if the file tree DOM node has focus, otherwise `false`.
     */
  }, {
    key: '_treeHasFocus',
    value: function _treeHasFocus() {
      var fileTree = this._fileTreePanel.getFileTree();
      return fileTree.hasFocus();
    }

    /**
     * Focuses the tree if it does not have focus, blurs the tree if it does have focus.
     */
  }, {
    key: 'toggleTreeFocus',
    value: function toggleTreeFocus() {
      if (this._treeHasFocus()) {
        this.blurTree();
      } else {
        this.focusTree();
      }
    }
  }, {
    key: 'toggleVisibility',
    value: function toggleVisibility() {
      var willBeVisible = !this._isVisible;
      this._setVisibility(willBeVisible);
      if (willBeVisible && this._revealActiveFilePending) {
        this.revealActiveFile();
        this._revealActiveFilePending = false;
      }
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
      var file = editor ? editor.getBuffer().file : null;
      var filePath = file ? file.getPath() : null;

      if (showIfHidden) {
        // Ensure the file tree is visible before trying to reveal a file in it. Even if the currently
        // active pane is not an ordinary editor, we still at least want to show the tree.
        this._setVisibility(true);
      }

      if (!filePath) {
        return;
      }

      // If we are not showing the tree as part of this action, and it is currently hidden, this
      // reveal will take effect when the tree is shown.
      if (!showIfHidden && !this._isVisible) {
        this._revealActiveFilePending = true;
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
      this._setVisibility(true);
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
      _reactForAtom2['default'].unmountComponentAtNode(this._panelElement);
      this._panel.destroy();
      this._contextMenu.dispose();
    }
  }, {
    key: 'serialize',
    value: function serialize() {
      return {
        panel: {
          isVisible: this._isVisible,
          width: this._fileTreePanel.getLength()
        },
        tree: this._store.exportData()
      };
    }
  }]);

  return FileTreeController;
})();

var FileTreePanel = (function (_React$Component) {
  _inherits(FileTreePanel, _React$Component);

  function FileTreePanel() {
    _classCallCheck(this, FileTreePanel);

    _get(Object.getPrototypeOf(FileTreePanel.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(FileTreePanel, [{
    key: 'render',
    value: function render() {
      return _reactForAtom2['default'].createElement(
        _uiPanel.PanelComponent,
        {
          dock: 'left',
          initialLength: this.props.initialWidth,
          ref: 'panel' },
        _reactForAtom2['default'].createElement(_componentsFileTree2['default'], { store: this.props.store })
      );
    }
  }, {
    key: 'getFileTree',
    value: function getFileTree() {
      return this.refs['panel'].getChildComponent();
    }
  }, {
    key: 'getLength',
    value: function getLength() {
      return this.refs['panel'].getLength();
    }
  }], [{
    key: 'propTypes',
    value: {
      initialWidth: PropTypes.number,
      store: PropTypes.instanceOf(_FileTreeStore2['default']).isRequired
    },
    enumerable: true
  }]);

  return FileTreePanel;
})(_reactForAtom2['default'].Component);

module.exports = FileTreeController;

/**
 * True if a reveal was requested while the file tree is hidden. If so, we should apply it when
 * the tree is shown.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBYWtDLE1BQU07O2lDQUNGLHFCQUFxQjs7aUNBQzdCLHFCQUFxQjs7OztrQ0FDOUIsd0JBQXdCOzs7OytCQUNqQixtQkFBbUI7Ozs7bUNBQ2YsdUJBQXVCOzs7OytCQUMzQixtQkFBbUI7Ozs7NkJBQ3JCLGlCQUFpQjs7Ozt5QkFDckIsV0FBVzs7Ozt1QkFDSixnQkFBZ0I7OzRCQUMzQixnQkFBZ0I7Ozs7eUJBQ2QsaUJBQWlCOztrQkFFdEIsSUFBSTs7OztxQkFDRCxPQUFPOzs7O3NCQUVILFFBQVE7Ozs7SUFFdkIsU0FBUyw2QkFBVCxTQUFTOztJQWVWLGtCQUFrQjtlQUFsQixrQkFBa0I7O1dBaUJDLEdBQUc7Ozs7QUFFZixXQW5CUCxrQkFBa0IsQ0FtQlYsS0FBK0IsRUFBRTs7OzBCQW5CekMsa0JBQWtCOzs2QkFxQmYsRUFBQyxLQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsYUFBYSxFQUFDLEVBQUMsRUFDbEQsS0FBSzs7UUFGSCxLQUFLLGFBQUwsS0FBSzs7O0FBTVosUUFBSSxDQUFDLFVBQVUsR0FBRyxLQUFLLENBQUMsU0FBUyxJQUFJLElBQUksR0FBRyxLQUFLLENBQUMsU0FBUyxHQUFHLElBQUksQ0FBQztBQUNuRSxRQUFJLENBQUMsUUFBUSxHQUFHLDZCQUFnQixXQUFXLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsTUFBTSxHQUFHLDJCQUFjLFdBQVcsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztBQUN6QyxRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0RCxRQUFJLENBQUMsY0FBYyxHQUFHLCtCQUF5QixDQUFDOztBQUVoRCxRQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzs7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b2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RXhwb3J0U3RvcmVEYXRhfSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtFVkVOVF9IQU5ETEVSX1NFTEVDVE9SfSAgZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQgRmlsZVN5c3RlbUFjdGlvbnMgZnJvbSAnLi9GaWxlU3lzdGVtQWN0aW9ucyc7XG5pbXBvcnQgRmlsZVRyZWUgZnJvbSAnLi4vY29tcG9uZW50cy9GaWxlVHJlZSc7XG5pbXBvcnQgRmlsZVRyZWVBY3Rpb25zIGZyb20gJy4vRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCBGaWxlVHJlZUNvbnRleHRNZW51IGZyb20gJy4vRmlsZVRyZWVDb250ZXh0TWVudSc7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge1BhbmVsQ29tcG9uZW50fSBmcm9tICcuLi8uLi91aS9wYW5lbCc7XG5pbXBvcnQgUmVhY3QgZnJvbSAncmVhY3QtZm9yLWF0b20nO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcblxuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuY29uc3Qge1Byb3BUeXBlc30gPSBSZWFjdDtcblxudHlwZSBGaWxlVHJlZU5vZGVEYXRhID0ge1xuICBub2RlS2V5OiBzdHJpbmcsXG4gIHJvb3RLZXk6IHN0cmluZyxcbn07XG5cbmV4cG9ydCB0eXBlIEZpbGVUcmVlQ29udHJvbGxlclN0YXRlID0ge1xuICBwYW5lbDoge1xuICAgIGlzVmlzaWJsZTogP2Jvb2xlYW47XG4gICAgd2lkdGg6IG51bWJlcjtcbiAgfTtcbiAgdHJlZTogRXhwb3J0U3RvcmVEYXRhO1xufTtcblxuY2xhc3MgRmlsZVRyZWVDb250cm9sbGVyIHtcbiAgX2FjdGlvbnM6IEZpbGVUcmVlQWN0aW9ucztcbiAgX2NvbnRleHRNZW51OiBGaWxlVHJlZUNvbnRleHRNZW51O1xuICBfaXNWaXNpYmxlOiBib29sZWFuO1xuICBfcGFuZWw6IGF0b20kUGFuZWw7XG4gIF9maWxlVHJlZVBhbmVsOiBGaWxlVHJlZVBhbmVsO1xuICBfcGFuZWxFbGVtZW50OiBIVE1MRWxlbWVudDtcbiAgX3JlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+O1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIGF0b20kRGlzcG9zYWJsZT47XG4gIC8qKlxuICAgKiBUcnVlIGlmIGEgcmV2ZWFsIHdhcyByZXF1ZXN0ZWQgd2hpbGUgdGhlIGZpbGUgdHJlZSBpcyBoaWRkZW4uIElmIHNvLCB3ZSBzaG91bGQgYXBwbHkgaXQgd2hlblxuICAgKiB0aGUgdHJlZSBpcyBzaG93bi5cbiAgICovXG4gIF9yZXZlYWxBY3RpdmVGaWxlUGVuZGluZzogYm9vbGVhbjtcblxuICBzdGF0aWMgSU5JVElBTF9XSURUSCA9IDI0MDtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlKSB7XG4gICAgY29uc3Qge3BhbmVsfSA9IHtcbiAgICAgIC4uLntwYW5lbDoge3dpZHRoOiBGaWxlVHJlZUNvbnRyb2xsZXIuSU5JVElBTF9XSURUSH19LFxuICAgICAgLi4uc3RhdGUsXG4gICAgfTtcblxuICAgIC8vIHNob3cgdGhlIGZpbGUgdHJlZSBieSBkZWZhdWx0XG4gICAgdGhpcy5faXNWaXNpYmxlID0gcGFuZWwuaXNWaXNpYmxlICE9IG51bGwgPyBwYW5lbC5pc1Zpc2libGUgOiB0cnVlO1xuICAgIHRoaXMuX2FjdGlvbnMgPSBGaWxlVHJlZUFjdGlvbnMuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcbiAgICB0aGlzLl9yZXBvc2l0b3JpZXMgPSBuZXcgSW1tdXRhYmxlLlNldCgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkgPSBuZXcgSW1tdXRhYmxlLk1hcCgpO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIC8vIEluaXRpYWwgcm9vdCBkaXJlY3Rvcmllc1xuICAgIHRoaXMuX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpO1xuICAgIC8vIFN1YnNlcXVlbnQgcm9vdCBkaXJlY3RvcmllcyB1cGRhdGVkIG9uIGNoYW5nZVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4gdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCkpXG4gICAgKTtcbiAgICB0aGlzLl9pbml0aWFsaXplUGFuZWwoKTtcbiAgICAvLyBJbml0aWFsIHJlbmRlclxuICAgIHRoaXMuX3JlbmRlcihwYW5lbC53aWR0aCk7XG4gICAgLy8gU3Vic2VxdWVudCByZW5kZXJzIGhhcHBlbiBvbiBjaGFuZ2VzIHRvIGRhdGEgc3RvcmVcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIHRoaXMuX3N0b3JlLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9yZW5kZXIoKSlcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAvLyBQYXNzIHVuZGVmaW5lZCBzbyB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgZ2V0cyB1c2VkLlxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLWFjdGl2ZS1maWxlJzogdGhpcy5yZXZlYWxBY3RpdmVGaWxlLmJpbmQodGhpcywgdW5kZWZpbmVkKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnRvZ2dsZSc6IHRoaXMudG9nZ2xlVmlzaWJpbGl0eS5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6dG9nZ2xlLWZvY3VzJzogdGhpcy50b2dnbGVUcmVlRm9jdXMuYmluZCh0aGlzKSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKEVWRU5UX0hBTkRMRVJfU0VMRUNUT1IsIHtcbiAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogdGhpcy5fbW92ZURvd24uYmluZCh0aGlzKSxcbiAgICAgICAgJ2NvcmU6bW92ZS11cCc6IHRoaXMuX21vdmVVcC5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXRvLXRvcCc6IHRoaXMuX21vdmVUb1RvcC5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6IHRoaXMuX21vdmVUb0JvdHRvbS5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6YWRkLWZpbGUnOiAoKSA9PiB7XG4gICAgICAgICAgRmlsZVN5c3RlbUFjdGlvbnMub3BlbkFkZEZpbGVEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbEZpbGVQYXRoLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6YWRkLWZvbGRlcic6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuQWRkRm9sZGVyRGlhbG9nKHRoaXMuX29wZW5BbmRSZXZlYWxEaXJlY3RvcnlQYXRoLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6Y29sbGFwc2UtZGlyZWN0b3J5JzogdGhpcy5fY29sbGFwc2VTZWxlY3Rpb24uYmluZCh0aGlzLCAvKmRlZXAqLyBmYWxzZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZWN1cnNpdmUtY29sbGFwc2UtZGlyZWN0b3J5JzogdGhpcy5fY29sbGFwc2VTZWxlY3Rpb24uYmluZCh0aGlzLCB0cnVlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1jb2xsYXBzZS1hbGwnOiB0aGlzLl9jb2xsYXBzZUFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6Y29weS1mdWxsLXBhdGgnOiB0aGlzLl9jb3B5RnVsbFBhdGguYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmV4cGFuZC1kaXJlY3RvcnknOiB0aGlzLl9leHBhbmRTZWxlY3Rpb24uYmluZCh0aGlzLCAvKmRlZXAqLyBmYWxzZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZWN1cnNpdmUtZXhwYW5kLWRpcmVjdG9yeSc6IHRoaXMuX2V4cGFuZFNlbGVjdGlvbi5iaW5kKHRoaXMsIHRydWUpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeSc6IHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXVwJzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0VXAuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktZG93bic6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdERvd24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktbGVmdCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdExlZnQuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktcmlnaHQnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRSaWdodC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlJzogdGhpcy5fZGVsZXRlU2VsZWN0aW9uLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUtcHJvamVjdC1mb2xkZXItc2VsZWN0aW9uJzpcbiAgICAgICAgICB0aGlzLl9yZW1vdmVSb290Rm9sZGVyU2VsZWN0aW9uLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW5hbWUtc2VsZWN0aW9uJzogKCkgPT4gRmlsZVN5c3RlbUFjdGlvbnMub3BlblJlbmFtZURpYWxvZygpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6ZHVwbGljYXRlLXNlbGVjdGlvbic6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuRHVwbGljYXRlRGlhbG9nKHRoaXMucmV2ZWFsTm9kZUtleS5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnNlYXJjaC1pbi1kaXJlY3RvcnknOiB0aGlzLl9zZWFyY2hJbkRpcmVjdG9yeS5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6c2hvdy1pbi1maWxlLW1hbmFnZXInOiB0aGlzLl9zaG93SW5GaWxlTWFuYWdlci5iaW5kKHRoaXMpLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ1tpcz1cInRhYnMtdGFiXCJdJywge1xuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLXRhYi1maWxlJzogdGhpcy5fcmV2ZWFsVGFiRmlsZU9uQ2xpY2suYmluZCh0aGlzKSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICBpZiAoc3RhdGUgJiYgc3RhdGUudHJlZSkge1xuICAgICAgdGhpcy5fc3RvcmUubG9hZERhdGEoc3RhdGUudHJlZSk7XG4gICAgfVxuICAgIHRoaXMuX2NvbnRleHRNZW51ID0gbmV3IEZpbGVUcmVlQ29udGV4dE1lbnUoKTtcblxuICAgIHRoaXMuX3JldmVhbEFjdGl2ZUZpbGVQZW5kaW5nID0gZmFsc2U7XG4gIH1cblxuICBfaW5pdGlhbGl6ZVBhbmVsKCk6IHZvaWQge1xuICAgIHRoaXMuX3BhbmVsRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHRoaXMuX3BhbmVsRWxlbWVudC5zdHlsZS5oZWlnaHQgPSAnMTAwJSc7XG4gICAgdGhpcy5fcGFuZWwgPSBhdG9tLndvcmtzcGFjZS5hZGRMZWZ0UGFuZWwoe1xuICAgICAgaXRlbTogdGhpcy5fcGFuZWxFbGVtZW50LFxuICAgICAgdmlzaWJsZTogdGhpcy5faXNWaXNpYmxlLFxuICAgIH0pO1xuICB9XG5cbiAgX3JlbmRlcihpbml0aWFsV2lkdGg/OiA/bnVtYmVyKTogdm9pZCB7XG4gICAgdGhpcy5fZmlsZVRyZWVQYW5lbCA9IFJlYWN0LnJlbmRlcihcbiAgICAgIDxGaWxlVHJlZVBhbmVsXG4gICAgICAgIGluaXRpYWxXaWR0aD17aW5pdGlhbFdpZHRofVxuICAgICAgICBzdG9yZT17dGhpcy5fc3RvcmV9XG4gICAgICAvPixcbiAgICAgIHRoaXMuX3BhbmVsRWxlbWVudCxcbiAgICApO1xuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxGaWxlUGF0aChmaWxlUGF0aDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChmaWxlUGF0aCAhPSBudWxsKSB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxEaXJlY3RvcnlQYXRoKHBhdGg6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAocGF0aCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShwYXRoKSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgcmVtb3RlLXByb2plY3RzIHBhY2thZ2UgaGFzbid0IGxvYWRlZCB5ZXQgcmVtb3RlIGRpcmVjdG9yaWVzIHdpbGwgYmUgaW5zdGFudGlhdGVkIGFzXG4gICAgLy8gbG9jYWwgZGlyZWN0b3JpZXMgYnV0IHdpdGggaW52YWxpZCBwYXRocy4gV2UgbmVlZCB0byBleGNsdWRlIHRob3NlLlxuICAgIGNvbnN0IHJvb3REaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcihkaXJlY3RvcnkgPT4gKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmlzVmFsaWREaXJlY3RvcnkoZGlyZWN0b3J5KVxuICAgICkpO1xuICAgIGNvbnN0IHJvb3RLZXlzID0gcm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKTtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFJvb3RLZXlzKHJvb3RLZXlzKTtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVJlcG9zaXRvcmllcyhyb290RGlyZWN0b3JpZXMpO1xuICB9XG5cbiAgX3NldFZpc2liaWxpdHkoc2hvdWxkQmVWaXNpYmxlOiBib29sZWFuKTogdm9pZCB7XG4gICAgaWYgKHNob3VsZEJlVmlzaWJsZSkge1xuICAgICAgdGhpcy5fcGFuZWwuc2hvdygpO1xuICAgICAgdGhpcy5mb2N1c1RyZWUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHRoaXMuX3RyZWVIYXNGb2N1cygpKSB7XG4gICAgICAgIC8vIElmIHRoZSBmaWxlIHRyZWUgaGFzIGZvY3VzLCBibHVyIGl0IGJlY2F1c2UgaXQgd2lsbCBiZSBoaWRkZW4gd2hlbiB0aGUgcGFuZWwgaXMgaGlkZGVuLlxuICAgICAgICB0aGlzLmJsdXJUcmVlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLl9wYW5lbC5oaWRlKCk7XG4gICAgfVxuICAgIHRoaXMuX2lzVmlzaWJsZSA9IHNob3VsZEJlVmlzaWJsZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBcIkJsdXJzXCIgdGhlIHRyZWUsIHdoaWNoIGlzIGRvbmUgYnkgYWN0aXZhdGluZyB0aGUgYWN0aXZlIHBhbmUgaW5cbiAgICogW0F0b20ncyB0cmVlLXZpZXdde0BsaW5rIGh0dHBzOi8vZ2l0aHViLmNvbS9hdG9tL3RyZWUtdmlldy9ibG9iL3YwLjE4OC4wL2xpYi90cmVlLXZpZXcuY29mZmVlI0wxODd9LlxuICAgKi9cbiAgYmx1clRyZWUoKTogdm9pZCB7XG4gICAgYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlUGFuZSgpLmFjdGl2YXRlKCk7XG4gIH1cblxuICBmb2N1c1RyZWUoKTogdm9pZCB7XG4gICAgdGhpcy5fZmlsZVRyZWVQYW5lbC5nZXRGaWxlVHJlZSgpLmZvY3VzKCk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIGZpbGUgdHJlZSBET00gbm9kZSBoYXMgZm9jdXMsIG90aGVyd2lzZSBgZmFsc2VgLlxuICAgKi9cbiAgX3RyZWVIYXNGb2N1cygpOiBib29sZWFuIHtcbiAgICBjb25zdCBmaWxlVHJlZSA9IHRoaXMuX2ZpbGVUcmVlUGFuZWwuZ2V0RmlsZVRyZWUoKTtcbiAgICByZXR1cm4gZmlsZVRyZWUuaGFzRm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBGb2N1c2VzIHRoZSB0cmVlIGlmIGl0IGRvZXMgbm90IGhhdmUgZm9jdXMsIGJsdXJzIHRoZSB0cmVlIGlmIGl0IGRvZXMgaGF2ZSBmb2N1cy5cbiAgICovXG4gIHRvZ2dsZVRyZWVGb2N1cygpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fdHJlZUhhc0ZvY3VzKCkpIHtcbiAgICAgIHRoaXMuYmx1clRyZWUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5mb2N1c1RyZWUoKTtcbiAgICB9XG4gIH1cblxuICB0b2dnbGVWaXNpYmlsaXR5KCk6IHZvaWQge1xuICAgIGNvbnN0IHdpbGxCZVZpc2libGUgPSAhdGhpcy5faXNWaXNpYmxlO1xuICAgIHRoaXMuX3NldFZpc2liaWxpdHkod2lsbEJlVmlzaWJsZSk7XG4gICAgaWYgKHdpbGxCZVZpc2libGUgJiYgdGhpcy5fcmV2ZWFsQWN0aXZlRmlsZVBlbmRpbmcpIHtcbiAgICAgIHRoaXMucmV2ZWFsQWN0aXZlRmlsZSgpO1xuICAgICAgdGhpcy5fcmV2ZWFsQWN0aXZlRmlsZVBlbmRpbmcgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUmV2ZWFsIHRoZSBmaWxlIHRoYXQgY3VycmVudGx5IGhhcyBmb2N1cyBpbiB0aGUgZmlsZSB0cmVlLiBJZiBzaG93SWZIaWRkZW4gaXMgZmFsc2UsXG4gICAqIHRoaXMgd2lsbCBlbnF1ZXVlIGEgcGVuZGluZyByZXZlYWwgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgZmlsZSB0cmVlIGlzIHNob3duIGFnYWluLlxuICAgKi9cbiAgcmV2ZWFsQWN0aXZlRmlsZShzaG93SWZIaWRkZW4/OiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBjb25zdCBmaWxlID0gZWRpdG9yID8gZWRpdG9yLmdldEJ1ZmZlcigpLmZpbGUgOiBudWxsO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZmlsZSA/IGZpbGUuZ2V0UGF0aCgpIDogbnVsbDtcblxuICAgIGlmIChzaG93SWZIaWRkZW4pIHtcbiAgICAgIC8vIEVuc3VyZSB0aGUgZmlsZSB0cmVlIGlzIHZpc2libGUgYmVmb3JlIHRyeWluZyB0byByZXZlYWwgYSBmaWxlIGluIGl0LiBFdmVuIGlmIHRoZSBjdXJyZW50bHlcbiAgICAgIC8vIGFjdGl2ZSBwYW5lIGlzIG5vdCBhbiBvcmRpbmFyeSBlZGl0b3IsIHdlIHN0aWxsIGF0IGxlYXN0IHdhbnQgdG8gc2hvdyB0aGUgdHJlZS5cbiAgICAgIHRoaXMuX3NldFZpc2liaWxpdHkodHJ1ZSk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIHdlIGFyZSBub3Qgc2hvd2luZyB0aGUgdHJlZSBhcyBwYXJ0IG9mIHRoaXMgYWN0aW9uLCBhbmQgaXQgaXMgY3VycmVudGx5IGhpZGRlbiwgdGhpc1xuICAgIC8vIHJldmVhbCB3aWxsIHRha2UgZWZmZWN0IHdoZW4gdGhlIHRyZWUgaXMgc2hvd24uXG4gICAgaWYgKCFzaG93SWZIaWRkZW4gJiYgIXRoaXMuX2lzVmlzaWJsZSkge1xuICAgICAgdGhpcy5fcmV2ZWFsQWN0aXZlRmlsZVBlbmRpbmcgPSB0cnVlO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUmV2ZWFsIHRoZSBmaWxlIG9mIGEgZ2l2ZW4gdGFiIGJhc2VkIG9uIHRoZSBwYXRoIHN0b3JlZCBvbiB0aGUgRE9NLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtZWFudCB0byBiZSB0cmlnZ2VyZWQgYnkgdGhlIGNvbnRleHQtbWVudSBjbGljay5cbiAgICovXG4gIF9yZXZlYWxUYWJGaWxlT25DbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCB0YWIgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEVsZW1lbnQpO1xuICAgIGNvbnN0IHRpdGxlID0gdGFiLnF1ZXJ5U2VsZWN0b3IoJy50aXRsZVtkYXRhLXBhdGhdJyk7XG4gICAgaWYgKCF0aXRsZSkge1xuICAgICAgLy8gY2FuIG9ubHkgcmV2ZWFsIGl0IGlmIHdlIGZpbmQgdGhlIGZpbGUgcGF0aFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGl0bGUuZGF0YXNldC5wYXRoO1xuICAgIHRoaXMuX3NldFZpc2liaWxpdHkodHJ1ZSk7XG4gICAgdGhpcy5yZXZlYWxOb2RlS2V5KGZpbGVQYXRoKTtcbiAgfVxuXG4gIHJldmVhbE5vZGVLZXkobm9kZUtleTogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmICghbm9kZUtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByb290S2V5OiA/c3RyaW5nID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEZvcktleShub2RlS2V5KTtcbiAgICBpZiAoIXJvb3RLZXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICBsZXQga2V5ID0gbm9kZUtleTtcbiAgICB3aGlsZSAoa2V5ICE9IG51bGwgJiYga2V5ICE9PSByb290S2V5KSB7XG4gICAgICBzdGFjay5wdXNoKGtleSk7XG4gICAgICBrZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGtleSk7XG4gICAgfVxuICAgIC8vIFdlIHdhbnQgdGhlIHN0YWNrIHRvIGJlIFtwYXJlbnRLZXksIC4uLiwgbm9kZUtleV0uXG4gICAgc3RhY2sucmV2ZXJzZSgpO1xuICAgIHN0YWNrLmZvckVhY2goKGNoaWxkS2V5LCBpKSA9PiB7XG4gICAgICBjb25zdCBwYXJlbnRLZXkgPSAoaSA9PT0gMCkgPyByb290S2V5IDogc3RhY2tbaSAtIDFdO1xuICAgICAgdGhpcy5fYWN0aW9ucy5lbnN1cmVDaGlsZE5vZGUocm9vdEtleSwgcGFyZW50S2V5LCBjaGlsZEtleSk7XG4gICAgICB0aGlzLl9hY3Rpb25zLmV4cGFuZE5vZGUocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBzZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gIH1cblxuICBzZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lcyk7XG4gIH1cblxuICBzZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzKTtcbiAgfVxuXG4gIHNldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFicyk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGFsbCBzZWxlY3RlZCBkaXJlY3Rvcnkgbm9kZXMuIElmIHRoZSBzZWxlY3Rpb24gaXMgYSBzaW5nbGUgZmlsZSBvciBhIHNpbmdsZSBjb2xsYXBzZWRcbiAgICogZGlyZWN0b3J5LCB0aGUgc2VsZWN0aW9uIGlzIHNldCB0byB0aGUgZGlyZWN0b3J5J3MgcGFyZW50LlxuICAgKi9cbiAgX2NvbGxhcHNlU2VsZWN0aW9uKGRlZXA6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgY29uc3QgZmlyc3RTZWxlY3RlZE5vZGUgPSBzZWxlY3RlZE5vZGVzLmZpcnN0KCk7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuc2l6ZSA9PT0gMVxuICAgICAgJiYgIWZpcnN0U2VsZWN0ZWROb2RlLmlzUm9vdFxuICAgICAgJiYgIShmaXJzdFNlbGVjdGVkTm9kZS5pc0NvbnRhaW5lciAmJiBmaXJzdFNlbGVjdGVkTm9kZS5pc0V4cGFuZGVkKCkpKSB7XG4gICAgICAvKlxuICAgICAgICogU2VsZWN0IHRoZSBwYXJlbnQgb2YgdGhlIHNlbGVjdGlvbiBpZiB0aGUgZm9sbG93aW5nIGNyaXRlcmlhIGFyZSBtZXQ6XG4gICAgICAgKiAgICogT25seSAxIG5vZGUgaXMgc2VsZWN0ZWRcbiAgICAgICAqICAgKiBUaGUgbm9kZSBpcyBub3QgYSByb290XG4gICAgICAgKiAgICogVGhlIG5vZGUgaXMgbm90IGFuIGV4cGFuZGVkIGRpcmVjdG9yeVxuICAgICAgICovXG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShmaXJzdFNlbGVjdGVkTm9kZS5ub2RlS2V5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgLy8gT25seSBkaXJlY3RvcmllcyBjYW4gYmUgZXhwYW5kZWQuIFNraXAgbm9uLWRpcmVjdG9yeSBub2Rlcy5cbiAgICAgICAgaWYgKCFub2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZURlZXAobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX2NvbGxhcHNlQWxsKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3RLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICByb290S2V5cy5mb3JFYWNoKHJvb3RLZXkgPT4gdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGVEZWVwKHJvb3RLZXksIHJvb3RLZXkpKTtcbiAgfVxuXG4gIF9kZWxldGVTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgaWYgKG5vZGVzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb290UGF0aHMgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiBub2RlLmlzUm9vdCk7XG4gICAgaWYgKHJvb3RQYXRocy5zaXplID09PSAwKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZFBhdGhzID0gbm9kZXMubWFwKG5vZGUgPT4gbm9kZS5ub2RlUGF0aCk7XG4gICAgICBjb25zdCBtZXNzYWdlID0gJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhlIGZvbGxvd2luZyAnICtcbiAgICAgICAgICAobm9kZXMuc2l6ZSA+IDEgPyAnaXRlbXM/JyA6ICdpdGVtPycpO1xuICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICdEZWxldGUnOiAoKSA9PiB7IHRoaXMuX2FjdGlvbnMuZGVsZXRlU2VsZWN0ZWROb2RlcygpOyB9LFxuICAgICAgICAgICdDYW5jZWwnOiAoKSA9PiB7fSxcbiAgICAgICAgfSxcbiAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBgWW91IGFyZSBkZWxldGluZzoke29zLkVPTH0ke3NlbGVjdGVkUGF0aHMuam9pbihvcy5FT0wpfWAsXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG1lc3NhZ2U7XG4gICAgICBpZiAocm9vdFBhdGhzLnNpemUgPT09IDEpIHtcbiAgICAgICAgbWVzc2FnZSA9IGBUaGUgcm9vdCBkaXJlY3RvcnkgJyR7cm9vdFBhdGhzLmZpcnN0KCkubm9kZU5hbWV9JyBjYW4ndCBiZSByZW1vdmVkLmA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByb290UGF0aE5hbWVzID0gcm9vdFBhdGhzLm1hcChub2RlID0+IGAnJHtub2RlLm5vZGVOYW1lfSdgKS5qb2luKCcsICcpO1xuICAgICAgICBtZXNzYWdlID0gYFRoZSByb290IGRpcmVjdG9yaWVzICR7cm9vdFBhdGhOYW1lc30gY2FuJ3QgYmUgcmVtb3ZlZC5gO1xuICAgICAgfVxuXG4gICAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgICBidXR0b25zOiBbJ09LJ10sXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyBhbGwgc2VsZWN0ZWQgZGlyZWN0b3J5IG5vZGVzLlxuICAgKi9cbiAgX2V4cGFuZFNlbGVjdGlvbihkZWVwOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAvLyBPbmx5IGRpcmVjdG9yaWVzIGNhbiBiZSBleHBhbmRlZC4gU2tpcCBub24tZGlyZWN0b3J5IG5vZGVzLlxuICAgICAgaWYgKCFub2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlRGVlcChub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9hY3Rpb25zLmV4cGFuZE5vZGUobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX21vdmVEb3duKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0U2VsZWN0ZWRLZXkgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZEtleXMoKS5sYXN0KCk7XG4gICAgaWYgKGxhc3RTZWxlY3RlZEtleSA9PSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBubyBzZWxlY3Rpb24geWV0LCBzbyBtb3ZlIHRvIHRoZSB0b3Agb2YgdGhlIHRyZWUuXG4gICAgICB0aGlzLl9tb3ZlVG9Ub3AoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGFyZW50S2V5O1xuICAgIGxldCByb290S2V5O1xuICAgIGxldCBzaWJsaW5nS2V5cztcbiAgICBjb25zdCBpc1Jvb3QgPSB0aGlzLl9zdG9yZS5pc1Jvb3RLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoaXNSb290KSB7XG4gICAgICByb290S2V5ID0gbGFzdFNlbGVjdGVkS2V5O1xuICAgICAgLy8gT3RoZXIgcm9vdHMgYXJlIHRoaXMgcm9vdCdzIHNpYmxpbmdzXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIHJvb3RLZXkgPSB0aGlzLl9zdG9yZS5nZXRSb290Rm9yS2V5KGxhc3RTZWxlY3RlZEtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSByb290IGRvZXMgbm90IGV4aXN0IG9yIGlmIHRoaXMgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhIHBhcmVudCBidXQgZG9lc24ndCAocm9vdHMgZG9cbiAgICAvLyBub3QgaGF2ZSBwYXJlbnRzKSwgbm90aGluZyBjYW4gYmUgZG9uZS4gRXhpdC5cbiAgICBpZiAocm9vdEtleSA9PSBudWxsIHx8ICghaXNSb290ICYmIHBhcmVudEtleSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGxhc3RTZWxlY3RlZEtleSkgJiZcbiAgICAgIHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQocm9vdEtleSwgbGFzdFNlbGVjdGVkS2V5KSAmJlxuICAgICAgY2hpbGRyZW4ubGVuZ3RoID4gMFxuICAgICkge1xuICAgICAgLy8gRGlyZWN0b3J5IGlzIGV4cGFuZGVkIGFuZCBpdCBoYXMgY2hpbGRyZW4uIFNlbGVjdCBmaXJzdCBjaGlsZC4gRXhpdC5cbiAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBjaGlsZHJlblswXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihsYXN0U2VsZWN0ZWRLZXkpO1xuICAgICAgY29uc3QgbWF4SW5kZXggPSBzaWJsaW5nS2V5cy5sZW5ndGggLSAxO1xuXG4gICAgICBpZiAoaW5kZXggPCBtYXhJbmRleCkge1xuICAgICAgICBjb25zdCBuZXh0U2libGluZ0tleSA9IHNpYmxpbmdLZXlzW2luZGV4ICsgMV07XG5cbiAgICAgICAgaWYgKGlzUm9vdCkge1xuICAgICAgICAgIC8vIElmIHRoZSBuZXh0IHNlbGVjdGVkIGl0ZW0gaXMgYW5vdGhlciByb290LCBzZXQgYHJvb3RLZXlgIHRvIGl0IHNvIHRyYWNrQW5kU2VsZWN0IGZpbmRzXG4gICAgICAgICAgLy8gdGhhdCBbcm9vdEtleSwgcm9vdEtleV0gdHVwbGUuXG4gICAgICAgICAgcm9vdEtleSA9IG5leHRTaWJsaW5nS2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBoYXMgYSBuZXh0IHNpYmxpbmcuXG4gICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBzaWJsaW5nS2V5c1tpbmRleCArIDFdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG5lYXJlc3RBbmNlc3RvclNpYmxpbmcgPSB0aGlzLl9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhyb290S2V5LCBsYXN0U2VsZWN0ZWRLZXkpO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgdGhlIGJvdHRvbW1vc3Qgbm9kZSBvZiB0aGUgdHJlZSwgdGhlcmUgd29uJ3QgYmUgYW55dGhpbmcgdG8gc2VsZWN0LlxuICAgICAgICAvLyBWb2lkIHJldHVybiBzaWduaWZpZXMgbm8gbmV4dCBub2RlIHdhcyBmb3VuZC5cbiAgICAgICAgaWYgKG5lYXJlc3RBbmNlc3RvclNpYmxpbmcgIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShuZWFyZXN0QW5jZXN0b3JTaWJsaW5nLnJvb3RLZXksIG5lYXJlc3RBbmNlc3RvclNpYmxpbmcubm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfbW92ZVVwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0U2VsZWN0ZWRLZXkgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZEtleXMoKS5sYXN0KCk7XG4gICAgaWYgKGxhc3RTZWxlY3RlZEtleSA9PSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBubyBzZWxlY3Rpb24uIE1vdmUgdG8gdGhlIGJvdHRvbSBvZiB0aGUgdHJlZS5cbiAgICAgIHRoaXMuX21vdmVUb0JvdHRvbSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwYXJlbnRLZXk7XG4gICAgbGV0IHJvb3RLZXk7XG4gICAgbGV0IHNpYmxpbmdLZXlzO1xuICAgIGNvbnN0IGlzUm9vdCA9IHRoaXMuX3N0b3JlLmlzUm9vdEtleShsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgIHJvb3RLZXkgPSBsYXN0U2VsZWN0ZWRLZXk7XG4gICAgICAvLyBPdGhlciByb290cyBhcmUgdGhpcyByb290J3Mgc2libGluZ3NcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50S2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShsYXN0U2VsZWN0ZWRLZXkpO1xuICAgICAgcm9vdEtleSA9IHRoaXMuX3N0b3JlLmdldFJvb3RGb3JLZXkobGFzdFNlbGVjdGVkS2V5KTtcblxuICAgICAgaW52YXJpYW50KHJvb3RLZXkgJiYgcGFyZW50S2V5KTtcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHJvb3QgZG9lcyBub3QgZXhpc3Qgb3IgaWYgdGhpcyBpcyBleHBlY3RlZCB0byBoYXZlIGEgcGFyZW50IGJ1dCBkb2Vzbid0IChyb290cyBkb1xuICAgIC8vIG5vdCBoYXZlIHBhcmVudHMpLCBub3RoaW5nIGNhbiBiZSBkb25lLiBFeGl0LlxuICAgIGlmIChyb290S2V5ID09IG51bGwgfHwgKCFpc1Jvb3QgJiYgcGFyZW50S2V5ID09IG51bGwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBzaWJsaW5nS2V5cy5pbmRleE9mKGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICBpZiAoIWlzUm9vdCAmJiBwYXJlbnRLZXkgIT0gbnVsbCkge1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBmaXJzdCBjaGlsZC4gSXQgaGFzIGEgcGFyZW50LiBTZWxlY3QgdGhlIHBhcmVudC5cbiAgICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgICB9XG4gICAgICAvLyBUaGlzIGlzIHRoZSByb290IGFuZC9vciB0aGUgdG9wIG9mIHRoZSB0cmVlIChoYXMgbm8gcGFyZW50KS4gTm90aGluZyBlbHNlIHRvIHRyYXZlcnNlLlxuICAgICAgLy8gRXhpdC5cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHJldmlvdXNTaWJsaW5nS2V5ID0gc2libGluZ0tleXNbaW5kZXggLSAxXTtcblxuICAgICAgaWYgKGlzUm9vdCkge1xuICAgICAgICAvLyBJZiB0cmF2ZXJzaW5nIHVwIHRvIGEgZGlmZmVyZW50IHJvb3QsIHRoZSByb290S2V5IG11c3QgYmVjb21lIHRoYXQgbmV3IHJvb3QgdG8gY2hlY2tcbiAgICAgICAgLy8gZXhwYW5kZWQga2V5cyBpbiBpdC5cbiAgICAgICAgcm9vdEtleSA9IHByZXZpb3VzU2libGluZ0tleTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKFxuICAgICAgICByb290S2V5LFxuICAgICAgICB0aGlzLl9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShyb290S2V5LCBwcmV2aW91c1NpYmxpbmdLZXkpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIF9tb3ZlVG9Ub3AoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJvb3RLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleXNbMF0sIHJvb3RLZXlzWzBdKTtcbiAgfVxuXG4gIF9tb3ZlVG9Cb3R0b20oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNlbGVjdCB0aGUgbG93ZXJtb3N0IGRlc2NlbmRhbnQgb2YgdGhlIGxhc3Qgcm9vdCBub2RlLlxuICAgIGNvbnN0IHJvb3RLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICBjb25zdCBsYXN0Um9vdEtleSA9IHJvb3RLZXlzW3Jvb3RLZXlzLmxlbmd0aCAtIDFdO1xuICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShcbiAgICAgIGxhc3RSb290S2V5LFxuICAgICAgdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkobGFzdFJvb3RLZXksIGxhc3RSb290S2V5KVxuICAgICk7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm5zIHRoZSBsb3dlcm1vc3QgZGVzY2VuZGFudCB3aGVuIGNvbnNpZGVyZWQgaW4gZmlsZSBzeXN0ZW0gb3JkZXIgd2l0aCBleHBhbmRhYmxlXG4gICAqIGRpcmVjdG9yaWVzLiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogICBBID5cbiAgICogICAgIEIgPlxuICAgKiAgICAgQyA+XG4gICAqICAgICAgIEUudHh0XG4gICAqICAgICBELmZvb1xuICAgKlxuICAgKiAgID4gX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KEEpXG4gICAqICAgRC5mb29cbiAgICpcbiAgICogVGhvdWdoIEEgaGFzIG1vcmUgZGVlcGx5LW5lc3RlZCBkZXNjZW5kYW50cyB0aGFuIEQuZm9vLCBsaWtlIEUudHh0LCBELmZvbyBpcyBsb3dlcm1vc3Qgd2hlblxuICAgKiBjb25zaWRlcmVkIGluIGZpbGUgc3lzdGVtIG9yZGVyLlxuICAgKi9cbiAgX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIShGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobm9kZUtleSkgJiYgdGhpcy5fc3RvcmUuaXNFeHBhbmRlZChyb290S2V5LCBub2RlS2V5KSkpIHtcbiAgICAgIC8vIElmIGBub2RlS2V5YCBpcyBub3QgYW4gZXhwYW5kZWQgZGlyZWN0b3J5IHRoZXJlIGFyZSBubyBtb3JlIGRlc2NlbmRhbnRzIHRvIHRyYXZlcnNlLiBSZXR1cm5cbiAgICAgIC8vIHRoZSBgbm9kZUtleWAuXG4gICAgICByZXR1cm4gbm9kZUtleTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgbm9kZUtleSk7XG4gICAgaWYgKGNoaWxkS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIElmIHRoZSBkaXJlY3RvcnkgaGFzIG5vIGNoaWxkcmVuLCB0aGUgZGlyZWN0b3J5IGl0c2VsZiBpcyB0aGUgbG93ZXJtb3N0IGRlc2NlbmRhbnQuXG4gICAgICByZXR1cm4gbm9kZUtleTtcbiAgICB9XG5cbiAgICAvLyBUaGVyZSdzIGF0IGxlYXN0IG9uZSBjaGlsZC4gUmVjdXJzZSBkb3duIHRoZSBsYXN0IGNoaWxkLlxuICAgIHJldHVybiB0aGlzLl9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShyb290S2V5LCBjaGlsZEtleXNbY2hpbGRLZXlzLmxlbmd0aCAtIDFdKTtcbiAgfVxuXG4gIC8qXG4gICAqIFJldHVybnMgdGhlIG5lYXJlc3QgXCJhbmNlc3RvciBzaWJsaW5nXCIgd2hlbiBjb25zaWRlcmVkIGluIGZpbGUgc3lzdGVtIG9yZGVyIHdpdGggZXhwYW5kYWJsZVxuICAgKiBkaXJlY3Rvcmllcy4gRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqICAgQSA+XG4gICAqICAgICBCID5cbiAgICogICAgICAgQyA+XG4gICAqICAgICAgICAgRS50eHRcbiAgICogICBELmZvb1xuICAgKlxuICAgKiAgID4gX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKEUudHh0KVxuICAgKiAgIEQuZm9vXG4gICAqL1xuICBfZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiA/RmlsZVRyZWVOb2RlRGF0YSB7XG4gICAgbGV0IHBhcmVudEtleTtcbiAgICBsZXQgc2libGluZ0tleXM7XG4gICAgY29uc3QgaXNSb290ID0gcm9vdEtleSA9PT0gbm9kZUtleTtcbiAgICBpZiAoaXNSb290KSB7XG4gICAgICAvLyBgcm9vdEtleSA9PT0gbm9kZUtleWAgbWVhbnMgdGhpcyBoYXMgcmVjdXJzZWQgdG8gYSByb290LiBgbm9kZUtleWAgaXMgYSByb290IGtleS5cbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50S2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShub2RlS2V5KTtcblxuICAgICAgaW52YXJpYW50KHJvb3RLZXkgJiYgcGFyZW50S2V5KTtcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBzaWJsaW5nS2V5cy5pbmRleE9mKG5vZGVLZXkpO1xuICAgIGlmIChpbmRleCA8IChzaWJsaW5nS2V5cy5sZW5ndGggLSAxKSkge1xuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBzaWJsaW5nS2V5c1tpbmRleCArIDFdO1xuICAgICAgLy8gSWYgdHJhdmVyc2luZyBhY3Jvc3Mgcm9vdHMsIHRoZSBuZXh0IHNpYmxpbmcgaXMgYWxzbyB0aGUgbmV4dCByb290LiBSZXR1cm4gaXQgYXMgdGhlIG5leHRcbiAgICAgIC8vIHJvb3Qga2V5IGFzIHdlbGwgYXMgdGhlIG5leHQgbm9kZSBrZXkuXG4gICAgICByZXR1cm4gaXNSb290XG4gICAgICAgID8ge25vZGVLZXk6IG5leHRTaWJsaW5nLCByb290S2V5OiBuZXh0U2libGluZ31cbiAgICAgICAgOiB7bm9kZUtleTogbmV4dFNpYmxpbmcsIHJvb3RLZXl9O1xuICAgIH0gZWxzZSBpZiAocGFyZW50S2V5ICE9IG51bGwpIHtcbiAgICAgIC8vIFRoZXJlIGlzIGEgcGFyZW50IHRvIHJlY3Vyc2UuIFJldHVybiBpdHMgbmVhcmVzdCBhbmNlc3RvciBzaWJsaW5nLlxuICAgICAgcmV0dXJuIHRoaXMuX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGBwYXJlbnRLZXlgIGlzIG51bGwsIG5vZGVLZXkgaXMgYSByb290IGFuZCBoYXMgbW9yZSBwYXJlbnRzIHRvIHJlY3Vyc2UuIFJldHVybiBgbnVsbGAgdG9cbiAgICAgIC8vIHNpZ25pZnkgbm8gYXBwcm9wcmlhdGUga2V5IHdhcyBmb3VuZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeSgpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAvLyBPbmx5IHBlcmZvcm0gdGhlIGRlZmF1bHQgYWN0aW9uIGlmIGEgc2luZ2xlIG5vZGUgaXMgc2VsZWN0ZWQuXG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3Rpb25zLmNvbmZpcm1Ob2RlKHNpbmdsZVNlbGVjdGVkTm9kZS5yb290S2V5LCBzaW5nbGVTZWxlY3RlZE5vZGUubm9kZUtleSk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQob3JpZW50YXRpb246IGF0b20kUGFuZVNwbGl0T3JpZW50YXRpb24sIHNpZGU6IGF0b20kUGFuZVNwbGl0U2lkZSk6IHZvaWQge1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIC8vIE9ubHkgcGVyZm9ybSB0aGUgZGVmYXVsdCBhY3Rpb24gaWYgYSBzaW5nbGUgbm9kZSBpcyBzZWxlY3RlZC5cbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwgJiYgIXNpbmdsZVNlbGVjdGVkTm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgLy8gZm9yOiBpcyB0aGlzIGZlYXR1cmUgdXNlZCBlbm91Z2ggdG8ganVzdGlmeSB1bmNvbGxhcHNpbmc/XG4gICAgICB0cmFjaygnZmlsZXRyZWUtc3BsaXQtZmlsZScsIHtcbiAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgIHNpZGUsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2FjdGlvbnMub3BlblNlbGVjdGVkRW50cnlTcGxpdChcbiAgICAgICAgc2luZ2xlU2VsZWN0ZWROb2RlLm5vZGVLZXksXG4gICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICBzaWRlLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdFVwKCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ3ZlcnRpY2FsJywgJ2JlZm9yZScpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXREb3duKCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ3ZlcnRpY2FsJywgJ2FmdGVyJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdExlZnQoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgnaG9yaXpvbnRhbCcsICdiZWZvcmUnKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0UmlnaHQoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgnaG9yaXpvbnRhbCcsICdhZnRlcicpO1xuICB9XG5cbiAgX3JlbW92ZVJvb3RGb2xkZXJTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAocm9vdE5vZGUgIT0gbnVsbCAmJiByb290Tm9kZS5pc1Jvb3QpIHtcbiAgICAgIGF0b20ucHJvamVjdC5yZW1vdmVQYXRoKHJvb3ROb2RlLm5vZGVQYXRoKTtcbiAgICB9XG4gIH1cblxuICBfc2VhcmNoSW5EaXJlY3RvcnkoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgLy8gRGlzcGF0Y2ggYSBjb21tYW5kIHRvIHNob3cgdGhlIGBQcm9qZWN0RmluZFZpZXdgLiBUaGlzIG9wZW5zIHRoZSB2aWV3IGFuZCBmb2N1c2VzIHRoZSBzZWFyY2hcbiAgICAvLyBib3guXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBIVE1MRWxlbWVudCksXG4gICAgICAncHJvamVjdC1maW5kOnNob3ctaW4tY3VycmVudC1kaXJlY3RvcnknXG4gICAgKTtcbiAgfVxuXG4gIF9zaG93SW5GaWxlTWFuYWdlcigpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgLy8gT25seSBhbGxvdyByZXZlYWxpbmcgYSBzaW5nbGUgZGlyZWN0b3J5L2ZpbGUgYXQgYSB0aW1lLiBSZXR1cm4gb3RoZXJ3aXNlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzaGVsbC5zaG93SXRlbUluRm9sZGVyKG5vZGUubm9kZVBhdGgpO1xuICB9XG5cbiAgX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIFNlbGVjdCB0aGUgbm9kZSBiZWZvcmUgdHJhY2tpbmcgaXQgYmVjYXVzZSBzZXR0aW5nIGEgbmV3IHNlbGVjdGlvbiBjbGVhcnMgdGhlIHRyYWNrZWQgbm9kZS5cbiAgICB0aGlzLl9hY3Rpb25zLnNlbGVjdFNpbmdsZU5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRUcmFja2VkTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgfVxuXG4gIF9jb3B5RnVsbFBhdGgoKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsKSB7XG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShzaW5nbGVTZWxlY3RlZE5vZGUuZ2V0TG9jYWxQYXRoKCkpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgZm9yIChjb25zdCBkaXNwb3NhYmxlIG9mIHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkudmFsdWVzKCkpIHtcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9zdG9yZS5yZXNldCgpO1xuICAgIFJlYWN0LnVubW91bnRDb21wb25lbnRBdE5vZGUodGhpcy5fcGFuZWxFbGVtZW50KTtcbiAgICB0aGlzLl9wYW5lbC5kZXN0cm95KCk7XG4gICAgdGhpcy5fY29udGV4dE1lbnUuZGlzcG9zZSgpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IEZpbGVUcmVlQ29udHJvbGxlclN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgcGFuZWw6IHtcbiAgICAgICAgaXNWaXNpYmxlOiB0aGlzLl9pc1Zpc2libGUsXG4gICAgICAgIHdpZHRoOiB0aGlzLl9maWxlVHJlZVBhbmVsLmdldExlbmd0aCgpLFxuICAgICAgfSxcbiAgICAgIHRyZWU6IHRoaXMuX3N0b3JlLmV4cG9ydERhdGEoKSxcbiAgICB9O1xuICB9XG59XG5cbmNsYXNzIEZpbGVUcmVlUGFuZWwgZXh0ZW5kcyBSZWFjdC5Db21wb25lbnQge1xuICBzdGF0aWMgcHJvcFR5cGVzID0ge1xuICAgIGluaXRpYWxXaWR0aDogUHJvcFR5cGVzLm51bWJlcixcbiAgICBzdG9yZTogUHJvcFR5cGVzLmluc3RhbmNlT2YoRmlsZVRyZWVTdG9yZSkuaXNSZXF1aXJlZCxcbiAgfTtcblxuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIChcbiAgICAgIDxQYW5lbENvbXBvbmVudFxuICAgICAgICBkb2NrPVwibGVmdFwiXG4gICAgICAgIGluaXRpYWxMZW5ndGg9e3RoaXMucHJvcHMuaW5pdGlhbFdpZHRofVxuICAgICAgICByZWY9XCJwYW5lbFwiPlxuICAgICAgICA8RmlsZVRyZWUgc3RvcmU9e3RoaXMucHJvcHMuc3RvcmV9IC8+XG4gICAgICA8L1BhbmVsQ29tcG9uZW50PlxuICAgICk7XG4gIH1cblxuICBnZXRGaWxlVHJlZSgpOiBGaWxlVHJlZSB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1sncGFuZWwnXS5nZXRDaGlsZENvbXBvbmVudCgpO1xuICB9XG5cbiAgZ2V0TGVuZ3RoKCk6IG51bWJlciB7XG4gICAgcmV0dXJuIHRoaXMucmVmc1sncGFuZWwnXS5nZXRMZW5ndGgoKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQ29udHJvbGxlcjtcbiJdfQ==