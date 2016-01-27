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
      this._fileTreePanel = _reactForAtom.React.render(_reactForAtom.React.createElement(FileTreePanel, {
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
      _reactForAtom.React.unmountComponentAtNode(this._panelElement);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7b0JBYWtDLE1BQU07O2lDQUNGLHFCQUFxQjs7aUNBQzdCLHFCQUFxQjs7OztrQ0FDOUIsd0JBQXdCOzs7OytCQUNqQixtQkFBbUI7Ozs7bUNBQ2YsdUJBQXVCOzs7OytCQUMzQixtQkFBbUI7Ozs7NkJBQ3JCLGlCQUFpQjs7Ozt5QkFDckIsV0FBVzs7Ozt1QkFDSixnQkFBZ0I7OzRCQUN6QixnQkFBZ0I7O3lCQUNoQixpQkFBaUI7O2tCQUV0QixJQUFJOzs7O3FCQUNELE9BQU87Ozs7c0JBRUgsUUFBUTs7OztJQUV2QixTQUFTLHVCQUFULFNBQVM7O0lBZVYsa0JBQWtCO2VBQWxCLGtCQUFrQjs7V0FpQkMsR0FBRzs7OztBQUVmLFdBbkJQLGtCQUFrQixDQW1CVixLQUErQixFQUFFOzs7MEJBbkJ6QyxrQkFBa0I7OzZCQXFCZixFQUFDLEtBQUssRUFBRSxFQUFDLEtBQUssRUFBRSxrQkFBa0IsQ0FBQyxhQUFhLEVBQUMsRUFBQyxFQUNsRCxLQUFLOztRQUZILEtBQUssYUFBTCxLQUFLOzs7QUFNWixRQUFJLENBQUMsVUFBVSxHQUFHLEtBQUssQ0FBQyxTQUFTLElBQUksSUFBSSxHQUFHLEtBQUssQ0FBQyxTQUFTLEdBQUcsSUFBSSxDQUFDO0FBQ25FLFFBQUksQ0FBQyxRQUFRLEdBQUcsNkJBQWdCLFdBQVcsRUFBRSxDQUFDO0FBQzlDLFFBQUksQ0FBQyxNQUFNLEdBQUcsMkJBQWMsV0FBVyxFQUFFLENBQUM7QUFDMUMsUUFBSSxDQUFDLGFBQWEsR0FBRyxJQUFJLHVCQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3pDLFFBQUksQ0FBQywwQkFBMEIsR0FBRyxJQUFJLHVCQUFVLEdBQUcsRUFBRSxDQUFDO0FBQ3RELFFBQUksQ0FBQyxjQUFjLEdBQUcsK0JBQXlCLENBQUM7O0FBRWhELFFBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztBQUU5QixRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUFNLE1BQUssc0JBQXNCLEVBQUU7S0FBQSxDQUFDLENBQ25FLENBQUM7QUFDRixRQUFJLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQzs7QUFFeEIsUUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLENBQUM7O0FBRTFCLFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQzthQUFNLE1BQUssT0FBTyxFQUFFO0tBQUEsQ0FBQyxDQUM1QyxDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFOztBQUVsQyw0Q0FBc0MsRUFBRSxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxTQUFTLENBQUM7QUFDbkYsZ0NBQTBCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUQsc0NBQWdDLEVBQUUsSUFBSSxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0tBQ2xFLENBQUMsQ0FDSCxDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyw0Q0FBeUI7QUFDeEMsc0JBQWdCLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzNDLG9CQUFjLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQ3ZDLHdCQUFrQixFQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM5QywyQkFBcUIsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDcEQsa0NBQTRCLEVBQUUsa0NBQU07QUFDbEMsdUNBQWtCLGlCQUFpQixDQUFDLE1BQUssc0JBQXNCLENBQUMsSUFBSSxPQUFNLENBQUMsQ0FBQztPQUM3RTtBQUNELG9DQUE4QixFQUFFLG9DQUFNO0FBQ3BDLHVDQUFrQixtQkFBbUIsQ0FBQyxNQUFLLDJCQUEyQixDQUFDLElBQUksT0FBTSxDQUFDLENBQUM7T0FDcEY7QUFDRCw0Q0FBc0MsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksVUFBVyxLQUFLLENBQUM7QUFDMUYsc0RBQWdELEVBQUUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDO0FBQzFGLGdEQUEwQyxFQUFFLElBQUksQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUN4RSx3Q0FBa0MsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDakUsMENBQW9DLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLFVBQVcsS0FBSyxDQUFDO0FBQ3RGLG9EQUE4QyxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztBQUN0Riw2Q0FBdUMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUMzRSxnREFBMEMsRUFDeEMsSUFBSSxDQUFDLHlCQUF5QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDM0Msa0RBQTRDLEVBQzFDLElBQUksQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzdDLGtEQUE0QyxFQUMxQyxJQUFJLENBQUMsMkJBQTJCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUM3QyxtREFBNkMsRUFDM0MsSUFBSSxDQUFDLDRCQUE0QixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDOUMsZ0NBQTBCLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7QUFDNUQseURBQW1ELEVBQ2pELElBQUksQ0FBQywwQkFBMEIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO0FBQzVDLDBDQUFvQyxFQUFFO2VBQU0sK0JBQWtCLGdCQUFnQixFQUFFO09BQUE7QUFDaEYsNkNBQXVDLEVBQUUsNkNBQU07QUFDN0MsdUNBQWtCLG1CQUFtQixDQUFDLE1BQUssYUFBYSxDQUFDLElBQUksT0FBTSxDQUFDLENBQUM7T0FDdEU7QUFDRCw2Q0FBdUMsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztBQUMzRSw4Q0FBd0MsRUFBRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUM3RSxDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksQ0FBQyxjQUFjLENBQUMsR0FBRyxDQUNyQixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRTtBQUNuQyx5Q0FBbUMsRUFBRSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztLQUMzRSxDQUFDLENBQ0gsQ0FBQztBQUNGLFFBQUksS0FBSyxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUU7QUFDdkIsVUFBSSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0tBQ2xDO0FBQ0QsUUFBSSxDQUFDLFlBQVksR0FBRyxzQ0FBeUIsQ0FBQzs7QUFFOUMsUUFBSSxDQUFDLHdCQUF3QixHQUFHLEtBQUssQ0FBQztHQUN2Qzs7ZUF0R0csa0JBQWtCOztXQXdHTiw0QkFBUztBQUN2QixVQUFJLENBQUMsYUFBYSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsS0FBSyxDQUFDLENBQUM7QUFDbkQsVUFBSSxDQUFDLGFBQWEsQ0FBQyxLQUFLLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQztBQUN6QyxVQUFJLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUFDO0FBQ3hDLFlBQUksRUFBRSxJQUFJLENBQUMsYUFBYTtBQUN4QixlQUFPLEVBQUUsSUFBSSxDQUFDLFVBQVU7T0FDekIsQ0FBQyxDQUFDO0tBQ0o7OztXQUVNLGlCQUFDLFlBQXNCLEVBQVE7QUFDcEMsVUFBSSxDQUFDLGNBQWMsR0FBRyxvQkFBTSxNQUFNLENBQ2hDLGtDQUFDLGFBQWE7QUFDWixvQkFBWSxFQUFFLFlBQVksQUFBQztBQUMzQixhQUFLLEVBQUUsSUFBSSxDQUFDLE1BQU0sQUFBQztRQUNuQixFQUNGLElBQUksQ0FBQyxhQUFhLENBQ25CLENBQUM7S0FDSDs7O1dBRXFCLGdDQUFDLFFBQWlCLEVBQVE7QUFDOUMsVUFBSSxRQUFRLElBQUksSUFBSSxFQUFFO0FBQ3BCLFlBQUksQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlCLFlBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7T0FDOUI7S0FDRjs7O1dBRTBCLHFDQUFDLElBQWEsRUFBUTtBQUMvQyxVQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7QUFDaEIsWUFBSSxDQUFDLGFBQWEsQ0FBQyw2QkFBZ0IsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7T0FDeEQ7S0FDRjs7O1dBRXFCLGtDQUFTOzs7QUFHN0IsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxjQUFjLEVBQUUsQ0FBQyxNQUFNLENBQUMsVUFBQSxTQUFTO2VBQ3BFLDZCQUFnQixnQkFBZ0IsQ0FBQyxTQUFTLENBQUM7T0FDNUMsQ0FBQyxDQUFDO0FBQ0gsVUFBTSxRQUFRLEdBQUcsZUFBZSxDQUFDLEdBQUcsQ0FDbEMsVUFBQSxTQUFTO2VBQUksNkJBQWdCLFlBQVksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLENBQUM7T0FBQSxDQUMvRCxDQUFDO0FBQ0YsVUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDcEMsVUFBSSxDQUFDLFFBQVEsQ0FBQyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUNuRDs7O1dBRWEsd0JBQUMsZUFBd0IsRUFBUTtBQUM3QyxVQUFJLGVBQWUsRUFBRTtBQUNuQixZQUFJLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxDQUFDO0FBQ25CLFlBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztPQUNsQixNQUFNO0FBQ0wsWUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7O0FBRXhCLGNBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztTQUNqQjtBQUNELFlBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLENBQUM7T0FDcEI7QUFDRCxVQUFJLENBQUMsVUFBVSxHQUFHLGVBQWUsQ0FBQztLQUNuQzs7Ozs7Ozs7V0FNTyxvQkFBUztBQUNmLFVBQUksQ0FBQyxTQUFTLENBQUMsYUFBYSxFQUFFLENBQUMsUUFBUSxFQUFFLENBQUM7S0FDM0M7OztXQUVRLHFCQUFTO0FBQ2hCLFVBQUksQ0FBQyxjQUFjLENBQUMsV0FBVyxFQUFFLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDM0M7Ozs7Ozs7V0FLWSx5QkFBWTtBQUN2QixVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsY0FBYyxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQ25ELGFBQU8sUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO0tBQzVCOzs7Ozs7O1dBS2MsMkJBQVM7QUFDdEIsVUFBSSxJQUFJLENBQUMsYUFBYSxFQUFFLEVBQUU7QUFDeEIsWUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO09BQ2pCLE1BQU07QUFDTCxZQUFJLENBQUMsU0FBUyxFQUFFLENBQUM7T0FDbEI7S0FDRjs7O1dBRWUsNEJBQVM7QUFDdkIsVUFBTSxhQUFhLEdBQUcsQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO0FBQ3ZDLFVBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDbkMsVUFBSSxhQUFhLElBQUksSUFBSSxDQUFDLHdCQUF3QixFQUFFO0FBQ2xELFlBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQ3hCLFlBQUksQ0FBQyx3QkFBd0IsR0FBRyxLQUFLLENBQUM7T0FDdkM7S0FDRjs7Ozs7Ozs7V0FNZSw0QkFBc0M7VUFBckMsWUFBc0IseURBQUcsSUFBSTs7QUFDNUMsVUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO0FBQ3BELFVBQU0sSUFBSSxHQUFHLE1BQU0sR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztBQUNyRCxVQUFNLFFBQVEsR0FBRyxJQUFJLEdBQUcsSUFBSSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQzs7QUFFOUMsVUFBSSxZQUFZLEVBQUU7OztBQUdoQixZQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO09BQzNCOztBQUVELFVBQUksQ0FBQyxRQUFRLEVBQUU7QUFDYixlQUFPO09BQ1I7Ozs7QUFJRCxVQUFJLENBQUMsWUFBWSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtBQUNyQyxZQUFJLENBQUMsd0JBQXdCLEdBQUcsSUFBSSxDQUFDO0FBQ3JDLGVBQU87T0FDUjs7QUFFRCxVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzlCOzs7Ozs7OztXQU1vQiwrQkFBQyxLQUFZLEVBQVE7QUFDeEMsVUFBTSxHQUFHLEdBQUssS0FBSyxDQUFDLGFBQWEsQUFBZ0IsQ0FBQztBQUNsRCxVQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLENBQUM7QUFDckQsVUFBSSxDQUFDLEtBQUssRUFBRTs7QUFFVixlQUFPO09BQ1I7O0FBRUQsVUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7QUFDcEMsVUFBSSxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUMxQixVQUFJLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQzlCOzs7V0FFWSx1QkFBQyxPQUFnQixFQUFROzs7QUFDcEMsVUFBSSxDQUFDLE9BQU8sRUFBRTtBQUNaLGVBQU87T0FDUjtBQUNELFVBQU0sT0FBZ0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxPQUFPLENBQUMsQ0FBQztBQUM1RCxVQUFJLENBQUMsT0FBTyxFQUFFO0FBQ1osZUFBTztPQUNSO0FBQ0QsVUFBTSxLQUFLLEdBQUcsRUFBRSxDQUFDO0FBQ2pCLFVBQUksR0FBRyxHQUFHLE9BQU8sQ0FBQztBQUNsQixhQUFPLEdBQUcsSUFBSSxJQUFJLElBQUksR0FBRyxLQUFLLE9BQU8sRUFBRTtBQUNyQyxhQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQ2hCLFdBQUcsR0FBRyw2QkFBZ0IsWUFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDO09BQ3pDOztBQUVELFdBQUssQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUNoQixXQUFLLENBQUMsT0FBTyxDQUFDLFVBQUMsUUFBUSxFQUFFLENBQUMsRUFBSztBQUM3QixZQUFNLFNBQVMsR0FBRyxBQUFDLENBQUMsS0FBSyxDQUFDLEdBQUksT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDckQsZUFBSyxRQUFRLENBQUMsZUFBZSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDLENBQUM7QUFDNUQsZUFBSyxRQUFRLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztPQUM5QyxDQUFDLENBQUM7QUFDSCxVQUFJLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQzVDOzs7V0FFd0IsbUNBQUMsc0JBQStCLEVBQVE7QUFDL0QsVUFBSSxDQUFDLFFBQVEsQ0FBQyx5QkFBeUIsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDO0tBQ2pFOzs7V0FFa0IsNkJBQUMsZ0JBQXlCLEVBQVE7QUFDbkQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxtQkFBbUIsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO0tBQ3JEOzs7V0FFYyx5QkFBQyxZQUEyQixFQUFRO0FBQ2pELFVBQUksQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLFlBQVksQ0FBQyxDQUFDO0tBQzdDOzs7V0FFZ0IsMkJBQUMsY0FBdUIsRUFBUTtBQUMvQyxVQUFJLENBQUMsUUFBUSxDQUFDLGlCQUFpQixDQUFDLGNBQWMsQ0FBQyxDQUFDO0tBQ2pEOzs7Ozs7OztXQU1pQiw4QkFBOEI7OztVQUE3QixJQUFhLHlEQUFHLEtBQUs7O0FBQ3RDLFVBQU0sYUFBYSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQztBQUNyRCxVQUFNLGlCQUFpQixHQUFHLGFBQWEsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNoRCxVQUFJLGFBQWEsQ0FBQyxJQUFJLEtBQUssQ0FBQyxJQUN2QixDQUFDLGlCQUFpQixDQUFDLE1BQU0sSUFDekIsRUFBRSxpQkFBaUIsQ0FBQyxXQUFXLElBQUksaUJBQWlCLENBQUMsVUFBVSxFQUFFLENBQUEsQUFBQyxFQUFFOzs7Ozs7O0FBT3ZFLFlBQUksQ0FBQyxhQUFhLENBQUMsNkJBQWdCLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDO09BQzdFLE1BQU07QUFDTCxxQkFBYSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTs7QUFFNUIsY0FBSSxDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUU7QUFDckIsbUJBQU87V0FDUjs7QUFFRCxjQUFJLElBQUksRUFBRTtBQUNSLG1CQUFLLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztXQUM1RCxNQUFNO0FBQ0wsbUJBQUssUUFBUSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztXQUN4RDtTQUNGLENBQUMsQ0FBQztPQUNKO0tBQ0Y7OztXQUVXLHdCQUFTOzs7QUFDbkIsVUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztBQUMzQyxjQUFRLENBQUMsT0FBTyxDQUFDLFVBQUEsT0FBTztlQUFJLE9BQUssUUFBUSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxPQUFPLENBQUM7T0FBQSxDQUFDLENBQUM7S0FDL0U7OztXQUVlLDRCQUFTOzs7QUFDdkIsVUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDO0FBQzdDLFVBQUksS0FBSyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUU7QUFDcEIsZUFBTztPQUNSOztBQUVELFVBQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUMsVUFBQSxJQUFJO2VBQUksSUFBSSxDQUFDLE1BQU07T0FBQSxDQUFDLENBQUM7QUFDcEQsVUFBSSxTQUFTLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRTtBQUN4QixZQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLFVBQUEsSUFBSTtpQkFBSSxJQUFJLENBQUMsUUFBUTtTQUFBLENBQUMsQ0FBQztBQUN2RCxZQUFNLE9BQU8sR0FBRyxnREFBZ0QsSUFDM0QsS0FBSyxDQUFDLElBQUksR0FBRyxDQUFDLEdBQUcsUUFBUSxHQUFHLE9BQU8sQ0FBQSxBQUFDLENBQUM7QUFDMUMsWUFBSSxDQUFDLE9BQU8sQ0FBQztBQUNYLGlCQUFPLEVBQUU7QUFDUCxvQkFBUSxFQUFFLGtCQUFNO0FBQUUscUJBQUssUUFBUSxDQUFDLG1CQUFtQixFQUFFLENBQUM7YUFBRTtBQUN4RCxvQkFBUSxFQUFFLGtCQUFNLEVBQUU7V0FDbkI7QUFDRCx5QkFBZSx3QkFBc0IsZ0JBQUcsR0FBRyxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsZ0JBQUcsR0FBRyxDQUFDLEFBQUU7QUFDMUUsaUJBQU8sRUFBUCxPQUFPO1NBQ1IsQ0FBQyxDQUFDO09BQ0osTUFBTTtBQUNMLFlBQUksT0FBTyxZQUFBLENBQUM7QUFDWixZQUFJLFNBQVMsQ0FBQyxJQUFJLEtBQUssQ0FBQyxFQUFFO0FBQ3hCLGlCQUFPLDZCQUEwQixTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSwwQkFBcUIsQ0FBQztTQUNsRixNQUFNO0FBQ0wsY0FBTSxhQUFhLEdBQUcsU0FBUyxDQUFDLEdBQUcsQ0FBQyxVQUFBLElBQUk7MEJBQVEsSUFBSSxDQUFDLFFBQVE7V0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQzdFLGlCQUFPLDZCQUEyQixhQUFhLHdCQUFvQixDQUFDO1NBQ3JFOztBQUVELFlBQUksQ0FBQyxPQUFPLENBQUM7QUFDWCxpQkFBTyxFQUFFLENBQUMsSUFBSSxDQUFDO0FBQ2YsaUJBQU8sRUFBUCxPQUFPO1NBQ1IsQ0FBQyxDQUFDO09BQ0o7S0FDRjs7Ozs7OztXQUtlLDBCQUFDLElBQWEsRUFBUTs7O0FBQ3BDLFVBQUksQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsQ0FBQyxPQUFPLENBQUMsVUFBQSxJQUFJLEVBQUk7O0FBRTdDLFlBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFO0FBQ3JCLGlCQUFPO1NBQ1I7O0FBRUQsWUFBSSxJQUFJLEVBQUU7QUFDUixpQkFBSyxRQUFRLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQzFELE1BQU07QUFDTCxpQkFBSyxRQUFRLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxPQUFPLEVBQUUsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1NBQ3REO09BQ0YsQ0FBQyxDQUFDO0tBQ0o7OztXQUVRLHFCQUFTO0FBQ2hCLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUN6QixlQUFPO09BQ1I7O0FBRUQsVUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxlQUFlLEVBQUUsQ0FBQyxJQUFJLEVBQUUsQ0FBQztBQUM3RCxVQUFJLGVBQWUsSUFBSSxJQUFJLEVBQUU7O0FBRTNCLFlBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztBQUNsQixlQUFPO09BQ1I7O0FBRUQsVUFBSSxTQUFTLFlBQUEsQ0FBQztBQUNkLFVBQUksT0FBTyxZQUFBLENBQUM7QUFDWixVQUFJLFdBQVcsWUFBQSxDQUFDO0FBQ2hCLFVBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ3RELFVBQUksTUFBTSxFQUFFO0FBQ1YsZUFBTyxHQUFHLGVBQWUsQ0FBQzs7QUFFMUIsbUJBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO09BQ3pDLE1BQU07QUFDTCxpQkFBUyxHQUFHLDZCQUFnQixZQUFZLENBQUMsZUFBZSxDQUFDLENBQUM7QUFDMUQsZUFBTyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsYUFBYSxDQUFDLGVBQWUsQ0FBQyxDQUFDOztBQUVyRCxpQ0FBVSxPQUFPLElBQUksU0FBUyxDQUFDLENBQUM7QUFDaEMsbUJBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztPQUNsRTs7OztBQUlELFVBQUksT0FBTyxJQUFJLElBQUksSUFBSyxDQUFDLE1BQU0sSUFBSSxTQUFTLElBQUksSUFBSSxBQUFDLEVBQUU7QUFDckQsZUFBTztPQUNSOztBQUVELFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxDQUFDO0FBQzFFLFVBQ0UsNkJBQWdCLFFBQVEsQ0FBQyxlQUFlLENBQUMsSUFDekMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLGVBQWUsQ0FBQyxJQUNoRCxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFDbkI7O0FBRUEsWUFBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNoRCxNQUFNO0FBQ0wsWUFBTSxLQUFLLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUNuRCxZQUFNLFFBQVEsR0FBRyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQzs7QUFFeEMsWUFBSSxLQUFLLEdBQUcsUUFBUSxFQUFFO0FBQ3BCLGNBQU0sY0FBYyxHQUFHLFdBQVcsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFDLENBQUM7O0FBRTlDLGNBQUksTUFBTSxFQUFFOzs7QUFHVixtQkFBTyxHQUFHLGNBQWMsQ0FBQztXQUMxQjs7O0FBR0QsY0FBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxXQUFXLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDM0QsTUFBTTtBQUNMLGNBQU0sc0JBQXNCLEdBQUcsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sRUFBRSxlQUFlLENBQUMsQ0FBQzs7OztBQUkxRixjQUFJLHNCQUFzQixJQUFJLElBQUksRUFBRTtBQUNsQyxnQkFBSSxDQUFDLG1CQUFtQixDQUFDLHNCQUFzQixDQUFDLE9BQU8sRUFBRSxzQkFBc0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztXQUMxRjtTQUNGO09BQ0Y7S0FDRjs7O1dBRU0sbUJBQVM7QUFDZCxVQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDekIsZUFBTztPQUNSOztBQUVELFVBQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsZUFBZSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDN0QsVUFBSSxlQUFlLElBQUksSUFBSSxFQUFFOztBQUUzQixZQUFJLENBQUMsYUFBYSxFQUFFLENBQUM7QUFDckIsZUFBTztPQUNSOztBQUVELFVBQUksU0FBUyxZQUFBLENBQUM7QUFDZCxVQUFJLE9BQU8sWUFBQSxDQUFDO0FBQ1osVUFBSSxXQUFXLFlBQUEsQ0FBQztBQUNoQixVQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxlQUFlLENBQUMsQ0FBQztBQUN0RCxVQUFJLE1BQU0sRUFBRTtBQUNWLGVBQU8sR0FBRyxlQUFlLENBQUM7O0FBRTFCLG1CQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUN6QyxNQUFNO0FBQ0wsaUJBQVMsR0FBRyw2QkFBZ0IsWUFBWSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQzFELGVBQU8sR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGFBQWEsQ0FBQyxlQUFlLENBQUMsQ0FBQzs7QUFFckQsaUNBQVUsT0FBTyxJQUFJLFNBQVMsQ0FBQyxDQUFDO0FBQ2hDLG1CQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsU0FBUyxDQUFDLENBQUM7T0FDbEU7Ozs7QUFJRCxVQUFJLE9BQU8sSUFBSSxJQUFJLElBQUssQ0FBQyxNQUFNLElBQUksU0FBUyxJQUFJLElBQUksQUFBQyxFQUFFO0FBQ3JELGVBQU87T0FDUjs7QUFFRCxVQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLGVBQWUsQ0FBQyxDQUFDO0FBQ25ELFVBQUksS0FBSyxLQUFLLENBQUMsRUFBRTtBQUNmLFlBQUksQ0FBQyxNQUFNLElBQUksU0FBUyxJQUFJLElBQUksRUFBRTs7QUFFaEMsY0FBSSxDQUFDLG1CQUFtQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztTQUM5Qzs7O09BR0YsTUFBTTtBQUNMLGNBQU0sa0JBQWtCLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQzs7QUFFbEQsY0FBSSxNQUFNLEVBQUU7OztBQUdWLG1CQUFPLEdBQUcsa0JBQWtCLENBQUM7V0FDOUI7O0FBRUQsY0FBSSxDQUFDLG1CQUFtQixDQUN0QixPQUFPLEVBQ1AsSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUM5RCxDQUFDO1NBQ0g7S0FDRjs7O1dBRVMsc0JBQVM7QUFDakIsVUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ3pCLGVBQU87T0FDUjs7QUFFRCxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxDQUFDO0FBQzNDLFVBQUksQ0FBQyxtQkFBbUIsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7S0FDcEQ7OztXQUVZLHlCQUFTO0FBQ3BCLFVBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsRUFBRTtBQUN6QixlQUFPO09BQ1I7OztBQUdELFVBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7QUFDM0MsVUFBTSxXQUFXLEdBQUcsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDbEQsVUFBSSxDQUFDLG1CQUFtQixDQUN0QixXQUFXLEVBQ1gsSUFBSSxDQUFDLDJCQUEyQixDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsQ0FDM0QsQ0FBQztLQUNIOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztXQWtCMEIscUNBQUMsT0FBZSxFQUFFLE9BQWUsRUFBVTtBQUNwRSxVQUFJLEVBQUUsNkJBQWdCLFFBQVEsQ0FBQyxPQUFPLENBQUMsSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUEsQUFBQyxFQUFFOzs7QUFHcEYsZUFBTyxPQUFPLENBQUM7T0FDaEI7O0FBRUQsVUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDbkUsVUFBSSxTQUFTLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTs7QUFFMUIsZUFBTyxPQUFPLENBQUM7T0FDaEI7OztBQUdELGFBQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0tBQ25GOzs7Ozs7Ozs7Ozs7Ozs7OztXQWUwQixxQ0FBQyxPQUFlLEVBQUUsT0FBZSxFQUFxQjtBQUMvRSxVQUFJLFNBQVMsWUFBQSxDQUFDO0FBQ2QsVUFBSSxXQUFXLFlBQUEsQ0FBQztBQUNoQixVQUFNLE1BQU0sR0FBRyxPQUFPLEtBQUssT0FBTyxDQUFDO0FBQ25DLFVBQUksTUFBTSxFQUFFOztBQUVWLG1CQUFXLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsQ0FBQztPQUN6QyxNQUFNO0FBQ0wsaUJBQVMsR0FBRyw2QkFBZ0IsWUFBWSxDQUFDLE9BQU8sQ0FBQyxDQUFDOztBQUVsRCxpQ0FBVSxPQUFPLElBQUksU0FBUyxDQUFDLENBQUM7QUFDaEMsbUJBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLGtCQUFrQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztPQUNsRTs7QUFFRCxVQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0FBQzNDLFVBQUksS0FBSyxHQUFJLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxBQUFDLEVBQUU7QUFDcEMsWUFBTSxXQUFXLEdBQUcsV0FBVyxDQUFDLEtBQUssR0FBRyxDQUFDLENBQUMsQ0FBQzs7O0FBRzNDLGVBQU8sTUFBTSxHQUNULEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFDLEdBQzVDLEVBQUMsT0FBTyxFQUFFLFdBQVcsRUFBRSxPQUFPLEVBQVAsT0FBTyxFQUFDLENBQUM7T0FDckMsTUFBTSxJQUFJLFNBQVMsSUFBSSxJQUFJLEVBQUU7O0FBRTVCLGVBQU8sSUFBSSxDQUFDLDJCQUEyQixDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQztPQUM3RCxNQUFNOzs7QUFHTCxlQUFPLElBQUksQ0FBQztPQUNiO0tBQ0Y7OztXQUVpQiw4QkFBUztBQUN6QixVQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQzs7QUFFL0QsVUFBSSxrQkFBa0IsSUFBSSxJQUFJLEVBQUU7QUFDOUIsWUFBSSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsa0JBQWtCLENBQUMsT0FBTyxFQUFFLGtCQUFrQixDQUFDLE9BQU8sQ0FBQyxDQUFDO09BQ25GO0tBQ0Y7OztXQUVzQixpQ0FBQyxXQUFzQyxFQUFFLElBQXdCLEVBQVE7QUFDOUYsVUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7O0FBRS9ELFVBQUksa0JBQWtCLElBQUksSUFBSSxJQUFJLENBQUMsa0JBQWtCLENBQUMsV0FBVyxFQUFFOztBQUVqRSw4QkFBTSxxQkFBcUIsRUFBRTtBQUMzQixxQkFBVyxFQUFYLFdBQVc7QUFDWCxjQUFJLEVBQUosSUFBSTtTQUNMLENBQUMsQ0FBQztBQUNILFlBQUksQ0FBQyxRQUFRLENBQUMsc0JBQXNCLENBQ2xDLGtCQUFrQixDQUFDLE9BQU8sRUFDMUIsV0FBVyxFQUNYLElBQUksQ0FDTCxDQUFDO09BQ0g7S0FDRjs7O1dBRXdCLHFDQUFTO0FBQ2hDLFVBQUksQ0FBQyx1QkFBdUIsQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUM7S0FDcEQ7OztXQUUwQix1Q0FBUztBQUNsQyxVQUFJLENBQUMsdUJBQXVCLENBQUMsVUFBVSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ25EOzs7V0FFMEIsdUNBQVM7QUFDbEMsVUFBSSxDQUFDLHVCQUF1QixDQUFDLFlBQVksRUFBRSxRQUFRLENBQUMsQ0FBQztLQUN0RDs7O1dBRTJCLHdDQUFTO0FBQ25DLFVBQUksQ0FBQyx1QkFBdUIsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7S0FDckQ7OztXQUV5QixzQ0FBUztBQUNqQyxVQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDckQsVUFBSSxRQUFRLElBQUksSUFBSSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEVBQUU7QUFDdkMsWUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxDQUFDO09BQzVDO0tBQ0Y7OztXQUVpQiw0QkFBQyxLQUFZLEVBQVE7OztBQUdyQyxVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FDbEIsS0FBSyxDQUFDLE1BQU0sRUFDZCx3Q0FBd0MsQ0FDekMsQ0FBQztLQUNIOzs7V0FFaUIsOEJBQVM7QUFDekIsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQ2pELFVBQUksSUFBSSxJQUFJLElBQUksRUFBRTs7QUFFaEIsZUFBTztPQUNSO0FBQ0QseUJBQU0sZ0JBQWdCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0tBQ3ZDOzs7V0FFa0IsNkJBQUMsT0FBZSxFQUFFLE9BQWUsRUFBUTs7QUFFMUQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDakQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0tBQ2hEOzs7V0FFWSx5QkFBUztBQUNwQixVQUFNLGtCQUFrQixHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsQ0FBQztBQUMvRCxVQUFJLGtCQUFrQixJQUFJLElBQUksRUFBRTtBQUM5QixZQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxZQUFZLEVBQUUsQ0FBQyxDQUFDO09BQ3pEO0tBQ0Y7OztXQUVNLG1CQUFTO0FBQ2QsVUFBSSxDQUFDLGNBQWMsQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM5QixXQUFLLElBQU0sVUFBVSxJQUFJLElBQUksQ0FBQywwQkFBMEIsQ0FBQyxNQUFNLEVBQUUsRUFBRTtBQUNqRSxrQkFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO09BQ3RCO0FBQ0QsVUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQiwwQkFBTSxzQkFBc0IsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDakQsVUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUN0QixVQUFJLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxDQUFDO0tBQzdCOzs7V0FFUSxxQkFBNEI7QUFDbkMsYUFBTztBQUNMLGFBQUssRUFBRTtBQUNMLG1CQUFTLEVBQUUsSUFBSSxDQUFDLFVBQVU7QUFDMUIsZUFBSyxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUMsU0FBUyxFQUFFO1NBQ3ZDO0FBQ0QsWUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO09BQy9CLENBQUM7S0FDSDs7O1NBbHNCRyxrQkFBa0I7OztJQXFzQmxCLGFBQWE7WUFBYixhQUFhOztXQUFiLGFBQWE7MEJBQWIsYUFBYTs7K0JBQWIsYUFBYTs7O2VBQWIsYUFBYTs7V0FNWCxrQkFBRztBQUNQLGFBQ0U7OztBQUNFLGNBQUksRUFBQyxNQUFNO0FBQ1gsdUJBQWEsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLFlBQVksQUFBQztBQUN2QyxhQUFHLEVBQUMsT0FBTztRQUNYLHFFQUFVLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQUFBQyxHQUFHO09BQ3RCLENBQ2pCO0tBQ0g7OztXQUVVLHVCQUFhO0FBQ3RCLGFBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0tBQy9DOzs7V0FFUSxxQkFBVztBQUNsQixhQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7S0FDdkM7OztXQXRCa0I7QUFDakIsa0JBQVksRUFBRSxTQUFTLENBQUMsTUFBTTtBQUM5QixXQUFLLEVBQUUsU0FBUyxDQUFDLFVBQVUsNEJBQWUsQ0FBQyxVQUFVO0tBQ3REOzs7O1NBSkcsYUFBYTtHQUFTLG9CQUFNLFNBQVM7O0FBMEIzQyxNQUFNLENBQUMsT0FBTyxHQUFHLGtCQUFrQixDQUFDIiwiZmlsZSI6IkZpbGVUcmVlQ29udHJvbGxlci5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtFeHBvcnRTdG9yZURhdGF9IGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0VWRU5UX0hBTkRMRVJfU0VMRUNUT1J9ICBmcm9tICcuL0ZpbGVUcmVlQ29uc3RhbnRzJztcbmltcG9ydCBGaWxlU3lzdGVtQWN0aW9ucyBmcm9tICcuL0ZpbGVTeXN0ZW1BY3Rpb25zJztcbmltcG9ydCBGaWxlVHJlZSBmcm9tICcuLi9jb21wb25lbnRzL0ZpbGVUcmVlJztcbmltcG9ydCBGaWxlVHJlZUFjdGlvbnMgZnJvbSAnLi9GaWxlVHJlZUFjdGlvbnMnO1xuaW1wb3J0IEZpbGVUcmVlQ29udGV4dE1lbnUgZnJvbSAnLi9GaWxlVHJlZUNvbnRleHRNZW51JztcbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7UGFuZWxDb21wb25lbnR9IGZyb20gJy4uLy4uL3VpL3BhbmVsJztcbmltcG9ydCB7UmVhY3R9IGZyb20gJ3JlYWN0LWZvci1hdG9tJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL2FuYWx5dGljcyc7XG5cbmltcG9ydCBvcyBmcm9tICdvcyc7XG5pbXBvcnQgc2hlbGwgZnJvbSAnc2hlbGwnO1xuXG5pbXBvcnQgaW52YXJpYW50IGZyb20gJ2Fzc2VydCc7XG5cbmNvbnN0IHtQcm9wVHlwZXN9ID0gUmVhY3Q7XG5cbnR5cGUgRmlsZVRyZWVOb2RlRGF0YSA9IHtcbiAgbm9kZUtleTogc3RyaW5nLFxuICByb290S2V5OiBzdHJpbmcsXG59O1xuXG5leHBvcnQgdHlwZSBGaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSA9IHtcbiAgcGFuZWw6IHtcbiAgICBpc1Zpc2libGU6ID9ib29sZWFuO1xuICAgIHdpZHRoOiBudW1iZXI7XG4gIH07XG4gIHRyZWU6IEV4cG9ydFN0b3JlRGF0YTtcbn07XG5cbmNsYXNzIEZpbGVUcmVlQ29udHJvbGxlciB7XG4gIF9hY3Rpb25zOiBGaWxlVHJlZUFjdGlvbnM7XG4gIF9jb250ZXh0TWVudTogRmlsZVRyZWVDb250ZXh0TWVudTtcbiAgX2lzVmlzaWJsZTogYm9vbGVhbjtcbiAgX3BhbmVsOiBhdG9tJFBhbmVsO1xuICBfZmlsZVRyZWVQYW5lbDogRmlsZVRyZWVQYW5lbDtcbiAgX3BhbmVsRWxlbWVudDogSFRNTEVsZW1lbnQ7XG4gIF9yZXBvc2l0b3JpZXM6IEltbXV0YWJsZS5TZXQ8YXRvbSRSZXBvc2l0b3J5PjtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcbiAgX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnk6IEltbXV0YWJsZS5NYXA8YXRvbSRSZXBvc2l0b3J5LCBhdG9tJERpc3Bvc2FibGU+O1xuICAvKipcbiAgICogVHJ1ZSBpZiBhIHJldmVhbCB3YXMgcmVxdWVzdGVkIHdoaWxlIHRoZSBmaWxlIHRyZWUgaXMgaGlkZGVuLiBJZiBzbywgd2Ugc2hvdWxkIGFwcGx5IGl0IHdoZW5cbiAgICogdGhlIHRyZWUgaXMgc2hvd24uXG4gICAqL1xuICBfcmV2ZWFsQWN0aXZlRmlsZVBlbmRpbmc6IGJvb2xlYW47XG5cbiAgc3RhdGljIElOSVRJQUxfV0lEVEggPSAyNDA7XG5cbiAgY29uc3RydWN0b3Ioc3RhdGU6ID9GaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSkge1xuICAgIGNvbnN0IHtwYW5lbH0gPSB7XG4gICAgICAuLi57cGFuZWw6IHt3aWR0aDogRmlsZVRyZWVDb250cm9sbGVyLklOSVRJQUxfV0lEVEh9fSxcbiAgICAgIC4uLnN0YXRlLFxuICAgIH07XG5cbiAgICAvLyBzaG93IHRoZSBmaWxlIHRyZWUgYnkgZGVmYXVsdFxuICAgIHRoaXMuX2lzVmlzaWJsZSA9IHBhbmVsLmlzVmlzaWJsZSAhPSBudWxsID8gcGFuZWwuaXNWaXNpYmxlIDogdHJ1ZTtcbiAgICB0aGlzLl9hY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yaWVzID0gbmV3IEltbXV0YWJsZS5TZXQoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gbmV3IEltbXV0YWJsZS5NYXAoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICAvLyBJbml0aWFsIHJvb3QgZGlyZWN0b3JpZXNcbiAgICB0aGlzLl91cGRhdGVSb290RGlyZWN0b3JpZXMoKTtcbiAgICAvLyBTdWJzZXF1ZW50IHJvb3QgZGlyZWN0b3JpZXMgdXBkYXRlZCBvbiBjaGFuZ2VcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20ucHJvamVjdC5vbkRpZENoYW5nZVBhdGhzKCgpID0+IHRoaXMuX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpKVxuICAgICk7XG4gICAgdGhpcy5faW5pdGlhbGl6ZVBhbmVsKCk7XG4gICAgLy8gSW5pdGlhbCByZW5kZXJcbiAgICB0aGlzLl9yZW5kZXIocGFuZWwud2lkdGgpO1xuICAgIC8vIFN1YnNlcXVlbnQgcmVuZGVycyBoYXBwZW4gb24gY2hhbmdlcyB0byBkYXRhIHN0b3JlXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICB0aGlzLl9zdG9yZS5zdWJzY3JpYmUoKCkgPT4gdGhpcy5fcmVuZGVyKCkpXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdhdG9tLXdvcmtzcGFjZScsIHtcbiAgICAgICAgLy8gUGFzcyB1bmRlZmluZWQgc28gdGhlIGRlZmF1bHQgcGFyYW1ldGVyIGdldHMgdXNlZC5cbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJldmVhbC1hY3RpdmUtZmlsZSc6IHRoaXMucmV2ZWFsQWN0aXZlRmlsZS5iaW5kKHRoaXMsIHVuZGVmaW5lZCksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTp0b2dnbGUnOiB0aGlzLnRvZ2dsZVZpc2liaWxpdHkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnRvZ2dsZS1mb2N1cyc6IHRoaXMudG9nZ2xlVHJlZUZvY3VzLmJpbmQodGhpcyksXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChFVkVOVF9IQU5ETEVSX1NFTEVDVE9SLCB7XG4gICAgICAgICdjb3JlOm1vdmUtZG93bic6IHRoaXMuX21vdmVEb3duLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiB0aGlzLl9tb3ZlVXAuYmluZCh0aGlzKSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by10b3AnOiB0aGlzLl9tb3ZlVG9Ub3AuYmluZCh0aGlzKSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiB0aGlzLl9tb3ZlVG9Cb3R0b20uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1maWxlJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5BZGRGaWxlRGlhbG9nKHRoaXMuX29wZW5BbmRSZXZlYWxGaWxlUGF0aC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1mb2xkZXInOiAoKSA9PiB7XG4gICAgICAgICAgRmlsZVN5c3RlbUFjdGlvbnMub3BlbkFkZEZvbGRlckRpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRGlyZWN0b3J5UGF0aC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmNvbGxhcHNlLWRpcmVjdG9yeSc6IHRoaXMuX2NvbGxhcHNlU2VsZWN0aW9uLmJpbmQodGhpcywgLypkZWVwKi8gZmFsc2UpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWNvbGxhcHNlLWRpcmVjdG9yeSc6IHRoaXMuX2NvbGxhcHNlU2VsZWN0aW9uLmJpbmQodGhpcywgdHJ1ZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZWN1cnNpdmUtY29sbGFwc2UtYWxsJzogdGhpcy5fY29sbGFwc2VBbGwuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmNvcHktZnVsbC1wYXRoJzogdGhpcy5fY29weUZ1bGxQYXRoLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpleHBhbmQtZGlyZWN0b3J5JzogdGhpcy5fZXhwYW5kU2VsZWN0aW9uLmJpbmQodGhpcywgLypkZWVwKi8gZmFsc2UpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWV4cGFuZC1kaXJlY3RvcnknOiB0aGlzLl9leHBhbmRTZWxlY3Rpb24uYmluZCh0aGlzLCB0cnVlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnknOiB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeS5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS11cCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdFVwLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWRvd24nOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXREb3duLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWxlZnQnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRMZWZ0LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXJpZ2h0JzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0UmlnaHQuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZSc6IHRoaXMuX2RlbGV0ZVNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlLXByb2plY3QtZm9sZGVyLXNlbGVjdGlvbic6XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlUm9vdEZvbGRlclNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVuYW1lLXNlbGVjdGlvbic6ICgpID0+IEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5SZW5hbWVEaWFsb2coKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmR1cGxpY2F0ZS1zZWxlY3Rpb24nOiAoKSA9PiB7XG4gICAgICAgICAgRmlsZVN5c3RlbUFjdGlvbnMub3BlbkR1cGxpY2F0ZURpYWxvZyh0aGlzLnJldmVhbE5vZGVLZXkuYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzZWFyY2gtaW4tZGlyZWN0b3J5JzogdGhpcy5fc2VhcmNoSW5EaXJlY3RvcnkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnNob3ctaW4tZmlsZS1tYW5hZ2VyJzogdGhpcy5fc2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzKSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdbaXM9XCJ0YWJzLXRhYlwiXScsIHtcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJldmVhbC10YWItZmlsZSc6IHRoaXMuX3JldmVhbFRhYkZpbGVPbkNsaWNrLmJpbmQodGhpcyksXG4gICAgICB9KVxuICAgICk7XG4gICAgaWYgKHN0YXRlICYmIHN0YXRlLnRyZWUpIHtcbiAgICAgIHRoaXMuX3N0b3JlLmxvYWREYXRhKHN0YXRlLnRyZWUpO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0TWVudSA9IG5ldyBGaWxlVHJlZUNvbnRleHRNZW51KCk7XG5cbiAgICB0aGlzLl9yZXZlYWxBY3RpdmVGaWxlUGVuZGluZyA9IGZhbHNlO1xuICB9XG5cbiAgX2luaXRpYWxpemVQYW5lbCgpOiB2b2lkIHtcbiAgICB0aGlzLl9wYW5lbEVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLl9wYW5lbEVsZW1lbnQuc3R5bGUuaGVpZ2h0ID0gJzEwMCUnO1xuICAgIHRoaXMuX3BhbmVsID0gYXRvbS53b3Jrc3BhY2UuYWRkTGVmdFBhbmVsKHtcbiAgICAgIGl0ZW06IHRoaXMuX3BhbmVsRWxlbWVudCxcbiAgICAgIHZpc2libGU6IHRoaXMuX2lzVmlzaWJsZSxcbiAgICB9KTtcbiAgfVxuXG4gIF9yZW5kZXIoaW5pdGlhbFdpZHRoPzogP251bWJlcik6IHZvaWQge1xuICAgIHRoaXMuX2ZpbGVUcmVlUGFuZWwgPSBSZWFjdC5yZW5kZXIoXG4gICAgICA8RmlsZVRyZWVQYW5lbFxuICAgICAgICBpbml0aWFsV2lkdGg9e2luaXRpYWxXaWR0aH1cbiAgICAgICAgc3RvcmU9e3RoaXMuX3N0b3JlfVxuICAgICAgLz4sXG4gICAgICB0aGlzLl9wYW5lbEVsZW1lbnQsXG4gICAgKTtcbiAgfVxuXG4gIF9vcGVuQW5kUmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGg6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCkge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCk7XG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuQW5kUmV2ZWFsRGlyZWN0b3J5UGF0aChwYXRoOiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHBhdGggIT0gbnVsbCkge1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkocGF0aCkpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVSb290RGlyZWN0b3JpZXMoKTogdm9pZCB7XG4gICAgLy8gSWYgdGhlIHJlbW90ZS1wcm9qZWN0cyBwYWNrYWdlIGhhc24ndCBsb2FkZWQgeWV0IHJlbW90ZSBkaXJlY3RvcmllcyB3aWxsIGJlIGluc3RhbnRpYXRlZCBhc1xuICAgIC8vIGxvY2FsIGRpcmVjdG9yaWVzIGJ1dCB3aXRoIGludmFsaWQgcGF0aHMuIFdlIG5lZWQgdG8gZXhjbHVkZSB0aG9zZS5cbiAgICBjb25zdCByb290RGlyZWN0b3JpZXMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5maWx0ZXIoZGlyZWN0b3J5ID0+IChcbiAgICAgIEZpbGVUcmVlSGVscGVycy5pc1ZhbGlkRGlyZWN0b3J5KGRpcmVjdG9yeSlcbiAgICApKTtcbiAgICBjb25zdCByb290S2V5cyA9IHJvb3REaXJlY3Rvcmllcy5tYXAoXG4gICAgICBkaXJlY3RvcnkgPT4gRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShkaXJlY3RvcnkuZ2V0UGF0aCgpKVxuICAgICk7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRSb290S2V5cyhyb290S2V5cyk7XG4gICAgdGhpcy5fYWN0aW9ucy51cGRhdGVSZXBvc2l0b3JpZXMocm9vdERpcmVjdG9yaWVzKTtcbiAgfVxuXG4gIF9zZXRWaXNpYmlsaXR5KHNob3VsZEJlVmlzaWJsZTogYm9vbGVhbik6IHZvaWQge1xuICAgIGlmIChzaG91bGRCZVZpc2libGUpIHtcbiAgICAgIHRoaXMuX3BhbmVsLnNob3coKTtcbiAgICAgIHRoaXMuZm9jdXNUcmVlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0aGlzLl90cmVlSGFzRm9jdXMoKSkge1xuICAgICAgICAvLyBJZiB0aGUgZmlsZSB0cmVlIGhhcyBmb2N1cywgYmx1ciBpdCBiZWNhdXNlIGl0IHdpbGwgYmUgaGlkZGVuIHdoZW4gdGhlIHBhbmVsIGlzIGhpZGRlbi5cbiAgICAgICAgdGhpcy5ibHVyVHJlZSgpO1xuICAgICAgfVxuICAgICAgdGhpcy5fcGFuZWwuaGlkZSgpO1xuICAgIH1cbiAgICB0aGlzLl9pc1Zpc2libGUgPSBzaG91bGRCZVZpc2libGU7XG4gIH1cblxuICAvKipcbiAgICogXCJCbHVyc1wiIHRoZSB0cmVlLCB3aGljaCBpcyBkb25lIGJ5IGFjdGl2YXRpbmcgdGhlIGFjdGl2ZSBwYW5lIGluXG4gICAqIFtBdG9tJ3MgdHJlZS12aWV3XXtAbGluayBodHRwczovL2dpdGh1Yi5jb20vYXRvbS90cmVlLXZpZXcvYmxvYi92MC4xODguMC9saWIvdHJlZS12aWV3LmNvZmZlZSNMMTg3fS5cbiAgICovXG4gIGJsdXJUcmVlKCk6IHZvaWQge1xuICAgIGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVBhbmUoKS5hY3RpdmF0ZSgpO1xuICB9XG5cbiAgZm9jdXNUcmVlKCk6IHZvaWQge1xuICAgIHRoaXMuX2ZpbGVUcmVlUGFuZWwuZ2V0RmlsZVRyZWUoKS5mb2N1cygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYHRydWVgIGlmIHRoZSBmaWxlIHRyZWUgRE9NIG5vZGUgaGFzIGZvY3VzLCBvdGhlcndpc2UgYGZhbHNlYC5cbiAgICovXG4gIF90cmVlSGFzRm9jdXMoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgZmlsZVRyZWUgPSB0aGlzLl9maWxlVHJlZVBhbmVsLmdldEZpbGVUcmVlKCk7XG4gICAgcmV0dXJuIGZpbGVUcmVlLmhhc0ZvY3VzKCk7XG4gIH1cblxuICAvKipcbiAgICogRm9jdXNlcyB0aGUgdHJlZSBpZiBpdCBkb2VzIG5vdCBoYXZlIGZvY3VzLCBibHVycyB0aGUgdHJlZSBpZiBpdCBkb2VzIGhhdmUgZm9jdXMuXG4gICAqL1xuICB0b2dnbGVUcmVlRm9jdXMoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3RyZWVIYXNGb2N1cygpKSB7XG4gICAgICB0aGlzLmJsdXJUcmVlKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuZm9jdXNUcmVlKCk7XG4gICAgfVxuICB9XG5cbiAgdG9nZ2xlVmlzaWJpbGl0eSgpOiB2b2lkIHtcbiAgICBjb25zdCB3aWxsQmVWaXNpYmxlID0gIXRoaXMuX2lzVmlzaWJsZTtcbiAgICB0aGlzLl9zZXRWaXNpYmlsaXR5KHdpbGxCZVZpc2libGUpO1xuICAgIGlmICh3aWxsQmVWaXNpYmxlICYmIHRoaXMuX3JldmVhbEFjdGl2ZUZpbGVQZW5kaW5nKSB7XG4gICAgICB0aGlzLnJldmVhbEFjdGl2ZUZpbGUoKTtcbiAgICAgIHRoaXMuX3JldmVhbEFjdGl2ZUZpbGVQZW5kaW5nID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFJldmVhbCB0aGUgZmlsZSB0aGF0IGN1cnJlbnRseSBoYXMgZm9jdXMgaW4gdGhlIGZpbGUgdHJlZS4gSWYgc2hvd0lmSGlkZGVuIGlzIGZhbHNlLFxuICAgKiB0aGlzIHdpbGwgZW5xdWV1ZSBhIHBlbmRpbmcgcmV2ZWFsIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZpbGUgdHJlZSBpcyBzaG93biBhZ2Fpbi5cbiAgICovXG4gIHJldmVhbEFjdGl2ZUZpbGUoc2hvd0lmSGlkZGVuPzogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgY29uc3QgZmlsZSA9IGVkaXRvciA/IGVkaXRvci5nZXRCdWZmZXIoKS5maWxlIDogbnVsbDtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGZpbGUgPyBmaWxlLmdldFBhdGgoKSA6IG51bGw7XG5cbiAgICBpZiAoc2hvd0lmSGlkZGVuKSB7XG4gICAgICAvLyBFbnN1cmUgdGhlIGZpbGUgdHJlZSBpcyB2aXNpYmxlIGJlZm9yZSB0cnlpbmcgdG8gcmV2ZWFsIGEgZmlsZSBpbiBpdC4gRXZlbiBpZiB0aGUgY3VycmVudGx5XG4gICAgICAvLyBhY3RpdmUgcGFuZSBpcyBub3QgYW4gb3JkaW5hcnkgZWRpdG9yLCB3ZSBzdGlsbCBhdCBsZWFzdCB3YW50IHRvIHNob3cgdGhlIHRyZWUuXG4gICAgICB0aGlzLl9zZXRWaXNpYmlsaXR5KHRydWUpO1xuICAgIH1cblxuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiB3ZSBhcmUgbm90IHNob3dpbmcgdGhlIHRyZWUgYXMgcGFydCBvZiB0aGlzIGFjdGlvbiwgYW5kIGl0IGlzIGN1cnJlbnRseSBoaWRkZW4sIHRoaXNcbiAgICAvLyByZXZlYWwgd2lsbCB0YWtlIGVmZmVjdCB3aGVuIHRoZSB0cmVlIGlzIHNob3duLlxuICAgIGlmICghc2hvd0lmSGlkZGVuICYmICF0aGlzLl9pc1Zpc2libGUpIHtcbiAgICAgIHRoaXMuX3JldmVhbEFjdGl2ZUZpbGVQZW5kaW5nID0gdHJ1ZTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldmVhbCB0aGUgZmlsZSBvZiBhIGdpdmVuIHRhYiBiYXNlZCBvbiB0aGUgcGF0aCBzdG9yZWQgb24gdGhlIERPTS5cbiAgICogVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgdHJpZ2dlcmVkIGJ5IHRoZSBjb250ZXh0LW1lbnUgY2xpY2suXG4gICAqL1xuICBfcmV2ZWFsVGFiRmlsZU9uQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgdGFiID0gKChldmVudC5jdXJyZW50VGFyZ2V0OiBhbnkpOiBFbGVtZW50KTtcbiAgICBjb25zdCB0aXRsZSA9IHRhYi5xdWVyeVNlbGVjdG9yKCcudGl0bGVbZGF0YS1wYXRoXScpO1xuICAgIGlmICghdGl0bGUpIHtcbiAgICAgIC8vIGNhbiBvbmx5IHJldmVhbCBpdCBpZiB3ZSBmaW5kIHRoZSBmaWxlIHBhdGhcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IHRpdGxlLmRhdGFzZXQucGF0aDtcbiAgICB0aGlzLl9zZXRWaXNpYmlsaXR5KHRydWUpO1xuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICByZXZlYWxOb2RlS2V5KG5vZGVLZXk6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIW5vZGVLZXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleTogP3N0cmluZyA9IHRoaXMuX3N0b3JlLmdldFJvb3RGb3JLZXkobm9kZUtleSk7XG4gICAgaWYgKCFyb290S2V5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgbGV0IGtleSA9IG5vZGVLZXk7XG4gICAgd2hpbGUgKGtleSAhPSBudWxsICYmIGtleSAhPT0gcm9vdEtleSkge1xuICAgICAgc3RhY2sucHVzaChrZXkpO1xuICAgICAga2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShrZXkpO1xuICAgIH1cbiAgICAvLyBXZSB3YW50IHRoZSBzdGFjayB0byBiZSBbcGFyZW50S2V5LCAuLi4sIG5vZGVLZXldLlxuICAgIHN0YWNrLnJldmVyc2UoKTtcbiAgICBzdGFjay5mb3JFYWNoKChjaGlsZEtleSwgaSkgPT4ge1xuICAgICAgY29uc3QgcGFyZW50S2V5ID0gKGkgPT09IDApID8gcm9vdEtleSA6IHN0YWNrW2kgLSAxXTtcbiAgICAgIHRoaXMuX2FjdGlvbnMuZW5zdXJlQ2hpbGROb2RlKHJvb3RLZXksIHBhcmVudEtleSwgY2hpbGRLZXkpO1xuICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lcyk7XG4gIH1cblxuICBzZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnMpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxhcHNlcyBhbGwgc2VsZWN0ZWQgZGlyZWN0b3J5IG5vZGVzLiBJZiB0aGUgc2VsZWN0aW9uIGlzIGEgc2luZ2xlIGZpbGUgb3IgYSBzaW5nbGUgY29sbGFwc2VkXG4gICAqIGRpcmVjdG9yeSwgdGhlIHNlbGVjdGlvbiBpcyBzZXQgdG8gdGhlIGRpcmVjdG9yeSdzIHBhcmVudC5cbiAgICovXG4gIF9jb2xsYXBzZVNlbGVjdGlvbihkZWVwOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGNvbnN0IGZpcnN0U2VsZWN0ZWROb2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGlmIChzZWxlY3RlZE5vZGVzLnNpemUgPT09IDFcbiAgICAgICYmICFmaXJzdFNlbGVjdGVkTm9kZS5pc1Jvb3RcbiAgICAgICYmICEoZmlyc3RTZWxlY3RlZE5vZGUuaXNDb250YWluZXIgJiYgZmlyc3RTZWxlY3RlZE5vZGUuaXNFeHBhbmRlZCgpKSkge1xuICAgICAgLypcbiAgICAgICAqIFNlbGVjdCB0aGUgcGFyZW50IG9mIHRoZSBzZWxlY3Rpb24gaWYgdGhlIGZvbGxvd2luZyBjcml0ZXJpYSBhcmUgbWV0OlxuICAgICAgICogICAqIE9ubHkgMSBub2RlIGlzIHNlbGVjdGVkXG4gICAgICAgKiAgICogVGhlIG5vZGUgaXMgbm90IGEgcm9vdFxuICAgICAgICogICAqIFRoZSBub2RlIGlzIG5vdCBhbiBleHBhbmRlZCBkaXJlY3RvcnlcbiAgICAgICAqL1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkoZmlyc3RTZWxlY3RlZE5vZGUubm9kZUtleSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIC8vIE9ubHkgZGlyZWN0b3JpZXMgY2FuIGJlIGV4cGFuZGVkLiBTa2lwIG5vbi1kaXJlY3Rvcnkgbm9kZXMuXG4gICAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGVEZWVwKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZShub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9jb2xsYXBzZUFsbCgpOiB2b2lkIHtcbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgcm9vdEtleXMuZm9yRWFjaChyb290S2V5ID0+IHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlRGVlcChyb290S2V5LCByb290S2V5KSk7XG4gIH1cblxuICBfZGVsZXRlU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGlmIChub2Rlcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdFBhdGhzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZS5pc1Jvb3QpO1xuICAgIGlmIChyb290UGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRQYXRocyA9IG5vZGVzLm1hcChub2RlID0+IG5vZGUubm9kZVBhdGgpO1xuICAgICAgY29uc3QgbWVzc2FnZSA9ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoZSBmb2xsb3dpbmcgJyArXG4gICAgICAgICAgKG5vZGVzLnNpemUgPiAxID8gJ2l0ZW1zPycgOiAnaXRlbT8nKTtcbiAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAnRGVsZXRlJzogKCkgPT4geyB0aGlzLl9hY3Rpb25zLmRlbGV0ZVNlbGVjdGVkTm9kZXMoKTsgfSxcbiAgICAgICAgICAnQ2FuY2VsJzogKCkgPT4ge30sXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogYFlvdSBhcmUgZGVsZXRpbmc6JHtvcy5FT0x9JHtzZWxlY3RlZFBhdGhzLmpvaW4ob3MuRU9MKX1gLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgaWYgKHJvb3RQYXRocy5zaXplID09PSAxKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBgVGhlIHJvb3QgZGlyZWN0b3J5ICcke3Jvb3RQYXRocy5maXJzdCgpLm5vZGVOYW1lfScgY2FuJ3QgYmUgcmVtb3ZlZC5gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgcm9vdFBhdGhOYW1lcyA9IHJvb3RQYXRocy5tYXAobm9kZSA9PiBgJyR7bm9kZS5ub2RlTmFtZX0nYCkuam9pbignLCAnKTtcbiAgICAgICAgbWVzc2FnZSA9IGBUaGUgcm9vdCBkaXJlY3RvcmllcyAke3Jvb3RQYXRoTmFtZXN9IGNhbid0IGJlIHJlbW92ZWQuYDtcbiAgICAgIH1cblxuICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgYnV0dG9uczogWydPSyddLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIHNlbGVjdGVkIGRpcmVjdG9yeSBub2Rlcy5cbiAgICovXG4gIF9leHBhbmRTZWxlY3Rpb24oZGVlcDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgLy8gT25seSBkaXJlY3RvcmllcyBjYW4gYmUgZXhwYW5kZWQuIFNraXAgbm9uLWRpcmVjdG9yeSBub2Rlcy5cbiAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZURlZXAobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9tb3ZlRG93bigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFNlbGVjdGVkS2V5ID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChsYXN0U2VsZWN0ZWRLZXkgPT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gc2VsZWN0aW9uIHlldCwgc28gbW92ZSB0byB0aGUgdG9wIG9mIHRoZSB0cmVlLlxuICAgICAgdGhpcy5fbW92ZVRvVG9wKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBhcmVudEtleTtcbiAgICBsZXQgcm9vdEtleTtcbiAgICBsZXQgc2libGluZ0tleXM7XG4gICAgY29uc3QgaXNSb290ID0gdGhpcy5fc3RvcmUuaXNSb290S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgcm9vdEtleSA9IGxhc3RTZWxlY3RlZEtleTtcbiAgICAgIC8vIE90aGVyIHJvb3RzIGFyZSB0aGlzIHJvb3QncyBzaWJsaW5nc1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgICByb290S2V5ID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEZvcktleShsYXN0U2VsZWN0ZWRLZXkpO1xuXG4gICAgICBpbnZhcmlhbnQocm9vdEtleSAmJiBwYXJlbnRLZXkpO1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcm9vdCBkb2VzIG5vdCBleGlzdCBvciBpZiB0aGlzIGlzIGV4cGVjdGVkIHRvIGhhdmUgYSBwYXJlbnQgYnV0IGRvZXNuJ3QgKHJvb3RzIGRvXG4gICAgLy8gbm90IGhhdmUgcGFyZW50cyksIG5vdGhpbmcgY2FuIGJlIGRvbmUuIEV4aXQuXG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCB8fCAoIWlzUm9vdCAmJiBwYXJlbnRLZXkgPT0gbnVsbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChcbiAgICAgIEZpbGVUcmVlSGVscGVycy5pc0RpcktleShsYXN0U2VsZWN0ZWRLZXkpICYmXG4gICAgICB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHJvb3RLZXksIGxhc3RTZWxlY3RlZEtleSkgJiZcbiAgICAgIGNoaWxkcmVuLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIC8vIERpcmVjdG9yeSBpcyBleHBhbmRlZCBhbmQgaXQgaGFzIGNoaWxkcmVuLiBTZWxlY3QgZmlyc3QgY2hpbGQuIEV4aXQuXG4gICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgY2hpbGRyZW5bMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdLZXlzLmluZGV4T2YobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIGNvbnN0IG1heEluZGV4ID0gc2libGluZ0tleXMubGVuZ3RoIC0gMTtcblxuICAgICAgaWYgKGluZGV4IDwgbWF4SW5kZXgpIHtcbiAgICAgICAgY29uc3QgbmV4dFNpYmxpbmdLZXkgPSBzaWJsaW5nS2V5c1tpbmRleCArIDFdO1xuXG4gICAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgbmV4dCBzZWxlY3RlZCBpdGVtIGlzIGFub3RoZXIgcm9vdCwgc2V0IGByb290S2V5YCB0byBpdCBzbyB0cmFja0FuZFNlbGVjdCBmaW5kc1xuICAgICAgICAgIC8vIHRoYXQgW3Jvb3RLZXksIHJvb3RLZXldIHR1cGxlLlxuICAgICAgICAgIHJvb3RLZXkgPSBuZXh0U2libGluZ0tleTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaGFzIGEgbmV4dCBzaWJsaW5nLlxuICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgc2libGluZ0tleXNbaW5kZXggKyAxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZWFyZXN0QW5jZXN0b3JTaWJsaW5nID0gdGhpcy5fZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcocm9vdEtleSwgbGFzdFNlbGVjdGVkS2V5KTtcblxuICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBib3R0b21tb3N0IG5vZGUgb2YgdGhlIHRyZWUsIHRoZXJlIHdvbid0IGJlIGFueXRoaW5nIHRvIHNlbGVjdC5cbiAgICAgICAgLy8gVm9pZCByZXR1cm4gc2lnbmlmaWVzIG5vIG5leHQgbm9kZSB3YXMgZm91bmQuXG4gICAgICAgIGlmIChuZWFyZXN0QW5jZXN0b3JTaWJsaW5nICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUobmVhcmVzdEFuY2VzdG9yU2libGluZy5yb290S2V5LCBuZWFyZXN0QW5jZXN0b3JTaWJsaW5nLm5vZGVLZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX21vdmVVcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFNlbGVjdGVkS2V5ID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChsYXN0U2VsZWN0ZWRLZXkgPT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gc2VsZWN0aW9uLiBNb3ZlIHRvIHRoZSBib3R0b20gb2YgdGhlIHRyZWUuXG4gICAgICB0aGlzLl9tb3ZlVG9Cb3R0b20oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGFyZW50S2V5O1xuICAgIGxldCByb290S2V5O1xuICAgIGxldCBzaWJsaW5nS2V5cztcbiAgICBjb25zdCBpc1Jvb3QgPSB0aGlzLl9zdG9yZS5pc1Jvb3RLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoaXNSb290KSB7XG4gICAgICByb290S2V5ID0gbGFzdFNlbGVjdGVkS2V5O1xuICAgICAgLy8gT3RoZXIgcm9vdHMgYXJlIHRoaXMgcm9vdCdzIHNpYmxpbmdzXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIHJvb3RLZXkgPSB0aGlzLl9zdG9yZS5nZXRSb290Rm9yS2V5KGxhc3RTZWxlY3RlZEtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSByb290IGRvZXMgbm90IGV4aXN0IG9yIGlmIHRoaXMgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhIHBhcmVudCBidXQgZG9lc24ndCAocm9vdHMgZG9cbiAgICAvLyBub3QgaGF2ZSBwYXJlbnRzKSwgbm90aGluZyBjYW4gYmUgZG9uZS4gRXhpdC5cbiAgICBpZiAocm9vdEtleSA9PSBudWxsIHx8ICghaXNSb290ICYmIHBhcmVudEtleSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgaWYgKCFpc1Jvb3QgJiYgcGFyZW50S2V5ICE9IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgY2hpbGQuIEl0IGhhcyBhIHBhcmVudC4gU2VsZWN0IHRoZSBwYXJlbnQuXG4gICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgICAgfVxuICAgICAgLy8gVGhpcyBpcyB0aGUgcm9vdCBhbmQvb3IgdGhlIHRvcCBvZiB0aGUgdHJlZSAoaGFzIG5vIHBhcmVudCkuIE5vdGhpbmcgZWxzZSB0byB0cmF2ZXJzZS5cbiAgICAgIC8vIEV4aXQuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzU2libGluZ0tleSA9IHNpYmxpbmdLZXlzW2luZGV4IC0gMV07XG5cbiAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgLy8gSWYgdHJhdmVyc2luZyB1cCB0byBhIGRpZmZlcmVudCByb290LCB0aGUgcm9vdEtleSBtdXN0IGJlY29tZSB0aGF0IG5ldyByb290IHRvIGNoZWNrXG4gICAgICAgIC8vIGV4cGFuZGVkIGtleXMgaW4gaXQuXG4gICAgICAgIHJvb3RLZXkgPSBwcmV2aW91c1NpYmxpbmdLZXk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShcbiAgICAgICAgcm9vdEtleSxcbiAgICAgICAgdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleSwgcHJldmlvdXNTaWJsaW5nS2V5KVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfbW92ZVRvVG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXlzWzBdLCByb290S2V5c1swXSk7XG4gIH1cblxuICBfbW92ZVRvQm90dG9tKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3QgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50IG9mIHRoZSBsYXN0IHJvb3Qgbm9kZS5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgY29uc3QgbGFzdFJvb3RLZXkgPSByb290S2V5c1tyb290S2V5cy5sZW5ndGggLSAxXTtcbiAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUoXG4gICAgICBsYXN0Um9vdEtleSxcbiAgICAgIHRoaXMuX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KGxhc3RSb290S2V5LCBsYXN0Um9vdEtleSlcbiAgICApO1xuICB9XG5cbiAgLypcbiAgICogUmV0dXJucyB0aGUgbG93ZXJtb3N0IGRlc2NlbmRhbnQgd2hlbiBjb25zaWRlcmVkIGluIGZpbGUgc3lzdGVtIG9yZGVyIHdpdGggZXhwYW5kYWJsZVxuICAgKiBkaXJlY3Rvcmllcy4gRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqICAgQSA+XG4gICAqICAgICBCID5cbiAgICogICAgIEMgPlxuICAgKiAgICAgICBFLnR4dFxuICAgKiAgICAgRC5mb29cbiAgICpcbiAgICogICA+IF9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShBKVxuICAgKiAgIEQuZm9vXG4gICAqXG4gICAqIFRob3VnaCBBIGhhcyBtb3JlIGRlZXBseS1uZXN0ZWQgZGVzY2VuZGFudHMgdGhhbiBELmZvbywgbGlrZSBFLnR4dCwgRC5mb28gaXMgbG93ZXJtb3N0IHdoZW5cbiAgICogY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlci5cbiAgICovXG4gIF9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCEoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KG5vZGVLZXkpICYmIHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQocm9vdEtleSwgbm9kZUtleSkpKSB7XG4gICAgICAvLyBJZiBgbm9kZUtleWAgaXMgbm90IGFuIGV4cGFuZGVkIGRpcmVjdG9yeSB0aGVyZSBhcmUgbm8gbW9yZSBkZXNjZW5kYW50cyB0byB0cmF2ZXJzZS4gUmV0dXJuXG4gICAgICAvLyB0aGUgYG5vZGVLZXlgLlxuICAgICAgcmV0dXJuIG5vZGVLZXk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChjaGlsZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGhhcyBubyBjaGlsZHJlbiwgdGhlIGRpcmVjdG9yeSBpdHNlbGYgaXMgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50LlxuICAgICAgcmV0dXJuIG5vZGVLZXk7XG4gICAgfVxuXG4gICAgLy8gVGhlcmUncyBhdCBsZWFzdCBvbmUgY2hpbGQuIFJlY3Vyc2UgZG93biB0aGUgbGFzdCBjaGlsZC5cbiAgICByZXR1cm4gdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleSwgY2hpbGRLZXlzW2NoaWxkS2V5cy5sZW5ndGggLSAxXSk7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm5zIHRoZSBuZWFyZXN0IFwiYW5jZXN0b3Igc2libGluZ1wiIHdoZW4gY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlciB3aXRoIGV4cGFuZGFibGVcbiAgICogZGlyZWN0b3JpZXMuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiAgIEEgPlxuICAgKiAgICAgQiA+XG4gICAqICAgICAgIEMgPlxuICAgKiAgICAgICAgIEUudHh0XG4gICAqICAgRC5mb29cbiAgICpcbiAgICogICA+IF9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhFLnR4dClcbiAgICogICBELmZvb1xuICAgKi9cbiAgX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogP0ZpbGVUcmVlTm9kZURhdGEge1xuICAgIGxldCBwYXJlbnRLZXk7XG4gICAgbGV0IHNpYmxpbmdLZXlzO1xuICAgIGNvbnN0IGlzUm9vdCA9IHJvb3RLZXkgPT09IG5vZGVLZXk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgLy8gYHJvb3RLZXkgPT09IG5vZGVLZXlgIG1lYW5zIHRoaXMgaGFzIHJlY3Vyc2VkIHRvIGEgcm9vdC4gYG5vZGVLZXlgIGlzIGEgcm9vdCBrZXkuXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobm9kZUtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihub2RlS2V5KTtcbiAgICBpZiAoaW5kZXggPCAoc2libGluZ0tleXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZ0tleXNbaW5kZXggKyAxXTtcbiAgICAgIC8vIElmIHRyYXZlcnNpbmcgYWNyb3NzIHJvb3RzLCB0aGUgbmV4dCBzaWJsaW5nIGlzIGFsc28gdGhlIG5leHQgcm9vdC4gUmV0dXJuIGl0IGFzIHRoZSBuZXh0XG4gICAgICAvLyByb290IGtleSBhcyB3ZWxsIGFzIHRoZSBuZXh0IG5vZGUga2V5LlxuICAgICAgcmV0dXJuIGlzUm9vdFxuICAgICAgICA/IHtub2RlS2V5OiBuZXh0U2libGluZywgcm9vdEtleTogbmV4dFNpYmxpbmd9XG4gICAgICAgIDoge25vZGVLZXk6IG5leHRTaWJsaW5nLCByb290S2V5fTtcbiAgICB9IGVsc2UgaWYgKHBhcmVudEtleSAhPSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBhIHBhcmVudCB0byByZWN1cnNlLiBSZXR1cm4gaXRzIG5lYXJlc3QgYW5jZXN0b3Igc2libGluZy5cbiAgICAgIHJldHVybiB0aGlzLl9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBgcGFyZW50S2V5YCBpcyBudWxsLCBub2RlS2V5IGlzIGEgcm9vdCBhbmQgaGFzIG1vcmUgcGFyZW50cyB0byByZWN1cnNlLiBSZXR1cm4gYG51bGxgIHRvXG4gICAgICAvLyBzaWduaWZ5IG5vIGFwcHJvcHJpYXRlIGtleSB3YXMgZm91bmQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnkoKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgLy8gT25seSBwZXJmb3JtIHRoZSBkZWZhdWx0IGFjdGlvbiBpZiBhIHNpbmdsZSBub2RlIGlzIHNlbGVjdGVkLlxuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aW9ucy5jb25maXJtTm9kZShzaW5nbGVTZWxlY3RlZE5vZGUucm9vdEtleSwgc2luZ2xlU2VsZWN0ZWROb2RlLm5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KG9yaWVudGF0aW9uOiBhdG9tJFBhbmVTcGxpdE9yaWVudGF0aW9uLCBzaWRlOiBhdG9tJFBhbmVTcGxpdFNpZGUpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAvLyBPbmx5IHBlcmZvcm0gdGhlIGRlZmF1bHQgYWN0aW9uIGlmIGEgc2luZ2xlIG5vZGUgaXMgc2VsZWN0ZWQuXG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsICYmICFzaW5nbGVTZWxlY3RlZE5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgIC8vIGZvcjogaXMgdGhpcyBmZWF0dXJlIHVzZWQgZW5vdWdoIHRvIGp1c3RpZnkgdW5jb2xsYXBzaW5nP1xuICAgICAgdHJhY2soJ2ZpbGV0cmVlLXNwbGl0LWZpbGUnLCB7XG4gICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICBzaWRlLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9hY3Rpb25zLm9wZW5TZWxlY3RlZEVudHJ5U3BsaXQoXG4gICAgICAgIHNpbmdsZVNlbGVjdGVkTm9kZS5ub2RlS2V5LFxuICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgc2lkZSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCd2ZXJ0aWNhbCcsICdiZWZvcmUnKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bigpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCd2ZXJ0aWNhbCcsICdhZnRlcicpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRMZWZ0KCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ2hvcml6b250YWwnLCAnYmVmb3JlJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0KCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ2hvcml6b250YWwnLCAnYWZ0ZXInKTtcbiAgfVxuXG4gIF9yZW1vdmVSb290Rm9sZGVyU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKHJvb3ROb2RlICE9IG51bGwgJiYgcm9vdE5vZGUuaXNSb290KSB7XG4gICAgICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aChyb290Tm9kZS5ub2RlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX3NlYXJjaEluRGlyZWN0b3J5KGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIC8vIERpc3BhdGNoIGEgY29tbWFuZCB0byBzaG93IHRoZSBgUHJvamVjdEZpbmRWaWV3YC4gVGhpcyBvcGVucyB0aGUgdmlldyBhbmQgZm9jdXNlcyB0aGUgc2VhcmNoXG4gICAgLy8gYm94LlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAoKGV2ZW50LnRhcmdldDogYW55KTogSFRNTEVsZW1lbnQpLFxuICAgICAgJ3Byb2plY3QtZmluZDpzaG93LWluLWN1cnJlbnQtZGlyZWN0b3J5J1xuICAgICk7XG4gIH1cblxuICBfc2hvd0luRmlsZU1hbmFnZXIoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIC8vIE9ubHkgYWxsb3cgcmV2ZWFsaW5nIGEgc2luZ2xlIGRpcmVjdG9yeS9maWxlIGF0IGEgdGltZS4gUmV0dXJuIG90aGVyd2lzZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihub2RlLm5vZGVQYXRoKTtcbiAgfVxuXG4gIF9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBTZWxlY3QgdGhlIG5vZGUgYmVmb3JlIHRyYWNraW5nIGl0IGJlY2F1c2Ugc2V0dGluZyBhIG5ldyBzZWxlY3Rpb24gY2xlYXJzIHRoZSB0cmFja2VkIG5vZGUuXG4gICAgdGhpcy5fYWN0aW9ucy5zZWxlY3RTaW5nbGVOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VHJhY2tlZE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBfY29weUZ1bGxQYXRoKCk6IHZvaWQge1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCkge1xuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoc2luZ2xlU2VsZWN0ZWROb2RlLmdldExvY2FsUGF0aCgpKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGZvciAoY29uc3QgZGlzcG9zYWJsZSBvZiB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5LnZhbHVlcygpKSB7XG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fc3RvcmUucmVzZXQoKTtcbiAgICBSZWFjdC51bm1vdW50Q29tcG9uZW50QXROb2RlKHRoaXMuX3BhbmVsRWxlbWVudCk7XG4gICAgdGhpcy5fcGFuZWwuZGVzdHJveSgpO1xuICAgIHRoaXMuX2NvbnRleHRNZW51LmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBGaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHBhbmVsOiB7XG4gICAgICAgIGlzVmlzaWJsZTogdGhpcy5faXNWaXNpYmxlLFxuICAgICAgICB3aWR0aDogdGhpcy5fZmlsZVRyZWVQYW5lbC5nZXRMZW5ndGgoKSxcbiAgICAgIH0sXG4gICAgICB0cmVlOiB0aGlzLl9zdG9yZS5leHBvcnREYXRhKCksXG4gICAgfTtcbiAgfVxufVxuXG5jbGFzcyBGaWxlVHJlZVBhbmVsIGV4dGVuZHMgUmVhY3QuQ29tcG9uZW50IHtcbiAgc3RhdGljIHByb3BUeXBlcyA9IHtcbiAgICBpbml0aWFsV2lkdGg6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgc3RvcmU6IFByb3BUeXBlcy5pbnN0YW5jZU9mKEZpbGVUcmVlU3RvcmUpLmlzUmVxdWlyZWQsXG4gIH07XG5cbiAgcmVuZGVyKCkge1xuICAgIHJldHVybiAoXG4gICAgICA8UGFuZWxDb21wb25lbnRcbiAgICAgICAgZG9jaz1cImxlZnRcIlxuICAgICAgICBpbml0aWFsTGVuZ3RoPXt0aGlzLnByb3BzLmluaXRpYWxXaWR0aH1cbiAgICAgICAgcmVmPVwicGFuZWxcIj5cbiAgICAgICAgPEZpbGVUcmVlIHN0b3JlPXt0aGlzLnByb3BzLnN0b3JlfSAvPlxuICAgICAgPC9QYW5lbENvbXBvbmVudD5cbiAgICApO1xuICB9XG5cbiAgZ2V0RmlsZVRyZWUoKTogRmlsZVRyZWUge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ3BhbmVsJ10uZ2V0Q2hpbGRDb21wb25lbnQoKTtcbiAgfVxuXG4gIGdldExlbmd0aCgpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLnJlZnNbJ3BhbmVsJ10uZ2V0TGVuZ3RoKCk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZUNvbnRyb2xsZXI7XG4iXX0=