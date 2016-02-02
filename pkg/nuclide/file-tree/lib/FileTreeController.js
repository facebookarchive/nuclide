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

var _analytics = require('../../analytics');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var PropTypes = _reactForAtom.React.PropTypes;

var FileTreeController = (function () {
  _createClass(FileTreeController, null, [{
    key: 'INITIAL_WIDTH',
    value: 240,
    enumerable: true
  }]);

  function FileTreeController(state) {
    var _this = this;

    _classCallCheck(this, FileTreeController);

    var _extends2 = _extends({
      panel: { width: FileTreeController.INITIAL_WIDTH }
    }, state);

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
      this._fileTreePanel = _reactForAtom.ReactDOM.render(_reactForAtom.React.createElement(FileTreePanel, {
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
      _reactForAtom.ReactDOM.unmountComponentAtNode(this._panelElement);
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
      return _reactForAtom.React.createElement(
        _uiPanel.PanelComponent,
        {
          dock: 'left',
          initialLength: this.props.initialWidth,
          ref: 'panel' },
        _reactForAtom.React.createElement(_componentsFileTree2['default'], { store: this.props.store })
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
})(_reactForAtom.React.Component);

module.exports = FileTreeController;

/**
 * True if a reveal was requested while the file tree is hidden. If so, we should apply it when
 * the tree is shown.
 */
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBYWtDLE1BQU07O2lDQUNGLHFCQUFxQjs7aUNBQzdCLHFCQUFxQjs7OztrQ0FDOUIsd0JBQXdCOzs7OytCQUNqQixtQkFBbUI7Ozs7bUNBQ2YsdUJBQXVCOzs7OytCQUMzQixtQkFBbUI7Ozs7NkJBQ3JCLGlCQUFpQjs7Ozt5QkFDckIsV0FBVzs7Ozt1QkFDSixnQkFBZ0I7OzRCQUl0QyxnQkFBZ0I7O3lCQUNILGlCQUFpQjs7a0JBRXRCLElBQUk7Ozs7cUJBQ0QsT0FBTzs7OztzQkFFSCxRQUFROzs7O0lBRXZCLFNBQVMsdUJBQVQsU0FBUzs7SUFlVixrQkFBa0I7ZUFBbEIsa0JBQWtCOztXQWlCQyxHQUFHOzs7O0FBRWYsV0FuQlAsa0JBQWtCLENBbUJWLEtBQStCLEVBQUU7OzswQkFuQnpDLGtCQUFrQjs7O0FBcUJsQixXQUFLLEVBQUUsRUFBQyxLQUFLLEVBQUUsa0JBQWtCLENBQUMsYUFBYSxFQUFDO09BQzdDLEtBQUs7O1FBRkgsS0FBSyxhQUFMLEtBQUs7OztBQU1aLFFBQUksQ0FBQyxVQUFVLEdBQUcsS0FBSyxDQUFDLFNBQVMsSUFBSSxJQUFJLEdBQUcsS0FBSyxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7QUFDbkUsUUFBSSxDQUFDLFFBQVEsR0FBRyw2QkFBZ0IsV0FBVyxFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLE1BQU0sR0FBRywyQkFBYyxXQUFXLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksdUJBQVUsR0FBRyxFQUFFLENBQUM7QUFDekMsUUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksdUJBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEQsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQzs7QUFFaEQsUUFBSSxDQUFDLHNCQUFzQixFQUFFLENBQUM7O0FBRTlCLFFBQUks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c291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0V4cG9ydFN0b3JlRGF0YX0gZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RVZFTlRfSEFORExFUl9TRUxFQ1RPUn0gIGZyb20gJy4vRmlsZVRyZWVDb25zdGFudHMnO1xuaW1wb3J0IEZpbGVTeXN0ZW1BY3Rpb25zIGZyb20gJy4vRmlsZVN5c3RlbUFjdGlvbnMnO1xuaW1wb3J0IEZpbGVUcmVlIGZyb20gJy4uL2NvbXBvbmVudHMvRmlsZVRyZWUnO1xuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuL0ZpbGVUcmVlQWN0aW9ucyc7XG5pbXBvcnQgRmlsZVRyZWVDb250ZXh0TWVudSBmcm9tICcuL0ZpbGVUcmVlQ29udGV4dE1lbnUnO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQgRmlsZVRyZWVTdG9yZSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuaW1wb3J0IEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuaW1wb3J0IHtQYW5lbENvbXBvbmVudH0gZnJvbSAnLi4vLi4vdWkvcGFuZWwnO1xuaW1wb3J0IHtcbiAgUmVhY3QsXG4gIFJlYWN0RE9NLFxufSBmcm9tICdyZWFjdC1mb3ItYXRvbSc7XG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9hbmFseXRpY3MnO1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5jb25zdCB7UHJvcFR5cGVzfSA9IFJlYWN0O1xuXG50eXBlIEZpbGVUcmVlTm9kZURhdGEgPSB7XG4gIG5vZGVLZXk6IHN0cmluZyxcbiAgcm9vdEtleTogc3RyaW5nLFxufTtcblxuZXhwb3J0IHR5cGUgRmlsZVRyZWVDb250cm9sbGVyU3RhdGUgPSB7XG4gIHBhbmVsOiB7XG4gICAgaXNWaXNpYmxlOiA/Ym9vbGVhbjtcbiAgICB3aWR0aDogbnVtYmVyO1xuICB9O1xuICB0cmVlOiBFeHBvcnRTdG9yZURhdGE7XG59O1xuXG5jbGFzcyBGaWxlVHJlZUNvbnRyb2xsZXIge1xuICBfYWN0aW9uczogRmlsZVRyZWVBY3Rpb25zO1xuICBfY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnU7XG4gIF9pc1Zpc2libGU6IGJvb2xlYW47XG4gIF9wYW5lbDogYXRvbSRQYW5lbDtcbiAgX2ZpbGVUcmVlUGFuZWw6IEZpbGVUcmVlUGFuZWw7XG4gIF9wYW5lbEVsZW1lbnQ6IEhUTUxFbGVtZW50O1xuICBfcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT47XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgSURpc3Bvc2FibGU+O1xuICAvKipcbiAgICogVHJ1ZSBpZiBhIHJldmVhbCB3YXMgcmVxdWVzdGVkIHdoaWxlIHRoZSBmaWxlIHRyZWUgaXMgaGlkZGVuLiBJZiBzbywgd2Ugc2hvdWxkIGFwcGx5IGl0IHdoZW5cbiAgICogdGhlIHRyZWUgaXMgc2hvd24uXG4gICAqL1xuICBfcmV2ZWFsQWN0aXZlRmlsZVBlbmRpbmc6IGJvb2xlYW47XG5cbiAgc3RhdGljIElOSVRJQUxfV0lEVEggPSAyNDA7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9GaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSkge1xuICAgIGNvbnN0IHtwYW5lbH0gPSB7XG4gICAgICBwYW5lbDoge3dpZHRoOiBGaWxlVHJlZUNvbnRyb2xsZXIuSU5JVElBTF9XSURUSH0sXG4gICAgICAuLi5zdGF0ZSxcbiAgICB9O1xuXG4gICAgLy8gc2hvdyB0aGUgZmlsZSB0cmVlIGJ5IGRlZmF1bHRcbiAgICB0aGlzLl9pc1Zpc2libGUgPSBwYW5lbC5pc1Zpc2libGUgIT0gbnVsbCA/IHBhbmVsLmlzVmlzaWJsZSA6IHRydWU7XG4gICAgdGhpcy5fYWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKCk7XG4gICAgLy8gSW5pdGlhbCByb290IGRpcmVjdG9yaWVzXG4gICAgdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCk7XG4gICAgLy8gU3Vic2VxdWVudCByb290IGRpcmVjdG9yaWVzIHVwZGF0ZWQgb24gY2hhbmdlXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB0aGlzLl91cGRhdGVSb290RGlyZWN0b3JpZXMoKSlcbiAgICApO1xuICAgIHRoaXMuX2luaXRpYWxpemVQYW5lbCgpO1xuICAgIC8vIEluaXRpYWwgcmVuZGVyXG4gICAgdGhpcy5fcmVuZGVyKHBhbmVsLndpZHRoKTtcbiAgICAvLyBTdWJzZXF1ZW50IHJlbmRlcnMgaGFwcGVuIG9uIGNoYW5nZXMgdG8gZGF0YSBzdG9yZVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgdGhpcy5fc3RvcmUuc3Vic2NyaWJlKCgpID0+IHRoaXMuX3JlbmRlcigpKVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgIC8vIFBhc3MgdW5kZWZpbmVkIHNvIHRoZSBkZWZhdWx0IHBhcmFtZXRlciBnZXRzIHVzZWQuXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtYWN0aXZlLWZpbGUnOiB0aGlzLnJldmVhbEFjdGl2ZUZpbGUuYmluZCh0aGlzLCB1bmRlZmluZWQpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6dG9nZ2xlJzogdGhpcy50b2dnbGVWaXNpYmlsaXR5LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTp0b2dnbGUtZm9jdXMnOiB0aGlzLnRvZ2dsZVRyZWVGb2N1cy5iaW5kKHRoaXMpLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoRVZFTlRfSEFORExFUl9TRUxFQ1RPUiwge1xuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiB0aGlzLl9tb3ZlRG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXVwJzogdGhpcy5fbW92ZVVwLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogdGhpcy5fbW92ZVRvVG9wLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogdGhpcy5fbW92ZVRvQm90dG9tLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuQWRkRmlsZURpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRmlsZVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZm9sZGVyJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5BZGRGb2xkZXJEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbERpcmVjdG9yeVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1jb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIHRydWUpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWNvbGxhcHNlLWFsbCc6IHRoaXMuX2NvbGxhcHNlQWxsLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb3B5LWZ1bGwtcGF0aCc6IHRoaXMuX2NvcHlGdWxsUGF0aC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6ZXhwYW5kLWRpcmVjdG9yeSc6IHRoaXMuX2V4cGFuZFNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1leHBhbmQtZGlyZWN0b3J5JzogdGhpcy5fZXhwYW5kU2VsZWN0aW9uLmJpbmQodGhpcywgdHJ1ZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5JzogdGhpcy5fb3BlblNlbGVjdGVkRW50cnkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktdXAnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1kb3duJzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1sZWZ0JzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0TGVmdC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUnOiB0aGlzLl9kZWxldGVTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZS1wcm9qZWN0LWZvbGRlci1zZWxlY3Rpb24nOlxuICAgICAgICAgIHRoaXMuX3JlbW92ZVJvb3RGb2xkZXJTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbmFtZS1zZWxlY3Rpb24nOiAoKSA9PiBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuUmVuYW1lRGlhbG9nKCksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpkdXBsaWNhdGUtc2VsZWN0aW9uJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5EdXBsaWNhdGVEaWFsb2codGhpcy5yZXZlYWxOb2RlS2V5LmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6c2VhcmNoLWluLWRpcmVjdG9yeSc6IHRoaXMuX3NlYXJjaEluRGlyZWN0b3J5LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcic6IHRoaXMuX3Nob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcyksXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnW2lzPVwidGFicy10YWJcIl0nLCB7XG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtdGFiLWZpbGUnOiB0aGlzLl9yZXZlYWxUYWJGaWxlT25DbGljay5iaW5kKHRoaXMpLFxuICAgICAgfSlcbiAgICApO1xuICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS50cmVlKSB7XG4gICAgICB0aGlzLl9zdG9yZS5sb2FkRGF0YShzdGF0ZS50cmVlKTtcbiAgICB9XG4gICAgdGhpcy5fY29udGV4dE1lbnUgPSBuZXcgRmlsZVRyZWVDb250ZXh0TWVudSgpO1xuXG4gICAgdGhpcy5fcmV2ZWFsQWN0aXZlRmlsZVBlbmRpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIF9pbml0aWFsaXplUGFuZWwoKTogdm9pZCB7XG4gICAgdGhpcy5fcGFuZWxFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgdGhpcy5fcGFuZWxFbGVtZW50LnN0eWxlLmhlaWdodCA9ICcxMDAlJztcbiAgICB0aGlzLl9wYW5lbCA9IGF0b20ud29ya3NwYWNlLmFkZExlZnRQYW5lbCh7XG4gICAgICBpdGVtOiB0aGlzLl9wYW5lbEVsZW1lbnQsXG4gICAgICB2aXNpYmxlOiB0aGlzLl9pc1Zpc2libGUsXG4gICAgfSk7XG4gIH1cblxuICBfcmVuZGVyKGluaXRpYWxXaWR0aD86ID9udW1iZXIpOiB2b2lkIHtcbiAgICB0aGlzLl9maWxlVHJlZVBhbmVsID0gUmVhY3RET00ucmVuZGVyKFxuICAgICAgPEZpbGVUcmVlUGFuZWxcbiAgICAgICAgaW5pdGlhbFdpZHRoPXtpbml0aWFsV2lkdGh9XG4gICAgICAgIHN0b3JlPXt0aGlzLl9zdG9yZX1cbiAgICAgIC8+LFxuICAgICAgdGhpcy5fcGFuZWxFbGVtZW50LFxuICAgICk7XG4gIH1cblxuICBfb3BlbkFuZFJldmVhbEZpbGVQYXRoKGZpbGVQYXRoOiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGZpbGVQYXRoICE9IG51bGwpIHtcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpO1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KGZpbGVQYXRoKTtcbiAgICB9XG4gIH1cblxuICBfb3BlbkFuZFJldmVhbERpcmVjdG9yeVBhdGgocGF0aDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChwYXRoICE9IG51bGwpIHtcbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KHBhdGgpKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlUm9vdERpcmVjdG9yaWVzKCk6IHZvaWQge1xuICAgIC8vIElmIHRoZSByZW1vdGUtcHJvamVjdHMgcGFja2FnZSBoYXNuJ3QgbG9hZGVkIHlldCByZW1vdGUgZGlyZWN0b3JpZXMgd2lsbCBiZSBpbnN0YW50aWF0ZWQgYXNcbiAgICAvLyBsb2NhbCBkaXJlY3RvcmllcyBidXQgd2l0aCBpbnZhbGlkIHBhdGhzLiBXZSBuZWVkIHRvIGV4Y2x1ZGUgdGhvc2UuXG4gICAgY29uc3Qgcm9vdERpcmVjdG9yaWVzID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuZmlsdGVyKGRpcmVjdG9yeSA9PiAoXG4gICAgICBGaWxlVHJlZUhlbHBlcnMuaXNWYWxpZERpcmVjdG9yeShkaXJlY3RvcnkpXG4gICAgKSk7XG4gICAgY29uc3Qgcm9vdEtleXMgPSByb290RGlyZWN0b3JpZXMubWFwKFxuICAgICAgZGlyZWN0b3J5ID0+IEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkoZGlyZWN0b3J5LmdldFBhdGgoKSlcbiAgICApO1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0Um9vdEtleXMocm9vdEtleXMpO1xuICAgIHRoaXMuX2FjdGlvbnMudXBkYXRlUmVwb3NpdG9yaWVzKHJvb3REaXJlY3Rvcmllcyk7XG4gIH1cblxuICBfc2V0VmlzaWJpbGl0eShzaG91bGRCZVZpc2libGU6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBpZiAoc2hvdWxkQmVWaXNpYmxlKSB7XG4gICAgICB0aGlzLl9wYW5lbC5zaG93KCk7XG4gICAgICB0aGlzLmZvY3VzVHJlZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodGhpcy5fdHJlZUhhc0ZvY3VzKCkpIHtcbiAgICAgICAgLy8gSWYgdGhlIGZpbGUgdHJlZSBoYXMgZm9jdXMsIGJsdXIgaXQgYmVjYXVzZSBpdCB3aWxsIGJlIGhpZGRlbiB3aGVuIHRoZSBwYW5lbCBpcyBoaWRkZW4uXG4gICAgICAgIHRoaXMuYmx1clRyZWUoKTtcbiAgICAgIH1cbiAgICAgIHRoaXMuX3BhbmVsLmhpZGUoKTtcbiAgICB9XG4gICAgdGhpcy5faXNWaXNpYmxlID0gc2hvdWxkQmVWaXNpYmxlO1xuICB9XG5cbiAgLyoqXG4gICAqIFwiQmx1cnNcIiB0aGUgdHJlZSwgd2hpY2ggaXMgZG9uZSBieSBhY3RpdmF0aW5nIHRoZSBhY3RpdmUgcGFuZSBpblxuICAgKiBbQXRvbSdzIHRyZWUtdmlld117QGxpbmsgaHR0cHM6Ly9naXRodWIuY29tL2F0b20vdHJlZS12aWV3L2Jsb2IvdjAuMTg4LjAvbGliL3RyZWUtdmlldy5jb2ZmZWUjTDE4N30uXG4gICAqL1xuICBibHVyVHJlZSgpOiB2b2lkIHtcbiAgICBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVQYW5lKCkuYWN0aXZhdGUoKTtcbiAgfVxuXG4gIGZvY3VzVHJlZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9maWxlVHJlZVBhbmVsLmdldEZpbGVUcmVlKCkuZm9jdXMoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGB0cnVlYCBpZiB0aGUgZmlsZSB0cmVlIERPTSBub2RlIGhhcyBmb2N1cywgb3RoZXJ3aXNlIGBmYWxzZWAuXG4gICAqL1xuICBfdHJlZUhhc0ZvY3VzKCk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IGZpbGVUcmVlID0gdGhpcy5fZmlsZVRyZWVQYW5lbC5nZXRGaWxlVHJlZSgpO1xuICAgIHJldHVybiBmaWxlVHJlZS5oYXNGb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIEZvY3VzZXMgdGhlIHRyZWUgaWYgaXQgZG9lcyBub3QgaGF2ZSBmb2N1cywgYmx1cnMgdGhlIHRyZWUgaWYgaXQgZG9lcyBoYXZlIGZvY3VzLlxuICAgKi9cbiAgdG9nZ2xlVHJlZUZvY3VzKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl90cmVlSGFzRm9jdXMoKSkge1xuICAgICAgdGhpcy5ibHVyVHJlZSgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aGlzLmZvY3VzVHJlZSgpO1xuICAgIH1cbiAgfVxuXG4gIHRvZ2dsZVZpc2liaWxpdHkoKTogdm9pZCB7XG4gICAgY29uc3Qgd2lsbEJlVmlzaWJsZSA9ICF0aGlzLl9pc1Zpc2libGU7XG4gICAgdGhpcy5fc2V0VmlzaWJpbGl0eSh3aWxsQmVWaXNpYmxlKTtcbiAgICBpZiAod2lsbEJlVmlzaWJsZSAmJiB0aGlzLl9yZXZlYWxBY3RpdmVGaWxlUGVuZGluZykge1xuICAgICAgdGhpcy5yZXZlYWxBY3RpdmVGaWxlKCk7XG4gICAgICB0aGlzLl9yZXZlYWxBY3RpdmVGaWxlUGVuZGluZyA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXZlYWwgdGhlIGZpbGUgdGhhdCBjdXJyZW50bHkgaGFzIGZvY3VzIGluIHRoZSBmaWxlIHRyZWUuIElmIHNob3dJZkhpZGRlbiBpcyBmYWxzZSxcbiAgICogdGhpcyB3aWxsIGVucXVldWUgYSBwZW5kaW5nIHJldmVhbCB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBmaWxlIHRyZWUgaXMgc2hvd24gYWdhaW4uXG4gICAqL1xuICByZXZlYWxBY3RpdmVGaWxlKHNob3dJZkhpZGRlbj86IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IGZpbGUgPSBlZGl0b3IgPyBlZGl0b3IuZ2V0QnVmZmVyKCkuZmlsZSA6IG51bGw7XG4gICAgY29uc3QgZmlsZVBhdGggPSBmaWxlID8gZmlsZS5nZXRQYXRoKCkgOiBudWxsO1xuXG4gICAgaWYgKHNob3dJZkhpZGRlbikge1xuICAgICAgLy8gRW5zdXJlIHRoZSBmaWxlIHRyZWUgaXMgdmlzaWJsZSBiZWZvcmUgdHJ5aW5nIHRvIHJldmVhbCBhIGZpbGUgaW4gaXQuIEV2ZW4gaWYgdGhlIGN1cnJlbnRseVxuICAgICAgLy8gYWN0aXZlIHBhbmUgaXMgbm90IGFuIG9yZGluYXJ5IGVkaXRvciwgd2Ugc3RpbGwgYXQgbGVhc3Qgd2FudCB0byBzaG93IHRoZSB0cmVlLlxuICAgICAgdGhpcy5fc2V0VmlzaWJpbGl0eSh0cnVlKTtcbiAgICB9XG5cbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgd2UgYXJlIG5vdCBzaG93aW5nIHRoZSB0cmVlIGFzIHBhcnQgb2YgdGhpcyBhY3Rpb24sIGFuZCBpdCBpcyBjdXJyZW50bHkgaGlkZGVuLCB0aGlzXG4gICAgLy8gcmV2ZWFsIHdpbGwgdGFrZSBlZmZlY3Qgd2hlbiB0aGUgdHJlZSBpcyBzaG93bi5cbiAgICBpZiAoIXNob3dJZkhpZGRlbiAmJiAhdGhpcy5faXNWaXNpYmxlKSB7XG4gICAgICB0aGlzLl9yZXZlYWxBY3RpdmVGaWxlUGVuZGluZyA9IHRydWU7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5yZXZlYWxOb2RlS2V5KGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXZlYWwgdGhlIGZpbGUgb2YgYSBnaXZlbiB0YWIgYmFzZWQgb24gdGhlIHBhdGggc3RvcmVkIG9uIHRoZSBET00uXG4gICAqIFRoaXMgbWV0aG9kIGlzIG1lYW50IHRvIGJlIHRyaWdnZXJlZCBieSB0aGUgY29udGV4dC1tZW51IGNsaWNrLlxuICAgKi9cbiAgX3JldmVhbFRhYkZpbGVPbkNsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHRhYiA9ICgoZXZlbnQuY3VycmVudFRhcmdldDogYW55KTogRWxlbWVudCk7XG4gICAgY29uc3QgdGl0bGUgPSB0YWIucXVlcnlTZWxlY3RvcignLnRpdGxlW2RhdGEtcGF0aF0nKTtcbiAgICBpZiAoIXRpdGxlKSB7XG4gICAgICAvLyBjYW4gb25seSByZXZlYWwgaXQgaWYgd2UgZmluZCB0aGUgZmlsZSBwYXRoXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZVBhdGggPSB0aXRsZS5kYXRhc2V0LnBhdGg7XG4gICAgdGhpcy5fc2V0VmlzaWJpbGl0eSh0cnVlKTtcbiAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICB9XG5cbiAgcmV2ZWFsTm9kZUtleShub2RlS2V5OiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCFub2RlS2V5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb3RLZXk6ID9zdHJpbmcgPSB0aGlzLl9zdG9yZS5nZXRSb290Rm9yS2V5KG5vZGVLZXkpO1xuICAgIGlmICghcm9vdEtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzdGFjayA9IFtdO1xuICAgIGxldCBrZXkgPSBub2RlS2V5O1xuICAgIHdoaWxlIChrZXkgIT0gbnVsbCAmJiBrZXkgIT09IHJvb3RLZXkpIHtcbiAgICAgIHN0YWNrLnB1c2goa2V5KTtcbiAgICAgIGtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkoa2V5KTtcbiAgICB9XG4gICAgLy8gV2Ugd2FudCB0aGUgc3RhY2sgdG8gYmUgW3BhcmVudEtleSwgLi4uLCBub2RlS2V5XS5cbiAgICBzdGFjay5yZXZlcnNlKCk7XG4gICAgc3RhY2suZm9yRWFjaCgoY2hpbGRLZXksIGkpID0+IHtcbiAgICAgIGNvbnN0IHBhcmVudEtleSA9IChpID09PSAwKSA/IHJvb3RLZXkgOiBzdGFja1tpIC0gMV07XG4gICAgICB0aGlzLl9hY3Rpb25zLmVuc3VyZUNoaWxkTm9kZShyb290S2V5LCBwYXJlbnRLZXksIGNoaWxkS2V5KTtcbiAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZShyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgfVxuXG4gIHNldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzKTtcbiAgfVxuXG4gIHNldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzKTtcbiAgfVxuXG4gIHNldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb2xsYXBzZXMgYWxsIHNlbGVjdGVkIGRpcmVjdG9yeSBub2Rlcy4gSWYgdGhlIHNlbGVjdGlvbiBpcyBhIHNpbmdsZSBmaWxlIG9yIGEgc2luZ2xlIGNvbGxhcHNlZFxuICAgKiBkaXJlY3RvcnksIHRoZSBzZWxlY3Rpb24gaXMgc2V0IHRvIHRoZSBkaXJlY3RvcnkncyBwYXJlbnQuXG4gICAqL1xuICBfY29sbGFwc2VTZWxlY3Rpb24oZGVlcDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBjb25zdCBmaXJzdFNlbGVjdGVkTm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplID09PSAxXG4gICAgICAmJiAhZmlyc3RTZWxlY3RlZE5vZGUuaXNSb290XG4gICAgICAmJiAhKGZpcnN0U2VsZWN0ZWROb2RlLmlzQ29udGFpbmVyICYmIGZpcnN0U2VsZWN0ZWROb2RlLmlzRXhwYW5kZWQoKSkpIHtcbiAgICAgIC8qXG4gICAgICAgKiBTZWxlY3QgdGhlIHBhcmVudCBvZiB0aGUgc2VsZWN0aW9uIGlmIHRoZSBmb2xsb3dpbmcgY3JpdGVyaWEgYXJlIG1ldDpcbiAgICAgICAqICAgKiBPbmx5IDEgbm9kZSBpcyBzZWxlY3RlZFxuICAgICAgICogICAqIFRoZSBub2RlIGlzIG5vdCBhIHJvb3RcbiAgICAgICAqICAgKiBUaGUgbm9kZSBpcyBub3QgYW4gZXhwYW5kZWQgZGlyZWN0b3J5XG4gICAgICAgKi9cbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGZpcnN0U2VsZWN0ZWROb2RlLm5vZGVLZXkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAvLyBPbmx5IGRpcmVjdG9yaWVzIGNhbiBiZSBleHBhbmRlZC4gU2tpcCBub24tZGlyZWN0b3J5IG5vZGVzLlxuICAgICAgICBpZiAoIW5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVlcCkge1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlRGVlcChub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGUobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfY29sbGFwc2VBbGwoKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdEtleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIHJvb3RLZXlzLmZvckVhY2gocm9vdEtleSA9PiB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZURlZXAocm9vdEtleSwgcm9vdEtleSkpO1xuICB9XG5cbiAgX2RlbGV0ZVNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlcyA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAobm9kZXMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJvb3RQYXRocyA9IG5vZGVzLmZpbHRlcihub2RlID0+IG5vZGUuaXNSb290KTtcbiAgICBpZiAocm9vdFBhdGhzLnNpemUgPT09IDApIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkUGF0aHMgPSBub2Rlcy5tYXAobm9kZSA9PiBub2RlLm5vZGVQYXRoKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGUgZm9sbG93aW5nICcgK1xuICAgICAgICAgIChub2Rlcy5zaXplID4gMSA/ICdpdGVtcz8nIDogJ2l0ZW0/Jyk7XG4gICAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgJ0RlbGV0ZSc6ICgpID0+IHsgdGhpcy5fYWN0aW9ucy5kZWxldGVTZWxlY3RlZE5vZGVzKCk7IH0sXG4gICAgICAgICAgJ0NhbmNlbCc6ICgpID0+IHt9LFxuICAgICAgICB9LFxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IGBZb3UgYXJlIGRlbGV0aW5nOiR7b3MuRU9MfSR7c2VsZWN0ZWRQYXRocy5qb2luKG9zLkVPTCl9YCxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbWVzc2FnZTtcbiAgICAgIGlmIChyb290UGF0aHMuc2l6ZSA9PT0gMSkge1xuICAgICAgICBtZXNzYWdlID0gYFRoZSByb290IGRpcmVjdG9yeSAnJHtyb290UGF0aHMuZmlyc3QoKS5ub2RlTmFtZX0nIGNhbid0IGJlIHJlbW92ZWQuYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJvb3RQYXRoTmFtZXMgPSByb290UGF0aHMubWFwKG5vZGUgPT4gYCcke25vZGUubm9kZU5hbWV9J2ApLmpvaW4oJywgJyk7XG4gICAgICAgIG1lc3NhZ2UgPSBgVGhlIHJvb3QgZGlyZWN0b3JpZXMgJHtyb290UGF0aE5hbWVzfSBjYW4ndCBiZSByZW1vdmVkLmA7XG4gICAgICB9XG5cbiAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgIGJ1dHRvbnM6IFsnT0snXSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIGFsbCBzZWxlY3RlZCBkaXJlY3Rvcnkgbm9kZXMuXG4gICAqL1xuICBfZXhwYW5kU2VsZWN0aW9uKGRlZXA6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIC8vIE9ubHkgZGlyZWN0b3JpZXMgY2FuIGJlIGV4cGFuZGVkLiBTa2lwIG5vbi1kaXJlY3Rvcnkgbm9kZXMuXG4gICAgICBpZiAoIW5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVlcCkge1xuICAgICAgICB0aGlzLl9hY3Rpb25zLmV4cGFuZE5vZGVEZWVwKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZShub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfbW92ZURvd24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RTZWxlY3RlZEtleSA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkS2V5cygpLmxhc3QoKTtcbiAgICBpZiAobGFzdFNlbGVjdGVkS2V5ID09IG51bGwpIHtcbiAgICAgIC8vIFRoZXJlIGlzIG5vIHNlbGVjdGlvbiB5ZXQsIHNvIG1vdmUgdG8gdGhlIHRvcCBvZiB0aGUgdHJlZS5cbiAgICAgIHRoaXMuX21vdmVUb1RvcCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwYXJlbnRLZXk7XG4gICAgbGV0IHJvb3RLZXk7XG4gICAgbGV0IHNpYmxpbmdLZXlzO1xuICAgIGNvbnN0IGlzUm9vdCA9IHRoaXMuX3N0b3JlLmlzUm9vdEtleShsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgIHJvb3RLZXkgPSBsYXN0U2VsZWN0ZWRLZXk7XG4gICAgICAvLyBPdGhlciByb290cyBhcmUgdGhpcyByb290J3Mgc2libGluZ3NcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50S2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShsYXN0U2VsZWN0ZWRLZXkpO1xuICAgICAgcm9vdEtleSA9IHRoaXMuX3N0b3JlLmdldFJvb3RGb3JLZXkobGFzdFNlbGVjdGVkS2V5KTtcblxuICAgICAgaW52YXJpYW50KHJvb3RLZXkgJiYgcGFyZW50S2V5KTtcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHJvb3QgZG9lcyBub3QgZXhpc3Qgb3IgaWYgdGhpcyBpcyBleHBlY3RlZCB0byBoYXZlIGEgcGFyZW50IGJ1dCBkb2Vzbid0IChyb290cyBkb1xuICAgIC8vIG5vdCBoYXZlIHBhcmVudHMpLCBub3RoaW5nIGNhbiBiZSBkb25lLiBFeGl0LlxuICAgIGlmIChyb290S2V5ID09IG51bGwgfHwgKCFpc1Jvb3QgJiYgcGFyZW50S2V5ID09IG51bGwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgbGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoXG4gICAgICBGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobGFzdFNlbGVjdGVkS2V5KSAmJlxuICAgICAgdGhpcy5fc3RvcmUuaXNFeHBhbmRlZChyb290S2V5LCBsYXN0U2VsZWN0ZWRLZXkpICYmXG4gICAgICBjaGlsZHJlbi5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgICAvLyBEaXJlY3RvcnkgaXMgZXhwYW5kZWQgYW5kIGl0IGhhcyBjaGlsZHJlbi4gU2VsZWN0IGZpcnN0IGNoaWxkLiBFeGl0LlxuICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIGNoaWxkcmVuWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5kZXggPSBzaWJsaW5nS2V5cy5pbmRleE9mKGxhc3RTZWxlY3RlZEtleSk7XG4gICAgICBjb25zdCBtYXhJbmRleCA9IHNpYmxpbmdLZXlzLmxlbmd0aCAtIDE7XG5cbiAgICAgIGlmIChpbmRleCA8IG1heEluZGV4KSB7XG4gICAgICAgIGNvbnN0IG5leHRTaWJsaW5nS2V5ID0gc2libGluZ0tleXNbaW5kZXggKyAxXTtcblxuICAgICAgICBpZiAoaXNSb290KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIG5leHQgc2VsZWN0ZWQgaXRlbSBpcyBhbm90aGVyIHJvb3QsIHNldCBgcm9vdEtleWAgdG8gaXQgc28gdHJhY2tBbmRTZWxlY3QgZmluZHNcbiAgICAgICAgICAvLyB0aGF0IFtyb290S2V5LCByb290S2V5XSB0dXBsZS5cbiAgICAgICAgICByb290S2V5ID0gbmV4dFNpYmxpbmdLZXk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGhhcyBhIG5leHQgc2libGluZy5cbiAgICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIHNpYmxpbmdLZXlzW2luZGV4ICsgMV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbmVhcmVzdEFuY2VzdG9yU2libGluZyA9IHRoaXMuX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKHJvb3RLZXksIGxhc3RTZWxlY3RlZEtleSk7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyB0aGUgYm90dG9tbW9zdCBub2RlIG9mIHRoZSB0cmVlLCB0aGVyZSB3b24ndCBiZSBhbnl0aGluZyB0byBzZWxlY3QuXG4gICAgICAgIC8vIFZvaWQgcmV0dXJuIHNpZ25pZmllcyBubyBuZXh0IG5vZGUgd2FzIGZvdW5kLlxuICAgICAgICBpZiAobmVhcmVzdEFuY2VzdG9yU2libGluZyAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKG5lYXJlc3RBbmNlc3RvclNpYmxpbmcucm9vdEtleSwgbmVhcmVzdEFuY2VzdG9yU2libGluZy5ub2RlS2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9tb3ZlVXAoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RTZWxlY3RlZEtleSA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkS2V5cygpLmxhc3QoKTtcbiAgICBpZiAobGFzdFNlbGVjdGVkS2V5ID09IG51bGwpIHtcbiAgICAgIC8vIFRoZXJlIGlzIG5vIHNlbGVjdGlvbi4gTW92ZSB0byB0aGUgYm90dG9tIG9mIHRoZSB0cmVlLlxuICAgICAgdGhpcy5fbW92ZVRvQm90dG9tKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBhcmVudEtleTtcbiAgICBsZXQgcm9vdEtleTtcbiAgICBsZXQgc2libGluZ0tleXM7XG4gICAgY29uc3QgaXNSb290ID0gdGhpcy5fc3RvcmUuaXNSb290S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgcm9vdEtleSA9IGxhc3RTZWxlY3RlZEtleTtcbiAgICAgIC8vIE90aGVyIHJvb3RzIGFyZSB0aGlzIHJvb3QncyBzaWJsaW5nc1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgICByb290S2V5ID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEZvcktleShsYXN0U2VsZWN0ZWRLZXkpO1xuXG4gICAgICBpbnZhcmlhbnQocm9vdEtleSAmJiBwYXJlbnRLZXkpO1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcm9vdCBkb2VzIG5vdCBleGlzdCBvciBpZiB0aGlzIGlzIGV4cGVjdGVkIHRvIGhhdmUgYSBwYXJlbnQgYnV0IGRvZXNuJ3QgKHJvb3RzIGRvXG4gICAgLy8gbm90IGhhdmUgcGFyZW50cyksIG5vdGhpbmcgY2FuIGJlIGRvbmUuIEV4aXQuXG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCB8fCAoIWlzUm9vdCAmJiBwYXJlbnRLZXkgPT0gbnVsbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdLZXlzLmluZGV4T2YobGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgIGlmICghaXNSb290ICYmIHBhcmVudEtleSAhPSBudWxsKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGZpcnN0IGNoaWxkLiBJdCBoYXMgYSBwYXJlbnQuIFNlbGVjdCB0aGUgcGFyZW50LlxuICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgaXMgdGhlIHJvb3QgYW5kL29yIHRoZSB0b3Agb2YgdGhlIHRyZWUgKGhhcyBubyBwYXJlbnQpLiBOb3RoaW5nIGVsc2UgdG8gdHJhdmVyc2UuXG4gICAgICAvLyBFeGl0LlxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcmV2aW91c1NpYmxpbmdLZXkgPSBzaWJsaW5nS2V5c1tpbmRleCAtIDFdO1xuXG4gICAgICBpZiAoaXNSb290KSB7XG4gICAgICAgIC8vIElmIHRyYXZlcnNpbmcgdXAgdG8gYSBkaWZmZXJlbnQgcm9vdCwgdGhlIHJvb3RLZXkgbXVzdCBiZWNvbWUgdGhhdCBuZXcgcm9vdCB0byBjaGVja1xuICAgICAgICAvLyBleHBhbmRlZCBrZXlzIGluIGl0LlxuICAgICAgICByb290S2V5ID0gcHJldmlvdXNTaWJsaW5nS2V5O1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUoXG4gICAgICAgIHJvb3RLZXksXG4gICAgICAgIHRoaXMuX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KHJvb3RLZXksIHByZXZpb3VzU2libGluZ0tleSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgX21vdmVUb1RvcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdEtleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5c1swXSwgcm9vdEtleXNbMF0pO1xuICB9XG5cbiAgX21vdmVUb0JvdHRvbSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2VsZWN0IHRoZSBsb3dlcm1vc3QgZGVzY2VuZGFudCBvZiB0aGUgbGFzdCByb290IG5vZGUuXG4gICAgY29uc3Qgcm9vdEtleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIGNvbnN0IGxhc3RSb290S2V5ID0gcm9vdEtleXNbcm9vdEtleXMubGVuZ3RoIC0gMV07XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKFxuICAgICAgbGFzdFJvb3RLZXksXG4gICAgICB0aGlzLl9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShsYXN0Um9vdEtleSwgbGFzdFJvb3RLZXkpXG4gICAgKTtcbiAgfVxuXG4gIC8qXG4gICAqIFJldHVybnMgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50IHdoZW4gY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlciB3aXRoIGV4cGFuZGFibGVcbiAgICogZGlyZWN0b3JpZXMuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiAgIEEgPlxuICAgKiAgICAgQiA+XG4gICAqICAgICBDID5cbiAgICogICAgICAgRS50eHRcbiAgICogICAgIEQuZm9vXG4gICAqXG4gICAqICAgPiBfZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkoQSlcbiAgICogICBELmZvb1xuICAgKlxuICAgKiBUaG91Z2ggQSBoYXMgbW9yZSBkZWVwbHktbmVzdGVkIGRlc2NlbmRhbnRzIHRoYW4gRC5mb28sIGxpa2UgRS50eHQsIEQuZm9vIGlzIGxvd2VybW9zdCB3aGVuXG4gICAqIGNvbnNpZGVyZWQgaW4gZmlsZSBzeXN0ZW0gb3JkZXIuXG4gICAqL1xuICBfZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KSAmJiB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHJvb3RLZXksIG5vZGVLZXkpKSkge1xuICAgICAgLy8gSWYgYG5vZGVLZXlgIGlzIG5vdCBhbiBleHBhbmRlZCBkaXJlY3RvcnkgdGhlcmUgYXJlIG5vIG1vcmUgZGVzY2VuZGFudHMgdG8gdHJhdmVyc2UuIFJldHVyblxuICAgICAgLy8gdGhlIGBub2RlS2V5YC5cbiAgICAgIHJldHVybiBub2RlS2V5O1xuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBub2RlS2V5KTtcbiAgICBpZiAoY2hpbGRLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gSWYgdGhlIGRpcmVjdG9yeSBoYXMgbm8gY2hpbGRyZW4sIHRoZSBkaXJlY3RvcnkgaXRzZWxmIGlzIHRoZSBsb3dlcm1vc3QgZGVzY2VuZGFudC5cbiAgICAgIHJldHVybiBub2RlS2V5O1xuICAgIH1cblxuICAgIC8vIFRoZXJlJ3MgYXQgbGVhc3Qgb25lIGNoaWxkLiBSZWN1cnNlIGRvd24gdGhlIGxhc3QgY2hpbGQuXG4gICAgcmV0dXJuIHRoaXMuX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KHJvb3RLZXksIGNoaWxkS2V5c1tjaGlsZEtleXMubGVuZ3RoIC0gMV0pO1xuICB9XG5cbiAgLypcbiAgICogUmV0dXJucyB0aGUgbmVhcmVzdCBcImFuY2VzdG9yIHNpYmxpbmdcIiB3aGVuIGNvbnNpZGVyZWQgaW4gZmlsZSBzeXN0ZW0gb3JkZXIgd2l0aCBleHBhbmRhYmxlXG4gICAqIGRpcmVjdG9yaWVzLiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogICBBID5cbiAgICogICAgIEIgPlxuICAgKiAgICAgICBDID5cbiAgICogICAgICAgICBFLnR4dFxuICAgKiAgIEQuZm9vXG4gICAqXG4gICAqICAgPiBfZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcoRS50eHQpXG4gICAqICAgRC5mb29cbiAgICovXG4gIF9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6ID9GaWxlVHJlZU5vZGVEYXRhIHtcbiAgICBsZXQgcGFyZW50S2V5O1xuICAgIGxldCBzaWJsaW5nS2V5cztcbiAgICBjb25zdCBpc1Jvb3QgPSByb290S2V5ID09PSBub2RlS2V5O1xuICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgIC8vIGByb290S2V5ID09PSBub2RlS2V5YCBtZWFucyB0aGlzIGhhcyByZWN1cnNlZCB0byBhIHJvb3QuIGBub2RlS2V5YCBpcyBhIHJvb3Qga2V5LlxuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KG5vZGVLZXkpO1xuXG4gICAgICBpbnZhcmlhbnQocm9vdEtleSAmJiBwYXJlbnRLZXkpO1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdLZXlzLmluZGV4T2Yobm9kZUtleSk7XG4gICAgaWYgKGluZGV4IDwgKHNpYmxpbmdLZXlzLmxlbmd0aCAtIDEpKSB7XG4gICAgICBjb25zdCBuZXh0U2libGluZyA9IHNpYmxpbmdLZXlzW2luZGV4ICsgMV07XG4gICAgICAvLyBJZiB0cmF2ZXJzaW5nIGFjcm9zcyByb290cywgdGhlIG5leHQgc2libGluZyBpcyBhbHNvIHRoZSBuZXh0IHJvb3QuIFJldHVybiBpdCBhcyB0aGUgbmV4dFxuICAgICAgLy8gcm9vdCBrZXkgYXMgd2VsbCBhcyB0aGUgbmV4dCBub2RlIGtleS5cbiAgICAgIHJldHVybiBpc1Jvb3RcbiAgICAgICAgPyB7bm9kZUtleTogbmV4dFNpYmxpbmcsIHJvb3RLZXk6IG5leHRTaWJsaW5nfVxuICAgICAgICA6IHtub2RlS2V5OiBuZXh0U2libGluZywgcm9vdEtleX07XG4gICAgfSBlbHNlIGlmIChwYXJlbnRLZXkgIT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgYSBwYXJlbnQgdG8gcmVjdXJzZS4gUmV0dXJuIGl0cyBuZWFyZXN0IGFuY2VzdG9yIHNpYmxpbmcuXG4gICAgICByZXR1cm4gdGhpcy5fZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgYHBhcmVudEtleWAgaXMgbnVsbCwgbm9kZUtleSBpcyBhIHJvb3QgYW5kIGhhcyBtb3JlIHBhcmVudHMgdG8gcmVjdXJzZS4gUmV0dXJuIGBudWxsYCB0b1xuICAgICAgLy8gc2lnbmlmeSBubyBhcHByb3ByaWF0ZSBrZXkgd2FzIGZvdW5kLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5KCk6IHZvaWQge1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIC8vIE9ubHkgcGVyZm9ybSB0aGUgZGVmYXVsdCBhY3Rpb24gaWYgYSBzaW5nbGUgbm9kZSBpcyBzZWxlY3RlZC5cbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGlvbnMuY29uZmlybU5vZGUoc2luZ2xlU2VsZWN0ZWROb2RlLnJvb3RLZXksIHNpbmdsZVNlbGVjdGVkTm9kZS5ub2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdChvcmllbnRhdGlvbjogYXRvbSRQYW5lU3BsaXRPcmllbnRhdGlvbiwgc2lkZTogYXRvbSRQYW5lU3BsaXRTaWRlKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgLy8gT25seSBwZXJmb3JtIHRoZSBkZWZhdWx0IGFjdGlvbiBpZiBhIHNpbmdsZSBub2RlIGlzIHNlbGVjdGVkLlxuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCAmJiAhc2luZ2xlU2VsZWN0ZWROb2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICAvLyBmb3I6IGlzIHRoaXMgZmVhdHVyZSB1c2VkIGVub3VnaCB0byBqdXN0aWZ5IHVuY29sbGFwc2luZz9cbiAgICAgIHRyYWNrKCdmaWxldHJlZS1zcGxpdC1maWxlJywge1xuICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgc2lkZSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fYWN0aW9ucy5vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KFxuICAgICAgICBzaW5nbGVTZWxlY3RlZE5vZGUubm9kZUtleSxcbiAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgIHNpZGUsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0VXAoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgndmVydGljYWwnLCAnYmVmb3JlJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdERvd24oKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgndmVydGljYWwnLCAnYWZ0ZXInKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0TGVmdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCdob3Jpem9udGFsJywgJ2JlZm9yZScpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRSaWdodCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCdob3Jpem9udGFsJywgJ2FmdGVyJyk7XG4gIH1cblxuICBfcmVtb3ZlUm9vdEZvbGRlclNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChyb290Tm9kZSAhPSBudWxsICYmIHJvb3ROb2RlLmlzUm9vdCkge1xuICAgICAgYXRvbS5wcm9qZWN0LnJlbW92ZVBhdGgocm9vdE5vZGUubm9kZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIF9zZWFyY2hJbkRpcmVjdG9yeShldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBEaXNwYXRjaCBhIGNvbW1hbmQgdG8gc2hvdyB0aGUgYFByb2plY3RGaW5kVmlld2AuIFRoaXMgb3BlbnMgdGhlIHZpZXcgYW5kIGZvY3VzZXMgdGhlIHNlYXJjaFxuICAgIC8vIGJveC5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgKChldmVudC50YXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KSxcbiAgICAgICdwcm9qZWN0LWZpbmQ6c2hvdy1pbi1jdXJyZW50LWRpcmVjdG9yeSdcbiAgICApO1xuICB9XG5cbiAgX3Nob3dJbkZpbGVNYW5hZ2VyKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAvLyBPbmx5IGFsbG93IHJldmVhbGluZyBhIHNpbmdsZSBkaXJlY3RvcnkvZmlsZSBhdCBhIHRpbWUuIFJldHVybiBvdGhlcndpc2UuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIobm9kZS5ub2RlUGF0aCk7XG4gIH1cblxuICBfc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gU2VsZWN0IHRoZSBub2RlIGJlZm9yZSB0cmFja2luZyBpdCBiZWNhdXNlIHNldHRpbmcgYSBuZXcgc2VsZWN0aW9uIGNsZWFycyB0aGUgdHJhY2tlZCBub2RlLlxuICAgIHRoaXMuX2FjdGlvbnMuc2VsZWN0U2luZ2xlTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFRyYWNrZWROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgX2NvcHlGdWxsUGF0aCgpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwpIHtcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNpbmdsZVNlbGVjdGVkTm9kZS5nZXRMb2NhbFBhdGgoKSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IGRpc3Bvc2FibGUgb2YgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeS52YWx1ZXMoKSkge1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3N0b3JlLnJlc2V0KCk7XG4gICAgUmVhY3RET00udW5tb3VudENvbXBvbmVudEF0Tm9kZSh0aGlzLl9wYW5lbEVsZW1lbnQpO1xuICAgIHRoaXMuX3BhbmVsLmRlc3Ryb3koKTtcbiAgICB0aGlzLl9jb250ZXh0TWVudS5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogRmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICBwYW5lbDoge1xuICAgICAgICBpc1Zpc2libGU6IHRoaXMuX2lzVmlzaWJsZSxcbiAgICAgICAgd2lkdGg6IHRoaXMuX2ZpbGVUcmVlUGFuZWwuZ2V0TGVuZ3RoKCksXG4gICAgICB9LFxuICAgICAgdHJlZTogdGhpcy5fc3RvcmUuZXhwb3J0RGF0YSgpLFxuICAgIH07XG4gIH1cbn1cblxuY2xhc3MgRmlsZVRyZWVQYW5lbCBleHRlbmRzIFJlYWN0LkNvbXBvbmVudCB7XG4gIHN0YXRpYyBwcm9wVHlwZXMgPSB7XG4gICAgaW5pdGlhbFdpZHRoOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgIHN0b3JlOiBQcm9wVHlwZXMuaW5zdGFuY2VPZihGaWxlVHJlZVN0b3JlKS5pc1JlcXVpcmVkLFxuICB9O1xuXG4gIHJlbmRlcigpIHtcbiAgICByZXR1cm4gKFxuICAgICAgPFBhbmVsQ29tcG9uZW50XG4gICAgICAgIGRvY2s9XCJsZWZ0XCJcbiAgICAgICAgaW5pdGlhbExlbmd0aD17dGhpcy5wcm9wcy5pbml0aWFsV2lkdGh9XG4gICAgICAgIHJlZj1cInBhbmVsXCI+XG4gICAgICAgIDxGaWxlVHJlZSBzdG9yZT17dGhpcy5wcm9wcy5zdG9yZX0gLz5cbiAgICAgIDwvUGFuZWxDb21wb25lbnQ+XG4gICAgKTtcbiAgfVxuXG4gIGdldEZpbGVUcmVlKCk6IEZpbGVUcmVlIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydwYW5lbCddLmdldENoaWxkQ29tcG9uZW50KCk7XG4gIH1cblxuICBnZXRMZW5ndGgoKTogbnVtYmVyIHtcbiAgICByZXR1cm4gdGhpcy5yZWZzWydwYW5lbCddLmdldExlbmd0aCgpO1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVDb250cm9sbGVyO1xuIl19