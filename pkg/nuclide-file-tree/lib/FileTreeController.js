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

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _shell = require('shell');

var _shell2 = _interopRequireDefault(_shell);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var VALID_FILTER_CHARS = '!#./0123456789:;?@ABCDEFGHIJKLMNOPQRSTUVWXYZ' + '_abcdefghijklmnopqrstuvwxyz~';

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
    var letterKeyBindings = {
      'nuclide-file-tree:remove-letter': this._handleRemoveLetterKeypress.bind(this),
      'nuclide-file-tree:clear-filter': this._handleClearFilter.bind(this)
    };
    for (var i = 0, c = VALID_FILTER_CHARS.charCodeAt(0); i < VALID_FILTER_CHARS.length; i++, c = VALID_FILTER_CHARS.charCodeAt(i)) {
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
    key: '_handleClearFilter',
    value: function _handleClearFilter() {
      this._store.clearFilter();
    }
  }, {
    key: '_handlePrefixKeypress',
    value: function _handlePrefixKeypress(letter) {
      if (!this._store.usePrefixNav()) {
        return;
      }

      this._store.addFilterLetter(letter);
    }
  }, {
    key: '_handleRemoveLetterKeypress',
    value: function _handleRemoveLetterKeypress() {
      if (!this._store.usePrefixNav()) {
        return;
      }
      this._store.removeFilterLetter();
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
      if (editorElement == null || typeof editorElement.getModel !== 'function' || !atom.workspace.isTextEditor(editorElement.getModel())) {
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
      var _this2 = this;

      if (cwdApi == null) {
        this._actions.setCwd(null);
        this._cwdApiSubscription = null;
      } else {
        (0, _assert2['default'])(this._cwdApiSubscription == null);
        this._cwdApiSubscription = cwdApi.observeCwd(function (directory) {
          var path = directory == null ? null : directory.getPath();
          var rootKey = path && _FileTreeHelpers2['default'].dirPathToKey(path);
          _this2._actions.setCwd(rootKey);
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
      var _this3 = this;

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
            _this3._actions.collapseNodeDeep(node.rootUri, node.uri);
          } else {
            _this3._actions.collapseNode(node.rootUri, node.uri);
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
      var _this4 = this;

      var roots = this._store.roots;
      roots.forEach(function (root) {
        return _this4._actions.collapseNodeDeep(root.uri, root.uri);
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
          return _FileTreeHelpers2['default'].keyToPath(node.uri);
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

      this._handleClearFilter();

      this._store.getSelectedNodes().forEach(function (node) {
        // Only directories can be expanded. Skip non-directory nodes.
        if (!node.isContainer) {
          return;
        }

        if (deep) {
          _this6._actions.expandNodeDeep(node.rootUri, node.uri);
          _this6._actions.setTrackedNode(node.rootUri, node.uri);
        } else {
          if (node.isExpanded) {
            // Node is already expanded; move the selection to the first child.
            var firstChild = node.children.first();
            if (firstChild != null && !firstChild.shouldBeShown) {
              firstChild = firstChild.findNextShownSibling();
            }

            if (firstChild != null) {
              _this6._selectAndTrackNode(firstChild);
            }
          } else {
            _this6._actions.expandNode(node.rootUri, node.uri);
            _this6._actions.setTrackedNode(node.rootUri, node.uri);
          }
        }
      });
    }
  }, {
    key: '_openSelectedEntry',
    value: function _openSelectedEntry() {
      this._handleClearFilter();
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