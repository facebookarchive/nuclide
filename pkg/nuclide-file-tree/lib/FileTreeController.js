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

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

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
    this._store = _FileTreeStore.FileTreeStore.getInstance();
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
    key: '_moveUp',
    value: function _moveUp() {
      this._actions.moveSelectionUp();
    }
  }, {
    key: '_moveDown',
    value: function _moveDown() {
      this._actions.moveSelectionDown();
    }
  }, {
    key: '_moveToTop',
    value: function _moveToTop() {
      this._actions.moveSelectionToTop();
    }
  }, {
    key: '_moveToBottom',
    value: function _moveToBottom() {
      this._actions.moveSelectionToBottom();
    }
  }, {
    key: 'getContextMenu',
    value: function getContextMenu() {
      return this._contextMenu;
    }
  }, {
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
      var firstSelectedNode = this._store.getSelectedNodes().first();
      if (firstSelectedNode == null || firstSelectedNode.isRoot) {
        return false;
      }
      var targetNode = firstSelectedNode.parent.children.find(function (n) {
        return n.name.toLowerCase().replace(NOT_LETTERS, '').startsWith(prefix);
      });
      if (targetNode == null) {
        return false;
      }
      this.revealNodeKey(targetNode.uri);
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
      if (nodeKey == null) {
        return;
      }

      this._actions.ensureChildNode(nodeKey);
    }
  }, {
    key: '_setCwdToSelection',
    value: function _setCwdToSelection() {
      var node = this._store.getSingleSelectedNode();
      if (node == null) {
        return;
      }
      var path = _FileTreeHelpers2['default'].keyToPath(node.uri);
      if (this._cwdApi != null) {
        this._cwdApi.setCwd(path);
      }
    }
  }, {
    key: 'setCwdApi',
    value: function setCwdApi(cwdApi) {
      var _this3 = this;

      if (cwdApi == null) {
        this._actions.setCwd(null);
        this._cwdApiSubscription = null;
      } else {
        (0, _assert2['default'])(this._cwdApiSubscription == null);
        this._cwdApiSubscription = cwdApi.observeCwd(function (directory) {
          var path = directory == null ? null : directory.getPath();
          var rootKey = path && _FileTreeHelpers2['default'].dirPathToKey(path);
          _this3._actions.setCwd(rootKey);
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
      var _this4 = this;

      var deep = arguments.length <= 0 || arguments[0] === undefined ? false : arguments[0];

      var selectedNodes = this._store.getSelectedNodes();
      var firstSelectedNode = selectedNodes.first();
      if (selectedNodes.size === 1 && !firstSelectedNode.isRoot && !(firstSelectedNode.isContainer && firstSelectedNode.isExpanded)) {
        /*
         * Select the parent of the selection if the following criteria are met:
         *   * Only 1 node is selected
         *   * The node is not a root
         *   * The node is not an expanded directory
        */

        var _parent = firstSelectedNode.parent;
        this._selectAndTrackNode(_parent);
      } else {
        selectedNodes.forEach(function (node) {
          // Only directories can be expanded. Skip non-directory nodes.
          if (!node.isContainer) {
            return;
          }

          if (deep) {
            _this4._actions.collapseNodeDeep(node.rootUri, node.uri);
          } else {
            _this4._actions.collapseNode(node.rootUri, node.uri);
          }
        });
      }
    }
  }, {
    key: '_selectAndTrackNode',
    value: function _selectAndTrackNode(node) {
      this._actions.setSelectedNode(node.rootUri, node.uri);
    }
  }, {
    key: '_collapseAll',
    value: function _collapseAll() {
      var _this5 = this;

      var roots = this._store.roots;
      roots.forEach(function (root) {
        return _this5._actions.collapseNodeDeep(root.uri, root.uri);
      });
    }
  }, {
    key: '_deleteSelection',
    value: function _deleteSelection() {
      var _this6 = this;

      var nodes = this._store.getSelectedNodes();
      if (nodes.size === 0) {
        return;
      }

      var rootPaths = nodes.filter(function (node) {
        return node.isRoot;
      });
      if (rootPaths.size === 0) {
        var selectedPaths = nodes.map(function (node) {
          return _FileTreeHelpers2['default'].keyToPath(node.uri);
        });
        var message = 'Are you sure you want to delete the following ' + (nodes.size > 1 ? 'items?' : 'item?');
        atom.confirm({
          buttons: {
            'Delete': function Delete() {
              _this6._actions.deleteSelectedNodes();
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
      var _this7 = this;

      this._store.getSelectedNodes().forEach(function (node) {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        if (deep) {
          _this7._actions.expandNodeDeep(node.rootUri, node.uri);
          _this7._actions.setTrackedNode(node.rootUri, node.uri);
        } else {
          if (node.isExpanded) {
            // Node is already expanded; move the selection to the first child.
            var firstChild = node.children.first();
            if (firstChild != null && !firstChild.shouldBeShown) {
              firstChild = firstChild.findNextShownSibling();
            }

            if (firstChild != null) {
              _this7._selectAndTrackNode(firstChild);
            }
          } else {
            _this7._actions.expandNode(node.rootUri, node.uri);
            _this7._actions.setTrackedNode(node.rootUri, node.uri);
          }
        }
      });
    }
  }, {
    key: '_openSelectedEntry',
    value: function _openSelectedEntry() {
      var singleSelectedNode = this._store.getSingleSelectedNode();
      // Only perform the default action if a single node is selected.
      if (singleSelectedNode != null) {
        this._actions.confirmNode(singleSelectedNode.rootUri, singleSelectedNode.uri);
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
        this._actions.openSelectedEntrySplit(singleSelectedNode.uri, orientation, side);
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
      var _this8 = this;

      var rootNode = this._store.getSingleSelectedNode();
      if (rootNode != null && rootNode.isRoot) {
        (function () {
          // close all the files associated with the project before closing
          var projectEditors = atom.workspace.getTextEditors();
          var roots = _this8._store.getRootKeys();
          projectEditors.forEach(function (editor) {
            var path = editor.getPath();
            // if the path of the editor is not null AND
            // is part of the currently selected root that would be removed AND
            // is not part of any other open root, then close the file.
            if (path != null && path.startsWith(rootNode.uri) && roots.filter(function (root) {
              return path.startsWith(root);
            }).length === 1) {
              atom.workspace.paneForURI(path).destroyItem(editor);
            }
          });
          // actually close the project
          atom.project.removePath(_FileTreeHelpers2['default'].keyToPath(rootNode.uri));
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
      _shell2['default'].showItemInFolder(node.uri);
    }
  }, {
    key: '_copyFullPath',
    value: function _copyFullPath() {
      var singleSelectedNode = this._store.getSingleSelectedNode();
      if (singleSelectedNode != null) {
        atom.clipboard.write(singleSelectedNode.localPath);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udHJvbGxlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztvQkFjOEMsTUFBTTs7aUNBQ2QscUJBQXFCOztpQ0FDN0IscUJBQXFCOzs7OytCQUN2QixtQkFBbUI7Ozs7bUNBQ2YsdUJBQXVCOzs7OytCQUMzQixtQkFBbUI7Ozs7NkJBQ25CLGlCQUFpQjs7eUJBQ3ZCLFdBQVc7Ozs7Z0NBQ2IseUJBQXlCOztrQ0FDbEIsNEJBQTRCOztrQkFFeEMsSUFBSTs7OztxQkFDRCxPQUFPOzs7O3NCQUVILFFBQVE7Ozs7QUFVOUIsSUFBTSxXQUFXLEdBQUcsWUFBWSxDQUFDO0FBQ2pDLElBQU0sa0JBQWtCLEdBQUcsR0FBRyxDQUFDOztJQUV6QixrQkFBa0I7QUFZWCxXQVpQLGtCQUFrQixDQVlWLEtBQStCLEVBQUU7OzswQkFaekMsa0JBQWtCOztBQWFwQixRQUFJLENBQUMsUUFBUSxHQUFHLDZCQUFnQixXQUFXLEVBQUUsQ0FBQztBQUM5QyxRQUFJLENBQUMsTUFBTSxHQUFHLDZCQUFjLFdBQVcsRUFBRSxDQUFDO0FBQzFDLFFBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztBQUN6QyxRQUFJLENBQUMsMEJBQTBCLEdBQUcsSUFBSSx1QkFBVSxHQUFHLEVBQUUsQ0FBQztBQUN0RCxRQUFJLENBQUMsY0FBYyxHQUFHLDhCQUNwQixxQkFBZSxZQUFNO0FBQ25CLFVBQUksTUFBSyxtQkFBbUIsSUFBSSxJQUFJLEVBQUU7QUFDcEMsY0FBSyxtQkFBbUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUNwQztLQUNGLENBQUMsQ0FDSCxDQUFDOztBQUVGLFFBQUksQ0FBQyxzQkFBc0IsRUFBRSxDQUFDOztBQUU5QixRQUFJLENBQUMsY0FBYyxDQUFDLEdBQUcsQ0FDckIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQzthQUFNLE1BQUssc0JBQXNCLEVBQUU7S0FBQSxDQUFDLENB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YyxDQUFDLENBQUM7S0FDbkM7OztXQUVRLHFCQUE0QjtBQUNuQyxhQUFPO0FBQ0wsWUFBSSxFQUFFLElBQUksQ0FBQyxNQUFNLENBQUMsVUFBVSxFQUFFO09BQy9CLENBQUM7S0FDSDs7O1NBbGhCRyxrQkFBa0I7OztBQXFoQnhCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsa0JBQWtCLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVDb250cm9sbGVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCc7XG4vKiBAZmxvdyAqL1xuXG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE1LXByZXNlbnQsIEZhY2Vib29rLCBJbmMuXG4gKiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuICpcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIGxpY2Vuc2UgZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBpblxuICogdGhlIHJvb3QgZGlyZWN0b3J5IG9mIHRoaXMgc291cmNlIHRyZWUuXG4gKi9cblxuaW1wb3J0IHR5cGUge0N3ZEFwaX0gZnJvbSAnLi4vLi4vbnVjbGlkZS1jdXJyZW50LXdvcmtpbmctZGlyZWN0b3J5L2xpYi9Dd2RBcGknO1xuaW1wb3J0IHR5cGUge0V4cG9ydFN0b3JlRGF0YX0gZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcblxuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlLCBEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RVZFTlRfSEFORExFUl9TRUxFQ1RPUn0gIGZyb20gJy4vRmlsZVRyZWVDb25zdGFudHMnO1xuaW1wb3J0IEZpbGVTeXN0ZW1BY3Rpb25zIGZyb20gJy4vRmlsZVN5c3RlbUFjdGlvbnMnO1xuaW1wb3J0IEZpbGVUcmVlQWN0aW9ucyBmcm9tICcuL0ZpbGVUcmVlQWN0aW9ucyc7XG5pbXBvcnQgRmlsZVRyZWVDb250ZXh0TWVudSBmcm9tICcuL0ZpbGVUcmVlQ29udGV4dE1lbnUnO1xuaW1wb3J0IEZpbGVUcmVlSGVscGVycyBmcm9tICcuL0ZpbGVUcmVlSGVscGVycyc7XG5pbXBvcnQge0ZpbGVUcmVlU3RvcmV9IGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5pbXBvcnQgSW1tdXRhYmxlIGZyb20gJ2ltbXV0YWJsZSc7XG5pbXBvcnQge3RyYWNrfSBmcm9tICcuLi8uLi9udWNsaWRlLWFuYWx5dGljcyc7XG5pbXBvcnQge2lzVGV4dEVkaXRvcn0gZnJvbSAnLi4vLi4vbnVjbGlkZS1hdG9tLWhlbHBlcnMnO1xuXG5pbXBvcnQgb3MgZnJvbSAnb3MnO1xuaW1wb3J0IHNoZWxsIGZyb20gJ3NoZWxsJztcblxuaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuXG5pbXBvcnQgdHlwZSB7V29ya2luZ1NldH0gZnJvbSAnLi4vLi4vbnVjbGlkZS13b3JraW5nLXNldHMnO1xuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXRzU3RvcmV9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzL2xpYi9Xb3JraW5nU2V0c1N0b3JlJztcbmltcG9ydCB0eXBlIHtGaWxlVHJlZU5vZGV9IGZyb20gJy4vRmlsZVRyZWVOb2RlJztcblxuZXhwb3J0IHR5cGUgRmlsZVRyZWVDb250cm9sbGVyU3RhdGUgPSB7XG4gIHRyZWU6IEV4cG9ydFN0b3JlRGF0YTtcbn07XG5cbmNvbnN0IE5PVF9MRVRURVJTID0gL1teYS16QS1aXS9nO1xuY29uc3QgUFJFRklYX1JFU0VUX0RFTEFZID0gNTAwO1xuXG5jbGFzcyBGaWxlVHJlZUNvbnRyb2xsZXIge1xuICBfYWN0aW9uczogRmlsZVRyZWVBY3Rpb25zO1xuICBfY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnU7XG4gIF9jd2RBcGk6ID9Dd2RBcGk7XG4gIF9jd2RBcGlTdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcbiAgX3JlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+O1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIElEaXNwb3NhYmxlPjtcbiAgX3ByZWZpeDogc3RyaW5nO1xuICBfcHJlZml4VGltZW91dDogP251bWJlcjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlKSB7XG4gICAgdGhpcy5fYWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fY3dkQXBpU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICAgIC8vIEluaXRpYWwgcm9vdCBkaXJlY3Rvcmllc1xuICAgIHRoaXMuX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpO1xuICAgIC8vIFN1YnNlcXVlbnQgcm9vdCBkaXJlY3RvcmllcyB1cGRhdGVkIG9uIGNoYW5nZVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4gdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCkpXG4gICAgKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAvLyBQYXNzIHVuZGVmaW5lZCBzbyB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgZ2V0cyB1c2VkLlxuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIHNwZWNpZmljYWxseSBmb3IgdXNlIGluIERpZmYgVmlldywgc28gZG9uJ3QgZXhwb3NlIGEgbWVudSBpdGVtLlxuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBudWNsaWRlLWludGVybmFsL2NvbW1hbmQtbWVudS1pdGVtcyAqL1xuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLXRleHQtZWRpdG9yJzogdGhpcy5fcmV2ZWFsVGV4dEVkaXRvci5iaW5kKHRoaXMpLFxuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG51Y2xpZGUtaW50ZXJuYWwvY29tbWFuZC1tZW51LWl0ZW1zICovXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtYWN0aXZlLWZpbGUnOiB0aGlzLnJldmVhbEFjdGl2ZUZpbGUuYmluZCh0aGlzLCB1bmRlZmluZWQpLFxuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IGxldHRlcktleUJpbmRpbmdzID0ge307XG4gICAgY29uc3QgekNoYXJDb2RlID0gJ3onLmNoYXJDb2RlQXQoMCk7XG4gICAgZm9yIChsZXQgYyA9ICdhJy5jaGFyQ29kZUF0KDApOyBjIDw9IHpDaGFyQ29kZTsgYysrKSB7XG4gICAgICBjb25zdCBjaGFyID0gU3RyaW5nLmZyb21DaGFyQ29kZShjKTtcbiAgICAgIGxldHRlcktleUJpbmRpbmdzW2BudWNsaWRlLWZpbGUtdHJlZTpnby10by1sZXR0ZXItJHtjaGFyfWBdID1cbiAgICAgICAgdGhpcy5faGFuZGxlUHJlZml4S2V5cHJlc3MuYmluZCh0aGlzLCBjaGFyKTtcbiAgICB9XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5hZGQoXG4gICAgICBhdG9tLmNvbW1hbmRzLmFkZChFVkVOVF9IQU5ETEVSX1NFTEVDVE9SLCB7XG4gICAgICAgICdjb3JlOm1vdmUtZG93bic6IHRoaXMuX21vdmVEb3duLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdXAnOiB0aGlzLl9tb3ZlVXAuYmluZCh0aGlzKSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by10b3AnOiB0aGlzLl9tb3ZlVG9Ub3AuYmluZCh0aGlzKSxcbiAgICAgICAgJ2NvcmU6bW92ZS10by1ib3R0b20nOiB0aGlzLl9tb3ZlVG9Cb3R0b20uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1maWxlJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5BZGRGaWxlRGlhbG9nKHRoaXMuX29wZW5BbmRSZXZlYWxGaWxlUGF0aC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1mb2xkZXInOiAoKSA9PiB7XG4gICAgICAgICAgRmlsZVN5c3RlbUFjdGlvbnMub3BlbkFkZEZvbGRlckRpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRGlyZWN0b3J5UGF0aC5iaW5kKHRoaXMpKTtcbiAgICAgICAgfSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmNvbGxhcHNlLWRpcmVjdG9yeSc6IHRoaXMuX2NvbGxhcHNlU2VsZWN0aW9uLmJpbmQodGhpcywgLypkZWVwKi8gZmFsc2UpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWNvbGxhcHNlLWRpcmVjdG9yeSc6IHRoaXMuX2NvbGxhcHNlU2VsZWN0aW9uLmJpbmQodGhpcywgdHJ1ZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZWN1cnNpdmUtY29sbGFwc2UtYWxsJzogdGhpcy5fY29sbGFwc2VBbGwuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmNvcHktZnVsbC1wYXRoJzogdGhpcy5fY29weUZ1bGxQYXRoLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpleHBhbmQtZGlyZWN0b3J5JzogdGhpcy5fZXhwYW5kU2VsZWN0aW9uLmJpbmQodGhpcywgLypkZWVwKi8gZmFsc2UpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWV4cGFuZC1kaXJlY3RvcnknOiB0aGlzLl9leHBhbmRTZWxlY3Rpb24uYmluZCh0aGlzLCB0cnVlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnknOiB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeS5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS11cCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdFVwLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWRvd24nOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXREb3duLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWxlZnQnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRMZWZ0LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXJpZ2h0JzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0UmlnaHQuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZSc6IHRoaXMuX2RlbGV0ZVNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlLXByb2plY3QtZm9sZGVyLXNlbGVjdGlvbic6XG4gICAgICAgICAgdGhpcy5fcmVtb3ZlUm9vdEZvbGRlclNlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVuYW1lLXNlbGVjdGlvbic6ICgpID0+IEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5SZW5hbWVEaWFsb2coKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmR1cGxpY2F0ZS1zZWxlY3Rpb24nOiAoKSA9PiB7XG4gICAgICAgICAgRmlsZVN5c3RlbUFjdGlvbnMub3BlbkR1cGxpY2F0ZURpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRmlsZVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzZWFyY2gtaW4tZGlyZWN0b3J5JzogdGhpcy5fc2VhcmNoSW5EaXJlY3RvcnkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnNob3ctaW4tZmlsZS1tYW5hZ2VyJzogdGhpcy5fc2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnNldC1jdXJyZW50LXdvcmtpbmctcm9vdCc6IHRoaXMuX3NldEN3ZFRvU2VsZWN0aW9uLmJpbmQodGhpcyksXG4gICAgICAgIC4uLmxldHRlcktleUJpbmRpbmdzLFxuICAgICAgfSlcbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ1tpcz1cInRhYnMtdGFiXCJdJywge1xuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLXRhYi1maWxlJzogdGhpcy5fcmV2ZWFsVGFiRmlsZU9uQ2xpY2suYmluZCh0aGlzKSxcbiAgICAgIH0pXG4gICAgKTtcbiAgICBpZiAoc3RhdGUgJiYgc3RhdGUudHJlZSkge1xuICAgICAgdGhpcy5fc3RvcmUubG9hZERhdGEoc3RhdGUudHJlZSk7XG4gICAgfVxuICAgIHRoaXMuX2NvbnRleHRNZW51ID0gbmV3IEZpbGVUcmVlQ29udGV4dE1lbnUoKTtcbiAgICB0aGlzLl9wcmVmaXhUaW1lb3V0ID0gbnVsbDtcbiAgICB0aGlzLl9wcmVmaXggPSAnJztcbiAgfVxuXG4gIF9tb3ZlVXAoKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5tb3ZlU2VsZWN0aW9uVXAoKTtcbiAgfVxuXG4gIF9tb3ZlRG93bigpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLm1vdmVTZWxlY3Rpb25Eb3duKCk7XG4gIH1cblxuICBfbW92ZVRvVG9wKCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMubW92ZVNlbGVjdGlvblRvVG9wKCk7XG4gIH1cblxuICBfbW92ZVRvQm90dG9tKCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMubW92ZVNlbGVjdGlvblRvQm90dG9tKCk7XG4gIH1cblxuICBnZXRDb250ZXh0TWVudSgpOiBGaWxlVHJlZUNvbnRleHRNZW51IHtcbiAgICByZXR1cm4gdGhpcy5fY29udGV4dE1lbnU7XG4gIH1cblxuICBfaGFuZGxlUHJlZml4S2V5cHJlc3MobGV0dGVyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3N0b3JlLnVzZVByZWZpeE5hdigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmICh0aGlzLl9wcmVmaXhUaW1lb3V0ICE9IG51bGwpIHtcbiAgICAgIGNsZWFyVGltZW91dCh0aGlzLl9wcmVmaXhUaW1lb3V0KTtcbiAgICAgIHRoaXMuX3ByZWZpeFRpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgICBjb25zdCBwcmVmaXggPSB0aGlzLl9wcmVmaXggKyBsZXR0ZXI7XG4gICAgaWYgKHRoaXMuX2RpZFJldmVhbE5vZGVTdGFydGluZ1dpdGgocHJlZml4KSkge1xuICAgICAgLy8gT25seSBhcHBlbmQgdGhlIHByZWZpeCBzdHJpbmcgaWYgYSBtYXRjaCBleGlzdHMgdG8gYWxsb3cgZm9yIHR5cG9zLlxuICAgICAgdGhpcy5fcHJlZml4ID0gcHJlZml4O1xuICAgIH1cbiAgICB0aGlzLl9wcmVmaXhUaW1lb3V0ID0gc2V0VGltZW91dChcbiAgICAgICgpID0+IHtcbiAgICAgICAgdGhpcy5fcHJlZml4ID0gJyc7XG4gICAgICAgIHRoaXMuX3ByZWZpeFRpbWVvdXQgPSBudWxsO1xuICAgICAgfSxcbiAgICAgIFBSRUZJWF9SRVNFVF9ERUxBWVxuICAgICk7XG4gIH1cblxuICAvLyBSZXR1cm5zIHdoZXRoZXIgYSBub2RlIG1hdGNoaW5nIHRoZSBwcmVmaXggd2FzIHN1Y2Nlc3NmdWxseSBzZWxlY3RlZC5cbiAgX2RpZFJldmVhbE5vZGVTdGFydGluZ1dpdGgocHJlZml4OiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBmaXJzdFNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKS5maXJzdCgpO1xuICAgIGlmIChmaXJzdFNlbGVjdGVkTm9kZSA9PSBudWxsIHx8IGZpcnN0U2VsZWN0ZWROb2RlLmlzUm9vdCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXROb2RlID0gZmlyc3RTZWxlY3RlZE5vZGUucGFyZW50LmNoaWxkcmVuLmZpbmQobiA9PlxuICAgICAgbi5uYW1lLnRvTG93ZXJDYXNlKCkucmVwbGFjZShOT1RfTEVUVEVSUywgJycpLnN0YXJ0c1dpdGgocHJlZml4KVxuICAgICk7XG4gICAgaWYgKHRhcmdldE5vZGUgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0aGlzLnJldmVhbE5vZGVLZXkodGFyZ2V0Tm9kZS51cmkpO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxGaWxlUGF0aChmaWxlUGF0aDogP3N0cmluZyk6IHZvaWQge1xuICAgIGlmIChmaWxlUGF0aCAhPSBudWxsKSB7XG4gICAgICBhdG9tLndvcmtzcGFjZS5vcGVuKGZpbGVQYXRoKTtcbiAgICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5BbmRSZXZlYWxEaXJlY3RvcnlQYXRoKHBhdGg6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAocGF0aCAhPSBudWxsKSB7XG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShwYXRoKSk7XG4gICAgfVxuICB9XG5cbiAgX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpOiB2b2lkIHtcbiAgICAvLyBJZiB0aGUgcmVtb3RlLXByb2plY3RzIHBhY2thZ2UgaGFzbid0IGxvYWRlZCB5ZXQgcmVtb3RlIGRpcmVjdG9yaWVzIHdpbGwgYmUgaW5zdGFudGlhdGVkIGFzXG4gICAgLy8gbG9jYWwgZGlyZWN0b3JpZXMgYnV0IHdpdGggaW52YWxpZCBwYXRocy4gV2UgbmVlZCB0byBleGNsdWRlIHRob3NlLlxuICAgIGNvbnN0IHJvb3REaXJlY3RvcmllcyA9IGF0b20ucHJvamVjdC5nZXREaXJlY3RvcmllcygpLmZpbHRlcihkaXJlY3RvcnkgPT4gKFxuICAgICAgRmlsZVRyZWVIZWxwZXJzLmlzVmFsaWREaXJlY3RvcnkoZGlyZWN0b3J5KVxuICAgICkpO1xuICAgIGNvbnN0IHJvb3RLZXlzID0gcm9vdERpcmVjdG9yaWVzLm1hcChcbiAgICAgIGRpcmVjdG9yeSA9PiBGaWxlVHJlZUhlbHBlcnMuZGlyUGF0aFRvS2V5KGRpcmVjdG9yeS5nZXRQYXRoKCkpXG4gICAgKTtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFJvb3RLZXlzKHJvb3RLZXlzKTtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVJlcG9zaXRvcmllcyhyb290RGlyZWN0b3JpZXMpO1xuICB9XG5cbiAgX3JldmVhbFRleHRFZGl0b3IoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yRWxlbWVudCA9ICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBhdG9tJFRleHRFZGl0b3JFbGVtZW50KTtcbiAgICBpZiAoXG4gICAgICBlZGl0b3JFbGVtZW50ID09IG51bGxcbiAgICAgIHx8IHR5cGVvZiBlZGl0b3JFbGVtZW50LmdldE1vZGVsICE9PSAnZnVuY3Rpb24nXG4gICAgICB8fCAhaXNUZXh0RWRpdG9yKGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKSlcbiAgICApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IGVkaXRvckVsZW1lbnQuZ2V0TW9kZWwoKS5nZXRQYXRoKCk7XG4gICAgdGhpcy5fcmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldmVhbCB0aGUgZmlsZSB0aGF0IGN1cnJlbnRseSBoYXMgZm9jdXMgaW4gdGhlIGZpbGUgdHJlZS4gSWYgc2hvd0lmSGlkZGVuIGlzIGZhbHNlLFxuICAgKiB0aGlzIHdpbGwgZW5xdWV1ZSBhIHBlbmRpbmcgcmV2ZWFsIHRvIGJlIGV4ZWN1dGVkIHdoZW4gdGhlIGZpbGUgdHJlZSBpcyBzaG93biBhZ2Fpbi5cbiAgICovXG4gIHJldmVhbEFjdGl2ZUZpbGUoc2hvd0lmSGlkZGVuPzogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBjb25zdCBlZGl0b3IgPSBhdG9tLndvcmtzcGFjZS5nZXRBY3RpdmVUZXh0RWRpdG9yKCk7XG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3IgIT0gbnVsbCA/IGVkaXRvci5nZXRQYXRoKCkgOiBudWxsO1xuICAgIHRoaXMuX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoLCBzaG93SWZIaWRkZW4pO1xuICB9XG5cbiAgX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoOiA/c3RyaW5nLCBzaG93SWZIaWRkZW4/OiBib29sZWFuID0gdHJ1ZSk6IHZvaWQge1xuICAgIGlmIChzaG93SWZIaWRkZW4pIHtcbiAgICAgIC8vIEVuc3VyZSB0aGUgZmlsZSB0cmVlIGlzIHZpc2libGUgYmVmb3JlIHRyeWluZyB0byByZXZlYWwgYSBmaWxlIGluIGl0LiBFdmVuIGlmIHRoZSBjdXJyZW50bHlcbiAgICAgIC8vIGFjdGl2ZSBwYW5lIGlzIG5vdCBhbiBvcmRpbmFyeSBlZGl0b3IsIHdlIHN0aWxsIGF0IGxlYXN0IHdhbnQgdG8gc2hvdyB0aGUgdHJlZS5cbiAgICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICAgIGF0b20udmlld3MuZ2V0VmlldyhhdG9tLndvcmtzcGFjZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTp0b2dnbGUnLFxuICAgICAgICB7ZGlzcGxheTogdHJ1ZX1cbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKCFmaWxlUGF0aCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICAvKipcbiAgICogUmV2ZWFsIHRoZSBmaWxlIG9mIGEgZ2l2ZW4gdGFiIGJhc2VkIG9uIHRoZSBwYXRoIHN0b3JlZCBvbiB0aGUgRE9NLlxuICAgKiBUaGlzIG1ldGhvZCBpcyBtZWFudCB0byBiZSB0cmlnZ2VyZWQgYnkgdGhlIGNvbnRleHQtbWVudSBjbGljay5cbiAgICovXG4gIF9yZXZlYWxUYWJGaWxlT25DbGljayhldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICBjb25zdCB0YWIgPSAoKGV2ZW50LmN1cnJlbnRUYXJnZXQ6IGFueSk6IEVsZW1lbnQpO1xuICAgIGNvbnN0IHRpdGxlID0gdGFiLnF1ZXJ5U2VsZWN0b3IoJy50aXRsZVtkYXRhLXBhdGhdJyk7XG4gICAgaWYgKCF0aXRsZSkge1xuICAgICAgLy8gY2FuIG9ubHkgcmV2ZWFsIGl0IGlmIHdlIGZpbmQgdGhlIGZpbGUgcGF0aFxuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGNvbnN0IGZpbGVQYXRoID0gdGl0bGUuZGF0YXNldC5wYXRoO1xuICAgIGF0b20uY29tbWFuZHMuZGlzcGF0Y2goXG4gICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnRvZ2dsZScsXG4gICAgICB7ZGlzcGxheTogdHJ1ZX1cbiAgICApO1xuICAgIHRoaXMucmV2ZWFsTm9kZUtleShmaWxlUGF0aCk7XG4gIH1cblxuICByZXZlYWxOb2RlS2V5KG5vZGVLZXk6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAobm9kZUtleSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fYWN0aW9ucy5lbnN1cmVDaGlsZE5vZGUobm9kZUtleSk7XG4gIH1cblxuICBfc2V0Q3dkVG9TZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChub2RlID09IG51bGwpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgY29uc3QgcGF0aCA9IEZpbGVUcmVlSGVscGVycy5rZXlUb1BhdGgobm9kZS51cmkpO1xuICAgIGlmICh0aGlzLl9jd2RBcGkgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fY3dkQXBpLnNldEN3ZChwYXRoKTtcbiAgICB9XG4gIH1cblxuICBzZXRDd2RBcGkoY3dkQXBpOiA/Q3dkQXBpKTogdm9pZCB7XG4gICAgaWYgKGN3ZEFwaSA9PSBudWxsKSB7XG4gICAgICB0aGlzLl9hY3Rpb25zLnNldEN3ZChudWxsKTtcbiAgICAgIHRoaXMuX2N3ZEFwaVN1YnNjcmlwdGlvbiA9IG51bGw7XG4gICAgfSBlbHNlIHtcbiAgICAgIGludmFyaWFudCh0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24gPT0gbnVsbCk7XG4gICAgICB0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24gPSBjd2RBcGkub2JzZXJ2ZUN3ZChkaXJlY3RvcnkgPT4ge1xuICAgICAgICBjb25zdCBwYXRoID0gZGlyZWN0b3J5ID09IG51bGwgPyBudWxsIDogZGlyZWN0b3J5LmdldFBhdGgoKTtcbiAgICAgICAgY29uc3Qgcm9vdEtleSA9IHBhdGggJiYgRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShwYXRoKTtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5zZXRDd2Qocm9vdEtleSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9jd2RBcGkgPSBjd2RBcGk7XG4gIH1cblxuICBzZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldEV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMoZXhjbHVkZVZjc0lnbm9yZWRQYXRocyk7XG4gIH1cblxuICBzZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXM6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldEhpZGVJZ25vcmVkTmFtZXMoaGlkZUlnbm9yZWROYW1lcyk7XG4gIH1cblxuICBzZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzOiBBcnJheTxzdHJpbmc+KTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRJZ25vcmVkTmFtZXMoaWdub3JlZE5hbWVzKTtcbiAgfVxuXG4gIHNldFVzZVByZXZpZXdUYWJzKHVzZVByZXZpZXdUYWJzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFicyk7XG4gIH1cblxuICBzZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2OiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRVc2VQcmVmaXhOYXYodXNlUHJlZml4TmF2KTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXQod29ya2luZ1NldDogV29ya2luZ1NldCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMudXBkYXRlV29ya2luZ1NldCh3b3JraW5nU2V0KTtcbiAgfVxuXG4gIHVwZGF0ZVdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZTogP1dvcmtpbmdTZXRzU3RvcmUpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVdvcmtpbmdTZXRzU3RvcmUod29ya2luZ1NldHNTdG9yZSk7XG4gIH1cblxuICB1cGRhdGVPcGVuRmlsZXNXb3JraW5nU2V0KG9wZW5GaWxlc1dvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZU9wZW5GaWxlc1dvcmtpbmdTZXQob3BlbkZpbGVzV29ya2luZ1NldCk7XG4gIH1cblxuICAvKipcbiAgICogQ29sbGFwc2VzIGFsbCBzZWxlY3RlZCBkaXJlY3Rvcnkgbm9kZXMuIElmIHRoZSBzZWxlY3Rpb24gaXMgYSBzaW5nbGUgZmlsZSBvciBhIHNpbmdsZSBjb2xsYXBzZWRcbiAgICogZGlyZWN0b3J5LCB0aGUgc2VsZWN0aW9uIGlzIHNldCB0byB0aGUgZGlyZWN0b3J5J3MgcGFyZW50LlxuICAgKi9cbiAgX2NvbGxhcHNlU2VsZWN0aW9uKGRlZXA6IGJvb2xlYW4gPSBmYWxzZSk6IHZvaWQge1xuICAgIGNvbnN0IHNlbGVjdGVkTm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgY29uc3QgZmlyc3RTZWxlY3RlZE5vZGUgPSBzZWxlY3RlZE5vZGVzLmZpcnN0KCk7XG4gICAgaWYgKHNlbGVjdGVkTm9kZXMuc2l6ZSA9PT0gMVxuICAgICAgJiYgIWZpcnN0U2VsZWN0ZWROb2RlLmlzUm9vdFxuICAgICAgJiYgIShmaXJzdFNlbGVjdGVkTm9kZS5pc0NvbnRhaW5lciAmJiBmaXJzdFNlbGVjdGVkTm9kZS5pc0V4cGFuZGVkKSkge1xuICAgICAgLypcbiAgICAgICAqIFNlbGVjdCB0aGUgcGFyZW50IG9mIHRoZSBzZWxlY3Rpb24gaWYgdGhlIGZvbGxvd2luZyBjcml0ZXJpYSBhcmUgbWV0OlxuICAgICAgICogICAqIE9ubHkgMSBub2RlIGlzIHNlbGVjdGVkXG4gICAgICAgKiAgICogVGhlIG5vZGUgaXMgbm90IGEgcm9vdFxuICAgICAgICogICAqIFRoZSBub2RlIGlzIG5vdCBhbiBleHBhbmRlZCBkaXJlY3RvcnlcbiAgICAgICovXG5cbiAgICAgIGNvbnN0IHBhcmVudCA9IGZpcnN0U2VsZWN0ZWROb2RlLnBhcmVudDtcbiAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShwYXJlbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzZWxlY3RlZE5vZGVzLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAgIC8vIE9ubHkgZGlyZWN0b3JpZXMgY2FuIGJlIGV4cGFuZGVkLiBTa2lwIG5vbi1kaXJlY3Rvcnkgbm9kZXMuXG4gICAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5jb2xsYXBzZU5vZGVEZWVwKG5vZGUucm9vdFVyaSwgbm9kZS51cmkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlKG5vZGUucm9vdFVyaSwgbm9kZS51cmkpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBfc2VsZWN0QW5kVHJhY2tOb2RlKG5vZGU6IEZpbGVUcmVlTm9kZSk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0U2VsZWN0ZWROb2RlKG5vZGUucm9vdFVyaSwgbm9kZS51cmkpO1xuICB9XG5cbiAgX2NvbGxhcHNlQWxsKCk6IHZvaWQge1xuICAgIGNvbnN0IHJvb3RzID0gdGhpcy5fc3RvcmUucm9vdHM7XG4gICAgcm9vdHMuZm9yRWFjaChyb290ID0+IHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlRGVlcChyb290LnVyaSwgcm9vdC51cmkpKTtcbiAgfVxuXG4gIF9kZWxldGVTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgbm9kZXMgPSB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgaWYgKG5vZGVzLnNpemUgPT09IDApIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCByb290UGF0aHMgPSBub2Rlcy5maWx0ZXIobm9kZSA9PiBub2RlLmlzUm9vdCk7XG4gICAgaWYgKHJvb3RQYXRocy5zaXplID09PSAwKSB7XG4gICAgICBjb25zdCBzZWxlY3RlZFBhdGhzID0gbm9kZXMubWFwKG5vZGUgPT4gRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChub2RlLnVyaSkpO1xuICAgICAgY29uc3QgbWVzc2FnZSA9ICdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoZSBmb2xsb3dpbmcgJyArXG4gICAgICAgICAgKG5vZGVzLnNpemUgPiAxID8gJ2l0ZW1zPycgOiAnaXRlbT8nKTtcbiAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgIGJ1dHRvbnM6IHtcbiAgICAgICAgICAnRGVsZXRlJzogKCkgPT4geyB0aGlzLl9hY3Rpb25zLmRlbGV0ZVNlbGVjdGVkTm9kZXMoKTsgfSxcbiAgICAgICAgICAnQ2FuY2VsJzogKCkgPT4ge30sXG4gICAgICAgIH0sXG4gICAgICAgIGRldGFpbGVkTWVzc2FnZTogYFlvdSBhcmUgZGVsZXRpbmc6JHtvcy5FT0x9JHtzZWxlY3RlZFBhdGhzLmpvaW4ob3MuRU9MKX1gLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBtZXNzYWdlO1xuICAgICAgaWYgKHJvb3RQYXRocy5zaXplID09PSAxKSB7XG4gICAgICAgIG1lc3NhZ2UgPSBgVGhlIHJvb3QgZGlyZWN0b3J5ICcke3Jvb3RQYXRocy5maXJzdCgpLm5vZGVOYW1lfScgY2FuJ3QgYmUgcmVtb3ZlZC5gO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc3Qgcm9vdFBhdGhOYW1lcyA9IHJvb3RQYXRocy5tYXAobm9kZSA9PiBgJyR7bm9kZS5ub2RlTmFtZX0nYCkuam9pbignLCAnKTtcbiAgICAgICAgbWVzc2FnZSA9IGBUaGUgcm9vdCBkaXJlY3RvcmllcyAke3Jvb3RQYXRoTmFtZXN9IGNhbid0IGJlIHJlbW92ZWQuYDtcbiAgICAgIH1cblxuICAgICAgYXRvbS5jb25maXJtKHtcbiAgICAgICAgYnV0dG9uczogWydPSyddLFxuICAgICAgICBtZXNzYWdlLFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEV4cGFuZHMgYWxsIHNlbGVjdGVkIGRpcmVjdG9yeSBub2Rlcy5cbiAgICovXG4gIF9leHBhbmRTZWxlY3Rpb24oZGVlcDogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKS5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgLy8gT25seSBkaXJlY3RvcmllcyBjYW4gYmUgZXhwYW5kZWQuIFNraXAgbm9uLWRpcmVjdG9yeSBub2Rlcy5cbiAgICAgIGlmICghbm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGlmIChkZWVwKSB7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZURlZXAobm9kZS5yb290VXJpLCBub2RlLnVyaSk7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuc2V0VHJhY2tlZE5vZGUobm9kZS5yb290VXJpLCBub2RlLnVyaSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobm9kZS5pc0V4cGFuZGVkKSB7XG4gICAgICAgICAgLy8gTm9kZSBpcyBhbHJlYWR5IGV4cGFuZGVkOyBtb3ZlIHRoZSBzZWxlY3Rpb24gdG8gdGhlIGZpcnN0IGNoaWxkLlxuICAgICAgICAgIGxldCBmaXJzdENoaWxkID0gbm9kZS5jaGlsZHJlbi5maXJzdCgpO1xuICAgICAgICAgIGlmIChmaXJzdENoaWxkICE9IG51bGwgJiYgIWZpcnN0Q2hpbGQuc2hvdWxkQmVTaG93bikge1xuICAgICAgICAgICAgZmlyc3RDaGlsZCA9IGZpcnN0Q2hpbGQuZmluZE5leHRTaG93blNpYmxpbmcoKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZmlyc3RDaGlsZCAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUoZmlyc3RDaGlsZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuZXhwYW5kTm9kZShub2RlLnJvb3RVcmksIG5vZGUudXJpKTtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLnNldFRyYWNrZWROb2RlKG5vZGUucm9vdFVyaSwgbm9kZS51cmkpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnkoKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgLy8gT25seSBwZXJmb3JtIHRoZSBkZWZhdWx0IGFjdGlvbiBpZiBhIHNpbmdsZSBub2RlIGlzIHNlbGVjdGVkLlxuICAgIGlmIChzaW5nbGVTZWxlY3RlZE5vZGUgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aW9ucy5jb25maXJtTm9kZShzaW5nbGVTZWxlY3RlZE5vZGUucm9vdFVyaSwgc2luZ2xlU2VsZWN0ZWROb2RlLnVyaSk7XG4gICAgfVxuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQob3JpZW50YXRpb246IGF0b20kUGFuZVNwbGl0T3JpZW50YXRpb24sIHNpZGU6IGF0b20kUGFuZVNwbGl0U2lkZSk6IHZvaWQge1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIC8vIE9ubHkgcGVyZm9ybSB0aGUgZGVmYXVsdCBhY3Rpb24gaWYgYSBzaW5nbGUgbm9kZSBpcyBzZWxlY3RlZC5cbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwgJiYgIXNpbmdsZVNlbGVjdGVkTm9kZS5pc0NvbnRhaW5lcikge1xuICAgICAgLy8gZm9yOiBpcyB0aGlzIGZlYXR1cmUgdXNlZCBlbm91Z2ggdG8ganVzdGlmeSB1bmNvbGxhcHNpbmc/XG4gICAgICB0cmFjaygnZmlsZXRyZWUtc3BsaXQtZmlsZScsIHtcbiAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgIHNpZGUsXG4gICAgICB9KTtcbiAgICAgIHRoaXMuX2FjdGlvbnMub3BlblNlbGVjdGVkRW50cnlTcGxpdChcbiAgICAgICAgc2luZ2xlU2VsZWN0ZWROb2RlLnVyaSxcbiAgICAgICAgb3JpZW50YXRpb24sXG4gICAgICAgIHNpZGUsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0VXAoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgndmVydGljYWwnLCAnYmVmb3JlJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdERvd24oKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgndmVydGljYWwnLCAnYWZ0ZXInKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0TGVmdCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCdob3Jpem9udGFsJywgJ2JlZm9yZScpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRSaWdodCgpOiB2b2lkIHtcbiAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KCdob3Jpem9udGFsJywgJ2FmdGVyJyk7XG4gIH1cblxuICBfcmVtb3ZlUm9vdEZvbGRlclNlbGVjdGlvbigpOiB2b2lkIHtcbiAgICBjb25zdCByb290Tm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIGlmIChyb290Tm9kZSAhPSBudWxsICYmIHJvb3ROb2RlLmlzUm9vdCkge1xuICAgICAgLy8gY2xvc2UgYWxsIHRoZSBmaWxlcyBhc3NvY2lhdGVkIHdpdGggdGhlIHByb2plY3QgYmVmb3JlIGNsb3NpbmdcbiAgICAgIGNvbnN0IHByb2plY3RFZGl0b3JzID0gYXRvbS53b3Jrc3BhY2UuZ2V0VGV4dEVkaXRvcnMoKTtcbiAgICAgIGNvbnN0IHJvb3RzID0gdGhpcy5fc3RvcmUuZ2V0Um9vdEtleXMoKTtcbiAgICAgIHByb2plY3RFZGl0b3JzLmZvckVhY2goZWRpdG9yID0+IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IGVkaXRvci5nZXRQYXRoKCk7XG4gICAgICAgIC8vIGlmIHRoZSBwYXRoIG9mIHRoZSBlZGl0b3IgaXMgbm90IG51bGwgQU5EXG4gICAgICAgIC8vIGlzIHBhcnQgb2YgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCByb290IHRoYXQgd291bGQgYmUgcmVtb3ZlZCBBTkRcbiAgICAgICAgLy8gaXMgbm90IHBhcnQgb2YgYW55IG90aGVyIG9wZW4gcm9vdCwgdGhlbiBjbG9zZSB0aGUgZmlsZS5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHBhdGggIT0gbnVsbCAmJlxuICAgICAgICAgIHBhdGguc3RhcnRzV2l0aChyb290Tm9kZS51cmkpICYmXG4gICAgICAgICAgcm9vdHMuZmlsdGVyKHJvb3QgPT4gcGF0aC5zdGFydHNXaXRoKHJvb3QpKS5sZW5ndGggPT09IDFcbiAgICAgICAgKSB7XG4gICAgICAgICAgYXRvbS53b3Jrc3BhY2UucGFuZUZvclVSSShwYXRoKS5kZXN0cm95SXRlbShlZGl0b3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIC8vIGFjdHVhbGx5IGNsb3NlIHRoZSBwcm9qZWN0XG4gICAgICBhdG9tLnByb2plY3QucmVtb3ZlUGF0aChGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKHJvb3ROb2RlLnVyaSkpO1xuICAgIH1cbiAgfVxuXG4gIF9zZWFyY2hJbkRpcmVjdG9yeShldmVudDogRXZlbnQpOiB2b2lkIHtcbiAgICAvLyBEaXNwYXRjaCBhIGNvbW1hbmQgdG8gc2hvdyB0aGUgYFByb2plY3RGaW5kVmlld2AuIFRoaXMgb3BlbnMgdGhlIHZpZXcgYW5kIGZvY3VzZXMgdGhlIHNlYXJjaFxuICAgIC8vIGJveC5cbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgKChldmVudC50YXJnZXQ6IGFueSk6IEhUTUxFbGVtZW50KSxcbiAgICAgICdwcm9qZWN0LWZpbmQ6c2hvdy1pbi1jdXJyZW50LWRpcmVjdG9yeSdcbiAgICApO1xuICB9XG5cbiAgX3Nob3dJbkZpbGVNYW5hZ2VyKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICAvLyBPbmx5IGFsbG93IHJldmVhbGluZyBhIHNpbmdsZSBkaXJlY3RvcnkvZmlsZSBhdCBhIHRpbWUuIFJldHVybiBvdGhlcndpc2UuXG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNoZWxsLnNob3dJdGVtSW5Gb2xkZXIobm9kZS51cmkpO1xuICB9XG5cbiAgX2NvcHlGdWxsUGF0aCgpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwpIHtcbiAgICAgIGF0b20uY2xpcGJvYXJkLndyaXRlKHNpbmdsZVNlbGVjdGVkTm9kZS5sb2NhbFBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIGRlc3Ryb3koKTogdm9pZCB7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gICAgZm9yIChjb25zdCBkaXNwb3NhYmxlIG9mIHRoaXMuX3N1YnNjcmlwdGlvbkZvclJlcG9zaXRvcnkudmFsdWVzKCkpIHtcbiAgICAgIGRpc3Bvc2FibGUuZGlzcG9zZSgpO1xuICAgIH1cbiAgICB0aGlzLl9zdG9yZS5yZXNldCgpO1xuICAgIHRoaXMuX2NvbnRleHRNZW51LmRpc3Bvc2UoKTtcbiAgICBjbGVhclRpbWVvdXQodGhpcy5fcHJlZml4VGltZW91dCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogRmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICB0cmVlOiB0aGlzLl9zdG9yZS5leHBvcnREYXRhKCksXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQ29udHJvbGxlcjtcbiJdfQ==