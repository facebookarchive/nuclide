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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

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

var _nuclideCommons = require('../../nuclide-commons');

var _nuclideAnalytics = require('../../nuclide-analytics');

var _nuclideAtomHelpers = require('../../nuclide-atom-helpers');

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var NOT_LETTERS = /[^a-zA-Z]/g;
var PREFIX_RESET_DELAY = 500;

var FileTreeController = (function () {
  function FileTreeController(state) {
    var _this = this;

    _classCallCheck(this, FileTreeController);

    this._actions = _FileTreeActions2['default'].getInstance();
    this._store = _FileTreeStore2['default'].getInstance();
    this._repositories = new _immutable2['default'].Set();
    this._subscriptionForRepository = new _immutable2['default'].Map();
    this._subscriptions = new _atom.CompositeDisposable(new _atom.Disposable(function () {
      if (_this._cwdApiSubscription != null) {
        _this._cwdApiSubscription.dispose();
      }
    }));
    // Initial root directories
    this._updateRootDirectories();
    // Subsequent root directories updated on change
    this._subscriptions.add(atom.project.onDidChangePaths(function () {
      return _this._updateRootDirectories();
    }));

    this._subscriptions.add(atom.commands.add('atom-workspace', {
      // Pass undefined so the default parameter gets used.
      // NOTE: This is specifically for use in Diff View, so don't expose a menu item.
      /* eslint-disable nuclide-internal/command-menu-items */
      'nuclide-file-tree:reveal-text-editor': this._revealTextEditor.bind(this),
      /* eslint-enable nuclide-internal/command-menu-items */
      'nuclide-file-tree:reveal-active-file': this.revealActiveFile.bind(this, undefined)
    }));
    var letterKeyBindings = {};
    var zCharCode = 'z'.charCodeAt(0);
    for (var c = 'a'.charCodeAt(0); c <= zCharCode; c++) {
      var char = String.fromCharCode(c);
      letterKeyBindings['nuclide-file-tree:go-to-letter-' + char] = this._handlePrefixKeypress.bind(this, char);
    }
    this._subscriptions.add(atom.commands.add(_FileTreeConstants.EVENT_HANDLER_SELECTOR, _extends({
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
      'nuclide-file-tree:show-in-file-manager': this._showInFileManager.bind(this),
      'nuclide-file-tree:set-current-working-root': this._setCwdToSelection.bind(this)
    }, letterKeyBindings)));
    this._subscriptions.add(atom.commands.add('[is="tabs-tab"]', {
      'nuclide-file-tree:reveal-tab-file': this._revealTabFileOnClick.bind(this)
    }));
    if (state && state.tree) {
      this._store.loadData(state.tree);
    }
    this._contextMenu = new _FileTreeContextMenu2['default']();
    this._prefixTimeout = null;
    this._prefix = '';
  }

  _createClass(FileTreeController, [{
    key: '_handlePrefixKeypress',
    value: function _handlePrefixKeypress(letter) {
      var _this2 = this;

      if (!this._store.usePrefixNav()) {
        return;
      }
      if (this._prefixTimeout != null) {
        clearTimeout(this._prefixTimeout);
        this._prefixTimeout = null;
      }
      var prefix = this._prefix + letter;
      if (this._didRevealNodeStartingWith(prefix)) {
        // Only append the prefix string if a match exists to allow for typos.
        this._prefix = prefix;
      }
      this._prefixTimeout = setTimeout(function () {
        _this2._prefix = '';
        _this2._prefixTimeout = null;
      }, PREFIX_RESET_DELAY);
    }

    // Returns whether a node matching the prefix was successfully selected.
  }, {
    key: '_didRevealNodeStartingWith',
    value: function _didRevealNodeStartingWith(prefix) {
      var nodes = this._store.getSelectedNodes();
      var firstSelectedNode = nodes.values().next().value;
      if (firstSelectedNode == null || firstSelectedNode.isRoot) {
        return false;
      }
      var targetNode = _nuclideCommons.array.find(firstSelectedNode.getParentNode().getChildNodes(), function (childNode) {
        return childNode.nodeName.toLowerCase().replace(NOT_LETTERS, '').startsWith(prefix);
      });
      if (targetNode == null) {
        return false;
      }
      this.revealNodeKey(targetNode.nodeKey);
      return true;
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
    key: '_revealTextEditor',
    value: function _revealTextEditor(event) {
      var editorElement = event.target;
      if (editorElement == null || typeof editorElement.getModel !== 'function' || !(0, _nuclideAtomHelpers.isTextEditor)(editorElement.getModel())) {
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
      var _this3 = this;

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
        _this3._actions.ensureChildNode(rootKey, parentKey, childKey);
        _this3._actions.expandNode(rootKey, parentKey);
      });
      this._selectAndTrackNode(rootKey, nodeKey);
    }
  }, {
    key: '_setCwdToSelection',
    value: function _setCwdToSelection() {
      var node = this._store.getSingleSelectedNode();
      if (node == null) {
        return;
      }
      var path = _FileTreeHelpers2['default'].keyToPath(node.rootKey);
      if (this._cwdApi != null) {
        this._cwdApi.setCwd(path);
      }
    }
  }, {
    key: 'setCwdApi',
    value: function setCwdApi(cwdApi) {
      var _this4 = this;

      if (cwdApi == null) {
        this._actions.setCwd(null);
        this._cwdApiSubscription = null;
      } else {
        (0, _assert2['default'])(this._cwdApiSubscription == null);
        this._cwdApiSubscription = cwdApi.observeCwd(function (directory) {
          var path = directory == null ? null : directory.getPath();
          var rootKey = path && _FileTreeHelpers2['default'].dirPathToKey(path);
          _this4._actions.setCwd(rootKey);
        });
      }

      this._cwdApi = cwdApi;
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
  }, {
    key: 'setUsePrefixNav',
    value: function setUsePrefixNav(usePrefixNav) {
      this._actions.setUsePrefixNav(usePrefixNav);
    }
  }, {
    key: 'updateWorkingSet',
    value: function updateWorkingSet(workingSet) {
      this._actions.updateWorkingSet(workingSet);
    }
  }, {
    key: 'updateWorkingSetsStore',
    value: function updateWorkingSetsStore(workingSetsStore) {
      this._actions.updateWorkingSetsStore(workingSetsStore);
    }
  }, {
    key: 'updateOpenFilesWorkingSet',
    value: function updateOpenFilesWorkingSet(openFilesWorkingSet) {
      this._actions.updateOpenFilesWorkingSet(openFilesWorkingSet);
    }

    /**
     * Collapses all selected directory nodes. If the selection is a single file or a single collapsed
     * directory, the selection is set to the directory's parent.
     */
  }, {
    key: '_collapseSelection',
    value: function _collapseSelection() {
      var _this5 = this;

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
            _this5._actions.collapseNodeDeep(node.rootKey, node.nodeKey);
          } else {
            _this5._actions.collapseNode(node.rootKey, node.nodeKey);
          }
        });
      }
    }
  }, {
    key: '_collapseAll',
    value: function _collapseAll() {
      var _this6 = this;

      var rootKeys = this._store.getRootKeys();
      rootKeys.forEach(function (rootKey) {
        return _this6._actions.collapseNodeDeep(rootKey, rootKey);
      });
    }
  }, {
    key: '_deleteSelection',
    value: function _deleteSelection() {
      var _this7 = this;

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
              _this7._actions.deleteSelectedNodes();
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
      var _this8 = this;

      this._store.getSelectedNodes().forEach(function (node) {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        if (deep) {
          _this8._actions.expandNodeDeep(node.rootKey, node.nodeKey);
        } else {
          if (node.isExpanded()) {
            // Node is already expanded; move the selection to the first child.

            var _node$getChildKeys = node.getChildKeys();

            var _node$getChildKeys2 = _slicedToArray(_node$getChildKeys, 1);

            var firstChildKey = _node$getChildKeys2[0];

            if (firstChildKey != null) {
              _this8.revealNodeKey(firstChildKey);
            }
          } else {
            _this8._actions.expandNode(node.rootKey, node.nodeKey);
          }
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
        (0, _nuclideAnalytics.track)('filetree-split-file', {
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
      var _this9 = this;

      var rootNode = this._store.getSingleSelectedNode();
      if (rootNode != null && rootNode.isRoot) {
        (function () {
          // close all the files associated with the project before closing
          var projectEditors = atom.workspace.getTextEditors();
          var roots = _this9._store.getRootKeys();
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
      clearTimeout(this._prefixTimeout);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWM4QyxNQUFNOztpQ0FDZCxxQkFBcUI7O2lDQUM3QixxQkFBcUI7Ozs7K0JBQ3ZCLG1CQUFtQjs7OzttQ0FDZix1QkFBdUI7Ozs7K0JBQzNCLG1CQUFtQjs7Ozs2QkFDckIsaUJBQWlCOzs7O3lCQUNyQixXQUFXOzs7OzhCQUNiLHVCQUF1Qjs7Z0NBQ3ZCLHlCQUF5Qjs7a0NBQ2xCLDRCQUE0Qjs7a0JBRXhDLElBQUk7Ozs7cUJBQ0QsT0FBTzs7OztzQkFFSCxRQUFROzs7O0FBYzlCLElBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQztBQUNqQyxJQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQzs7SUFFekIsa0JBQWtCO0FBWVgsV0FaUCxrQkFBa0IsQ0FZVixLQUErQixFQUFFOzs7MEJBWnpDLGtCQUFrQjs7QUFhcEIsUUFBSSxDQUFDLFFBQVEsR0FBRyw2QkFBZ0IsV0FBVyxFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLE1BQU0sR0FBRywyQkFBYyxXQUFXLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksdUJBQVUsR0FBRyxFQUFFLENBQUM7QUFDekMsUUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksdUJBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEQsUUFBSSxDQUFDLGNBQWMsR0FBRyw4QkFDcEIscUJBQWUsWUFBTTtBQUNuQixVQUFJLE1BQUssbUJBQW1CLElBQUksSUFBSSxFQUFFO0FBQ3BDLGNBQUssbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDcEM7S0FDRixDQUFDLENBQ0gsQ0FBQzs7QUFFRixRQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzs7QUFFOUIsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFBTSxNQUFLLHNCQUFz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UztBQUNkLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsV0FBSyxJQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDakUsa0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN0QjtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDcEIsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixrQkFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNuQzs7O1dBRVEscUJBQTRCO0FBQ25DLGFBQU87QUFDTCxZQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7T0FDL0IsQ0FBQztLQUNIOzs7U0E5dUJHLGtCQUFrQjs7O0FBaXZCeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZUNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q3dkQXBpfSBmcm9tICcuLi8uLi9udWNsaWRlLWN1cnJlbnQtd29ya2luZy1kaXJlY3RvcnkvbGliL0N3ZEFwaSc7XG5pbXBvcnQgdHlwZSB7RXhwb3J0U3RvcmVEYXRhfSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtFVkVOVF9IQU5ETEVSX1NFTEVDVE9SfSAgZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQgRmlsZVN5c3RlbUFjdGlvbnMgZnJvbSAnLi9GaWxlU3lzdGVtQWN0aW9ucyc7XG5pbXBvcnQgRmlsZVRyZWVBY3Rpb25zIGZyb20gJy4vRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCBGaWxlVHJlZUNvbnRleHRNZW51IGZyb20gJy4vRmlsZVRyZWVDb250ZXh0TWVudSc7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtpc1RleHRFZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcblxuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cy9saWIvV29ya2luZ1NldHNTdG9yZSc7XG5cbnR5cGUgRmlsZVRyZWVOb2RlRGF0YSA9IHtcbiAgbm9kZUtleTogc3RyaW5nO1xuICByb290S2V5OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBGaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSA9IHtcbiAgdHJlZTogRXhwb3J0U3RvcmVEYXRhO1xufTtcblxuY29uc3QgTk9UX0xFVFRFUlMgPSAvW15hLXpBLVpdL2c7XG5jb25zdCBQUkVGSVhfUkVTRVRfREVMQVkgPSA1MDA7XG5cbmNsYXNzIEZpbGVUcmVlQ29udHJvbGxlciB7XG4gIF9hY3Rpb25zOiBGaWxlVHJlZUFjdGlvbnM7XG4gIF9jb250ZXh0TWVudTogRmlsZVRyZWVDb250ZXh0TWVudTtcbiAgX2N3ZEFwaTogP0N3ZEFwaTtcbiAgX2N3ZEFwaVN1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuICBfcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT47XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgSURpc3Bvc2FibGU+O1xuICBfcHJlZml4OiBzdHJpbmc7XG4gIF9wcmVmaXhUaW1lb3V0OiA/bnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUpIHtcbiAgICB0aGlzLl9hY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yaWVzID0gbmV3IEltbXV0YWJsZS5TZXQoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gbmV3IEltbXV0YWJsZS5NYXAoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2N3ZEFwaVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gICAgLy8gSW5pdGlhbCByb290IGRpcmVjdG9yaWVzXG4gICAgdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCk7XG4gICAgLy8gU3Vic2VxdWVudCByb290IGRpcmVjdG9yaWVzIHVwZGF0ZWQgb24gY2hhbmdlXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB0aGlzLl91cGRhdGVSb290RGlyZWN0b3JpZXMoKSlcbiAgICApO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgIC8vIFBhc3MgdW5kZWZpbmVkIHNvIHRoZSBkZWZhdWx0IHBhcmFtZXRlciBnZXRzIHVzZWQuXG4gICAgICAgIC8vIE5PVEU6IFRoaXMgaXMgc3BlY2lmaWNhbGx5IGZvciB1c2UgaW4gRGlmZiBWaWV3LCBzbyBkb24ndCBleHBvc2UgYSBtZW51IGl0ZW0uXG4gICAgICAgIC8qIGVzbGludC1kaXNhYmxlIG51Y2xpZGUtaW50ZXJuYWwvY29tbWFuZC1tZW51LWl0ZW1zICovXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtdGV4dC1lZGl0b3InOiB0aGlzLl9yZXZlYWxUZXh0RWRpdG9yLmJpbmQodGhpcyksXG4gICAgICAgIC8qIGVzbGludC1lbmFibGUgbnVjbGlkZS1pbnRlcm5hbC9jb21tYW5kLW1lbnUtaXRlbXMgKi9cbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJldmVhbC1hY3RpdmUtZmlsZSc6IHRoaXMucmV2ZWFsQWN0aXZlRmlsZS5iaW5kKHRoaXMsIHVuZGVmaW5lZCksXG4gICAgICB9KVxuICAgICk7XG4gICAgY29uc3QgbGV0dGVyS2V5QmluZGluZ3MgPSB7fTtcbiAgICBjb25zdCB6Q2hhckNvZGUgPSAneicuY2hhckNvZGVBdCgwKTtcbiAgICBmb3IgKGxldCBjID0gJ2EnLmNoYXJDb2RlQXQoMCk7IGMgPD0gekNoYXJDb2RlOyBjKyspIHtcbiAgICAgIGNvbnN0IGNoYXIgPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGMpO1xuICAgICAgbGV0dGVyS2V5QmluZGluZ3NbYG51Y2xpZGUtZmlsZS10cmVlOmdvLXRvLWxldHRlci0ke2NoYXJ9YF0gPVxuICAgICAgICB0aGlzLl9oYW5kbGVQcmVmaXhLZXlwcmVzcy5iaW5kKHRoaXMsIGNoYXIpO1xuICAgIH1cbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKEVWRU5UX0hBTkRMRVJfU0VMRUNUT1IsIHtcbiAgICAgICAgJ2NvcmU6bW92ZS1kb3duJzogdGhpcy5fbW92ZURvd24uYmluZCh0aGlzKSxcbiAgICAgICAgJ2NvcmU6bW92ZS11cCc6IHRoaXMuX21vdmVVcC5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXRvLXRvcCc6IHRoaXMuX21vdmVUb1RvcC5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXRvLWJvdHRvbSc6IHRoaXMuX21vdmVUb0JvdHRvbS5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6YWRkLWZpbGUnOiAoKSA9PiB7XG4gICAgICAgICAgRmlsZVN5c3RlbUFjdGlvbnMub3BlbkFkZEZpbGVEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbEZpbGVQYXRoLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6YWRkLWZvbGRlcic6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuQWRkRm9sZGVyRGlhbG9nKHRoaXMuX29wZW5BbmRSZXZlYWxEaXJlY3RvcnlQYXRoLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6Y29sbGFwc2UtZGlyZWN0b3J5JzogdGhpcy5fY29sbGFwc2VTZWxlY3Rpb24uYmluZCh0aGlzLCAvKmRlZXAqLyBmYWxzZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZWN1cnNpdmUtY29sbGFwc2UtZGlyZWN0b3J5JzogdGhpcy5fY29sbGFwc2VTZWxlY3Rpb24uYmluZCh0aGlzLCB0cnVlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1jb2xsYXBzZS1hbGwnOiB0aGlzLl9jb2xsYXBzZUFsbC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6Y29weS1mdWxsLXBhdGgnOiB0aGlzLl9jb3B5RnVsbFBhdGguYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmV4cGFuZC1kaXJlY3RvcnknOiB0aGlzLl9leHBhbmRTZWxlY3Rpb24uYmluZCh0aGlzLCAvKmRlZXAqLyBmYWxzZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZWN1cnNpdmUtZXhwYW5kLWRpcmVjdG9yeSc6IHRoaXMuX2V4cGFuZFNlbGVjdGlvbi5iaW5kKHRoaXMsIHRydWUpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeSc6IHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXVwJzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0VXAuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktZG93bic6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdERvd24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktbGVmdCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdExlZnQuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktcmlnaHQnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRSaWdodC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlJzogdGhpcy5fZGVsZXRlU2VsZWN0aW9uLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUtcHJvamVjdC1mb2xkZXItc2VsZWN0aW9uJzpcbiAgICAgICAgICB0aGlzLl9yZW1vdmVSb290Rm9sZGVyU2VsZWN0aW9uLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW5hbWUtc2VsZWN0aW9uJzogKCkgPT4gRmlsZVN5c3RlbUFjdGlvbnMub3BlblJlbmFtZURpYWxvZygpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6ZHVwbGljYXRlLXNlbGVjdGlvbic6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuRHVwbGljYXRlRGlhbG9nKHRoaXMuX29wZW5BbmRSZXZlYWxGaWxlUGF0aC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnNlYXJjaC1pbi1kaXJlY3RvcnknOiB0aGlzLl9zZWFyY2hJbkRpcmVjdG9yeS5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6c2hvdy1pbi1maWxlLW1hbmFnZXInOiB0aGlzLl9zaG93SW5GaWxlTWFuYWdlci5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6c2V0LWN1cnJlbnQtd29ya2luZy1yb290JzogdGhpcy5fc2V0Q3dkVG9TZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgLi4ubGV0dGVyS2V5QmluZGluZ3MsXG4gICAgICB9KVxuICAgICk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnW2lzPVwidGFicy10YWJcIl0nLCB7XG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtdGFiLWZpbGUnOiB0aGlzLl9yZXZlYWxUYWJGaWxlT25DbGljay5iaW5kKHRoaXMpLFxuICAgICAgfSlcbiAgICApO1xuICAgIGlmIChzdGF0ZSAmJiBzdGF0ZS50cmVlKSB7XG4gICAgICB0aGlzLl9zdG9yZS5sb2FkRGF0YShzdGF0ZS50cmVlKTtcbiAgICB9XG4gICAgdGhpcy5fY29udGV4dE1lbnUgPSBuZXcgRmlsZVRyZWVDb250ZXh0TWVudSgpO1xuICAgIHRoaXMuX3ByZWZpeFRpbWVvdXQgPSBudWxsO1xuICAgIHRoaXMuX3ByZWZpeCA9ICcnO1xuICB9XG5cbiAgX2hhbmRsZVByZWZpeEtleXByZXNzKGxldHRlcjogc3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9zdG9yZS51c2VQcmVmaXhOYXYoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodGhpcy5fcHJlZml4VGltZW91dCAhPSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcHJlZml4VGltZW91dCk7XG4gICAgICB0aGlzLl9wcmVmaXhUaW1lb3V0ID0gbnVsbDtcbiAgICB9XG4gICAgY29uc3QgcHJlZml4ID0gdGhpcy5fcHJlZml4ICsgbGV0dGVyO1xuICAgIGlmICh0aGlzLl9kaWRSZXZlYWxOb2RlU3RhcnRpbmdXaXRoKHByZWZpeCkpIHtcbiAgICAgIC8vIE9ubHkgYXBwZW5kIHRoZSBwcmVmaXggc3RyaW5nIGlmIGEgbWF0Y2ggZXhpc3RzIHRvIGFsbG93IGZvciB0eXBvcy5cbiAgICAgIHRoaXMuX3ByZWZpeCA9IHByZWZpeDtcbiAgICB9XG4gICAgdGhpcy5fcHJlZml4VGltZW91dCA9IHNldFRpbWVvdXQoXG4gICAgICAoKSA9PiB7XG4gICAgICAgIHRoaXMuX3ByZWZpeCA9ICcnO1xuICAgICAgICB0aGlzLl9wcmVmaXhUaW1lb3V0ID0gbnVsbDtcbiAgICAgIH0sXG4gICAgICBQUkVGSVhfUkVTRVRfREVMQVlcbiAgICApO1xuICB9XG5cbiAgLy8gUmV0dXJucyB3aGV0aGVyIGEgbm9kZSBtYXRjaGluZyB0aGUgcHJlZml4IHdhcyBzdWNjZXNzZnVsbHkgc2VsZWN0ZWQuXG4gIF9kaWRSZXZlYWxOb2RlU3RhcnRpbmdXaXRoKHByZWZpeDogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgY29uc3Qgbm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgY29uc3QgZmlyc3RTZWxlY3RlZE5vZGUgPSBub2Rlcy52YWx1ZXMoKS5uZXh0KCkudmFsdWU7XG4gICAgaWYgKGZpcnN0U2VsZWN0ZWROb2RlID09IG51bGwgfHwgZmlyc3RTZWxlY3RlZE5vZGUuaXNSb290KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGNvbnN0IHRhcmdldE5vZGUgPSBhcnJheS5maW5kKFxuICAgICAgZmlyc3RTZWxlY3RlZE5vZGUuZ2V0UGFyZW50Tm9kZSgpLmdldENoaWxkTm9kZXMoKSxcbiAgICAgIGNoaWxkTm9kZSA9PiBjaGlsZE5vZGUubm9kZU5hbWUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKE5PVF9MRVRURVJTLCAnJykuc3RhcnRzV2l0aChwcmVmaXgpXG4gICAgKTtcbiAgICBpZiAodGFyZ2V0Tm9kZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHRoaXMucmV2ZWFsTm9kZUtleSh0YXJnZXROb2RlLm5vZGVLZXkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxGaWxlUGF0aChmaWxlUGF0aDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChmaWxlUGF0aCAhPSBudWxsKSB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxEaXJlY3RvcnlQYXRoKHBhdGg6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAocGF0aCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShwYXRoKSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgcmVtb3RlLXByb2plY3RzIHBhY2thZ2UgaGFzbid0IGxvYWRlZCB5ZXQgcmVtb3RlIGRpcmVjdG9yaWVzIHdpbGwgYmUgaW5zdGFudGlhdGVkIGFzXG4gICAgLy8gbG9jYWwgZGlyZWN0b3JpZXMgYnV0IHdpdGggaW52YWxpZCBwYXRocy4gV2UgbmVlZCB0byBleGNsdWRlIHRob3NlLlxuICAgIGNvbnN0IHJvb3REaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcihkaXJlY3RvcnkgPT4gKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmlzVmFsaWREaXJlY3RvcnkoZGlyZWN0b3J5KVxuICAgICkpO1xuICAgIGNvbnN0IHJvb3RLZXlzID0gcm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKTtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFJvb3RLZXlzKHJvb3RLZXlzKTtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVJlcG9zaXRvcmllcyhyb290RGlyZWN0b3JpZXMpO1xuICB9XG5cbiAgX3JldmVhbFRleHRFZGl0b3IoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yRWxlbWVudCA9ICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50KTtcbiAgICBpZiAoXG4gICAgICBlZGl0b3JFbGVtZW50ID09IG51bGxcbiAgICAgIHx8IHR5cGVvZiBlZGl0b3JFbGVtZW50LmdldE1vZGVsICE9PSAnZnVuY3Rpb24nXG4gICAgICB8fCAhaXNUZXh0RWRpdG9yKGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRQYXRoKCk7XG4gICAgdGhpcy5fcmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldmVhbCB0aGUgZmlsZSB0aGF0IGN1cnJlbnRseSBoYXMgZm9jdXMgaW4gdGhlIGZpbGUgdHJlZS4gSWYgc2hvd0lmSGlkZGVuIGlzIGZhbHNlLFxuICAgKiB0aGlzIHdpbGwgZW5xdWV1ZSBhIHBlbmRpbmcgcmV2ZWFsIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZpbGUgdHJlZSBpcyBzaG93biBhZ2Fpbi5cbiAgICovXG4gIHJldmVhbEFjdGl2ZUZpbGUoc2hvd0lmSGlkZGVuPzogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IgIT0gbnVsbCA/IGVkaXRvci5nZXRQYXRoKCkgOiBudWxsO1xuICAgIHRoaXMuX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoLCBzaG93SWZIaWRkZW4pO1xuICB9XG5cbiAgX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoOiA/c3RyaW5nLCBzaG93SWZIaWRkZW4/OiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzaG93SWZIaWRkZW4pIHtcbiAgICAgIC8vIEVuc3VyZSB0aGUgZmlsZSB0cmVlIGlzIHZpc2libGUgYmVmb3JlIHRyeWluZyB0byByZXZlYWwgYSBmaWxlIGluIGl0LiBFdmVuIGlmIHRoZSBjdXJyZW50bHlcbiAgICAgIC8vIGFjdGl2ZSBwYW5lIGlzIG5vdCBhbiBvcmRpbmFyeSBlZGl0b3IsIHdlIHN0aWxsIGF0IGxlYXN0IHdhbnQgdG8gc2hvdyB0aGUgdHJlZS5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTp0b2dnbGUnLFxuICAgICAgICB7ZGlzcGxheTogdHJ1ZX1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUmV2ZWFsIHRoZSBmaWxlIG9mIGEgZ2l2ZW4gdGFiIGJhc2VkIG9uIHRoZSBwYXRoIHN0b3JlZCBvbiB0aGUgRE9NLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtZWFudCB0byBiZSB0cmlnZ2VyZWQgYnkgdGhlIGNvbnRleHQtbWVudSBjbGljay5cbiAgICovXG4gIF9yZXZlYWxUYWJGaWxlT25DbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCB0YWIgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEVsZW1lbnQpO1xuICAgIGNvbnN0IHRpdGxlID0gdGFiLnF1ZXJ5U2VsZWN0b3IoJy50aXRsZVtkYXRhLXBhdGhdJyk7XG4gICAgaWYgKCF0aXRsZSkge1xuICAgICAgLy8gY2FuIG9ubHkgcmV2ZWFsIGl0IGlmIHdlIGZpbmQgdGhlIGZpbGUgcGF0aFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGl0bGUuZGF0YXNldC5wYXRoO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnRvZ2dsZScsXG4gICAgICB7ZGlzcGxheTogdHJ1ZX1cbiAgICApO1xuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICByZXZlYWxOb2RlS2V5KG5vZGVLZXk6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIW5vZGVLZXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgcm9vdEtleTogP3N0cmluZyA9IHRoaXMuX3N0b3JlLmdldFJvb3RGb3JLZXkobm9kZUtleSk7XG4gICAgaWYgKCFyb290S2V5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHN0YWNrID0gW107XG4gICAgbGV0IGtleSA9IG5vZGVLZXk7XG4gICAgd2hpbGUgKGtleSAhPSBudWxsICYmIGtleSAhPT0gcm9vdEtleSkge1xuICAgICAgc3RhY2sucHVzaChrZXkpO1xuICAgICAga2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShrZXkpO1xuICAgIH1cbiAgICAvLyBXZSB3YW50IHRoZSBzdGFjayB0byBiZSBbcGFyZW50S2V5LCAuLi4sIG5vZGVLZXldLlxuICAgIHN0YWNrLnJldmVyc2UoKTtcbiAgICBzdGFjay5mb3JFYWNoKChjaGlsZEtleSwgaSkgPT4ge1xuICAgICAgY29uc3QgcGFyZW50S2V5ID0gKGkgPT09IDApID8gcm9vdEtleSA6IHN0YWNrW2kgLSAxXTtcbiAgICAgIHRoaXMuX2FjdGlvbnMuZW5zdXJlQ2hpbGROb2RlKHJvb3RLZXksIHBhcmVudEtleSwgY2hpbGRLZXkpO1xuICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfSk7XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgX3NldEN3ZFRvU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhdGggPSBGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGUucm9vdEtleSk7XG4gICAgaWYgKHRoaXMuX2N3ZEFwaSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9jd2RBcGkuc2V0Q3dkKHBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIHNldEN3ZEFwaShjd2RBcGk6ID9Dd2RBcGkpOiB2b2lkIHtcbiAgICBpZiAoY3dkQXBpID09IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGlvbnMuc2V0Q3dkKG51bGwpO1xuICAgICAgdGhpcy5fY3dkQXBpU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICB9IGVsc2Uge1xuICAgICAgaW52YXJpYW50KHRoaXMuX2N3ZEFwaVN1YnNjcmlwdGlvbiA9PSBudWxsKTtcbiAgICAgIHRoaXMuX2N3ZEFwaVN1YnNjcmlwdGlvbiA9IGN3ZEFwaS5vYnNlcnZlQ3dkKGRpcmVjdG9yeSA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBkaXJlY3RvcnkgPT0gbnVsbCA/IG51bGwgOiBkaXJlY3RvcnkuZ2V0UGF0aCgpO1xuICAgICAgICBjb25zdCByb290S2V5ID0gcGF0aCAmJiBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KHBhdGgpO1xuICAgICAgICB0aGlzLl9hY3Rpb25zLnNldEN3ZChyb290S2V5KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuX2N3ZEFwaSA9IGN3ZEFwaTtcbiAgfVxuXG4gIHNldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRoczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzKTtcbiAgfVxuXG4gIHNldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzKTtcbiAgfVxuXG4gIHNldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXM6IEFycmF5PHN0cmluZz4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldElnbm9yZWROYW1lcyhpZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzKTtcbiAgfVxuXG4gIHNldFVzZVByZWZpeE5hdih1c2VQcmVmaXhOYXY6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFVzZVByZWZpeE5hdih1c2VQcmVmaXhOYXYpO1xuICB9XG5cbiAgdXBkYXRlV29ya2luZ1NldCh3b3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy51cGRhdGVXb3JraW5nU2V0KHdvcmtpbmdTZXQpO1xuICB9XG5cbiAgdXBkYXRlV29ya2luZ1NldHNTdG9yZSh3b3JraW5nU2V0c1N0b3JlOiA/V29ya2luZ1NldHNTdG9yZSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMudXBkYXRlV29ya2luZ1NldHNTdG9yZSh3b3JraW5nU2V0c1N0b3JlKTtcbiAgfVxuXG4gIHVwZGF0ZU9wZW5GaWxlc1dvcmtpbmdTZXQob3BlbkZpbGVzV29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMudXBkYXRlT3BlbkZpbGVzV29ya2luZ1NldChvcGVuRmlsZXNXb3JraW5nU2V0KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb2xsYXBzZXMgYWxsIHNlbGVjdGVkIGRpcmVjdG9yeSBub2Rlcy4gSWYgdGhlIHNlbGVjdGlvbiBpcyBhIHNpbmdsZSBmaWxlIG9yIGEgc2luZ2xlIGNvbGxhcHNlZFxuICAgKiBkaXJlY3RvcnksIHRoZSBzZWxlY3Rpb24gaXMgc2V0IHRvIHRoZSBkaXJlY3RvcnkncyBwYXJlbnQuXG4gICAqL1xuICBfY29sbGFwc2VTZWxlY3Rpb24oZGVlcDogYm9vbGVhbiA9IGZhbHNlKTogdm9pZCB7XG4gICAgY29uc3Qgc2VsZWN0ZWROb2RlcyA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBjb25zdCBmaXJzdFNlbGVjdGVkTm9kZSA9IHNlbGVjdGVkTm9kZXMuZmlyc3QoKTtcbiAgICBpZiAoc2VsZWN0ZWROb2Rlcy5zaXplID09PSAxXG4gICAgICAmJiAhZmlyc3RTZWxlY3RlZE5vZGUuaXNSb290XG4gICAgICAmJiAhKGZpcnN0U2VsZWN0ZWROb2RlLmlzQ29udGFpbmVyICYmIGZpcnN0U2VsZWN0ZWROb2RlLmlzRXhwYW5kZWQoKSkpIHtcbiAgICAgIC8qXG4gICAgICAgKiBTZWxlY3QgdGhlIHBhcmVudCBvZiB0aGUgc2VsZWN0aW9uIGlmIHRoZSBmb2xsb3dpbmcgY3JpdGVyaWEgYXJlIG1ldDpcbiAgICAgICAqICAgKiBPbmx5IDEgbm9kZSBpcyBzZWxlY3RlZFxuICAgICAgICogICAqIFRoZSBub2RlIGlzIG5vdCBhIHJvb3RcbiAgICAgICAqICAgKiBUaGUgbm9kZSBpcyBub3QgYW4gZXhwYW5kZWQgZGlyZWN0b3J5XG4gICAgICAgKi9cbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGZpcnN0U2VsZWN0ZWROb2RlLm5vZGVLZXkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAvLyBPbmx5IGRpcmVjdG9yaWVzIGNhbiBiZSBleHBhbmRlZC4gU2tpcCBub24tZGlyZWN0b3J5IG5vZGVzLlxuICAgICAgICBpZiAoIW5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVlcCkge1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlRGVlcChub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGUobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfY29sbGFwc2VBbGwoKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdEtleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIHJvb3RLZXlzLmZvckVhY2gocm9vdEtleSA9PiB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZURlZXAocm9vdEtleSwgcm9vdEtleSkpO1xuICB9XG5cbiAgX2RlbGV0ZVNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlcyA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBpZiAobm9kZXMuc2l6ZSA9PT0gMCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJvb3RQYXRocyA9IG5vZGVzLmZpbHRlcihub2RlID0+IG5vZGUuaXNSb290KTtcbiAgICBpZiAocm9vdFBhdGhzLnNpemUgPT09IDApIHtcbiAgICAgIGNvbnN0IHNlbGVjdGVkUGF0aHMgPSBub2Rlcy5tYXAobm9kZSA9PiBub2RlLm5vZGVQYXRoKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGUgZm9sbG93aW5nICcgK1xuICAgICAgICAgIChub2Rlcy5zaXplID4gMSA/ICdpdGVtcz8nIDogJ2l0ZW0/Jyk7XG4gICAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgJ0RlbGV0ZSc6ICgpID0+IHsgdGhpcy5fYWN0aW9ucy5kZWxldGVTZWxlY3RlZE5vZGVzKCk7IH0sXG4gICAgICAgICAgJ0NhbmNlbCc6ICgpID0+IHt9LFxuICAgICAgICB9LFxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IGBZb3UgYXJlIGRlbGV0aW5nOiR7b3MuRU9MfSR7c2VsZWN0ZWRQYXRocy5qb2luKG9zLkVPTCl9YCxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbWVzc2FnZTtcbiAgICAgIGlmIChyb290UGF0aHMuc2l6ZSA9PT0gMSkge1xuICAgICAgICBtZXNzYWdlID0gYFRoZSByb290IGRpcmVjdG9yeSAnJHtyb290UGF0aHMuZmlyc3QoKS5ub2RlTmFtZX0nIGNhbid0IGJlIHJlbW92ZWQuYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJvb3RQYXRoTmFtZXMgPSByb290UGF0aHMubWFwKG5vZGUgPT4gYCcke25vZGUubm9kZU5hbWV9J2ApLmpvaW4oJywgJyk7XG4gICAgICAgIG1lc3NhZ2UgPSBgVGhlIHJvb3QgZGlyZWN0b3JpZXMgJHtyb290UGF0aE5hbWVzfSBjYW4ndCBiZSByZW1vdmVkLmA7XG4gICAgICB9XG5cbiAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgIGJ1dHRvbnM6IFsnT0snXSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIGFsbCBzZWxlY3RlZCBkaXJlY3Rvcnkgbm9kZXMuXG4gICAqL1xuICBfZXhwYW5kU2VsZWN0aW9uKGRlZXA6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCkuZm9yRWFjaChub2RlID0+IHtcbiAgICAgIC8vIE9ubHkgZGlyZWN0b3JpZXMgY2FuIGJlIGV4cGFuZGVkLiBTa2lwIG5vbi1kaXJlY3Rvcnkgbm9kZXMuXG4gICAgICBpZiAoIW5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoZGVlcCkge1xuICAgICAgICB0aGlzLl9hY3Rpb25zLmV4cGFuZE5vZGVEZWVwKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChub2RlLmlzRXhwYW5kZWQoKSkge1xuICAgICAgICAgIC8vIE5vZGUgaXMgYWxyZWFkeSBleHBhbmRlZDsgbW92ZSB0aGUgc2VsZWN0aW9uIHRvIHRoZSBmaXJzdCBjaGlsZC5cbiAgICAgICAgICBjb25zdCBbZmlyc3RDaGlsZEtleV0gPSBub2RlLmdldENoaWxkS2V5cygpO1xuICAgICAgICAgIGlmIChmaXJzdENoaWxkS2V5ICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaXJzdENoaWxkS2V5KTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgX21vdmVEb3duKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0U2VsZWN0ZWRLZXkgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZEtleXMoKS5sYXN0KCk7XG4gICAgaWYgKGxhc3RTZWxlY3RlZEtleSA9PSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBubyBzZWxlY3Rpb24geWV0LCBzbyBtb3ZlIHRvIHRoZSB0b3Agb2YgdGhlIHRyZWUuXG4gICAgICB0aGlzLl9tb3ZlVG9Ub3AoKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGFyZW50S2V5O1xuICAgIGxldCByb290S2V5O1xuICAgIGxldCBzaWJsaW5nS2V5cztcbiAgICBjb25zdCBpc1Jvb3QgPSB0aGlzLl9zdG9yZS5pc1Jvb3RLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoaXNSb290KSB7XG4gICAgICByb290S2V5ID0gbGFzdFNlbGVjdGVkS2V5O1xuICAgICAgLy8gT3RoZXIgcm9vdHMgYXJlIHRoaXMgcm9vdCdzIHNpYmxpbmdzXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIHJvb3RLZXkgPSB0aGlzLl9zdG9yZS5nZXRSb290Rm9yS2V5KGxhc3RTZWxlY3RlZEtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSByb290IGRvZXMgbm90IGV4aXN0IG9yIGlmIHRoaXMgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhIHBhcmVudCBidXQgZG9lc24ndCAocm9vdHMgZG9cbiAgICAvLyBub3QgaGF2ZSBwYXJlbnRzKSwgbm90aGluZyBjYW4gYmUgZG9uZS4gRXhpdC5cbiAgICBpZiAocm9vdEtleSA9PSBudWxsIHx8ICghaXNSb290ICYmIHBhcmVudEtleSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkcmVuID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KGxhc3RTZWxlY3RlZEtleSkgJiZcbiAgICAgIHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQocm9vdEtleSwgbGFzdFNlbGVjdGVkS2V5KSAmJlxuICAgICAgY2hpbGRyZW4ubGVuZ3RoID4gMFxuICAgICkge1xuICAgICAgLy8gRGlyZWN0b3J5IGlzIGV4cGFuZGVkIGFuZCBpdCBoYXMgY2hpbGRyZW4uIFNlbGVjdCBmaXJzdCBjaGlsZC4gRXhpdC5cbiAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBjaGlsZHJlblswXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihsYXN0U2VsZWN0ZWRLZXkpO1xuICAgICAgY29uc3QgbWF4SW5kZXggPSBzaWJsaW5nS2V5cy5sZW5ndGggLSAxO1xuXG4gICAgICBpZiAoaW5kZXggPCBtYXhJbmRleCkge1xuICAgICAgICBjb25zdCBuZXh0U2libGluZ0tleSA9IHNpYmxpbmdLZXlzW2luZGV4ICsgMV07XG5cbiAgICAgICAgaWYgKGlzUm9vdCkge1xuICAgICAgICAgIC8vIElmIHRoZSBuZXh0IHNlbGVjdGVkIGl0ZW0gaXMgYW5vdGhlciByb290LCBzZXQgYHJvb3RLZXlgIHRvIGl0IHNvIHRyYWNrQW5kU2VsZWN0IGZpbmRzXG4gICAgICAgICAgLy8gdGhhdCBbcm9vdEtleSwgcm9vdEtleV0gdHVwbGUuXG4gICAgICAgICAgcm9vdEtleSA9IG5leHRTaWJsaW5nS2V5O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVGhpcyBoYXMgYSBuZXh0IHNpYmxpbmcuXG4gICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBzaWJsaW5nS2V5c1tpbmRleCArIDFdKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IG5lYXJlc3RBbmNlc3RvclNpYmxpbmcgPSB0aGlzLl9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhyb290S2V5LCBsYXN0U2VsZWN0ZWRLZXkpO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaXMgdGhlIGJvdHRvbW1vc3Qgbm9kZSBvZiB0aGUgdHJlZSwgdGhlcmUgd29uJ3QgYmUgYW55dGhpbmcgdG8gc2VsZWN0LlxuICAgICAgICAvLyBWb2lkIHJldHVybiBzaWduaWZpZXMgbm8gbmV4dCBub2RlIHdhcyBmb3VuZC5cbiAgICAgICAgaWYgKG5lYXJlc3RBbmNlc3RvclNpYmxpbmcgIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShuZWFyZXN0QW5jZXN0b3JTaWJsaW5nLnJvb3RLZXksIG5lYXJlc3RBbmNlc3RvclNpYmxpbmcubm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBfbW92ZVVwKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBsYXN0U2VsZWN0ZWRLZXkgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZEtleXMoKS5sYXN0KCk7XG4gICAgaWYgKGxhc3RTZWxlY3RlZEtleSA9PSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBubyBzZWxlY3Rpb24uIE1vdmUgdG8gdGhlIGJvdHRvbSBvZiB0aGUgdHJlZS5cbiAgICAgIHRoaXMuX21vdmVUb0JvdHRvbSgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwYXJlbnRLZXk7XG4gICAgbGV0IHJvb3RLZXk7XG4gICAgbGV0IHNpYmxpbmdLZXlzO1xuICAgIGNvbnN0IGlzUm9vdCA9IHRoaXMuX3N0b3JlLmlzUm9vdEtleShsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgIHJvb3RLZXkgPSBsYXN0U2VsZWN0ZWRLZXk7XG4gICAgICAvLyBPdGhlciByb290cyBhcmUgdGhpcyByb290J3Mgc2libGluZ3NcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50S2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShsYXN0U2VsZWN0ZWRLZXkpO1xuICAgICAgcm9vdEtleSA9IHRoaXMuX3N0b3JlLmdldFJvb3RGb3JLZXkobGFzdFNlbGVjdGVkS2V5KTtcblxuICAgICAgaW52YXJpYW50KHJvb3RLZXkgJiYgcGFyZW50S2V5KTtcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHJvb3QgZG9lcyBub3QgZXhpc3Qgb3IgaWYgdGhpcyBpcyBleHBlY3RlZCB0byBoYXZlIGEgcGFyZW50IGJ1dCBkb2Vzbid0IChyb290cyBkb1xuICAgIC8vIG5vdCBoYXZlIHBhcmVudHMpLCBub3RoaW5nIGNhbiBiZSBkb25lLiBFeGl0LlxuICAgIGlmIChyb290S2V5ID09IG51bGwgfHwgKCFpc1Jvb3QgJiYgcGFyZW50S2V5ID09IG51bGwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBzaWJsaW5nS2V5cy5pbmRleE9mKGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICBpZiAoIWlzUm9vdCAmJiBwYXJlbnRLZXkgIT0gbnVsbCkge1xuICAgICAgICAvLyBUaGlzIGlzIHRoZSBmaXJzdCBjaGlsZC4gSXQgaGFzIGEgcGFyZW50LiBTZWxlY3QgdGhlIHBhcmVudC5cbiAgICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgICB9XG4gICAgICAvLyBUaGlzIGlzIHRoZSByb290IGFuZC9vciB0aGUgdG9wIG9mIHRoZSB0cmVlIChoYXMgbm8gcGFyZW50KS4gTm90aGluZyBlbHNlIHRvIHRyYXZlcnNlLlxuICAgICAgLy8gRXhpdC5cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgcHJldmlvdXNTaWJsaW5nS2V5ID0gc2libGluZ0tleXNbaW5kZXggLSAxXTtcblxuICAgICAgaWYgKGlzUm9vdCkge1xuICAgICAgICAvLyBJZiB0cmF2ZXJzaW5nIHVwIHRvIGEgZGlmZmVyZW50IHJvb3QsIHRoZSByb290S2V5IG11c3QgYmVjb21lIHRoYXQgbmV3IHJvb3QgdG8gY2hlY2tcbiAgICAgICAgLy8gZXhwYW5kZWQga2V5cyBpbiBpdC5cbiAgICAgICAgcm9vdEtleSA9IHByZXZpb3VzU2libGluZ0tleTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKFxuICAgICAgICByb290S2V5LFxuICAgICAgICB0aGlzLl9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShyb290S2V5LCBwcmV2aW91c1NpYmxpbmdLZXkpXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIF9tb3ZlVG9Ub3AoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IHJvb3RLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleXNbMF0sIHJvb3RLZXlzWzBdKTtcbiAgfVxuXG4gIF9tb3ZlVG9Cb3R0b20oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFNlbGVjdCB0aGUgbG93ZXJtb3N0IGRlc2NlbmRhbnQgb2YgdGhlIGxhc3Qgcm9vdCBub2RlLlxuICAgIGNvbnN0IHJvb3RLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICBjb25zdCBsYXN0Um9vdEtleSA9IHJvb3RLZXlzW3Jvb3RLZXlzLmxlbmd0aCAtIDFdO1xuICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShcbiAgICAgIGxhc3RSb290S2V5LFxuICAgICAgdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkobGFzdFJvb3RLZXksIGxhc3RSb290S2V5KVxuICAgICk7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm5zIHRoZSBsb3dlcm1vc3QgZGVzY2VuZGFudCB3aGVuIGNvbnNpZGVyZWQgaW4gZmlsZSBzeXN0ZW0gb3JkZXIgd2l0aCBleHBhbmRhYmxlXG4gICAqIGRpcmVjdG9yaWVzLiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogICBBID5cbiAgICogICAgIEIgPlxuICAgKiAgICAgQyA+XG4gICAqICAgICAgIEUudHh0XG4gICAqICAgICBELmZvb1xuICAgKlxuICAgKiAgID4gX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KEEpXG4gICAqICAgRC5mb29cbiAgICpcbiAgICogVGhvdWdoIEEgaGFzIG1vcmUgZGVlcGx5LW5lc3RlZCBkZXNjZW5kYW50cyB0aGFuIEQuZm9vLCBsaWtlIEUudHh0LCBELmZvbyBpcyBsb3dlcm1vc3Qgd2hlblxuICAgKiBjb25zaWRlcmVkIGluIGZpbGUgc3lzdGVtIG9yZGVyLlxuICAgKi9cbiAgX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAoIShGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobm9kZUtleSkgJiYgdGhpcy5fc3RvcmUuaXNFeHBhbmRlZChyb290S2V5LCBub2RlS2V5KSkpIHtcbiAgICAgIC8vIElmIGBub2RlS2V5YCBpcyBub3QgYW4gZXhwYW5kZWQgZGlyZWN0b3J5IHRoZXJlIGFyZSBubyBtb3JlIGRlc2NlbmRhbnRzIHRvIHRyYXZlcnNlLiBSZXR1cm5cbiAgICAgIC8vIHRoZSBgbm9kZUtleWAuXG4gICAgICByZXR1cm4gbm9kZUtleTtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZEtleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgbm9kZUtleSk7XG4gICAgaWYgKGNoaWxkS2V5cy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIElmIHRoZSBkaXJlY3RvcnkgaGFzIG5vIGNoaWxkcmVuLCB0aGUgZGlyZWN0b3J5IGl0c2VsZiBpcyB0aGUgbG93ZXJtb3N0IGRlc2NlbmRhbnQuXG4gICAgICByZXR1cm4gbm9kZUtleTtcbiAgICB9XG5cbiAgICAvLyBUaGVyZSdzIGF0IGxlYXN0IG9uZSBjaGlsZC4gUmVjdXJzZSBkb3duIHRoZSBsYXN0IGNoaWxkLlxuICAgIHJldHVybiB0aGlzLl9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShyb290S2V5LCBjaGlsZEtleXNbY2hpbGRLZXlzLmxlbmd0aCAtIDFdKTtcbiAgfVxuXG4gIC8qXG4gICAqIFJldHVybnMgdGhlIG5lYXJlc3QgXCJhbmNlc3RvciBzaWJsaW5nXCIgd2hlbiBjb25zaWRlcmVkIGluIGZpbGUgc3lzdGVtIG9yZGVyIHdpdGggZXhwYW5kYWJsZVxuICAgKiBkaXJlY3Rvcmllcy4gRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqICAgQSA+XG4gICAqICAgICBCID5cbiAgICogICAgICAgQyA+XG4gICAqICAgICAgICAgRS50eHRcbiAgICogICBELmZvb1xuICAgKlxuICAgKiAgID4gX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKEUudHh0KVxuICAgKiAgIEQuZm9vXG4gICAqL1xuICBfZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiA/RmlsZVRyZWVOb2RlRGF0YSB7XG4gICAgbGV0IHBhcmVudEtleTtcbiAgICBsZXQgc2libGluZ0tleXM7XG4gICAgY29uc3QgaXNSb290ID0gcm9vdEtleSA9PT0gbm9kZUtleTtcbiAgICBpZiAoaXNSb290KSB7XG4gICAgICAvLyBgcm9vdEtleSA9PT0gbm9kZUtleWAgbWVhbnMgdGhpcyBoYXMgcmVjdXJzZWQgdG8gYSByb290LiBgbm9kZUtleWAgaXMgYSByb290IGtleS5cbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50S2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShub2RlS2V5KTtcblxuICAgICAgaW52YXJpYW50KHJvb3RLZXkgJiYgcGFyZW50S2V5KTtcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZXggPSBzaWJsaW5nS2V5cy5pbmRleE9mKG5vZGVLZXkpO1xuICAgIGlmIChpbmRleCA8IChzaWJsaW5nS2V5cy5sZW5ndGggLSAxKSkge1xuICAgICAgY29uc3QgbmV4dFNpYmxpbmcgPSBzaWJsaW5nS2V5c1tpbmRleCArIDFdO1xuICAgICAgLy8gSWYgdHJhdmVyc2luZyBhY3Jvc3Mgcm9vdHMsIHRoZSBuZXh0IHNpYmxpbmcgaXMgYWxzbyB0aGUgbmV4dCByb290LiBSZXR1cm4gaXQgYXMgdGhlIG5leHRcbiAgICAgIC8vIHJvb3Qga2V5IGFzIHdlbGwgYXMgdGhlIG5leHQgbm9kZSBrZXkuXG4gICAgICByZXR1cm4gaXNSb290XG4gICAgICAgID8ge25vZGVLZXk6IG5leHRTaWJsaW5nLCByb290S2V5OiBuZXh0U2libGluZ31cbiAgICAgICAgOiB7bm9kZUtleTogbmV4dFNpYmxpbmcsIHJvb3RLZXl9O1xuICAgIH0gZWxzZSBpZiAocGFyZW50S2V5ICE9IG51bGwpIHtcbiAgICAgIC8vIFRoZXJlIGlzIGEgcGFyZW50IHRvIHJlY3Vyc2UuIFJldHVybiBpdHMgbmVhcmVzdCBhbmNlc3RvciBzaWJsaW5nLlxuICAgICAgcmV0dXJuIHRoaXMuX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIElmIGBwYXJlbnRLZXlgIGlzIG51bGwsIG5vZGVLZXkgaXMgYSByb290IGFuZCBoYXMgbW9yZSBwYXJlbnRzIHRvIHJlY3Vyc2UuIFJldHVybiBgbnVsbGAgdG9cbiAgICAgIC8vIHNpZ25pZnkgbm8gYXBwcm9wcmlhdGUga2V5IHdhcyBmb3VuZC5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeSgpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAvLyBPbmx5IHBlcmZvcm0gdGhlIGRlZmF1bHQgYWN0aW9uIGlmIGEgc2luZ2xlIG5vZGUgaXMgc2VsZWN0ZWQuXG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3Rpb25zLmNvbmZpcm1Ob2RlKHNpbmdsZVNlbGVjdGVkTm9kZS5yb290S2V5LCBzaW5nbGVTZWxlY3RlZE5vZGUubm9kZUtleSk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQob3JpZW50YXRpb246IGF0b20kUGFuZVNwbGl0T3JpZW50YXRpb24sIHNpZGU6IGF0b20kUGFuZVNwbGl0U2lkZSk6IHZvaWQge1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIC8vIE9ubHkgcGVyZm9ybSB0aGUgZGVmYXVsdCBhY3Rpb24gaWYgYSBzaW5nbGUgbm9kZSBpcyBzZWxlY3RlZC5cbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwgJiYgIXNpbmdsZVNlbGVjdGVkTm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgLy8gZm9yOiBpcyB0aGlzIGZlYXR1cmUgdXNlZCBlbm91Z2ggdG8ganVzdGlmeSB1bmNvbGxhcHNpbmc/XG4gICAgICB0cmFjaygnZmlsZXRyZWUtc3BsaXQtZmlsZScsIHtcbiAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgIHNpZGUsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2FjdGlvbnMub3BlblNlbGVjdGVkRW50cnlTcGxpdChcbiAgICAgICAgc2luZ2xlU2VsZWN0ZWROb2RlLm5vZGVLZXksXG4gICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICBzaWRlLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdFVwKCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ3ZlcnRpY2FsJywgJ2JlZm9yZScpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXREb3duKCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ3ZlcnRpY2FsJywgJ2FmdGVyJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdExlZnQoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgnaG9yaXpvbnRhbCcsICdiZWZvcmUnKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0UmlnaHQoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgnaG9yaXpvbnRhbCcsICdhZnRlcicpO1xuICB9XG5cbiAgX3JlbW92ZVJvb3RGb2xkZXJTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAocm9vdE5vZGUgIT0gbnVsbCAmJiByb290Tm9kZS5pc1Jvb3QpIHtcbiAgICAgIC8vIGNsb3NlIGFsbCB0aGUgZmlsZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcm9qZWN0IGJlZm9yZSBjbG9zaW5nXG4gICAgICBjb25zdCBwcm9qZWN0RWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCk7XG4gICAgICBjb25zdCByb290cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgICBwcm9qZWN0RWRpdG9ycy5mb3JFYWNoKGVkaXRvciA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICAvLyBpZiB0aGUgcGF0aCBvZiB0aGUgZWRpdG9yIGlzIG5vdCBudWxsIEFORFxuICAgICAgICAvLyBpcyBwYXJ0IG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgcm9vdCB0aGF0IHdvdWxkIGJlIHJlbW92ZWQgQU5EXG4gICAgICAgIC8vIGlzIG5vdCBwYXJ0IG9mIGFueSBvdGhlciBvcGVuIHJvb3QsIHRoZW4gY2xvc2UgdGhlIGZpbGUuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBwYXRoICE9IG51bGwgJiZcbiAgICAgICAgICBwYXRoLnN0YXJ0c1dpdGgocm9vdE5vZGUubm9kZVBhdGgpICYmXG4gICAgICAgICAgcm9vdHMuZmlsdGVyKHJvb3QgPT4gcGF0aC5zdGFydHNXaXRoKHJvb3QpKS5sZW5ndGggPT09IDFcbiAgICAgICAgKSB7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShwYXRoKS5kZXN0cm95SXRlbShlZGl0b3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIGFjdHVhbGx5IGNsb3NlIHRoZSBwcm9qZWN0XG4gICAgICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aChyb290Tm9kZS5ub2RlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX3NlYXJjaEluRGlyZWN0b3J5KGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIC8vIERpc3BhdGNoIGEgY29tbWFuZCB0byBzaG93IHRoZSBgUHJvamVjdEZpbmRWaWV3YC4gVGhpcyBvcGVucyB0aGUgdmlldyBhbmQgZm9jdXNlcyB0aGUgc2VhcmNoXG4gICAgLy8gYm94LlxuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAoKGV2ZW50LnRhcmdldDogYW55KTogSFRNTEVsZW1lbnQpLFxuICAgICAgJ3Byb2plY3QtZmluZDpzaG93LWluLWN1cnJlbnQtZGlyZWN0b3J5J1xuICAgICk7XG4gIH1cblxuICBfc2hvd0luRmlsZU1hbmFnZXIoKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIC8vIE9ubHkgYWxsb3cgcmV2ZWFsaW5nIGEgc2luZ2xlIGRpcmVjdG9yeS9maWxlIGF0IGEgdGltZS4gUmV0dXJuIG90aGVyd2lzZS5cbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgc2hlbGwuc2hvd0l0ZW1JbkZvbGRlcihub2RlLm5vZGVQYXRoKTtcbiAgfVxuXG4gIF9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiB2b2lkIHtcbiAgICAvLyBTZWxlY3QgdGhlIG5vZGUgYmVmb3JlIHRyYWNraW5nIGl0IGJlY2F1c2Ugc2V0dGluZyBhIG5ldyBzZWxlY3Rpb24gY2xlYXJzIHRoZSB0cmFja2VkIG5vZGUuXG4gICAgdGhpcy5fYWN0aW9ucy5zZWxlY3RTaW5nbGVOb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VHJhY2tlZE5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBfY29weUZ1bGxQYXRoKCk6IHZvaWQge1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCkge1xuICAgICAgYXRvbS5jbGlwYm9hcmQud3JpdGUoc2luZ2xlU2VsZWN0ZWROb2RlLmdldExvY2FsUGF0aCgpKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGZvciAoY29uc3QgZGlzcG9zYWJsZSBvZiB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5LnZhbHVlcygpKSB7XG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fc3RvcmUucmVzZXQoKTtcbiAgICB0aGlzLl9jb250ZXh0TWVudS5kaXNwb3NlKCk7XG4gICAgY2xlYXJUaW1lb3V0KHRoaXMuX3ByZWZpeFRpbWVvdXQpO1xuICB9XG5cbiAgc2VyaWFsaXplKCk6IEZpbGVUcmVlQ29udHJvbGxlclN0YXRlIHtcbiAgICByZXR1cm4ge1xuICAgICAgdHJlZTogdGhpcy5fc3RvcmUuZXhwb3J0RGF0YSgpLFxuICAgIH07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZUNvbnRyb2xsZXI7XG4iXX0=