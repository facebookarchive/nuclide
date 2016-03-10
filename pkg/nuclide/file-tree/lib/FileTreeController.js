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

var _commons = require('../../commons');

var _analytics = require('../../analytics');

var _atomHelpers = require('../../atom-helpers');

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
      var targetNode = _commons.array.find(firstSelectedNode.getParentNode().getChildNodes(), function (childNode) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O29CQWM4QyxNQUFNOztpQ0FDZCxxQkFBcUI7O2lDQUM3QixxQkFBcUI7Ozs7K0JBQ3ZCLG1CQUFtQjs7OzttQ0FDZix1QkFBdUI7Ozs7K0JBQzNCLG1CQUFtQjs7Ozs2QkFDckIsaUJBQWlCOzs7O3lCQUNyQixXQUFXOzs7O3VCQUNiLGVBQWU7O3lCQUNmLGlCQUFpQjs7MkJBQ1Ysb0JBQW9COztrQkFFaEMsSUFBSTs7OztxQkFDRCxPQUFPOzs7O3NCQUVILFFBQVE7Ozs7QUFjOUIsSUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLElBQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFDOztJQUV6QixrQkFBa0I7QUFZWCxXQVpQLGtCQUFrQixDQVlWLEtBQStCLEVBQUU7OzswQkFaekMsa0JBQWtCOztBQWFwQixRQUFJLENBQUMsUUFBUSxHQUFHLDZCQUFnQixXQUFXLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsTUFBTSxHQUFHLDJCQUFjLFdBQVcsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztBQUN6QyxRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0RCxRQUFJLENBQUMsY0FBYyxHQUFHLDhCQUNwQixxQkFBZSxZQUFNO0FBQ25CLFVBQUksTUFBSyxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDcEMsY0FBSyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNwQztLQUNGLENBQUMsQ0FDSCxDQUFDOztBQUVGLFFBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztBQUU5QixRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUFNLE1BQUssc0JBQXNCLEVB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QUFJLENBQUMsY0FBYyxDQUFDLE9BQU8sRUFBRSxDQUFDO0FBQzlCLFdBQUssSUFBTSxVQUFVLElBQUksSUFBSSxDQUFDLDBCQUEwQixDQUFDLE1BQU0sRUFBRSxFQUFFO0FBQ2pFLGtCQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7T0FDdEI7QUFDRCxVQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ3BCLFVBQUksQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDNUIsa0JBQVksQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7S0FDbkM7OztXQUVRLHFCQUE0QjtBQUNuQyxhQUFPO0FBQ0wsWUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO09BQy9CLENBQUM7S0FDSDs7O1NBM3VCRyxrQkFBa0I7OztBQTh1QnhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0N3ZEFwaX0gZnJvbSAnLi4vLi4vY3VycmVudC13b3JraW5nLWRpcmVjdG9yeS9saWIvQ3dkQXBpJztcbmltcG9ydCB0eXBlIHtFeHBvcnRTdG9yZURhdGF9IGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5cbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZSwgRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0VWRU5UX0hBTkRMRVJfU0VMRUNUT1J9ICBmcm9tICcuL0ZpbGVUcmVlQ29uc3RhbnRzJztcbmltcG9ydCBGaWxlU3lzdGVtQWN0aW9ucyBmcm9tICcuL0ZpbGVTeXN0ZW1BY3Rpb25zJztcbmltcG9ydCBGaWxlVHJlZUFjdGlvbnMgZnJvbSAnLi9GaWxlVHJlZUFjdGlvbnMnO1xuaW1wb3J0IEZpbGVUcmVlQ29udGV4dE1lbnUgZnJvbSAnLi9GaWxlVHJlZUNvbnRleHRNZW51JztcbmltcG9ydCBGaWxlVHJlZUhlbHBlcnMgZnJvbSAnLi9GaWxlVHJlZUhlbHBlcnMnO1xuaW1wb3J0IEZpbGVUcmVlU3RvcmUgZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7YXJyYXl9IGZyb20gJy4uLy4uL2NvbW1vbnMnO1xuaW1wb3J0IHt0cmFja30gZnJvbSAnLi4vLi4vYW5hbHl0aWNzJztcbmltcG9ydCB7aXNUZXh0RWRpdG9yfSBmcm9tICcuLi8uLi9hdG9tLWhlbHBlcnMnO1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vd29ya2luZy1zZXRzJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi93b3JraW5nLXNldHMvbGliL1dvcmtpbmdTZXRzU3RvcmUnO1xuXG50eXBlIEZpbGVUcmVlTm9kZURhdGEgPSB7XG4gIG5vZGVLZXk6IHN0cmluZztcbiAgcm9vdEtleTogc3RyaW5nO1xufTtcblxuZXhwb3J0IHR5cGUgRmlsZVRyZWVDb250cm9sbGVyU3RhdGUgPSB7XG4gIHRyZWU6IEV4cG9ydFN0b3JlRGF0YTtcbn07XG5cbmNvbnN0IE5PVF9MRVRURVJTID0gL1teYS16QS1aXS9nO1xuY29uc3QgUFJFRklYX1JFU0VUX0RFTEFZID0gNTAwO1xuXG5jbGFzcyBGaWxlVHJlZUNvbnRyb2xsZXIge1xuICBfYWN0aW9uczogRmlsZVRyZWVBY3Rpb25zO1xuICBfY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnU7XG4gIF9jd2RBcGk6ID9Dd2RBcGk7XG4gIF9jd2RBcGlTdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcbiAgX3JlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+O1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIElEaXNwb3NhYmxlPjtcbiAgX3ByZWZpeDogc3RyaW5nO1xuICBfcHJlZml4VGltZW91dDogP251bWJlcjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlKSB7XG4gICAgdGhpcy5fYWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fY3dkQXBpU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICAgIC8vIEluaXRpYWwgcm9vdCBkaXJlY3Rvcmllc1xuICAgIHRoaXMuX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpO1xuICAgIC8vIFN1YnNlcXVlbnQgcm9vdCBkaXJlY3RvcmllcyB1cGRhdGVkIG9uIGNoYW5nZVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4gdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCkpXG4gICAgKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAvLyBQYXNzIHVuZGVmaW5lZCBzbyB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgZ2V0cyB1c2VkLlxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLXRleHQtZWRpdG9yJzogdGhpcy5fcmV2ZWFsVGV4dEVkaXRvci5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLWFjdGl2ZS1maWxlJzogdGhpcy5yZXZlYWxBY3RpdmVGaWxlLmJpbmQodGhpcywgdW5kZWZpbmVkKSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICBjb25zdCBsZXR0ZXJLZXlCaW5kaW5ncyA9IHt9O1xuICAgIGNvbnN0IHpDaGFyQ29kZSA9ICd6Jy5jaGFyQ29kZUF0KDApO1xuICAgIGZvciAobGV0IGMgPSAnYScuY2hhckNvZGVBdCgwKTsgYyA8PSB6Q2hhckNvZGU7IGMrKykge1xuICAgICAgY29uc3QgY2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICBsZXR0ZXJLZXlCaW5kaW5nc1tgbnVjbGlkZS1maWxlLXRyZWU6Z28tdG8tbGV0dGVyLSR7Y2hhcn1gXSA9XG4gICAgICAgIHRoaXMuX2hhbmRsZVByZWZpeEtleXByZXNzLmJpbmQodGhpcywgY2hhcik7XG4gICAgfVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoRVZFTlRfSEFORExFUl9TRUxFQ1RPUiwge1xuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiB0aGlzLl9tb3ZlRG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXVwJzogdGhpcy5fbW92ZVVwLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogdGhpcy5fbW92ZVRvVG9wLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogdGhpcy5fbW92ZVRvQm90dG9tLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuQWRkRmlsZURpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRmlsZVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZm9sZGVyJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5BZGRGb2xkZXJEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbERpcmVjdG9yeVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1jb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIHRydWUpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWNvbGxhcHNlLWFsbCc6IHRoaXMuX2NvbGxhcHNlQWxsLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb3B5LWZ1bGwtcGF0aCc6IHRoaXMuX2NvcHlGdWxsUGF0aC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6ZXhwYW5kLWRpcmVjdG9yeSc6IHRoaXMuX2V4cGFuZFNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1leHBhbmQtZGlyZWN0b3J5JzogdGhpcy5fZXhwYW5kU2VsZWN0aW9uLmJpbmQodGhpcywgdHJ1ZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5JzogdGhpcy5fb3BlblNlbGVjdGVkRW50cnkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktdXAnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1kb3duJzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1sZWZ0JzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0TGVmdC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUnOiB0aGlzLl9kZWxldGVTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZS1wcm9qZWN0LWZvbGRlci1zZWxlY3Rpb24nOlxuICAgICAgICAgIHRoaXMuX3JlbW92ZVJvb3RGb2xkZXJTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbmFtZS1zZWxlY3Rpb24nOiAoKSA9PiBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuUmVuYW1lRGlhbG9nKCksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpkdXBsaWNhdGUtc2VsZWN0aW9uJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5EdXBsaWNhdGVEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbEZpbGVQYXRoLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6c2VhcmNoLWluLWRpcmVjdG9yeSc6IHRoaXMuX3NlYXJjaEluRGlyZWN0b3J5LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcic6IHRoaXMuX3Nob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzZXQtY3VycmVudC13b3JraW5nLXJvb3QnOiB0aGlzLl9zZXRDd2RUb1NlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAuLi5sZXR0ZXJLZXlCaW5kaW5ncyxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdbaXM9XCJ0YWJzLXRhYlwiXScsIHtcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJldmVhbC10YWItZmlsZSc6IHRoaXMuX3JldmVhbFRhYkZpbGVPbkNsaWNrLmJpbmQodGhpcyksXG4gICAgICB9KVxuICAgICk7XG4gICAgaWYgKHN0YXRlICYmIHN0YXRlLnRyZWUpIHtcbiAgICAgIHRoaXMuX3N0b3JlLmxvYWREYXRhKHN0YXRlLnRyZWUpO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0TWVudSA9IG5ldyBGaWxlVHJlZUNvbnRleHRNZW51KCk7XG4gICAgdGhpcy5fcHJlZml4VGltZW91dCA9IG51bGw7XG4gICAgdGhpcy5fcHJlZml4ID0gJyc7XG4gIH1cblxuICBfaGFuZGxlUHJlZml4S2V5cHJlc3MobGV0dGVyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3N0b3JlLnVzZVByZWZpeE5hdigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9wcmVmaXhUaW1lb3V0ICE9IG51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wcmVmaXhUaW1lb3V0KTtcbiAgICAgIHRoaXMuX3ByZWZpeFRpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBwcmVmaXggPSB0aGlzLl9wcmVmaXggKyBsZXR0ZXI7XG4gICAgaWYgKHRoaXMuX2RpZFJldmVhbE5vZGVTdGFydGluZ1dpdGgocHJlZml4KSkge1xuICAgICAgLy8gT25seSBhcHBlbmQgdGhlIHByZWZpeCBzdHJpbmcgaWYgYSBtYXRjaCBleGlzdHMgdG8gYWxsb3cgZm9yIHR5cG9zLlxuICAgICAgdGhpcy5fcHJlZml4ID0gcHJlZml4O1xuICAgIH1cbiAgICB0aGlzLl9wcmVmaXhUaW1lb3V0ID0gc2V0VGltZW91dChcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5fcHJlZml4ID0gJyc7XG4gICAgICAgIHRoaXMuX3ByZWZpeFRpbWVvdXQgPSBudWxsO1xuICAgICAgfSxcbiAgICAgIFBSRUZJWF9SRVNFVF9ERUxBWVxuICAgICk7XG4gIH1cblxuICAvLyBSZXR1cm5zIHdoZXRoZXIgYSBub2RlIG1hdGNoaW5nIHRoZSBwcmVmaXggd2FzIHN1Y2Nlc3NmdWxseSBzZWxlY3RlZC5cbiAgX2RpZFJldmVhbE5vZGVTdGFydGluZ1dpdGgocHJlZml4OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBub2RlcyA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICBjb25zdCBmaXJzdFNlbGVjdGVkTm9kZSA9IG5vZGVzLnZhbHVlcygpLm5leHQoKS52YWx1ZTtcbiAgICBpZiAoZmlyc3RTZWxlY3RlZE5vZGUgPT0gbnVsbCB8fCBmaXJzdFNlbGVjdGVkTm9kZS5pc1Jvb3QpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgY29uc3QgdGFyZ2V0Tm9kZSA9IGFycmF5LmZpbmQoXG4gICAgICBmaXJzdFNlbGVjdGVkTm9kZS5nZXRQYXJlbnROb2RlKCkuZ2V0Q2hpbGROb2RlcygpLFxuICAgICAgY2hpbGROb2RlID0+IGNoaWxkTm9kZS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLnJlcGxhY2UoTk9UX0xFVFRFUlMsICcnKS5zdGFydHNXaXRoKHByZWZpeClcbiAgICApO1xuICAgIGlmICh0YXJnZXROb2RlID09IG51bGwpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5yZXZlYWxOb2RlS2V5KHRhcmdldE5vZGUubm9kZUtleSk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBfb3BlbkFuZFJldmVhbEZpbGVQYXRoKGZpbGVQYXRoOiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKGZpbGVQYXRoICE9IG51bGwpIHtcbiAgICAgIGF0b20ud29ya3NwYWNlLm9wZW4oZmlsZVBhdGgpO1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KGZpbGVQYXRoKTtcbiAgICB9XG4gIH1cblxuICBfb3BlbkFuZFJldmVhbERpcmVjdG9yeVBhdGgocGF0aDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChwYXRoICE9IG51bGwpIHtcbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KHBhdGgpKTtcbiAgICB9XG4gIH1cblxuICBfdXBkYXRlUm9vdERpcmVjdG9yaWVzKCk6IHZvaWQge1xuICAgIC8vIElmIHRoZSByZW1vdGUtcHJvamVjdHMgcGFja2FnZSBoYXNuJ3QgbG9hZGVkIHlldCByZW1vdGUgZGlyZWN0b3JpZXMgd2lsbCBiZSBpbnN0YW50aWF0ZWQgYXNcbiAgICAvLyBsb2NhbCBkaXJlY3RvcmllcyBidXQgd2l0aCBpbnZhbGlkIHBhdGhzLiBXZSBuZWVkIHRvIGV4Y2x1ZGUgdGhvc2UuXG4gICAgY29uc3Qgcm9vdERpcmVjdG9yaWVzID0gYXRvbS5wcm9qZWN0LmdldERpcmVjdG9yaWVzKCkuZmlsdGVyKGRpcmVjdG9yeSA9PiAoXG4gICAgICBGaWxlVHJlZUhlbHBlcnMuaXNWYWxpZERpcmVjdG9yeShkaXJlY3RvcnkpXG4gICAgKSk7XG4gICAgY29uc3Qgcm9vdEtleXMgPSByb290RGlyZWN0b3JpZXMubWFwKFxuICAgICAgZGlyZWN0b3J5ID0+IEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkoZGlyZWN0b3J5LmdldFBhdGgoKSlcbiAgICApO1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0Um9vdEtleXMocm9vdEtleXMpO1xuICAgIHRoaXMuX2FjdGlvbnMudXBkYXRlUmVwb3NpdG9yaWVzKHJvb3REaXJlY3Rvcmllcyk7XG4gIH1cblxuICBfcmV2ZWFsVGV4dEVkaXRvcihldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3JFbGVtZW50ID0gKChldmVudC50YXJnZXQ6IGFueSk6IGF0b20kVGV4dEVkaXRvckVsZW1lbnQpO1xuICAgIGlmIChcbiAgICAgIGVkaXRvckVsZW1lbnQgPT0gbnVsbFxuICAgICAgfHwgdHlwZW9mIGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwgIT09ICdmdW5jdGlvbidcbiAgICAgIHx8ICFpc1RleHRFZGl0b3IoZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpKVxuICAgICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yRWxlbWVudC5nZXRNb2RlbCgpLmdldFBhdGgoKTtcbiAgICB0aGlzLl9yZXZlYWxGaWxlUGF0aChmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUmV2ZWFsIHRoZSBmaWxlIHRoYXQgY3VycmVudGx5IGhhcyBmb2N1cyBpbiB0aGUgZmlsZSB0cmVlLiBJZiBzaG93SWZIaWRkZW4gaXMgZmFsc2UsXG4gICAqIHRoaXMgd2lsbCBlbnF1ZXVlIGEgcGVuZGluZyByZXZlYWwgdG8gYmUgZXhlY3V0ZWQgd2hlbiB0aGUgZmlsZSB0cmVlIGlzIHNob3duIGFnYWluLlxuICAgKi9cbiAgcmV2ZWFsQWN0aXZlRmlsZShzaG93SWZIaWRkZW4/OiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvciA9IGF0b20ud29ya3NwYWNlLmdldEFjdGl2ZVRleHRFZGl0b3IoKTtcbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvciAhPSBudWxsID8gZWRpdG9yLmdldFBhdGgoKSA6IG51bGw7XG4gICAgdGhpcy5fcmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGgsIHNob3dJZkhpZGRlbik7XG4gIH1cblxuICBfcmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGg6ID9zdHJpbmcsIHNob3dJZkhpZGRlbj86IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgaWYgKHNob3dJZkhpZGRlbikge1xuICAgICAgLy8gRW5zdXJlIHRoZSBmaWxlIHRyZWUgaXMgdmlzaWJsZSBiZWZvcmUgdHJ5aW5nIHRvIHJldmVhbCBhIGZpbGUgaW4gaXQuIEV2ZW4gaWYgdGhlIGN1cnJlbnRseVxuICAgICAgLy8gYWN0aXZlIHBhbmUgaXMgbm90IGFuIG9yZGluYXJ5IGVkaXRvciwgd2Ugc3RpbGwgYXQgbGVhc3Qgd2FudCB0byBzaG93IHRoZSB0cmVlLlxuICAgICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnRvZ2dsZScsXG4gICAgICAgIHtkaXNwbGF5OiB0cnVlfVxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoIWZpbGVQYXRoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5yZXZlYWxOb2RlS2V5KGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXZlYWwgdGhlIGZpbGUgb2YgYSBnaXZlbiB0YWIgYmFzZWQgb24gdGhlIHBhdGggc3RvcmVkIG9uIHRoZSBET00uXG4gICAqIFRoaXMgbWV0aG9kIGlzIG1lYW50IHRvIGJlIHRyaWdnZXJlZCBieSB0aGUgY29udGV4dC1tZW51IGNsaWNrLlxuICAgKi9cbiAgX3JldmVhbFRhYkZpbGVPbkNsaWNrKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IHRhYiA9ICgoZXZlbnQuY3VycmVudFRhcmdldDogYW55KTogRWxlbWVudCk7XG4gICAgY29uc3QgdGl0bGUgPSB0YWIucXVlcnlTZWxlY3RvcignLnRpdGxlW2RhdGEtcGF0aF0nKTtcbiAgICBpZiAoIXRpdGxlKSB7XG4gICAgICAvLyBjYW4gb25seSByZXZlYWwgaXQgaWYgd2UgZmluZCB0aGUgZmlsZSBwYXRoXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZVBhdGggPSB0aXRsZS5kYXRhc2V0LnBhdGg7XG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAnbnVjbGlkZS1maWxlLXRyZWU6dG9nZ2xlJyxcbiAgICAgIHtkaXNwbGF5OiB0cnVlfVxuICAgICk7XG4gICAgdGhpcy5yZXZlYWxOb2RlS2V5KGZpbGVQYXRoKTtcbiAgfVxuXG4gIHJldmVhbE5vZGVLZXkobm9kZUtleTogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmICghbm9kZUtleSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBjb25zdCByb290S2V5OiA/c3RyaW5nID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEZvcktleShub2RlS2V5KTtcbiAgICBpZiAoIXJvb3RLZXkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3Qgc3RhY2sgPSBbXTtcbiAgICBsZXQga2V5ID0gbm9kZUtleTtcbiAgICB3aGlsZSAoa2V5ICE9IG51bGwgJiYga2V5ICE9PSByb290S2V5KSB7XG4gICAgICBzdGFjay5wdXNoKGtleSk7XG4gICAgICBrZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGtleSk7XG4gICAgfVxuICAgIC8vIFdlIHdhbnQgdGhlIHN0YWNrIHRvIGJlIFtwYXJlbnRLZXksIC4uLiwgbm9kZUtleV0uXG4gICAgc3RhY2sucmV2ZXJzZSgpO1xuICAgIHN0YWNrLmZvckVhY2goKGNoaWxkS2V5LCBpKSA9PiB7XG4gICAgICBjb25zdCBwYXJlbnRLZXkgPSAoaSA9PT0gMCkgPyByb290S2V5IDogc3RhY2tbaSAtIDFdO1xuICAgICAgdGhpcy5fYWN0aW9ucy5lbnN1cmVDaGlsZE5vZGUocm9vdEtleSwgcGFyZW50S2V5LCBjaGlsZEtleSk7XG4gICAgICB0aGlzLl9hY3Rpb25zLmV4cGFuZE5vZGUocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9KTtcbiAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gIH1cblxuICBfc2V0Q3dkVG9TZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGF0aCA9IEZpbGVUcmVlSGVscGVycy5rZXlUb1BhdGgobm9kZS5yb290S2V5KTtcbiAgICBpZiAodGhpcy5fY3dkQXBpICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2N3ZEFwaS5zZXRDd2QocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgc2V0Q3dkQXBpKGN3ZEFwaTogP0N3ZEFwaSk6IHZvaWQge1xuICAgIGlmIChjd2RBcGkgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aW9ucy5zZXRDd2QobnVsbCk7XG4gICAgICB0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fY3dkQXBpU3Vic2NyaXB0aW9uID09IG51bGwpO1xuICAgICAgdGhpcy5fY3dkQXBpU3Vic2NyaXB0aW9uID0gY3dkQXBpLm9ic2VydmVDd2QoZGlyZWN0b3J5ID0+IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IGRpcmVjdG9yeSA9PSBudWxsID8gbnVsbCA6IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IHJvb3RLZXkgPSBwYXRoICYmIEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkocGF0aCk7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuc2V0Q3dkKHJvb3RLZXkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fY3dkQXBpID0gY3dkQXBpO1xuICB9XG5cbiAgc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lcyk7XG4gIH1cblxuICBzZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnMpO1xuICB9XG5cbiAgc2V0VXNlUHJlZml4TmF2KHVzZVByZWZpeE5hdjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VXNlUHJlZml4TmF2KHVzZVByZWZpeE5hdik7XG4gIH1cblxuICB1cGRhdGVXb3JraW5nU2V0KHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVdvcmtpbmdTZXQod29ya2luZ1NldCk7XG4gIH1cblxuICB1cGRhdGVXb3JraW5nU2V0c1N0b3JlKHdvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy51cGRhdGVXb3JraW5nU2V0c1N0b3JlKHdvcmtpbmdTZXRzU3RvcmUpO1xuICB9XG5cbiAgdXBkYXRlT3BlbkZpbGVzV29ya2luZ1NldChvcGVuRmlsZXNXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy51cGRhdGVPcGVuRmlsZXNXb3JraW5nU2V0KG9wZW5GaWxlc1dvcmtpbmdTZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxhcHNlcyBhbGwgc2VsZWN0ZWQgZGlyZWN0b3J5IG5vZGVzLiBJZiB0aGUgc2VsZWN0aW9uIGlzIGEgc2luZ2xlIGZpbGUgb3IgYSBzaW5nbGUgY29sbGFwc2VkXG4gICAqIGRpcmVjdG9yeSwgdGhlIHNlbGVjdGlvbiBpcyBzZXQgdG8gdGhlIGRpcmVjdG9yeSdzIHBhcmVudC5cbiAgICovXG4gIF9jb2xsYXBzZVNlbGVjdGlvbihkZWVwOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGNvbnN0IGZpcnN0U2VsZWN0ZWROb2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGlmIChzZWxlY3RlZE5vZGVzLnNpemUgPT09IDFcbiAgICAgICYmICFmaXJzdFNlbGVjdGVkTm9kZS5pc1Jvb3RcbiAgICAgICYmICEoZmlyc3RTZWxlY3RlZE5vZGUuaXNDb250YWluZXIgJiYgZmlyc3RTZWxlY3RlZE5vZGUuaXNFeHBhbmRlZCgpKSkge1xuICAgICAgLypcbiAgICAgICAqIFNlbGVjdCB0aGUgcGFyZW50IG9mIHRoZSBzZWxlY3Rpb24gaWYgdGhlIGZvbGxvd2luZyBjcml0ZXJpYSBhcmUgbWV0OlxuICAgICAgICogICAqIE9ubHkgMSBub2RlIGlzIHNlbGVjdGVkXG4gICAgICAgKiAgICogVGhlIG5vZGUgaXMgbm90IGEgcm9vdFxuICAgICAgICogICAqIFRoZSBub2RlIGlzIG5vdCBhbiBleHBhbmRlZCBkaXJlY3RvcnlcbiAgICAgICAqL1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KEZpbGVUcmVlSGVscGVycy5nZXRQYXJlbnRLZXkoZmlyc3RTZWxlY3RlZE5vZGUubm9kZUtleSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIC8vIE9ubHkgZGlyZWN0b3JpZXMgY2FuIGJlIGV4cGFuZGVkLiBTa2lwIG5vbi1kaXJlY3Rvcnkgbm9kZXMuXG4gICAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGVEZWVwKG5vZGUucm9vdEtleSwgbm9kZS5ub2RlS2V5KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZShub2RlLnJvb3RLZXksIG5vZGUubm9kZUtleSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIF9jb2xsYXBzZUFsbCgpOiB2b2lkIHtcbiAgICBjb25zdCByb290S2V5cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgcm9vdEtleXMuZm9yRWFjaChyb290S2V5ID0+IHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlRGVlcChyb290S2V5LCByb290S2V5KSk7XG4gIH1cblxuICBfZGVsZXRlU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGlmIChub2Rlcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdFBhdGhzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZS5pc1Jvb3QpO1xuICAgIGlmIChyb290UGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRQYXRocyA9IG5vZGVzLm1hcChub2RlID0+IG5vZGUubm9kZVBhdGgpO1xuICAgICAgY29uc3QgbWVzc2FnZSA9ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoZSBmb2xsb3dpbmcgJyArXG4gICAgICAgICAgKG5vZGVzLnNpemUgPiAxID8gJ2l0ZW1zPycgOiAnaXRlbT8nKTtcbiAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAnRGVsZXRlJzogKCkgPT4geyB0aGlzLl9hY3Rpb25zLmRlbGV0ZVNlbGVjdGVkTm9kZXMoKTsgfSxcbiAgICAgICAgICAnQ2FuY2VsJzogKCkgPT4ge30sXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogYFlvdSBhcmUgZGVsZXRpbmc6JHtvcy5FT0x9JHtzZWxlY3RlZFBhdGhzLmpvaW4ob3MuRU9MKX1gLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgaWYgKHJvb3RQYXRocy5zaXplID09PSAxKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBgVGhlIHJvb3QgZGlyZWN0b3J5ICcke3Jvb3RQYXRocy5maXJzdCgpLm5vZGVOYW1lfScgY2FuJ3QgYmUgcmVtb3ZlZC5gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgcm9vdFBhdGhOYW1lcyA9IHJvb3RQYXRocy5tYXAobm9kZSA9PiBgJyR7bm9kZS5ub2RlTmFtZX0nYCkuam9pbignLCAnKTtcbiAgICAgICAgbWVzc2FnZSA9IGBUaGUgcm9vdCBkaXJlY3RvcmllcyAke3Jvb3RQYXRoTmFtZXN9IGNhbid0IGJlIHJlbW92ZWQuYDtcbiAgICAgIH1cblxuICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgYnV0dG9uczogWydPSyddLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIHNlbGVjdGVkIGRpcmVjdG9yeSBub2Rlcy5cbiAgICovXG4gIF9leHBhbmRTZWxlY3Rpb24oZGVlcDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgLy8gT25seSBkaXJlY3RvcmllcyBjYW4gYmUgZXhwYW5kZWQuIFNraXAgbm9uLWRpcmVjdG9yeSBub2Rlcy5cbiAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZURlZXAobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKG5vZGUuaXNFeHBhbmRlZCgpKSB7XG4gICAgICAgICAgLy8gTm9kZSBpcyBhbHJlYWR5IGV4cGFuZGVkOyBtb3ZlIHRoZSBzZWxlY3Rpb24gdG8gdGhlIGZpcnN0IGNoaWxkLlxuICAgICAgICAgIGNvbnN0IFtmaXJzdENoaWxkS2V5XSA9IG5vZGUuZ2V0Q2hpbGRLZXlzKCk7XG4gICAgICAgICAgaWYgKGZpcnN0Q2hpbGRLZXkgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KGZpcnN0Q2hpbGRLZXkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLmV4cGFuZE5vZGUobm9kZS5yb290S2V5LCBub2RlLm5vZGVLZXkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfbW92ZURvd24oKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RTZWxlY3RlZEtleSA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkS2V5cygpLmxhc3QoKTtcbiAgICBpZiAobGFzdFNlbGVjdGVkS2V5ID09IG51bGwpIHtcbiAgICAgIC8vIFRoZXJlIGlzIG5vIHNlbGVjdGlvbiB5ZXQsIHNvIG1vdmUgdG8gdGhlIHRvcCBvZiB0aGUgdHJlZS5cbiAgICAgIHRoaXMuX21vdmVUb1RvcCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCBwYXJlbnRLZXk7XG4gICAgbGV0IHJvb3RLZXk7XG4gICAgbGV0IHNpYmxpbmdLZXlzO1xuICAgIGNvbnN0IGlzUm9vdCA9IHRoaXMuX3N0b3JlLmlzUm9vdEtleShsYXN0U2VsZWN0ZWRLZXkpO1xuICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgIHJvb3RLZXkgPSBsYXN0U2VsZWN0ZWRLZXk7XG4gICAgICAvLyBPdGhlciByb290cyBhcmUgdGhpcyByb290J3Mgc2libGluZ3NcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFyZW50S2V5ID0gRmlsZVRyZWVIZWxwZXJzLmdldFBhcmVudEtleShsYXN0U2VsZWN0ZWRLZXkpO1xuICAgICAgcm9vdEtleSA9IHRoaXMuX3N0b3JlLmdldFJvb3RGb3JLZXkobGFzdFNlbGVjdGVkS2V5KTtcblxuICAgICAgaW52YXJpYW50KHJvb3RLZXkgJiYgcGFyZW50S2V5KTtcbiAgICAgIHNpYmxpbmdLZXlzID0gdGhpcy5fc3RvcmUuZ2V0Q2FjaGVkQ2hpbGRLZXlzKHJvb3RLZXksIHBhcmVudEtleSk7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHJvb3QgZG9lcyBub3QgZXhpc3Qgb3IgaWYgdGhpcyBpcyBleHBlY3RlZCB0byBoYXZlIGEgcGFyZW50IGJ1dCBkb2Vzbid0IChyb290cyBkb1xuICAgIC8vIG5vdCBoYXZlIHBhcmVudHMpLCBub3RoaW5nIGNhbiBiZSBkb25lLiBFeGl0LlxuICAgIGlmIChyb290S2V5ID09IG51bGwgfHwgKCFpc1Jvb3QgJiYgcGFyZW50S2V5ID09IG51bGwpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgY2hpbGRyZW4gPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgbGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoXG4gICAgICBGaWxlVHJlZUhlbHBlcnMuaXNEaXJLZXkobGFzdFNlbGVjdGVkS2V5KSAmJlxuICAgICAgdGhpcy5fc3RvcmUuaXNFeHBhbmRlZChyb290S2V5LCBsYXN0U2VsZWN0ZWRLZXkpICYmXG4gICAgICBjaGlsZHJlbi5sZW5ndGggPiAwXG4gICAgKSB7XG4gICAgICAvLyBEaXJlY3RvcnkgaXMgZXhwYW5kZWQgYW5kIGl0IGhhcyBjaGlsZHJlbi4gU2VsZWN0IGZpcnN0IGNoaWxkLiBFeGl0LlxuICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIGNoaWxkcmVuWzBdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgaW5kZXggPSBzaWJsaW5nS2V5cy5pbmRleE9mKGxhc3RTZWxlY3RlZEtleSk7XG4gICAgICBjb25zdCBtYXhJbmRleCA9IHNpYmxpbmdLZXlzLmxlbmd0aCAtIDE7XG5cbiAgICAgIGlmIChpbmRleCA8IG1heEluZGV4KSB7XG4gICAgICAgIGNvbnN0IG5leHRTaWJsaW5nS2V5ID0gc2libGluZ0tleXNbaW5kZXggKyAxXTtcblxuICAgICAgICBpZiAoaXNSb290KSB7XG4gICAgICAgICAgLy8gSWYgdGhlIG5leHQgc2VsZWN0ZWQgaXRlbSBpcyBhbm90aGVyIHJvb3QsIHNldCBgcm9vdEtleWAgdG8gaXQgc28gdHJhY2tBbmRTZWxlY3QgZmluZHNcbiAgICAgICAgICAvLyB0aGF0IFtyb290S2V5LCByb290S2V5XSB0dXBsZS5cbiAgICAgICAgICByb290S2V5ID0gbmV4dFNpYmxpbmdLZXk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGlzIGhhcyBhIG5leHQgc2libGluZy5cbiAgICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKHJvb3RLZXksIHNpYmxpbmdLZXlzW2luZGV4ICsgMV0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3QgbmVhcmVzdEFuY2VzdG9yU2libGluZyA9IHRoaXMuX2ZpbmROZWFyZXN0QW5jZXN0b3JTaWJsaW5nKHJvb3RLZXksIGxhc3RTZWxlY3RlZEtleSk7XG5cbiAgICAgICAgLy8gSWYgdGhpcyBpcyB0aGUgYm90dG9tbW9zdCBub2RlIG9mIHRoZSB0cmVlLCB0aGVyZSB3b24ndCBiZSBhbnl0aGluZyB0byBzZWxlY3QuXG4gICAgICAgIC8vIFZvaWQgcmV0dXJuIHNpZ25pZmllcyBubyBuZXh0IG5vZGUgd2FzIGZvdW5kLlxuICAgICAgICBpZiAobmVhcmVzdEFuY2VzdG9yU2libGluZyAhPSBudWxsKSB7XG4gICAgICAgICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKG5lYXJlc3RBbmNlc3RvclNpYmxpbmcucm9vdEtleSwgbmVhcmVzdEFuY2VzdG9yU2libGluZy5ub2RlS2V5KTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIF9tb3ZlVXAoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuX3N0b3JlLmlzRW1wdHkoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGxhc3RTZWxlY3RlZEtleSA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkS2V5cygpLmxhc3QoKTtcbiAgICBpZiAobGFzdFNlbGVjdGVkS2V5ID09IG51bGwpIHtcbiAgICAgIC8vIFRoZXJlIGlzIG5vIHNlbGVjdGlvbi4gTW92ZSB0byB0aGUgYm90dG9tIG9mIHRoZSB0cmVlLlxuICAgICAgdGhpcy5fbW92ZVRvQm90dG9tKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHBhcmVudEtleTtcbiAgICBsZXQgcm9vdEtleTtcbiAgICBsZXQgc2libGluZ0tleXM7XG4gICAgY29uc3QgaXNSb290ID0gdGhpcy5fc3RvcmUuaXNSb290S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgaWYgKGlzUm9vdCkge1xuICAgICAgcm9vdEtleSA9IGxhc3RTZWxlY3RlZEtleTtcbiAgICAgIC8vIE90aGVyIHJvb3RzIGFyZSB0aGlzIHJvb3QncyBzaWJsaW5nc1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KGxhc3RTZWxlY3RlZEtleSk7XG4gICAgICByb290S2V5ID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEZvcktleShsYXN0U2VsZWN0ZWRLZXkpO1xuXG4gICAgICBpbnZhcmlhbnQocm9vdEtleSAmJiBwYXJlbnRLZXkpO1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgcm9vdCBkb2VzIG5vdCBleGlzdCBvciBpZiB0aGlzIGlzIGV4cGVjdGVkIHRvIGhhdmUgYSBwYXJlbnQgYnV0IGRvZXNuJ3QgKHJvb3RzIGRvXG4gICAgLy8gbm90IGhhdmUgcGFyZW50cyksIG5vdGhpbmcgY2FuIGJlIGRvbmUuIEV4aXQuXG4gICAgaWYgKHJvb3RLZXkgPT0gbnVsbCB8fCAoIWlzUm9vdCAmJiBwYXJlbnRLZXkgPT0gbnVsbCkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdLZXlzLmluZGV4T2YobGFzdFNlbGVjdGVkS2V5KTtcbiAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgIGlmICghaXNSb290ICYmIHBhcmVudEtleSAhPSBudWxsKSB7XG4gICAgICAgIC8vIFRoaXMgaXMgdGhlIGZpcnN0IGNoaWxkLiBJdCBoYXMgYSBwYXJlbnQuIFNlbGVjdCB0aGUgcGFyZW50LlxuICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICAgIH1cbiAgICAgIC8vIFRoaXMgaXMgdGhlIHJvb3QgYW5kL29yIHRoZSB0b3Agb2YgdGhlIHRyZWUgKGhhcyBubyBwYXJlbnQpLiBOb3RoaW5nIGVsc2UgdG8gdHJhdmVyc2UuXG4gICAgICAvLyBFeGl0LlxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBwcmV2aW91c1NpYmxpbmdLZXkgPSBzaWJsaW5nS2V5c1tpbmRleCAtIDFdO1xuXG4gICAgICBpZiAoaXNSb290KSB7XG4gICAgICAgIC8vIElmIHRyYXZlcnNpbmcgdXAgdG8gYSBkaWZmZXJlbnQgcm9vdCwgdGhlIHJvb3RLZXkgbXVzdCBiZWNvbWUgdGhhdCBuZXcgcm9vdCB0byBjaGVja1xuICAgICAgICAvLyBleHBhbmRlZCBrZXlzIGluIGl0LlxuICAgICAgICByb290S2V5ID0gcHJldmlvdXNTaWJsaW5nS2V5O1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUoXG4gICAgICAgIHJvb3RLZXksXG4gICAgICAgIHRoaXMuX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KHJvb3RLZXksIHByZXZpb3VzU2libGluZ0tleSlcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgX21vdmVUb1RvcCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdEtleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5c1swXSwgcm9vdEtleXNbMF0pO1xuICB9XG5cbiAgX21vdmVUb0JvdHRvbSgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5fc3RvcmUuaXNFbXB0eSgpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gU2VsZWN0IHRoZSBsb3dlcm1vc3QgZGVzY2VuZGFudCBvZiB0aGUgbGFzdCByb290IG5vZGUuXG4gICAgY29uc3Qgcm9vdEtleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIGNvbnN0IGxhc3RSb290S2V5ID0gcm9vdEtleXNbcm9vdEtleXMubGVuZ3RoIC0gMV07XG4gICAgdGhpcy5fc2VsZWN0QW5kVHJhY2tOb2RlKFxuICAgICAgbGFzdFJvb3RLZXksXG4gICAgICB0aGlzLl9maW5kTG93ZXJtb3N0RGVzY2VuZGFudEtleShsYXN0Um9vdEtleSwgbGFzdFJvb3RLZXkpXG4gICAgKTtcbiAgfVxuXG4gIC8qXG4gICAqIFJldHVybnMgdGhlIGxvd2VybW9zdCBkZXNjZW5kYW50IHdoZW4gY29uc2lkZXJlZCBpbiBmaWxlIHN5c3RlbSBvcmRlciB3aXRoIGV4cGFuZGFibGVcbiAgICogZGlyZWN0b3JpZXMuIEZvciBleGFtcGxlOlxuICAgKlxuICAgKiAgIEEgPlxuICAgKiAgICAgQiA+XG4gICAqICAgICBDID5cbiAgICogICAgICAgRS50eHRcbiAgICogICAgIEQuZm9vXG4gICAqXG4gICAqICAgPiBfZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkoQSlcbiAgICogICBELmZvb1xuICAgKlxuICAgKiBUaG91Z2ggQSBoYXMgbW9yZSBkZWVwbHktbmVzdGVkIGRlc2NlbmRhbnRzIHRoYW4gRC5mb28sIGxpa2UgRS50eHQsIEQuZm9vIGlzIGxvd2VybW9zdCB3aGVuXG4gICAqIGNvbnNpZGVyZWQgaW4gZmlsZSBzeXN0ZW0gb3JkZXIuXG4gICAqL1xuICBfZmluZExvd2VybW9zdERlc2NlbmRhbnRLZXkocm9vdEtleTogc3RyaW5nLCBub2RlS2V5OiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGlmICghKEZpbGVUcmVlSGVscGVycy5pc0RpcktleShub2RlS2V5KSAmJiB0aGlzLl9zdG9yZS5pc0V4cGFuZGVkKHJvb3RLZXksIG5vZGVLZXkpKSkge1xuICAgICAgLy8gSWYgYG5vZGVLZXlgIGlzIG5vdCBhbiBleHBhbmRlZCBkaXJlY3RvcnkgdGhlcmUgYXJlIG5vIG1vcmUgZGVzY2VuZGFudHMgdG8gdHJhdmVyc2UuIFJldHVyblxuICAgICAgLy8gdGhlIGBub2RlS2V5YC5cbiAgICAgIHJldHVybiBub2RlS2V5O1xuICAgIH1cblxuICAgIGNvbnN0IGNoaWxkS2V5cyA9IHRoaXMuX3N0b3JlLmdldENhY2hlZENoaWxkS2V5cyhyb290S2V5LCBub2RlS2V5KTtcbiAgICBpZiAoY2hpbGRLZXlzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgLy8gSWYgdGhlIGRpcmVjdG9yeSBoYXMgbm8gY2hpbGRyZW4sIHRoZSBkaXJlY3RvcnkgaXRzZWxmIGlzIHRoZSBsb3dlcm1vc3QgZGVzY2VuZGFudC5cbiAgICAgIHJldHVybiBub2RlS2V5O1xuICAgIH1cblxuICAgIC8vIFRoZXJlJ3MgYXQgbGVhc3Qgb25lIGNoaWxkLiBSZWN1cnNlIGRvd24gdGhlIGxhc3QgY2hpbGQuXG4gICAgcmV0dXJuIHRoaXMuX2ZpbmRMb3dlcm1vc3REZXNjZW5kYW50S2V5KHJvb3RLZXksIGNoaWxkS2V5c1tjaGlsZEtleXMubGVuZ3RoIC0gMV0pO1xuICB9XG5cbiAgLypcbiAgICogUmV0dXJucyB0aGUgbmVhcmVzdCBcImFuY2VzdG9yIHNpYmxpbmdcIiB3aGVuIGNvbnNpZGVyZWQgaW4gZmlsZSBzeXN0ZW0gb3JkZXIgd2l0aCBleHBhbmRhYmxlXG4gICAqIGRpcmVjdG9yaWVzLiBGb3IgZXhhbXBsZTpcbiAgICpcbiAgICogICBBID5cbiAgICogICAgIEIgPlxuICAgKiAgICAgICBDID5cbiAgICogICAgICAgICBFLnR4dFxuICAgKiAgIEQuZm9vXG4gICAqXG4gICAqICAgPiBfZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcoRS50eHQpXG4gICAqICAgRC5mb29cbiAgICovXG4gIF9maW5kTmVhcmVzdEFuY2VzdG9yU2libGluZyhyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6ID9GaWxlVHJlZU5vZGVEYXRhIHtcbiAgICBsZXQgcGFyZW50S2V5O1xuICAgIGxldCBzaWJsaW5nS2V5cztcbiAgICBjb25zdCBpc1Jvb3QgPSByb290S2V5ID09PSBub2RlS2V5O1xuICAgIGlmIChpc1Jvb3QpIHtcbiAgICAgIC8vIGByb290S2V5ID09PSBub2RlS2V5YCBtZWFucyB0aGlzIGhhcyByZWN1cnNlZCB0byBhIHJvb3QuIGBub2RlS2V5YCBpcyBhIHJvb3Qga2V5LlxuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRSb290S2V5cygpO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJlbnRLZXkgPSBGaWxlVHJlZUhlbHBlcnMuZ2V0UGFyZW50S2V5KG5vZGVLZXkpO1xuXG4gICAgICBpbnZhcmlhbnQocm9vdEtleSAmJiBwYXJlbnRLZXkpO1xuICAgICAgc2libGluZ0tleXMgPSB0aGlzLl9zdG9yZS5nZXRDYWNoZWRDaGlsZEtleXMocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9XG5cbiAgICBjb25zdCBpbmRleCA9IHNpYmxpbmdLZXlzLmluZGV4T2Yobm9kZUtleSk7XG4gICAgaWYgKGluZGV4IDwgKHNpYmxpbmdLZXlzLmxlbmd0aCAtIDEpKSB7XG4gICAgICBjb25zdCBuZXh0U2libGluZyA9IHNpYmxpbmdLZXlzW2luZGV4ICsgMV07XG4gICAgICAvLyBJZiB0cmF2ZXJzaW5nIGFjcm9zcyByb290cywgdGhlIG5leHQgc2libGluZyBpcyBhbHNvIHRoZSBuZXh0IHJvb3QuIFJldHVybiBpdCBhcyB0aGUgbmV4dFxuICAgICAgLy8gcm9vdCBrZXkgYXMgd2VsbCBhcyB0aGUgbmV4dCBub2RlIGtleS5cbiAgICAgIHJldHVybiBpc1Jvb3RcbiAgICAgICAgPyB7bm9kZUtleTogbmV4dFNpYmxpbmcsIHJvb3RLZXk6IG5leHRTaWJsaW5nfVxuICAgICAgICA6IHtub2RlS2V5OiBuZXh0U2libGluZywgcm9vdEtleX07XG4gICAgfSBlbHNlIGlmIChwYXJlbnRLZXkgIT0gbnVsbCkge1xuICAgICAgLy8gVGhlcmUgaXMgYSBwYXJlbnQgdG8gcmVjdXJzZS4gUmV0dXJuIGl0cyBuZWFyZXN0IGFuY2VzdG9yIHNpYmxpbmcuXG4gICAgICByZXR1cm4gdGhpcy5fZmluZE5lYXJlc3RBbmNlc3RvclNpYmxpbmcocm9vdEtleSwgcGFyZW50S2V5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gSWYgYHBhcmVudEtleWAgaXMgbnVsbCwgbm9kZUtleSBpcyBhIHJvb3QgYW5kIGhhcyBtb3JlIHBhcmVudHMgdG8gcmVjdXJzZS4gUmV0dXJuIGBudWxsYCB0b1xuICAgICAgLy8gc2lnbmlmeSBubyBhcHByb3ByaWF0ZSBrZXkgd2FzIGZvdW5kLlxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5KCk6IHZvaWQge1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIC8vIE9ubHkgcGVyZm9ybSB0aGUgZGVmYXVsdCBhY3Rpb24gaWYgYSBzaW5nbGUgbm9kZSBpcyBzZWxlY3RlZC5cbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGlvbnMuY29uZmlybU5vZGUoc2luZ2xlU2VsZWN0ZWROb2RlLnJvb3RLZXksIHNpbmdsZVNlbGVjdGVkTm9kZS5ub2RlS2V5KTtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdChvcmllbnRhdGlvbjogYXRvbSRQYW5lU3BsaXRPcmllbnRhdGlvbiwgc2lkZTogYXRvbSRQYW5lU3BsaXRTaWRlKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgLy8gT25seSBwZXJmb3JtIHRoZSBkZWZhdWx0IGFjdGlvbiBpZiBhIHNpbmdsZSBub2RlIGlzIHNlbGVjdGVkLlxuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCAmJiAhc2luZ2xlU2VsZWN0ZWROb2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICAvLyBmb3I6IGlzIHRoaXMgZmVhdHVyZSB1c2VkIGVub3VnaCB0byBqdXN0aWZ5IHVuY29sbGFwc2luZz9cbiAgICAgIHRyYWNrKCdmaWxldHJlZS1zcGxpdC1maWxlJywge1xuICAgICAgICBvcmllbnRhdGlvbixcbiAgICAgICAgc2lkZSxcbiAgICAgIH0pO1xuICAgICAgdGhpcy5fYWN0aW9ucy5vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KFxuICAgICAgICBzaW5nbGVTZWxlY3RlZE5vZGUubm9kZUtleSxcbiAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgIHNpZGUsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0VXAoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgndmVydGljYWwnLCAnYmVmb3JlJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdERvd24oKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgndmVydGljYWwnLCAnYWZ0ZXInKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0TGVmdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCdob3Jpem9udGFsJywgJ2JlZm9yZScpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRSaWdodCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCdob3Jpem9udGFsJywgJ2FmdGVyJyk7XG4gIH1cblxuICBfcmVtb3ZlUm9vdEZvbGRlclNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChyb290Tm9kZSAhPSBudWxsICYmIHJvb3ROb2RlLmlzUm9vdCkge1xuICAgICAgLy8gY2xvc2UgYWxsIHRoZSBmaWxlcyBhc3NvY2lhdGVkIHdpdGggdGhlIHByb2plY3QgYmVmb3JlIGNsb3NpbmdcbiAgICAgIGNvbnN0IHByb2plY3RFZGl0b3JzID0gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKTtcbiAgICAgIGNvbnN0IHJvb3RzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICAgIHByb2plY3RFZGl0b3JzLmZvckVhY2goZWRpdG9yID0+IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIC8vIGlmIHRoZSBwYXRoIG9mIHRoZSBlZGl0b3IgaXMgbm90IG51bGwgQU5EXG4gICAgICAgIC8vIGlzIHBhcnQgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCByb290IHRoYXQgd291bGQgYmUgcmVtb3ZlZCBBTkRcbiAgICAgICAgLy8gaXMgbm90IHBhcnQgb2YgYW55IG90aGVyIG9wZW4gcm9vdCwgdGhlbiBjbG9zZSB0aGUgZmlsZS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHBhdGggIT0gbnVsbCAmJlxuICAgICAgICAgIHBhdGguc3RhcnRzV2l0aChyb290Tm9kZS5ub2RlUGF0aCkgJiZcbiAgICAgICAgICByb290cy5maWx0ZXIocm9vdCA9PiBwYXRoLnN0YXJ0c1dpdGgocm9vdCkpLmxlbmd0aCA9PT0gMVxuICAgICAgICApIHtcbiAgICAgICAgICBhdG9tLndvcmtzcGFjZS5wYW5lRm9yVVJJKHBhdGgpLmRlc3Ryb3lJdGVtKGVkaXRvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgLy8gYWN0dWFsbHkgY2xvc2UgdGhlIHByb2plY3RcbiAgICAgIGF0b20ucHJvamVjdC5yZW1vdmVQYXRoKHJvb3ROb2RlLm5vZGVQYXRoKTtcbiAgICB9XG4gIH1cblxuICBfc2VhcmNoSW5EaXJlY3RvcnkoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgLy8gRGlzcGF0Y2ggYSBjb21tYW5kIHRvIHNob3cgdGhlIGBQcm9qZWN0RmluZFZpZXdgLiBUaGlzIG9wZW5zIHRoZSB2aWV3IGFuZCBmb2N1c2VzIHRoZSBzZWFyY2hcbiAgICAvLyBib3guXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBIVE1MRWxlbWVudCksXG4gICAgICAncHJvamVjdC1maW5kOnNob3ctaW4tY3VycmVudC1kaXJlY3RvcnknXG4gICAgKTtcbiAgfVxuXG4gIF9zaG93SW5GaWxlTWFuYWdlcigpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgLy8gT25seSBhbGxvdyByZXZlYWxpbmcgYSBzaW5nbGUgZGlyZWN0b3J5L2ZpbGUgYXQgYSB0aW1lLiBSZXR1cm4gb3RoZXJ3aXNlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzaGVsbC5zaG93SXRlbUluRm9sZGVyKG5vZGUubm9kZVBhdGgpO1xuICB9XG5cbiAgX3NlbGVjdEFuZFRyYWNrTm9kZShyb290S2V5OiBzdHJpbmcsIG5vZGVLZXk6IHN0cmluZyk6IHZvaWQge1xuICAgIC8vIFNlbGVjdCB0aGUgbm9kZSBiZWZvcmUgdHJhY2tpbmcgaXQgYmVjYXVzZSBzZXR0aW5nIGEgbmV3IHNlbGVjdGlvbiBjbGVhcnMgdGhlIHRyYWNrZWQgbm9kZS5cbiAgICB0aGlzLl9hY3Rpb25zLnNlbGVjdFNpbmdsZU5vZGUocm9vdEtleSwgbm9kZUtleSk7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRUcmFja2VkTm9kZShyb290S2V5LCBub2RlS2V5KTtcbiAgfVxuXG4gIF9jb3B5RnVsbFBhdGgoKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsKSB7XG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShzaW5nbGVTZWxlY3RlZE5vZGUuZ2V0TG9jYWxQYXRoKCkpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgZm9yIChjb25zdCBkaXNwb3NhYmxlIG9mIHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkudmFsdWVzKCkpIHtcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9zdG9yZS5yZXNldCgpO1xuICAgIHRoaXMuX2NvbnRleHRNZW51LmRpc3Bvc2UoKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fcHJlZml4VGltZW91dCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogRmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICB0cmVlOiB0aGlzLl9zdG9yZS5leHBvcnREYXRhKCksXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQ29udHJvbGxlcjtcbiJdfQ==