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
      'nuclide-file-tree:reveal-text-editor': this._revealTextEditor.bind(this),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWM4QyxNQUFNOztpQ0FDZCxxQkFBcUI7O2lDQUM3QixxQkFBcUI7Ozs7K0JBQ3ZCLG1CQUFtQjs7OzttQ0FDZix1QkFBdUI7Ozs7K0JBQzNCLG1CQUFtQjs7Ozs2QkFDckIsaUJBQWlCOzs7O3lCQUNyQixXQUFXOzs7OzhCQUNiLHVCQUF1Qjs7Z0NBQ3ZCLHlCQUF5Qjs7a0NBQ2xCLDRCQUE0Qjs7a0JBRXhDLElBQUk7Ozs7cUJBQ0QsT0FBTzs7OztzQkFFSCxRQUFROzs7O0FBYzlCLElBQU0sV0FBVyxHQUFHLFlBQVksQ0FBQztBQUNqQyxJQUFNLGtCQUFrQixHQUFHLEdBQUcsQ0FBQzs7SUFFekIsa0JBQWtCO0FBWVgsV0FaUCxrQkFBa0IsQ0FZVixLQUErQixFQUFFOzs7MEJBWnpDLGtCQUFrQjs7QUFhcEIsUUFBSSxDQUFDLFFBQVEsR0FBRyw2QkFBZ0IsV0FBVyxFQUFFLENBQUM7QUFDOUMsUUFBSSxDQUFDLE1BQU0sR0FBRywyQkFBYyxXQUFXLEVBQUUsQ0FBQztBQUMxQyxRQUFJLENBQUMsYUFBYSxHQUFHLElBQUksdUJBQVUsR0FBRyxFQUFFLENBQUM7QUFDekMsUUFBSSxDQUFDLDBCQUEwQixHQUFHLElBQUksdUJBQVUsR0FBRyxFQUFFLENBQUM7QUFDdEQsUUFBSSxDQUFDLGNBQWMsR0FBRyw4QkFDcEIscUJBQWUsWUFBTTtBQUNuQixVQUFJLE1BQUssbUJBQW1CLElBQUksSUFBSSxFQUFFO0FBQ3BDLGNBQUssbUJBQW1CLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDcEM7S0FDRixDQUFDLENBQ0gsQ0FBQzs7QUFFRixRQUFJLENBQUMsc0JBQXNCLEVBQUUsQ0FBQzs7QUFFOUIsUUFBSSxDQUFDLGNBQWMsQ0FBQyxHQUFHLENBQ3JCLElBQUksQ0FBQyxPQUFPLENBQUMsZ0JBQWdCLENBQUM7YUFBTSxNQUFLLHNCQUFz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QUNkLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsV0FBSyxJQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDakUsa0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN0QjtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDcEIsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztBQUM1QixrQkFBWSxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQztLQUNuQzs7O1dBRVEscUJBQTRCO0FBQ25DLGFBQU87QUFDTCxZQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7T0FDL0IsQ0FBQztLQUNIOzs7U0EzdUJHLGtCQUFrQjs7O0FBOHVCeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZUNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q3dkQXBpfSBmcm9tICcuLi8uLi9udWNsaWRlLWN1cnJlbnQtd29ya2luZy1kaXJlY3RvcnkvbGliL0N3ZEFwaSc7XG5pbXBvcnQgdHlwZSB7RXhwb3J0U3RvcmVEYXRhfSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtFVkVOVF9IQU5ETEVSX1NFTEVDVE9SfSAgZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQgRmlsZVN5c3RlbUFjdGlvbnMgZnJvbSAnLi9GaWxlU3lzdGVtQWN0aW9ucyc7XG5pbXBvcnQgRmlsZVRyZWVBY3Rpb25zIGZyb20gJy4vRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCBGaWxlVHJlZUNvbnRleHRNZW51IGZyb20gJy4vRmlsZVRyZWVDb250ZXh0TWVudSc7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCBGaWxlVHJlZVN0b3JlIGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge2FycmF5fSBmcm9tICcuLi8uLi9udWNsaWRlLWNvbW1vbnMnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vbnVjbGlkZS1hbmFseXRpY3MnO1xuaW1wb3J0IHtpc1RleHRFZGl0b3J9IGZyb20gJy4uLy4uL251Y2xpZGUtYXRvbS1oZWxwZXJzJztcblxuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cy9saWIvV29ya2luZ1NldHNTdG9yZSc7XG5cbnR5cGUgRmlsZVRyZWVOb2RlRGF0YSA9IHtcbiAgbm9kZUtleTogc3RyaW5nO1xuICByb290S2V5OiBzdHJpbmc7XG59O1xuXG5leHBvcnQgdHlwZSBGaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSA9IHtcbiAgdHJlZTogRXhwb3J0U3RvcmVEYXRhO1xufTtcblxuY29uc3QgTk9UX0xFVFRFUlMgPSAvW15hLXpBLVpdL2c7XG5jb25zdCBQUkVGSVhfUkVTRVRfREVMQVkgPSA1MDA7XG5cbmNsYXNzIEZpbGVUcmVlQ29udHJvbGxlciB7XG4gIF9hY3Rpb25zOiBGaWxlVHJlZUFjdGlvbnM7XG4gIF9jb250ZXh0TWVudTogRmlsZVRyZWVDb250ZXh0TWVudTtcbiAgX2N3ZEFwaTogP0N3ZEFwaTtcbiAgX2N3ZEFwaVN1YnNjcmlwdGlvbjogP0lEaXNwb3NhYmxlO1xuICBfcmVwb3NpdG9yaWVzOiBJbW11dGFibGUuU2V0PGF0b20kUmVwb3NpdG9yeT47XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG4gIF9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5OiBJbW11dGFibGUuTWFwPGF0b20kUmVwb3NpdG9yeSwgSURpc3Bvc2FibGU+O1xuICBfcHJlZml4OiBzdHJpbmc7XG4gIF9wcmVmaXhUaW1lb3V0OiA/bnVtYmVyO1xuXG4gIGNvbnN0cnVjdG9yKHN0YXRlOiA/RmlsZVRyZWVDb250cm9sbGVyU3RhdGUpIHtcbiAgICB0aGlzLl9hY3Rpb25zID0gRmlsZVRyZWVBY3Rpb25zLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fc3RvcmUgPSBGaWxlVHJlZVN0b3JlLmdldEluc3RhbmNlKCk7XG4gICAgdGhpcy5fcmVwb3NpdG9yaWVzID0gbmV3IEltbXV0YWJsZS5TZXQoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5ID0gbmV3IEltbXV0YWJsZS5NYXAoKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoXG4gICAgICBuZXcgRGlzcG9zYWJsZSgoKSA9PiB7XG4gICAgICAgIGlmICh0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24gIT0gbnVsbCkge1xuICAgICAgICAgIHRoaXMuX2N3ZEFwaVN1YnNjcmlwdGlvbi5kaXNwb3NlKCk7XG4gICAgICAgIH1cbiAgICAgIH0pLFxuICAgICk7XG4gICAgLy8gSW5pdGlhbCByb290IGRpcmVjdG9yaWVzXG4gICAgdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCk7XG4gICAgLy8gU3Vic2VxdWVudCByb290IGRpcmVjdG9yaWVzIHVwZGF0ZWQgb24gY2hhbmdlXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLnByb2plY3Qub25EaWRDaGFuZ2VQYXRocygoKSA9PiB0aGlzLl91cGRhdGVSb290RGlyZWN0b3JpZXMoKSlcbiAgICApO1xuXG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZCgnYXRvbS13b3Jrc3BhY2UnLCB7XG4gICAgICAgIC8vIFBhc3MgdW5kZWZpbmVkIHNvIHRoZSBkZWZhdWx0IHBhcmFtZXRlciBnZXRzIHVzZWQuXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtdGV4dC1lZGl0b3InOiB0aGlzLl9yZXZlYWxUZXh0RWRpdG9yLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtYWN0aXZlLWZpbGUnOiB0aGlzLnJldmVhbEFjdGl2ZUZpbGUuYmluZCh0aGlzLCB1bmRlZmluZWQpLFxuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IGxldHRlcktleUJpbmRpbmdzID0ge307XG4gICAgY29uc3QgekNoYXJDb2RlID0gJ3onLmNoYXJDb2RlQXQoMCk7XG4gICAgZm9yIChsZXQgYyA9ICdhJy5jaGFyQ29kZUF0KDApOyBjIDw9IHpDaGFyQ29kZTsgYysrKSB7XG4gICAgICBjb25zdCBjaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICAgIGxldHRlcktleUJpbmRpbmdzW2BudWNsaWRlLWZpbGUtdHJlZTpnby10by1sZXR0ZXItJHtjaGFyfWBdID1cbiAgICAgICAgdGhpcy5faGFuZGxlUHJlZml4S2V5cHJlc3MuYmluZCh0aGlzLCBjaGFyKTtcbiAgICB9XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChFVkVOVF9IQU5ETEVSX1NFTEVDVE9SLCB7XG4gICAgICAgICdjb3JlOm1vdmUtZG93bic6IHRoaXMuX21vdmVEb3duLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiB0aGlzLl9tb3ZlVXAuYmluZCh0aGlzKSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by10b3AnOiB0aGlzLl9tb3ZlVG9Ub3AuYmluZCh0aGlzKSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiB0aGlzLl9tb3ZlVG9Cb3R0b20uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1maWxlJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5BZGRGaWxlRGlhbG9nKHRoaXMuX29wZW5BbmRSZXZlYWxGaWxlUGF0aC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1mb2xkZXInOiAoKSA9PiB7XG4gICAgICAgICAgRmlsZVN5c3RlbUFjdGlvbnMub3BlbkFkZEZvbGRlckRpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRGlyZWN0b3J5UGF0aC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmNvbGxhcHNlLWRpcmVjdG9yeSc6IHRoaXMuX2NvbGxhcHNlU2VsZWN0aW9uLmJpbmQodGhpcywgLypkZWVwKi8gZmFsc2UpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWNvbGxhcHNlLWRpcmVjdG9yeSc6IHRoaXMuX2NvbGxhcHNlU2VsZWN0aW9uLmJpbmQodGhpcywgdHJ1ZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZWN1cnNpdmUtY29sbGFwc2UtYWxsJzogdGhpcy5fY29sbGFwc2VBbGwuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmNvcHktZnVsbC1wYXRoJzogdGhpcy5fY29weUZ1bGxQYXRoLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpleHBhbmQtZGlyZWN0b3J5JzogdGhpcy5fZXhwYW5kU2VsZWN0aW9uLmJpbmQodGhpcywgLypkZWVwKi8gZmFsc2UpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWV4cGFuZC1kaXJlY3RvcnknOiB0aGlzLl9leHBhbmRTZWxlY3Rpb24uYmluZCh0aGlzLCB0cnVlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnknOiB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeS5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS11cCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdFVwLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWRvd24nOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXREb3duLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWxlZnQnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRMZWZ0LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXJpZ2h0JzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0UmlnaHQuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZSc6IHRoaXMuX2RlbGV0ZVNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlLXByb2plY3QtZm9sZGVyLXNlbGVjdGlvbic6XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlUm9vdEZvbGRlclNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVuYW1lLXNlbGVjdGlvbic6ICgpID0+IEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5SZW5hbWVEaWFsb2coKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmR1cGxpY2F0ZS1zZWxlY3Rpb24nOiAoKSA9PiB7XG4gICAgICAgICAgRmlsZVN5c3RlbUFjdGlvbnMub3BlbkR1cGxpY2F0ZURpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRmlsZVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzZWFyY2gtaW4tZGlyZWN0b3J5JzogdGhpcy5fc2VhcmNoSW5EaXJlY3RvcnkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnNob3ctaW4tZmlsZS1tYW5hZ2VyJzogdGhpcy5fc2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnNldC1jdXJyZW50LXdvcmtpbmctcm9vdCc6IHRoaXMuX3NldEN3ZFRvU2VsZWN0aW9uLmJpbmQodGhpcyksXG4gICAgICAgIC4uLmxldHRlcktleUJpbmRpbmdzLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ1tpcz1cInRhYnMtdGFiXCJdJywge1xuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLXRhYi1maWxlJzogdGhpcy5fcmV2ZWFsVGFiRmlsZU9uQ2xpY2suYmluZCh0aGlzKSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICBpZiAoc3RhdGUgJiYgc3RhdGUudHJlZSkge1xuICAgICAgdGhpcy5fc3RvcmUubG9hZERhdGEoc3RhdGUudHJlZSk7XG4gICAgfVxuICAgIHRoaXMuX2NvbnRleHRNZW51ID0gbmV3IEZpbGVUcmVlQ29udGV4dE1lbnUoKTtcbiAgICB0aGlzLl9wcmVmaXhUaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLl9wcmVmaXggPSAnJztcbiAgfVxuXG4gIF9oYW5kbGVQcmVmaXhLZXlwcmVzcyhsZXR0ZXI6IHN0cmluZyk6IHZvaWQge1xuICAgIGlmICghdGhpcy5fc3RvcmUudXNlUHJlZml4TmF2KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHRoaXMuX3ByZWZpeFRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3ByZWZpeFRpbWVvdXQpO1xuICAgICAgdGhpcy5fcHJlZml4VGltZW91dCA9IG51bGw7XG4gICAgfVxuICAgIGNvbnN0IHByZWZpeCA9IHRoaXMuX3ByZWZpeCArIGxldHRlcjtcbiAgICBpZiAodGhpcy5fZGlkUmV2ZWFsTm9kZVN0YXJ0aW5nV2l0aChwcmVmaXgpKSB7XG4gICAgICAvLyBPbmx5IGFwcGVuZCB0aGUgcHJlZml4IHN0cmluZyBpZiBhIG1hdGNoIGV4aXN0cyB0byBhbGxvdyBmb3IgdHlwb3MuXG4gICAgICB0aGlzLl9wcmVmaXggPSBwcmVmaXg7XG4gICAgfVxuICAgIHRoaXMuX3ByZWZpeFRpbWVvdXQgPSBzZXRUaW1lb3V0KFxuICAgICAgKCkgPT4ge1xuICAgICAgICB0aGlzLl9wcmVmaXggPSAnJztcbiAgICAgICAgdGhpcy5fcHJlZml4VGltZW91dCA9IG51bGw7XG4gICAgICB9LFxuICAgICAgUFJFRklYX1JFU0VUX0RFTEFZXG4gICAgKTtcbiAgfVxuXG4gIC8vIFJldHVybnMgd2hldGhlciBhIG5vZGUgbWF0Y2hpbmcgdGhlIHByZWZpeCB3YXMgc3VjY2Vzc2Z1bGx5IHNlbGVjdGVkLlxuICBfZGlkUmV2ZWFsTm9kZVN0YXJ0aW5nV2l0aChwcmVmaXg6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGNvbnN0IGZpcnN0U2VsZWN0ZWROb2RlID0gbm9kZXMudmFsdWVzKCkubmV4dCgpLnZhbHVlO1xuICAgIGlmIChmaXJzdFNlbGVjdGVkTm9kZSA9PSBudWxsIHx8IGZpcnN0U2VsZWN0ZWROb2RlLmlzUm9vdCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXROb2RlID0gYXJyYXkuZmluZChcbiAgICAgIGZpcnN0U2VsZWN0ZWROb2RlLmdldFBhcmVudE5vZGUoKS5nZXRDaGlsZE5vZGVzKCksXG4gICAgICBjaGlsZE5vZGUgPT4gY2hpbGROb2RlLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZShOT1RfTEVUVEVSUywgJycpLnN0YXJ0c1dpdGgocHJlZml4KVxuICAgICk7XG4gICAgaWYgKHRhcmdldE5vZGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnJldmVhbE5vZGVLZXkodGFyZ2V0Tm9kZS5ub2RlS2V5KTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfVxuXG4gIF9vcGVuQW5kUmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGg6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCkge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCk7XG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuQW5kUmV2ZWFsRGlyZWN0b3J5UGF0aChwYXRoOiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHBhdGggIT0gbnVsbCkge1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkocGF0aCkpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVSb290RGlyZWN0b3JpZXMoKTogdm9pZCB7XG4gICAgLy8gSWYgdGhlIHJlbW90ZS1wcm9qZWN0cyBwYWNrYWdlIGhhc24ndCBsb2FkZWQgeWV0IHJlbW90ZSBkaXJlY3RvcmllcyB3aWxsIGJlIGluc3RhbnRpYXRlZCBhc1xuICAgIC8vIGxvY2FsIGRpcmVjdG9yaWVzIGJ1dCB3aXRoIGludmFsaWQgcGF0aHMuIFdlIG5lZWQgdG8gZXhjbHVkZSB0aG9zZS5cbiAgICBjb25zdCByb290RGlyZWN0b3JpZXMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5maWx0ZXIoZGlyZWN0b3J5ID0+IChcbiAgICAgIEZpbGVUcmVlSGVscGVycy5pc1ZhbGlkRGlyZWN0b3J5KGRpcmVjdG9yeSlcbiAgICApKTtcbiAgICBjb25zdCByb290S2V5cyA9IHJvb3REaXJlY3Rvcmllcy5tYXAoXG4gICAgICBkaXJlY3RvcnkgPT4gRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShkaXJlY3RvcnkuZ2V0UGF0aCgpKVxuICAgICk7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRSb290S2V5cyhyb290S2V5cyk7XG4gICAgdGhpcy5fYWN0aW9ucy51cGRhdGVSZXBvc2l0b3JpZXMocm9vdERpcmVjdG9yaWVzKTtcbiAgfVxuXG4gIF9yZXZlYWxUZXh0RWRpdG9yKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSAoKGV2ZW50LnRhcmdldDogYW55KTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCk7XG4gICAgaWYgKFxuICAgICAgZWRpdG9yRWxlbWVudCA9PSBudWxsXG4gICAgICB8fCB0eXBlb2YgZWRpdG9yRWxlbWVudC5nZXRNb2RlbCAhPT0gJ2Z1bmN0aW9uJ1xuICAgICAgfHwgIWlzVGV4dEVkaXRvcihlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkpXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuZ2V0UGF0aCgpO1xuICAgIHRoaXMuX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXZlYWwgdGhlIGZpbGUgdGhhdCBjdXJyZW50bHkgaGFzIGZvY3VzIGluIHRoZSBmaWxlIHRyZWUuIElmIHNob3dJZkhpZGRlbiBpcyBmYWxzZSxcbiAgICogdGhpcyB3aWxsIGVucXVldWUgYSBwZW5kaW5nIHJldmVhbCB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBmaWxlIHRyZWUgaXMgc2hvd24gYWdhaW4uXG4gICAqL1xuICByZXZlYWxBY3RpdmVGaWxlKHNob3dJZkhpZGRlbj86IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yICE9IG51bGwgPyBlZGl0b3IuZ2V0UGF0aCgpIDogbnVsbDtcbiAgICB0aGlzLl9yZXZlYWxGaWxlUGF0aChmaWxlUGF0aCwgc2hvd0lmSGlkZGVuKTtcbiAgfVxuXG4gIF9yZXZlYWxGaWxlUGF0aChmaWxlUGF0aDogP3N0cmluZywgc2hvd0lmSGlkZGVuPzogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBpZiAoc2hvd0lmSGlkZGVuKSB7XG4gICAgICAvLyBFbnN1cmUgdGhlIGZpbGUgdHJlZSBpcyB2aXNpYmxlIGJlZm9yZSB0cnlpbmcgdG8gcmV2ZWFsIGEgZmlsZSBpbiBpdC4gRXZlbiBpZiB0aGUgY3VycmVudGx5XG4gICAgICAvLyBhY3RpdmUgcGFuZSBpcyBub3QgYW4gb3JkaW5hcnkgZWRpdG9yLCB3ZSBzdGlsbCBhdCBsZWFzdCB3YW50IHRvIHNob3cgdGhlIHRyZWUuXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6dG9nZ2xlJyxcbiAgICAgICAge2Rpc3BsYXk6IHRydWV9XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldmVhbCB0aGUgZmlsZSBvZiBhIGdpdmVuIHRhYiBiYXNlZCBvbiB0aGUgcGF0aCBzdG9yZWQgb24gdGhlIERPTS5cbiAgICogVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgdHJpZ2dlcmVkIGJ5IHRoZSBjb250ZXh0LW1lbnUgY2xpY2suXG4gICAqL1xuICBfcmV2ZWFsVGFiRmlsZU9uQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgdGFiID0gKChldmVudC5jdXJyZW50VGFyZ2V0OiBhbnkpOiBFbGVtZW50KTtcbiAgICBjb25zdCB0aXRsZSA9IHRhYi5xdWVyeVNlbGVjdG9yKCcudGl0bGVbZGF0YS1wYXRoXScpO1xuICAgIGlmICghdGl0bGUpIHtcbiAgICAgIC8vIGNhbiBvbmx5IHJldmVhbCBpdCBpZiB3ZSBmaW5kIHRoZSBmaWxlIHBhdGhcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IHRpdGxlLmRhdGFzZXQucGF0aDtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZTp0b2dnbGUnLFxuICAgICAge2Rpc3BsYXk6IHRydWV9XG4gICAgKTtcbiAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICB9XG5cbiAgcmV2ZWFsTm9kZUtleShub2RlS2V5OiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKCFub2RlS2V5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHJvb3RLZXk6ID9zdHJpbmcgPSB0aGlzLl9zdG9yZS5nZXRSb290Rm9yS2V5KG5vZGVLZXkpO1xuICAgIGlmICghcm9vdEtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBzdGFjayA9IFtdO1xuICAgIGxldCBrZXkgPSBub2RlS2V5O1xuICAgIHdoaWxlIChrZXkgIT0gbnVsbCAmJiBrZXkgIT09IHJvb3RLZXkpIHtcbiAgICAgIHN0YWNrLnB1c2goa2V5KTtcbiAgICAgIGtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkoa2V5KTtcbiAgICB9XG4gICAgLy8gV2Ugd2FudCB0aGUgc3RhY2sgdG8gYmUgW3BhcmVudEtleSwgLi4uLCBub2RlS2V5XS5cbiAgICBzdGFjay5yZXZlcnNlKCk7XG4gICAgc3RhY2suZm9yRWFjaCgoY2hpbGRLZXksIGkpID0+IHtcbiAgICAgIGNvbnN0IHBhcmVudEtleSA9IChpID09PSAwKSA/IHJvb3RLZXkgOiBzdGFja1tpIC0gMV07XG4gICAgICB0aGlzLl9hY3Rpb25zLmVuc3VyZUNoaWxkTm9kZShyb290S2V5LCBwYXJlbnRLZXksIGNoaWxkS2V5KTtcbiAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZShyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH0pO1xuICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgfVxuXG4gIF9zZXRDd2RUb1NlbGVjdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCBwYXRoID0gRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlLnJvb3RLZXkpO1xuICAgIGlmICh0aGlzLl9jd2RBcGkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fY3dkQXBpLnNldEN3ZChwYXRoKTtcbiAgICB9XG4gIH1cblxuICBzZXRDd2RBcGkoY3dkQXBpOiA/Q3dkQXBpKTogdm9pZCB7XG4gICAgaWYgKGN3ZEFwaSA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3Rpb25zLnNldEN3ZChudWxsKTtcbiAgICAgIHRoaXMuX2N3ZEFwaVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudCh0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24gPT0gbnVsbCk7XG4gICAgICB0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24gPSBjd2RBcGkub2JzZXJ2ZUN3ZChkaXJlY3RvcnkgPT4ge1xuICAgICAgICBjb25zdCBwYXRoID0gZGlyZWN0b3J5ID09IG51bGwgPyBudWxsIDogZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICAgICAgY29uc3Qgcm9vdEtleSA9IHBhdGggJiYgRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShwYXRoKTtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5zZXRDd2Qocm9vdEtleSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9jd2RBcGkgPSBjd2RBcGk7XG4gIH1cblxuICBzZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gIH1cblxuICBzZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lcyk7XG4gIH1cblxuICBzZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzKTtcbiAgfVxuXG4gIHNldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFicyk7XG4gIH1cblxuICBzZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2KTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMudXBkYXRlV29ya2luZ1NldCh3b3JraW5nU2V0KTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmUpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZSk7XG4gIH1cblxuICB1cGRhdGVPcGVuRmlsZXNXb3JraW5nU2V0KG9wZW5GaWxlc1dvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZU9wZW5GaWxlc1dvcmtpbmdTZXQob3BlbkZpbGVzV29ya2luZ1NldCk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGFsbCBzZWxlY3RlZCBkaXJlY3Rvcnkgbm9kZXMuIElmIHRoZSBzZWxlY3Rpb24gaXMgYSBzaW5nbGUgZmlsZSBvciBhIHNpbmdsZSBjb2xsYXBzZWRcbiAgICogZGlyZWN0b3J5LCB0aGUgc2VsZWN0aW9uIGlzIHNldCB0byB0aGUgZGlyZWN0b3J5J3MgcGFyZW50LlxuICAgKi9cbiAgX2NvbGxhcHNlU2VsZWN0aW9uKGRlZXA6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgY29uc3QgZmlyc3RTZWxlY3RlZE5vZGUgPSBzZWxlY3RlZE5vZGVzLmZpcnN0KCk7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuc2l6ZSA9PT0gMVxuICAgICAgJiYgIWZpcnN0U2VsZWN0ZWROb2RlLmlzUm9vdFxuICAgICAgJiYgIShmaXJzdFNlbGVjdGVkTm9kZS5pc0NvbnRhaW5lciAmJiBmaXJzdFNlbGVjdGVkTm9kZS5pc0V4cGFuZGVkKCkpKSB7XG4gICAgICAvKlxuICAgICAgICogU2VsZWN0IHRoZSBwYXJlbnQgb2YgdGhlIHNlbGVjdGlvbiBpZiB0aGUgZm9sbG93aW5nIGNyaXRlcmlhIGFyZSBtZXQ6XG4gICAgICAgKiAgICogT25seSAxIG5vZGUgaXMgc2VsZWN0ZWRcbiAgICAgICAqICAgKiBUaGUgbm9kZSBpcyBub3QgYSByb290XG4gICAgICAgKiAgICogVGhlIG5vZGUgaXMgbm90IGFuIGV4cGFuZGVkIGRpcmVjdG9yeVxuICAgICAgICovXG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShmaXJzdFNlbGVjdGVkTm9kZS5ub2RlS2V5KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlbGVjdGVkTm9kZXMuZm9yRWFjaChub2RlID0+IHtcbiAgICAgICAgLy8gT25seSBkaXJlY3RvcmllcyBjYW4gYmUgZXhwYW5kZWQuIFNraXAgbm9uLWRpcmVjdG9yeSBub2Rlcy5cbiAgICAgICAgaWYgKCFub2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZURlZXAobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX2NvbGxhcHNlQWxsKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3RLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICByb290S2V5cy5mb3JFYWNoKHJvb3RLZXkgPT4gdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGVEZWVwKHJvb3RLZXksIHJvb3RLZXkpKTtcbiAgfVxuXG4gIF9kZWxldGVTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgaWYgKG5vZGVzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb290UGF0aHMgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiBub2RlLmlzUm9vdCk7XG4gICAgaWYgKHJvb3RQYXRocy5zaXplID09PSAwKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZFBhdGhzID0gbm9kZXMubWFwKG5vZGUgPT4gbm9kZS5ub2RlUGF0aCk7XG4gICAgICBjb25zdCBtZXNzYWdlID0gJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhlIGZvbGxvd2luZyAnICtcbiAgICAgICAgICAobm9kZXMuc2l6ZSA+IDEgPyAnaXRlbXM/JyA6ICdpdGVtPycpO1xuICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgYnV0dG9uczoge1xuICAgICAgICAgICdEZWxldGUnOiAoKSA9PiB7IHRoaXMuX2FjdGlvbnMuZGVsZXRlU2VsZWN0ZWROb2RlcygpOyB9LFxuICAgICAgICAgICdDYW5jZWwnOiAoKSA9PiB7fSxcbiAgICAgICAgfSxcbiAgICAgICAgZGV0YWlsZWRNZXNzYWdlOiBgWW91IGFyZSBkZWxldGluZzoke29zLkVPTH0ke3NlbGVjdGVkUGF0aHMuam9pbihvcy5FT0wpfWAsXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgbGV0IG1lc3NhZ2U7XG4gICAgICBpZiAocm9vdFBhdGhzLnNpemUgPT09IDEpIHtcbiAgICAgICAgbWVzc2FnZSA9IGBUaGUgcm9vdCBkaXJlY3RvcnkgJyR7cm9vdFBhdGhzLmZpcnN0KCkubm9kZU5hbWV9JyBjYW4ndCBiZSByZW1vdmVkLmA7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCByb290UGF0aE5hbWVzID0gcm9vdFBhdGhzLm1hcChub2RlID0+IGAnJHtub2RlLm5vZGVOYW1lfSdgKS5qb2luKCcsICcpO1xuICAgICAgICBtZXNzYWdlID0gYFRoZSByb290IGRpcmVjdG9yaWVzICR7cm9vdFBhdGhOYW1lc30gY2FuJ3QgYmUgcmVtb3ZlZC5gO1xuICAgICAgfVxuXG4gICAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgICBidXR0b25zOiBbJ09LJ10sXG4gICAgICAgIG1lc3NhZ2UsXG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRXhwYW5kcyBhbGwgc2VsZWN0ZWQgZGlyZWN0b3J5IG5vZGVzLlxuICAgKi9cbiAgX2V4cGFuZFNlbGVjdGlvbihkZWVwOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAvLyBPbmx5IGRpcmVjdG9yaWVzIGNhbiBiZSBleHBhbmRlZC4gU2tpcCBub24tZGlyZWN0b3J5IG5vZGVzLlxuICAgICAgaWYgKCFub2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlRGVlcChub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobm9kZS5pc0V4cGFuZGVkKCkpIHtcbiAgICAgICAgICAvLyBOb2RlIGlzIGFscmVhZHkgZXhwYW5kZWQ7IG1vdmUgdGhlIHNlbGVjdGlvbiB0byB0aGUgZmlyc3QgY2hpbGQuXG4gICAgICAgICAgY29uc3QgW2ZpcnN0Q2hpbGRLZXldID0gbm9kZS5nZXRDaGlsZEtleXMoKTtcbiAgICAgICAgICBpZiAoZmlyc3RDaGlsZEtleSAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlyc3RDaGlsZEtleSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZShub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9tb3ZlRG93bigpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFNlbGVjdGVkS2V5ID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChsYXN0U2VsZWN0ZWRLZXkgPT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gc2VsZWN0aW9uIHlldCwgc28gbW92ZSB0byB0aGUgdG9wIG9mIHRoZSB0cmVlLlxuICAgICAgdGhpcy5fbW92ZVRvVG9wKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBhcmVudEtleTtcbiAgICBsZXQgcm9vdEtleTtcbiAgICBsZXQgc2libGluZ0tleXM7XG4gICAgY29uc3QgaXNSb290ID0gdGhpcy5fc3RvcmUuaXNSb290S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgcm9vdEtleSA9IGxhc3RTZWxlY3RlZEtleTtcbiAgICAgIC8vIE90aGVyIHJvb3RzIGFyZSB0aGlzIHJvb3QncyBzaWJsaW5nc1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgICByb290S2V5ID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEZvcktleShsYXN0U2VsZWN0ZWRLZXkpO1xuXG4gICAgICBpbnZhcmlhbnQocm9vdEtleSAmJiBwYXJlbnRLZXkpO1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcm9vdCBkb2VzIG5vdCBleGlzdCBvciBpZiB0aGlzIGlzIGV4cGVjdGVkIHRvIGhhdmUgYSBwYXJlbnQgYnV0IGRvZXNuJ3QgKHJvb3RzIGRvXG4gICAgLy8gbm90IGhhdmUgcGFyZW50cyksIG5vdGhpbmcgY2FuIGJlIGRvbmUuIEV4aXQuXG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCB8fCAoIWlzUm9vdCAmJiBwYXJlbnRLZXkgPT0gbnVsbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBjaGlsZHJlbiA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChcbiAgICAgIEZpbGVUcmVlSGVscGVycy5pc0RpcktleShsYXN0U2VsZWN0ZWRLZXkpICYmXG4gICAgICB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHJvb3RLZXksIGxhc3RTZWxlY3RlZEtleSkgJiZcbiAgICAgIGNoaWxkcmVuLmxlbmd0aCA+IDBcbiAgICApIHtcbiAgICAgIC8vIERpcmVjdG9yeSBpcyBleHBhbmRlZCBhbmQgaXQgaGFzIGNoaWxkcmVuLiBTZWxlY3QgZmlyc3QgY2hpbGQuIEV4aXQuXG4gICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgY2hpbGRyZW5bMF0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdLZXlzLmluZGV4T2YobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIGNvbnN0IG1heEluZGV4ID0gc2libGluZ0tleXMubGVuZ3RoIC0gMTtcblxuICAgICAgaWYgKGluZGV4IDwgbWF4SW5kZXgpIHtcbiAgICAgICAgY29uc3QgbmV4dFNpYmxpbmdLZXkgPSBzaWJsaW5nS2V5c1tpbmRleCArIDFdO1xuXG4gICAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgICAvLyBJZiB0aGUgbmV4dCBzZWxlY3RlZCBpdGVtIGlzIGFub3RoZXIgcm9vdCwgc2V0IGByb290S2V5YCB0byBpdCBzbyB0cmFja0FuZFNlbGVjdCBmaW5kc1xuICAgICAgICAgIC8vIHRoYXQgW3Jvb3RLZXksIHJvb3RLZXldIHR1cGxlLlxuICAgICAgICAgIHJvb3RLZXkgPSBuZXh0U2libGluZ0tleTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoaXMgaGFzIGEgbmV4dCBzaWJsaW5nLlxuICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgc2libGluZ0tleXNbaW5kZXggKyAxXSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBuZWFyZXN0QW5jZXN0b3JTaWJsaW5nID0gdGhpcy5fZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcocm9vdEtleSwgbGFzdFNlbGVjdGVkS2V5KTtcblxuICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBib3R0b21tb3N0IG5vZGUgb2YgdGhlIHRyZWUsIHRoZXJlIHdvbid0IGJlIGFueXRoaW5nIHRvIHNlbGVjdC5cbiAgICAgICAgLy8gVm9pZCByZXR1cm4gc2lnbmlmaWVzIG5vIG5leHQgbm9kZSB3YXMgZm91bmQuXG4gICAgICAgIGlmIChuZWFyZXN0QW5jZXN0b3JTaWJsaW5nICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUobmVhcmVzdEFuY2VzdG9yU2libGluZy5yb290S2V5LCBuZWFyZXN0QW5jZXN0b3JTaWJsaW5nLm5vZGVLZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgX21vdmVVcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgbGFzdFNlbGVjdGVkS2V5ID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWRLZXlzKCkubGFzdCgpO1xuICAgIGlmIChsYXN0U2VsZWN0ZWRLZXkgPT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgbm8gc2VsZWN0aW9uLiBNb3ZlIHRvIHRoZSBib3R0b20gb2YgdGhlIHRyZWUuXG4gICAgICB0aGlzLl9tb3ZlVG9Cb3R0b20oKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgcGFyZW50S2V5O1xuICAgIGxldCByb290S2V5O1xuICAgIGxldCBzaWJsaW5nS2V5cztcbiAgICBjb25zdCBpc1Jvb3QgPSB0aGlzLl9zdG9yZS5pc1Jvb3RLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoaXNSb290KSB7XG4gICAgICByb290S2V5ID0gbGFzdFNlbGVjdGVkS2V5O1xuICAgICAgLy8gT3RoZXIgcm9vdHMgYXJlIHRoaXMgcm9vdCdzIHNpYmxpbmdzXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobGFzdFNlbGVjdGVkS2V5KTtcbiAgICAgIHJvb3RLZXkgPSB0aGlzLl9zdG9yZS5nZXRSb290Rm9yS2V5KGxhc3RTZWxlY3RlZEtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSByb290IGRvZXMgbm90IGV4aXN0IG9yIGlmIHRoaXMgaXMgZXhwZWN0ZWQgdG8gaGF2ZSBhIHBhcmVudCBidXQgZG9lc24ndCAocm9vdHMgZG9cbiAgICAvLyBub3QgaGF2ZSBwYXJlbnRzKSwgbm90aGluZyBjYW4gYmUgZG9uZS4gRXhpdC5cbiAgICBpZiAocm9vdEtleSA9PSBudWxsIHx8ICghaXNSb290ICYmIHBhcmVudEtleSA9PSBudWxsKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChpbmRleCA9PT0gMCkge1xuICAgICAgaWYgKCFpc1Jvb3QgJiYgcGFyZW50S2V5ICE9IG51bGwpIHtcbiAgICAgICAgLy8gVGhpcyBpcyB0aGUgZmlyc3QgY2hpbGQuIEl0IGhhcyBhIHBhcmVudC4gU2VsZWN0IHRoZSBwYXJlbnQuXG4gICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgICAgfVxuICAgICAgLy8gVGhpcyBpcyB0aGUgcm9vdCBhbmQvb3IgdGhlIHRvcCBvZiB0aGUgdHJlZSAoaGFzIG5vIHBhcmVudCkuIE5vdGhpbmcgZWxzZSB0byB0cmF2ZXJzZS5cbiAgICAgIC8vIEV4aXQuXG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHByZXZpb3VzU2libGluZ0tleSA9IHNpYmxpbmdLZXlzW2luZGV4IC0gMV07XG5cbiAgICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgICAgLy8gSWYgdHJhdmVyc2luZyB1cCB0byBhIGRpZmZlcmVudCByb290LCB0aGUgcm9vdEtleSBtdXN0IGJlY29tZSB0aGF0IG5ldyByb290IHRvIGNoZWNrXG4gICAgICAgIC8vIGV4cGFuZGVkIGtleXMgaW4gaXQuXG4gICAgICAgIHJvb3RLZXkgPSBwcmV2aW91c1NpYmxpbmdLZXk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShcbiAgICAgICAgcm9vdEtleSxcbiAgICAgICAgdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleSwgcHJldmlvdXNTaWJsaW5nS2V5KVxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfbW92ZVRvVG9wKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXlzWzBdLCByb290S2V5c1swXSk7XG4gIH1cblxuICBfbW92ZVRvQm90dG9tKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLl9zdG9yZS5pc0VtcHR5KCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3QgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50IG9mIHRoZSBsYXN0IHJvb3Qgbm9kZS5cbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgY29uc3QgbGFzdFJvb3RLZXkgPSByb290S2V5c1tyb290S2V5cy5sZW5ndGggLSAxXTtcbiAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUoXG4gICAgICBsYXN0Um9vdEtleSxcbiAgICAgIHRoaXMuX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KGxhc3RSb290S2V5LCBsYXN0Um9vdEtleSlcbiAgICApO1xuICB9XG5cbiAgLypcbiAgICogUmV0dXJucyB0aGUgbG93ZXJtb3N0IGRlc2NlbmRhbnQgd2hlbiBjb25zaWRlcmVkIGluIGZpbGUgc3lzdGVtIG9yZGVyIHdpdGggZXhwYW5kYWJsZVxuICAgKiBkaXJlY3Rvcmllcy4gRm9yIGV4YW1wbGU6XG4gICAqXG4gICAqICAgQSA+XG4gICAqICAgICBCID5cbiAgICogICAgIEMgPlxuICAgKiAgICAgICBFLnR4dFxuICAgKiAgICAgRC5mb29cbiAgICpcbiAgICogICA+IF9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShBKVxuICAgKiAgIEQuZm9vXG4gICAqXG4gICAqIFRob3VnaCBBIGhhcyBtb3JlIGRlZXBseS1uZXN0ZWQgZGVzY2VuZGFudHMgdGhhbiBELmZvbywgbGlrZSBFLnR4dCwgRC5mb28gaXMgbG93ZXJtb3N0IHdoZW5cbiAgICogY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlci5cbiAgICovXG4gIF9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgaWYgKCEoRmlsZVRyZWVIZWxwZXJzLmlzRGlyS2V5KG5vZGVLZXkpICYmIHRoaXMuX3N0b3JlLmlzRXhwYW5kZWQocm9vdEtleSwgbm9kZUtleSkpKSB7XG4gICAgICAvLyBJZiBgbm9kZUtleWAgaXMgbm90IGFuIGV4cGFuZGVkIGRpcmVjdG9yeSB0aGVyZSBhcmUgbm8gbW9yZSBkZXNjZW5kYW50cyB0byB0cmF2ZXJzZS4gUmV0dXJuXG4gICAgICAvLyB0aGUgYG5vZGVLZXlgLlxuICAgICAgcmV0dXJuIG5vZGVLZXk7XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIG5vZGVLZXkpO1xuICAgIGlmIChjaGlsZEtleXMubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGhhcyBubyBjaGlsZHJlbiwgdGhlIGRpcmVjdG9yeSBpdHNlbGYgaXMgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50LlxuICAgICAgcmV0dXJuIG5vZGVLZXk7XG4gICAgfVxuXG4gICAgLy8gVGhlcmUncyBhdCBsZWFzdCBvbmUgY2hpbGQuIFJlY3Vyc2UgZG93biB0aGUgbGFzdCBjaGlsZC5cbiAgICByZXR1cm4gdGhpcy5fZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleSwgY2hpbGRLZXlzW2NoaWxkS2V5cy5sZW5ndGggLSAxXSk7XG4gIH1cblxuICAvKlxuICAgKiBSZXR1cm5zIHRoZSBuZWFyZXN0IFwiYW5jZXN0b3Igc2libGluZ1wiIHdoZW4gY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlciB3aXRoIGV4cGFuZGFibGVcbiAgICogZGlyZWN0b3JpZXMuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiAgIEEgPlxuICAgKiAgICAgQiA+XG4gICAqICAgICAgIEMgPlxuICAgKiAgICAgICAgIEUudHh0XG4gICAqICAgRC5mb29cbiAgICpcbiAgICogICA+IF9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhFLnR4dClcbiAgICogICBELmZvb1xuICAgKi9cbiAgX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogP0ZpbGVUcmVlTm9kZURhdGEge1xuICAgIGxldCBwYXJlbnRLZXk7XG4gICAgbGV0IHNpYmxpbmdLZXlzO1xuICAgIGNvbnN0IGlzUm9vdCA9IHJvb3RLZXkgPT09IG5vZGVLZXk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgLy8gYHJvb3RLZXkgPT09IG5vZGVLZXlgIG1lYW5zIHRoaXMgaGFzIHJlY3Vyc2VkIHRvIGEgcm9vdC4gYG5vZGVLZXlgIGlzIGEgcm9vdCBrZXkuXG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHBhcmVudEtleSA9IEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkobm9kZUtleSk7XG5cbiAgICAgIGludmFyaWFudChyb290S2V5ICYmIHBhcmVudEtleSk7XG4gICAgICBzaWJsaW5nS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH1cblxuICAgIGNvbnN0IGluZGV4ID0gc2libGluZ0tleXMuaW5kZXhPZihub2RlS2V5KTtcbiAgICBpZiAoaW5kZXggPCAoc2libGluZ0tleXMubGVuZ3RoIC0gMSkpIHtcbiAgICAgIGNvbnN0IG5leHRTaWJsaW5nID0gc2libGluZ0tleXNbaW5kZXggKyAxXTtcbiAgICAgIC8vIElmIHRyYXZlcnNpbmcgYWNyb3NzIHJvb3RzLCB0aGUgbmV4dCBzaWJsaW5nIGlzIGFsc28gdGhlIG5leHQgcm9vdC4gUmV0dXJuIGl0IGFzIHRoZSBuZXh0XG4gICAgICAvLyByb290IGtleSBhcyB3ZWxsIGFzIHRoZSBuZXh0IG5vZGUga2V5LlxuICAgICAgcmV0dXJuIGlzUm9vdFxuICAgICAgICA/IHtub2RlS2V5OiBuZXh0U2libGluZywgcm9vdEtleTogbmV4dFNpYmxpbmd9XG4gICAgICAgIDoge25vZGVLZXk6IG5leHRTaWJsaW5nLCByb290S2V5fTtcbiAgICB9IGVsc2UgaWYgKHBhcmVudEtleSAhPSBudWxsKSB7XG4gICAgICAvLyBUaGVyZSBpcyBhIHBhcmVudCB0byByZWN1cnNlLiBSZXR1cm4gaXRzIG5lYXJlc3QgYW5jZXN0b3Igc2libGluZy5cbiAgICAgIHJldHVybiB0aGlzLl9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhyb290S2V5LCBwYXJlbnRLZXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBJZiBgcGFyZW50S2V5YCBpcyBudWxsLCBub2RlS2V5IGlzIGEgcm9vdCBhbmQgaGFzIG1vcmUgcGFyZW50cyB0byByZWN1cnNlLiBSZXR1cm4gYG51bGxgIHRvXG4gICAgICAvLyBzaWduaWZ5IG5vIGFwcHJvcHJpYXRlIGtleSB3YXMgZm91bmQuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnkoKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgLy8gT25seSBwZXJmb3JtIHRoZSBkZWZhdWx0IGFjdGlvbiBpZiBhIHNpbmdsZSBub2RlIGlzIHNlbGVjdGVkLlxuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aW9ucy5jb25maXJtTm9kZShzaW5nbGVTZWxlY3RlZE5vZGUucm9vdEtleSwgc2luZ2xlU2VsZWN0ZWROb2RlLm5vZGVLZXkpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KG9yaWVudGF0aW9uOiBhdG9tJFBhbmVTcGxpdE9yaWVudGF0aW9uLCBzaWRlOiBhdG9tJFBhbmVTcGxpdFNpZGUpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAvLyBPbmx5IHBlcmZvcm0gdGhlIGRlZmF1bHQgYWN0aW9uIGlmIGEgc2luZ2xlIG5vZGUgaXMgc2VsZWN0ZWQuXG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsICYmICFzaW5nbGVTZWxlY3RlZE5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgIC8vIGZvcjogaXMgdGhpcyBmZWF0dXJlIHVzZWQgZW5vdWdoIHRvIGp1c3RpZnkgdW5jb2xsYXBzaW5nP1xuICAgICAgdHJhY2soJ2ZpbGV0cmVlLXNwbGl0LWZpbGUnLCB7XG4gICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICBzaWRlLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9hY3Rpb25zLm9wZW5TZWxlY3RlZEVudHJ5U3BsaXQoXG4gICAgICAgIHNpbmdsZVNlbGVjdGVkTm9kZS5ub2RlS2V5LFxuICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgc2lkZSxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCd2ZXJ0aWNhbCcsICdiZWZvcmUnKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bigpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCd2ZXJ0aWNhbCcsICdhZnRlcicpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRMZWZ0KCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ2hvcml6b250YWwnLCAnYmVmb3JlJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0KCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ2hvcml6b250YWwnLCAnYWZ0ZXInKTtcbiAgfVxuXG4gIF9yZW1vdmVSb290Rm9sZGVyU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3ROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKHJvb3ROb2RlICE9IG51bGwgJiYgcm9vdE5vZGUuaXNSb290KSB7XG4gICAgICAvLyBjbG9zZSBhbGwgdGhlIGZpbGVzIGFzc29jaWF0ZWQgd2l0aCB0aGUgcHJvamVjdCBiZWZvcmUgY2xvc2luZ1xuICAgICAgY29uc3QgcHJvamVjdEVkaXRvcnMgPSBhdG9tLndvcmtzcGFjZS5nZXRUZXh0RWRpdG9ycygpO1xuICAgICAgY29uc3Qgcm9vdHMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgICAgcHJvamVjdEVkaXRvcnMuZm9yRWFjaChlZGl0b3IgPT4ge1xuICAgICAgICBjb25zdCBwYXRoID0gZWRpdG9yLmdldFBhdGgoKTtcbiAgICAgICAgLy8gaWYgdGhlIHBhdGggb2YgdGhlIGVkaXRvciBpcyBub3QgbnVsbCBBTkRcbiAgICAgICAgLy8gaXMgcGFydCBvZiB0aGUgY3VycmVudGx5IHNlbGVjdGVkIHJvb3QgdGhhdCB3b3VsZCBiZSByZW1vdmVkIEFORFxuICAgICAgICAvLyBpcyBub3QgcGFydCBvZiBhbnkgb3RoZXIgb3BlbiByb290LCB0aGVuIGNsb3NlIHRoZSBmaWxlLlxuICAgICAgICBpZiAoXG4gICAgICAgICAgcGF0aCAhPSBudWxsICYmXG4gICAgICAgICAgcGF0aC5zdGFydHNXaXRoKHJvb3ROb2RlLm5vZGVQYXRoKSAmJlxuICAgICAgICAgIHJvb3RzLmZpbHRlcihyb290ID0+IHBhdGguc3RhcnRzV2l0aChyb290KSkubGVuZ3RoID09PSAxXG4gICAgICAgICkge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkocGF0aCkuZGVzdHJveUl0ZW0oZWRpdG9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBhY3R1YWxseSBjbG9zZSB0aGUgcHJvamVjdFxuICAgICAgYXRvbS5wcm9qZWN0LnJlbW92ZVBhdGgocm9vdE5vZGUubm9kZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIF9zZWFyY2hJbkRpcmVjdG9yeShldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBEaXNwYXRjaCBhIGNvbW1hbmQgdG8gc2hvdyB0aGUgYFByb2plY3RGaW5kVmlld2AuIFRoaXMgb3BlbnMgdGhlIHZpZXcgYW5kIGZvY3VzZXMgdGhlIHNlYXJjaFxuICAgIC8vIGJveC5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgKChldmVudC50YXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KSxcbiAgICAgICdwcm9qZWN0LWZpbmQ6c2hvdy1pbi1jdXJyZW50LWRpcmVjdG9yeSdcbiAgICApO1xuICB9XG5cbiAgX3Nob3dJbkZpbGVNYW5hZ2VyKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAvLyBPbmx5IGFsbG93IHJldmVhbGluZyBhIHNpbmdsZSBkaXJlY3RvcnkvZmlsZSBhdCBhIHRpbWUuIFJldHVybiBvdGhlcndpc2UuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIobm9kZS5ub2RlUGF0aCk7XG4gIH1cblxuICBfc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXk6IHN0cmluZywgbm9kZUtleTogc3RyaW5nKTogdm9pZCB7XG4gICAgLy8gU2VsZWN0IHRoZSBub2RlIGJlZm9yZSB0cmFja2luZyBpdCBiZWNhdXNlIHNldHRpbmcgYSBuZXcgc2VsZWN0aW9uIGNsZWFycyB0aGUgdHJhY2tlZCBub2RlLlxuICAgIHRoaXMuX2FjdGlvbnMuc2VsZWN0U2luZ2xlTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFRyYWNrZWROb2RlKHJvb3RLZXksIG5vZGVLZXkpO1xuICB9XG5cbiAgX2NvcHlGdWxsUGF0aCgpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwpIHtcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNpbmdsZVNlbGVjdGVkTm9kZS5nZXRMb2NhbFBhdGgoKSk7XG4gICAgfVxuICB9XG5cbiAgZGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgICBmb3IgKGNvbnN0IGRpc3Bvc2FibGUgb2YgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeS52YWx1ZXMoKSkge1xuICAgICAgZGlzcG9zYWJsZS5kaXNwb3NlKCk7XG4gICAgfVxuICAgIHRoaXMuX3N0b3JlLnJlc2V0KCk7XG4gICAgdGhpcy5fY29udGV4dE1lbnUuZGlzcG9zZSgpO1xuICAgIGNsZWFyVGltZW91dCh0aGlzLl9wcmVmaXhUaW1lb3V0KTtcbiAgfVxuXG4gIHNlcmlhbGl6ZSgpOiBGaWxlVHJlZUNvbnRyb2xsZXJTdGF0ZSB7XG4gICAgcmV0dXJuIHtcbiAgICAgIHRyZWU6IHRoaXMuX3N0b3JlLmV4cG9ydERhdGEoKSxcbiAgICB9O1xuICB9XG59XG5cbm1vZHVsZS5leHBvcnRzID0gRmlsZVRyZWVDb250cm9sbGVyO1xuIl19