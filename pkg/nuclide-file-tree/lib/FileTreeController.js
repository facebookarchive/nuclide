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
//# sourceMappingURL=data:application/json;base64,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LEVBQUUsQ0FBQztBQUMvRCxVQUFJLGtCQUFrQixJQUFJLElBQUksRUFBRTtBQUM5QixZQUFJLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsQ0FBQyxTQUFTLENBQUMsQ0FBQztPQUNwRDtLQUNGOzs7V0FFTSxtQkFBUztBQUNkLFVBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDOUIsV0FBSyxJQUFNLFVBQVUsSUFBSSxJQUFJLENBQUMsMEJBQTBCLENBQUMsTUFBTSxFQUFFLEVBQUU7QUFDakUsa0JBQVUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztPQUN0QjtBQUNELFVBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7QUFDcEIsVUFBSSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsQ0FBQztLQUM3Qjs7O1dBRVEscUJBQTRCO0FBQ25DLGFBQU87QUFDTCxZQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLEVBQUU7T0FDL0IsQ0FBQztLQUNIOzs7U0FuZ0JHLGtCQUFrQjs7O0FBc2dCeEIsTUFBTSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQyIsImZpbGUiOiJGaWxlVHJlZUNvbnRyb2xsZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7Q3dkQXBpfSBmcm9tICcuLi8uLi9udWNsaWRlLWN1cnJlbnQtd29ya2luZy1kaXJlY3RvcnkvbGliL0N3ZEFwaSc7XG5pbXBvcnQgdHlwZSB7RXhwb3J0U3RvcmVEYXRhfSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGUsIERpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuaW1wb3J0IHtFVkVOVF9IQU5ETEVSX1NFTEVDVE9SfSAgZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQgRmlsZVN5c3RlbUFjdGlvbnMgZnJvbSAnLi9GaWxlU3lzdGVtQWN0aW9ucyc7XG5pbXBvcnQgRmlsZVRyZWVBY3Rpb25zIGZyb20gJy4vRmlsZVRyZWVBY3Rpb25zJztcbmltcG9ydCBGaWxlVHJlZUNvbnRleHRNZW51IGZyb20gJy4vRmlsZVRyZWVDb250ZXh0TWVudSc7XG5pbXBvcnQgRmlsZVRyZWVIZWxwZXJzIGZyb20gJy4vRmlsZVRyZWVIZWxwZXJzJztcbmltcG9ydCB7RmlsZVRyZWVTdG9yZX0gZnJvbSAnLi9GaWxlVHJlZVN0b3JlJztcbmltcG9ydCBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcbmltcG9ydCB7dHJhY2t9IGZyb20gJy4uLy4uL251Y2xpZGUtYW5hbHl0aWNzJztcblxuaW1wb3J0IG9zIGZyb20gJ29zJztcbmltcG9ydCBzaGVsbCBmcm9tICdzaGVsbCc7XG5cbmltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcblxuaW1wb3J0IHR5cGUge1dvcmtpbmdTZXR9IGZyb20gJy4uLy4uL251Y2xpZGUtd29ya2luZy1zZXRzJztcbmltcG9ydCB0eXBlIHtXb3JraW5nU2V0c1N0b3JlfSBmcm9tICcuLi8uLi9udWNsaWRlLXdvcmtpbmctc2V0cy9saWIvV29ya2luZ1NldHNTdG9yZSc7XG5pbXBvcnQgdHlwZSB7RmlsZVRyZWVOb2RlfSBmcm9tICcuL0ZpbGVUcmVlTm9kZSc7XG5cbmV4cG9ydCB0eXBlIEZpbGVUcmVlQ29udHJvbGxlclN0YXRlID0ge1xuICB0cmVlOiBFeHBvcnRTdG9yZURhdGE7XG59O1xuXG5jb25zdCBWQUxJRF9GSUxURVJfQ0hBUlMgPSAnISMuLzAxMjM0NTY3ODk6Oz9AQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVonICtcbiAgJ19hYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5en4nO1xuXG5jbGFzcyBGaWxlVHJlZUNvbnRyb2xsZXIge1xuICBfYWN0aW9uczogRmlsZVRyZWVBY3Rpb25zO1xuICBfY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnU7XG4gIF9jd2RBcGk6ID9Dd2RBcGk7XG4gIF9jd2RBcGlTdWJzY3JpcHRpb246ID9JRGlzcG9zYWJsZTtcbiAgX3JlcG9zaXRvcmllczogSW1tdXRhYmxlLlNldDxhdG9tJFJlcG9zaXRvcnk+O1xuICBfc3RvcmU6IEZpbGVUcmVlU3RvcmU7XG4gIF9zdWJzY3JpcHRpb25zOiBDb21wb3NpdGVEaXNwb3NhYmxlO1xuICBfc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeTogSW1tdXRhYmxlLk1hcDxhdG9tJFJlcG9zaXRvcnksIElEaXNwb3NhYmxlPjtcblxuICBjb25zdHJ1Y3RvcihzdGF0ZTogP0ZpbGVUcmVlQ29udHJvbGxlclN0YXRlKSB7XG4gICAgdGhpcy5fYWN0aW9ucyA9IEZpbGVUcmVlQWN0aW9ucy5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuICAgIHRoaXMuX3JlcG9zaXRvcmllcyA9IG5ldyBJbW11dGFibGUuU2V0KCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9uRm9yUmVwb3NpdG9yeSA9IG5ldyBJbW11dGFibGUuTWFwKCk7XG4gICAgdGhpcy5fc3Vic2NyaXB0aW9ucyA9IG5ldyBDb21wb3NpdGVEaXNwb3NhYmxlKFxuICAgICAgbmV3IERpc3Bvc2FibGUoKCkgPT4ge1xuICAgICAgICBpZiAodGhpcy5fY3dkQXBpU3Vic2NyaXB0aW9uICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24uZGlzcG9zZSgpO1xuICAgICAgICB9XG4gICAgICB9KSxcbiAgICApO1xuICAgIC8vIEluaXRpYWwgcm9vdCBkaXJlY3Rvcmllc1xuICAgIHRoaXMuX3VwZGF0ZVJvb3REaXJlY3RvcmllcygpO1xuICAgIC8vIFN1YnNlcXVlbnQgcm9vdCBkaXJlY3RvcmllcyB1cGRhdGVkIG9uIGNoYW5nZVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5wcm9qZWN0Lm9uRGlkQ2hhbmdlUGF0aHMoKCkgPT4gdGhpcy5fdXBkYXRlUm9vdERpcmVjdG9yaWVzKCkpXG4gICAgKTtcblxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoJ2F0b20td29ya3NwYWNlJywge1xuICAgICAgICAvLyBQYXNzIHVuZGVmaW5lZCBzbyB0aGUgZGVmYXVsdCBwYXJhbWV0ZXIgZ2V0cyB1c2VkLlxuICAgICAgICAvLyBOT1RFOiBUaGlzIGlzIHNwZWNpZmljYWxseSBmb3IgdXNlIGluIERpZmYgVmlldywgc28gZG9uJ3QgZXhwb3NlIGEgbWVudSBpdGVtLlxuICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBudWNsaWRlLWludGVybmFsL2NvbW1hbmQtbWVudS1pdGVtcyAqL1xuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmV2ZWFsLXRleHQtZWRpdG9yJzogdGhpcy5fcmV2ZWFsVGV4dEVkaXRvci5iaW5kKHRoaXMpLFxuICAgICAgICAvKiBlc2xpbnQtZW5hYmxlIG51Y2xpZGUtaW50ZXJuYWwvY29tbWFuZC1tZW51LWl0ZW1zICovXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZXZlYWwtYWN0aXZlLWZpbGUnOiB0aGlzLnJldmVhbEFjdGl2ZUZpbGUuYmluZCh0aGlzLCB1bmRlZmluZWQpLFxuICAgICAgfSlcbiAgICApO1xuICAgIGNvbnN0IGxldHRlcktleUJpbmRpbmdzID0ge1xuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZS1sZXR0ZXInOlxuICAgICAgICB0aGlzLl9oYW5kbGVSZW1vdmVMZXR0ZXJLZXlwcmVzcy5iaW5kKHRoaXMpLFxuICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOmNsZWFyLWZpbHRlcic6XG4gICAgICAgIHRoaXMuX2hhbmRsZUNsZWFyRmlsdGVyLmJpbmQodGhpcyksXG4gICAgfTtcbiAgICBmb3IgKGxldCBpID0gMCwgYyA9IFZBTElEX0ZJTFRFUl9DSEFSUy5jaGFyQ29kZUF0KDApO1xuICAgICAgICAgaSA8IFZBTElEX0ZJTFRFUl9DSEFSUy5sZW5ndGg7XG4gICAgICAgICBpKyssIGMgPSBWQUxJRF9GSUxURVJfQ0hBUlMuY2hhckNvZGVBdChpKSkge1xuICAgICAgY29uc3QgY2hhciA9IFN0cmluZy5mcm9tQ2hhckNvZGUoYyk7XG4gICAgICBsZXR0ZXJLZXlCaW5kaW5nc1tgbnVjbGlkZS1maWxlLXRyZWU6Z28tdG8tbGV0dGVyLSR7Y2hhcn1gXSA9XG4gICAgICAgIHRoaXMuX2hhbmRsZVByZWZpeEtleXByZXNzLmJpbmQodGhpcywgY2hhcik7XG4gICAgfVxuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuYWRkKFxuICAgICAgYXRvbS5jb21tYW5kcy5hZGQoRVZFTlRfSEFORExFUl9TRUxFQ1RPUiwge1xuICAgICAgICAnY29yZTptb3ZlLWRvd24nOiB0aGlzLl9tb3ZlRG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnY29yZTptb3ZlLXVwJzogdGhpcy5fbW92ZVVwLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tdG9wJzogdGhpcy5fbW92ZVRvVG9wLmJpbmQodGhpcyksXG4gICAgICAgICdjb3JlOm1vdmUtdG8tYm90dG9tJzogdGhpcy5fbW92ZVRvQm90dG9tLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZmlsZSc6ICgpID0+IHtcbiAgICAgICAgICBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuQWRkRmlsZURpYWxvZyh0aGlzLl9vcGVuQW5kUmV2ZWFsRmlsZVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZm9sZGVyJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5BZGRGb2xkZXJEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbERpcmVjdG9yeVBhdGguYmluZCh0aGlzKSk7XG4gICAgICAgIH0sXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1jb2xsYXBzZS1kaXJlY3RvcnknOiB0aGlzLl9jb2xsYXBzZVNlbGVjdGlvbi5iaW5kKHRoaXMsIHRydWUpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6cmVjdXJzaXZlLWNvbGxhcHNlLWFsbCc6IHRoaXMuX2NvbGxhcHNlQWxsLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpjb3B5LWZ1bGwtcGF0aCc6IHRoaXMuX2NvcHlGdWxsUGF0aC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6ZXhwYW5kLWRpcmVjdG9yeSc6IHRoaXMuX2V4cGFuZFNlbGVjdGlvbi5iaW5kKHRoaXMsIC8qZGVlcCovIGZhbHNlKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlY3Vyc2l2ZS1leHBhbmQtZGlyZWN0b3J5JzogdGhpcy5fZXhwYW5kU2VsZWN0aW9uLmJpbmQodGhpcywgdHJ1ZSksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5JzogdGhpcy5fb3BlblNlbGVjdGVkRW50cnkuYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktdXAnOlxuICAgICAgICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXRVcC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1kb3duJzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0RG93bi5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1sZWZ0JzpcbiAgICAgICAgICB0aGlzLl9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0TGVmdC5iaW5kKHRoaXMpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1yaWdodCc6XG4gICAgICAgICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdFJpZ2h0LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUnOiB0aGlzLl9kZWxldGVTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZS1wcm9qZWN0LWZvbGRlci1zZWxlY3Rpb24nOlxuICAgICAgICAgIHRoaXMuX3JlbW92ZVJvb3RGb2xkZXJTZWxlY3Rpb24uYmluZCh0aGlzKSxcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJlbmFtZS1zZWxlY3Rpb24nOiAoKSA9PiBGaWxlU3lzdGVtQWN0aW9ucy5vcGVuUmVuYW1lRGlhbG9nKCksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpkdXBsaWNhdGUtc2VsZWN0aW9uJzogKCkgPT4ge1xuICAgICAgICAgIEZpbGVTeXN0ZW1BY3Rpb25zLm9wZW5EdXBsaWNhdGVEaWFsb2codGhpcy5fb3BlbkFuZFJldmVhbEZpbGVQYXRoLmJpbmQodGhpcykpO1xuICAgICAgICB9LFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6c2VhcmNoLWluLWRpcmVjdG9yeSc6IHRoaXMuX3NlYXJjaEluRGlyZWN0b3J5LmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcic6IHRoaXMuX3Nob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcyksXG4gICAgICAgICdudWNsaWRlLWZpbGUtdHJlZTpzZXQtY3VycmVudC13b3JraW5nLXJvb3QnOiB0aGlzLl9zZXRDd2RUb1NlbGVjdGlvbi5iaW5kKHRoaXMpLFxuICAgICAgICAuLi5sZXR0ZXJLZXlCaW5kaW5ncyxcbiAgICAgIH0pXG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmFkZChcbiAgICAgIGF0b20uY29tbWFuZHMuYWRkKCdbaXM9XCJ0YWJzLXRhYlwiXScsIHtcbiAgICAgICAgJ251Y2xpZGUtZmlsZS10cmVlOnJldmVhbC10YWItZmlsZSc6IHRoaXMuX3JldmVhbFRhYkZpbGVPbkNsaWNrLmJpbmQodGhpcyksXG4gICAgICB9KVxuICAgICk7XG4gICAgaWYgKHN0YXRlICYmIHN0YXRlLnRyZWUpIHtcbiAgICAgIHRoaXMuX3N0b3JlLmxvYWREYXRhKHN0YXRlLnRyZWUpO1xuICAgIH1cbiAgICB0aGlzLl9jb250ZXh0TWVudSA9IG5ldyBGaWxlVHJlZUNvbnRleHRNZW51KCk7XG4gIH1cblxuICBfbW92ZVVwKCk6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMubW92ZVNlbGVjdGlvblVwKCk7XG4gIH1cblxuICBfbW92ZURvd24oKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5tb3ZlU2VsZWN0aW9uRG93bigpO1xuICB9XG5cbiAgX21vdmVUb1RvcCgpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLm1vdmVTZWxlY3Rpb25Ub1RvcCgpO1xuICB9XG5cbiAgX21vdmVUb0JvdHRvbSgpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLm1vdmVTZWxlY3Rpb25Ub0JvdHRvbSgpO1xuICB9XG5cbiAgZ2V0Q29udGV4dE1lbnUoKTogRmlsZVRyZWVDb250ZXh0TWVudSB7XG4gICAgcmV0dXJuIHRoaXMuX2NvbnRleHRNZW51O1xuICB9XG5cbiAgX2hhbmRsZUNsZWFyRmlsdGVyKCk6IHZvaWQge1xuICAgIHRoaXMuX3N0b3JlLmNsZWFyRmlsdGVyKCk7XG4gIH1cblxuICBfaGFuZGxlUHJlZml4S2V5cHJlc3MobGV0dGVyOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoIXRoaXMuX3N0b3JlLnVzZVByZWZpeE5hdigpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5fc3RvcmUuYWRkRmlsdGVyTGV0dGVyKGxldHRlcik7XG4gIH1cblxuICBfaGFuZGxlUmVtb3ZlTGV0dGVyS2V5cHJlc3MoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLl9zdG9yZS51c2VQcmVmaXhOYXYoKSkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLl9zdG9yZS5yZW1vdmVGaWx0ZXJMZXR0ZXIoKTtcbiAgfVxuXG4gIF9vcGVuQW5kUmV2ZWFsRmlsZVBhdGgoZmlsZVBhdGg6ID9zdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAoZmlsZVBhdGggIT0gbnVsbCkge1xuICAgICAgYXRvbS53b3Jrc3BhY2Uub3BlbihmaWxlUGF0aCk7XG4gICAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuQW5kUmV2ZWFsRGlyZWN0b3J5UGF0aChwYXRoOiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKHBhdGggIT0gbnVsbCkge1xuICAgICAgdGhpcy5yZXZlYWxOb2RlS2V5KEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkocGF0aCkpO1xuICAgIH1cbiAgfVxuXG4gIF91cGRhdGVSb290RGlyZWN0b3JpZXMoKTogdm9pZCB7XG4gICAgLy8gSWYgdGhlIHJlbW90ZS1wcm9qZWN0cyBwYWNrYWdlIGhhc24ndCBsb2FkZWQgeWV0IHJlbW90ZSBkaXJlY3RvcmllcyB3aWxsIGJlIGluc3RhbnRpYXRlZCBhc1xuICAgIC8vIGxvY2FsIGRpcmVjdG9yaWVzIGJ1dCB3aXRoIGludmFsaWQgcGF0aHMuIFdlIG5lZWQgdG8gZXhjbHVkZSB0aG9zZS5cbiAgICBjb25zdCByb290RGlyZWN0b3JpZXMgPSBhdG9tLnByb2plY3QuZ2V0RGlyZWN0b3JpZXMoKS5maWx0ZXIoZGlyZWN0b3J5ID0+IChcbiAgICAgIEZpbGVUcmVlSGVscGVycy5pc1ZhbGlkRGlyZWN0b3J5KGRpcmVjdG9yeSlcbiAgICApKTtcbiAgICBjb25zdCByb290S2V5cyA9IHJvb3REaXJlY3Rvcmllcy5tYXAoXG4gICAgICBkaXJlY3RvcnkgPT4gRmlsZVRyZWVIZWxwZXJzLmRpclBhdGhUb0tleShkaXJlY3RvcnkuZ2V0UGF0aCgpKVxuICAgICk7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRSb290S2V5cyhyb290S2V5cyk7XG4gICAgdGhpcy5fYWN0aW9ucy51cGRhdGVSZXBvc2l0b3JpZXMocm9vdERpcmVjdG9yaWVzKTtcbiAgfVxuXG4gIF9yZXZlYWxUZXh0RWRpdG9yKGV2ZW50OiBFdmVudCk6IHZvaWQge1xuICAgIGNvbnN0IGVkaXRvckVsZW1lbnQgPSAoKGV2ZW50LnRhcmdldDogYW55KTogYXRvbSRUZXh0RWRpdG9yRWxlbWVudCk7XG4gICAgaWYgKFxuICAgICAgZWRpdG9yRWxlbWVudCA9PSBudWxsIHx8XG4gICAgICB0eXBlb2YgZWRpdG9yRWxlbWVudC5nZXRNb2RlbCAhPT0gJ2Z1bmN0aW9uJyB8fFxuICAgICAgIWF0b20ud29ya3NwYWNlLmlzVGV4dEVkaXRvcihlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkpXG4gICAgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3QgZmlsZVBhdGggPSBlZGl0b3JFbGVtZW50LmdldE1vZGVsKCkuZ2V0UGF0aCgpO1xuICAgIHRoaXMuX3JldmVhbEZpbGVQYXRoKGZpbGVQYXRoKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXZlYWwgdGhlIGZpbGUgdGhhdCBjdXJyZW50bHkgaGFzIGZvY3VzIGluIHRoZSBmaWxlIHRyZWUuIElmIHNob3dJZkhpZGRlbiBpcyBmYWxzZSxcbiAgICogdGhpcyB3aWxsIGVucXVldWUgYSBwZW5kaW5nIHJldmVhbCB0byBiZSBleGVjdXRlZCB3aGVuIHRoZSBmaWxlIHRyZWUgaXMgc2hvd24gYWdhaW4uXG4gICAqL1xuICByZXZlYWxBY3RpdmVGaWxlKHNob3dJZkhpZGRlbj86IGJvb2xlYW4gPSB0cnVlKTogdm9pZCB7XG4gICAgY29uc3QgZWRpdG9yID0gYXRvbS53b3Jrc3BhY2UuZ2V0QWN0aXZlVGV4dEVkaXRvcigpO1xuICAgIGNvbnN0IGZpbGVQYXRoID0gZWRpdG9yICE9IG51bGwgPyBlZGl0b3IuZ2V0UGF0aCgpIDogbnVsbDtcbiAgICB0aGlzLl9yZXZlYWxGaWxlUGF0aChmaWxlUGF0aCwgc2hvd0lmSGlkZGVuKTtcbiAgfVxuXG4gIF9yZXZlYWxGaWxlUGF0aChmaWxlUGF0aDogP3N0cmluZywgc2hvd0lmSGlkZGVuPzogYm9vbGVhbiA9IHRydWUpOiB2b2lkIHtcbiAgICBpZiAoc2hvd0lmSGlkZGVuKSB7XG4gICAgICAvLyBFbnN1cmUgdGhlIGZpbGUgdHJlZSBpcyB2aXNpYmxlIGJlZm9yZSB0cnlpbmcgdG8gcmV2ZWFsIGEgZmlsZSBpbiBpdC4gRXZlbiBpZiB0aGUgY3VycmVudGx5XG4gICAgICAvLyBhY3RpdmUgcGFuZSBpcyBub3QgYW4gb3JkaW5hcnkgZWRpdG9yLCB3ZSBzdGlsbCBhdCBsZWFzdCB3YW50IHRvIHNob3cgdGhlIHRyZWUuXG4gICAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgICBhdG9tLnZpZXdzLmdldFZpZXcoYXRvbS53b3Jrc3BhY2UpLFxuICAgICAgICAnbnVjbGlkZS1maWxlLXRyZWU6dG9nZ2xlJyxcbiAgICAgICAge2Rpc3BsYXk6IHRydWV9XG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICghZmlsZVBhdGgpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldmVhbCB0aGUgZmlsZSBvZiBhIGdpdmVuIHRhYiBiYXNlZCBvbiB0aGUgcGF0aCBzdG9yZWQgb24gdGhlIERPTS5cbiAgICogVGhpcyBtZXRob2QgaXMgbWVhbnQgdG8gYmUgdHJpZ2dlcmVkIGJ5IHRoZSBjb250ZXh0LW1lbnUgY2xpY2suXG4gICAqL1xuICBfcmV2ZWFsVGFiRmlsZU9uQ2xpY2soZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgY29uc3QgdGFiID0gKChldmVudC5jdXJyZW50VGFyZ2V0OiBhbnkpOiBFbGVtZW50KTtcbiAgICBjb25zdCB0aXRsZSA9IHRhYi5xdWVyeVNlbGVjdG9yKCcudGl0bGVbZGF0YS1wYXRoXScpO1xuICAgIGlmICghdGl0bGUpIHtcbiAgICAgIC8vIGNhbiBvbmx5IHJldmVhbCBpdCBpZiB3ZSBmaW5kIHRoZSBmaWxlIHBhdGhcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBmaWxlUGF0aCA9IHRpdGxlLmRhdGFzZXQucGF0aDtcbiAgICBhdG9tLmNvbW1hbmRzLmRpc3BhdGNoKFxuICAgICAgYXRvbS52aWV3cy5nZXRWaWV3KGF0b20ud29ya3NwYWNlKSxcbiAgICAgICdudWNsaWRlLWZpbGUtdHJlZTp0b2dnbGUnLFxuICAgICAge2Rpc3BsYXk6IHRydWV9XG4gICAgKTtcbiAgICB0aGlzLnJldmVhbE5vZGVLZXkoZmlsZVBhdGgpO1xuICB9XG5cbiAgcmV2ZWFsTm9kZUtleShub2RlS2V5OiA/c3RyaW5nKTogdm9pZCB7XG4gICAgaWYgKG5vZGVLZXkgPT0gbnVsbCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMuX2FjdGlvbnMuZW5zdXJlQ2hpbGROb2RlKG5vZGVLZXkpO1xuICB9XG5cbiAgX3NldEN3ZFRvU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAobm9kZSA9PSBudWxsKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGNvbnN0IHBhdGggPSBGaWxlVHJlZUhlbHBlcnMua2V5VG9QYXRoKG5vZGUudXJpKTtcbiAgICBpZiAodGhpcy5fY3dkQXBpICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2N3ZEFwaS5zZXRDd2QocGF0aCk7XG4gICAgfVxuICB9XG5cbiAgc2V0Q3dkQXBpKGN3ZEFwaTogP0N3ZEFwaSk6IHZvaWQge1xuICAgIGlmIChjd2RBcGkgPT0gbnVsbCkge1xuICAgICAgdGhpcy5fYWN0aW9ucy5zZXRDd2QobnVsbCk7XG4gICAgICB0aGlzLl9jd2RBcGlTdWJzY3JpcHRpb24gPSBudWxsO1xuICAgIH0gZWxzZSB7XG4gICAgICBpbnZhcmlhbnQodGhpcy5fY3dkQXBpU3Vic2NyaXB0aW9uID09IG51bGwpO1xuICAgICAgdGhpcy5fY3dkQXBpU3Vic2NyaXB0aW9uID0gY3dkQXBpLm9ic2VydmVDd2QoZGlyZWN0b3J5ID0+IHtcbiAgICAgICAgY29uc3QgcGF0aCA9IGRpcmVjdG9yeSA9PSBudWxsID8gbnVsbCA6IGRpcmVjdG9yeS5nZXRQYXRoKCk7XG4gICAgICAgIGNvbnN0IHJvb3RLZXkgPSBwYXRoICYmIEZpbGVUcmVlSGVscGVycy5kaXJQYXRoVG9LZXkocGF0aCk7XG4gICAgICAgIHRoaXMuX2FjdGlvbnMuc2V0Q3dkKHJvb3RLZXkpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5fY3dkQXBpID0gY3dkQXBpO1xuICB9XG5cbiAgc2V0RXhjbHVkZVZjc0lnbm9yZWRQYXRocyhleGNsdWRlVmNzSWdub3JlZFBhdGhzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRFeGNsdWRlVmNzSWdub3JlZFBhdGhzKGV4Y2x1ZGVWY3NJZ25vcmVkUGF0aHMpO1xuICB9XG5cbiAgc2V0SGlkZUlnbm9yZWROYW1lcyhoaWRlSWdub3JlZE5hbWVzOiBib29sZWFuKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy5zZXRIaWRlSWdub3JlZE5hbWVzKGhpZGVJZ25vcmVkTmFtZXMpO1xuICB9XG5cbiAgc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lczogQXJyYXk8c3RyaW5nPik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0SWdub3JlZE5hbWVzKGlnbm9yZWROYW1lcyk7XG4gIH1cblxuICBzZXRVc2VQcmV2aWV3VGFicyh1c2VQcmV2aWV3VGFiczogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VXNlUHJldmlld1RhYnModXNlUHJldmlld1RhYnMpO1xuICB9XG5cbiAgc2V0VXNlUHJlZml4TmF2KHVzZVByZWZpeE5hdjogYm9vbGVhbik6IHZvaWQge1xuICAgIHRoaXMuX2FjdGlvbnMuc2V0VXNlUHJlZml4TmF2KHVzZVByZWZpeE5hdik7XG4gIH1cblxuICB1cGRhdGVXb3JraW5nU2V0KHdvcmtpbmdTZXQ6IFdvcmtpbmdTZXQpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnVwZGF0ZVdvcmtpbmdTZXQod29ya2luZ1NldCk7XG4gIH1cblxuICB1cGRhdGVXb3JraW5nU2V0c1N0b3JlKHdvcmtpbmdTZXRzU3RvcmU6ID9Xb3JraW5nU2V0c1N0b3JlKTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy51cGRhdGVXb3JraW5nU2V0c1N0b3JlKHdvcmtpbmdTZXRzU3RvcmUpO1xuICB9XG5cbiAgdXBkYXRlT3BlbkZpbGVzV29ya2luZ1NldChvcGVuRmlsZXNXb3JraW5nU2V0OiBXb3JraW5nU2V0KTogdm9pZCB7XG4gICAgdGhpcy5fYWN0aW9ucy51cGRhdGVPcGVuRmlsZXNXb3JraW5nU2V0KG9wZW5GaWxlc1dvcmtpbmdTZXQpO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbGxhcHNlcyBhbGwgc2VsZWN0ZWQgZGlyZWN0b3J5IG5vZGVzLiBJZiB0aGUgc2VsZWN0aW9uIGlzIGEgc2luZ2xlIGZpbGUgb3IgYSBzaW5nbGUgY29sbGFwc2VkXG4gICAqIGRpcmVjdG9yeSwgdGhlIHNlbGVjdGlvbiBpcyBzZXQgdG8gdGhlIGRpcmVjdG9yeSdzIHBhcmVudC5cbiAgICovXG4gIF9jb2xsYXBzZVNlbGVjdGlvbihkZWVwOiBib29sZWFuID0gZmFsc2UpOiB2b2lkIHtcbiAgICBjb25zdCBzZWxlY3RlZE5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGNvbnN0IGZpcnN0U2VsZWN0ZWROb2RlID0gc2VsZWN0ZWROb2Rlcy5maXJzdCgpO1xuICAgIGlmIChzZWxlY3RlZE5vZGVzLnNpemUgPT09IDEgJiZcbiAgICAgICFmaXJzdFNlbGVjdGVkTm9kZS5pc1Jvb3QgJiZcbiAgICAgICEoZmlyc3RTZWxlY3RlZE5vZGUuaXNDb250YWluZXIgJiYgZmlyc3RTZWxlY3RlZE5vZGUuaXNFeHBhbmRlZCkpIHtcbiAgICAgIC8qXG4gICAgICAgKiBTZWxlY3QgdGhlIHBhcmVudCBvZiB0aGUgc2VsZWN0aW9uIGlmIHRoZSBmb2xsb3dpbmcgY3JpdGVyaWEgYXJlIG1ldDpcbiAgICAgICAqICAgKiBPbmx5IDEgbm9kZSBpcyBzZWxlY3RlZFxuICAgICAgICogICAqIFRoZSBub2RlIGlzIG5vdCBhIHJvb3RcbiAgICAgICAqICAgKiBUaGUgbm9kZSBpcyBub3QgYW4gZXhwYW5kZWQgZGlyZWN0b3J5XG4gICAgICAqL1xuXG4gICAgICBjb25zdCBwYXJlbnQgPSBmaXJzdFNlbGVjdGVkTm9kZS5wYXJlbnQ7XG4gICAgICB0aGlzLl9zZWxlY3RBbmRUcmFja05vZGUocGFyZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2VsZWN0ZWROb2Rlcy5mb3JFYWNoKG5vZGUgPT4ge1xuICAgICAgICAvLyBPbmx5IGRpcmVjdG9yaWVzIGNhbiBiZSBleHBhbmRlZC4gU2tpcCBub24tZGlyZWN0b3J5IG5vZGVzLlxuICAgICAgICBpZiAoIW5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZGVlcCkge1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuY29sbGFwc2VOb2RlRGVlcChub2RlLnJvb3RVcmksIG5vZGUudXJpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZShub2RlLnJvb3RVcmksIG5vZGUudXJpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgX3NlbGVjdEFuZFRyYWNrTm9kZShub2RlOiBGaWxlVHJlZU5vZGUpOiB2b2lkIHtcbiAgICB0aGlzLl9hY3Rpb25zLnNldFNlbGVjdGVkTm9kZShub2RlLnJvb3RVcmksIG5vZGUudXJpKTtcbiAgfVxuXG4gIF9jb2xsYXBzZUFsbCgpOiB2b2lkIHtcbiAgICBjb25zdCByb290cyA9IHRoaXMuX3N0b3JlLnJvb3RzO1xuICAgIHJvb3RzLmZvckVhY2gocm9vdCA9PiB0aGlzLl9hY3Rpb25zLmNvbGxhcHNlTm9kZURlZXAocm9vdC51cmksIHJvb3QudXJpKSk7XG4gIH1cblxuICBfZGVsZXRlU2VsZWN0aW9uKCk6IHZvaWQge1xuICAgIGNvbnN0IG5vZGVzID0gdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpO1xuICAgIGlmIChub2Rlcy5zaXplID09PSAwKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgY29uc3Qgcm9vdFBhdGhzID0gbm9kZXMuZmlsdGVyKG5vZGUgPT4gbm9kZS5pc1Jvb3QpO1xuICAgIGlmIChyb290UGF0aHMuc2l6ZSA9PT0gMCkge1xuICAgICAgY29uc3Qgc2VsZWN0ZWRQYXRocyA9IG5vZGVzLm1hcChub2RlID0+IEZpbGVUcmVlSGVscGVycy5rZXlUb1BhdGgobm9kZS51cmkpKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2UgPSAnQXJlIHlvdSBzdXJlIHlvdSB3YW50IHRvIGRlbGV0ZSB0aGUgZm9sbG93aW5nICcgK1xuICAgICAgICAgIChub2Rlcy5zaXplID4gMSA/ICdpdGVtcz8nIDogJ2l0ZW0/Jyk7XG4gICAgICBhdG9tLmNvbmZpcm0oe1xuICAgICAgICBidXR0b25zOiB7XG4gICAgICAgICAgJ0RlbGV0ZSc6ICgpID0+IHsgdGhpcy5fYWN0aW9ucy5kZWxldGVTZWxlY3RlZE5vZGVzKCk7IH0sXG4gICAgICAgICAgJ0NhbmNlbCc6ICgpID0+IHt9LFxuICAgICAgICB9LFxuICAgICAgICBkZXRhaWxlZE1lc3NhZ2U6IGBZb3UgYXJlIGRlbGV0aW5nOiR7b3MuRU9MfSR7c2VsZWN0ZWRQYXRocy5qb2luKG9zLkVPTCl9YCxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbWVzc2FnZTtcbiAgICAgIGlmIChyb290UGF0aHMuc2l6ZSA9PT0gMSkge1xuICAgICAgICBtZXNzYWdlID0gYFRoZSByb290IGRpcmVjdG9yeSAnJHtyb290UGF0aHMuZmlyc3QoKS5ub2RlTmFtZX0nIGNhbid0IGJlIHJlbW92ZWQuYDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnN0IHJvb3RQYXRoTmFtZXMgPSByb290UGF0aHMubWFwKG5vZGUgPT4gYCcke25vZGUubm9kZU5hbWV9J2ApLmpvaW4oJywgJyk7XG4gICAgICAgIG1lc3NhZ2UgPSBgVGhlIHJvb3QgZGlyZWN0b3JpZXMgJHtyb290UGF0aE5hbWVzfSBjYW4ndCBiZSByZW1vdmVkLmA7XG4gICAgICB9XG5cbiAgICAgIGF0b20uY29uZmlybSh7XG4gICAgICAgIGJ1dHRvbnM6IFsnT0snXSxcbiAgICAgICAgbWVzc2FnZSxcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBhbmRzIGFsbCBzZWxlY3RlZCBkaXJlY3Rvcnkgbm9kZXMuXG4gICAqL1xuICBfZXhwYW5kU2VsZWN0aW9uKGRlZXA6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICB0aGlzLl9oYW5kbGVDbGVhckZpbHRlcigpO1xuXG4gICAgdGhpcy5fc3RvcmUuZ2V0U2VsZWN0ZWROb2RlcygpLmZvckVhY2gobm9kZSA9PiB7XG4gICAgICAvLyBPbmx5IGRpcmVjdG9yaWVzIGNhbiBiZSBleHBhbmRlZC4gU2tpcCBub24tZGlyZWN0b3J5IG5vZGVzLlxuICAgICAgaWYgKCFub2RlLmlzQ29udGFpbmVyKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKGRlZXApIHtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlRGVlcChub2RlLnJvb3RVcmksIG5vZGUudXJpKTtcbiAgICAgICAgdGhpcy5fYWN0aW9ucy5zZXRUcmFja2VkTm9kZShub2RlLnJvb3RVcmksIG5vZGUudXJpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChub2RlLmlzRXhwYW5kZWQpIHtcbiAgICAgICAgICAvLyBOb2RlIGlzIGFscmVhZHkgZXhwYW5kZWQ7IG1vdmUgdGhlIHNlbGVjdGlvbiB0byB0aGUgZmlyc3QgY2hpbGQuXG4gICAgICAgICAgbGV0IGZpcnN0Q2hpbGQgPSBub2RlLmNoaWxkcmVuLmZpcnN0KCk7XG4gICAgICAgICAgaWYgKGZpcnN0Q2hpbGQgIT0gbnVsbCAmJiAhZmlyc3RDaGlsZC5zaG91bGRCZVNob3duKSB7XG4gICAgICAgICAgICBmaXJzdENoaWxkID0gZmlyc3RDaGlsZC5maW5kTmV4dFNob3duU2libGluZygpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChmaXJzdENoaWxkICE9IG51bGwpIHtcbiAgICAgICAgICAgIHRoaXMuX3NlbGVjdEFuZFRyYWNrTm9kZShmaXJzdENoaWxkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdGhpcy5fYWN0aW9ucy5leHBhbmROb2RlKG5vZGUucm9vdFVyaSwgbm9kZS51cmkpO1xuICAgICAgICAgIHRoaXMuX2FjdGlvbnMuc2V0VHJhY2tlZE5vZGUobm9kZS5yb290VXJpLCBub2RlLnVyaSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeSgpOiB2b2lkIHtcbiAgICB0aGlzLl9oYW5kbGVDbGVhckZpbHRlcigpO1xuICAgIGNvbnN0IHNpbmdsZVNlbGVjdGVkTm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIC8vIE9ubHkgcGVyZm9ybSB0aGUgZGVmYXVsdCBhY3Rpb24gaWYgYSBzaW5nbGUgbm9kZSBpcyBzZWxlY3RlZC5cbiAgICBpZiAoc2luZ2xlU2VsZWN0ZWROb2RlICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX2FjdGlvbnMuY29uZmlybU5vZGUoc2luZ2xlU2VsZWN0ZWROb2RlLnJvb3RVcmksIHNpbmdsZVNlbGVjdGVkTm9kZS51cmkpO1xuICAgIH1cbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0KG9yaWVudGF0aW9uOiBhdG9tJFBhbmVTcGxpdE9yaWVudGF0aW9uLCBzaWRlOiBhdG9tJFBhbmVTcGxpdFNpZGUpOiB2b2lkIHtcbiAgICBjb25zdCBzaW5nbGVTZWxlY3RlZE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAvLyBPbmx5IHBlcmZvcm0gdGhlIGRlZmF1bHQgYWN0aW9uIGlmIGEgc2luZ2xlIG5vZGUgaXMgc2VsZWN0ZWQuXG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsICYmICFzaW5nbGVTZWxlY3RlZE5vZGUuaXNDb250YWluZXIpIHtcbiAgICAgIC8vIGZvcjogaXMgdGhpcyBmZWF0dXJlIHVzZWQgZW5vdWdoIHRvIGp1c3RpZnkgdW5jb2xsYXBzaW5nP1xuICAgICAgdHJhY2soJ2ZpbGV0cmVlLXNwbGl0LWZpbGUnLCB7XG4gICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICBzaWRlLFxuICAgICAgfSk7XG4gICAgICB0aGlzLl9hY3Rpb25zLm9wZW5TZWxlY3RlZEVudHJ5U3BsaXQoXG4gICAgICAgIHNpbmdsZVNlbGVjdGVkTm9kZS51cmksXG4gICAgICAgIG9yaWVudGF0aW9uLFxuICAgICAgICBzaWRlLFxuICAgICAgKTtcbiAgICB9XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdFVwKCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ3ZlcnRpY2FsJywgJ2JlZm9yZScpO1xuICB9XG5cbiAgX29wZW5TZWxlY3RlZEVudHJ5U3BsaXREb3duKCk6IHZvaWQge1xuICAgIHRoaXMuX29wZW5TZWxlY3RlZEVudHJ5U3BsaXQoJ3ZlcnRpY2FsJywgJ2FmdGVyJyk7XG4gIH1cblxuICBfb3BlblNlbGVjdGVkRW50cnlTcGxpdExlZnQoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgnaG9yaXpvbnRhbCcsICdiZWZvcmUnKTtcbiAgfVxuXG4gIF9vcGVuU2VsZWN0ZWRFbnRyeVNwbGl0UmlnaHQoKTogdm9pZCB7XG4gICAgdGhpcy5fb3BlblNlbGVjdGVkRW50cnlTcGxpdCgnaG9yaXpvbnRhbCcsICdhZnRlcicpO1xuICB9XG5cbiAgX3JlbW92ZVJvb3RGb2xkZXJTZWxlY3Rpb24oKTogdm9pZCB7XG4gICAgY29uc3Qgcm9vdE5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICBpZiAocm9vdE5vZGUgIT0gbnVsbCAmJiByb290Tm9kZS5pc1Jvb3QpIHtcbiAgICAgIC8vIGNsb3NlIGFsbCB0aGUgZmlsZXMgYXNzb2NpYXRlZCB3aXRoIHRoZSBwcm9qZWN0IGJlZm9yZSBjbG9zaW5nXG4gICAgICBjb25zdCBwcm9qZWN0RWRpdG9ycyA9IGF0b20ud29ya3NwYWNlLmdldFRleHRFZGl0b3JzKCk7XG4gICAgICBjb25zdCByb290cyA9IHRoaXMuX3N0b3JlLmdldFJvb3RLZXlzKCk7XG4gICAgICBwcm9qZWN0RWRpdG9ycy5mb3JFYWNoKGVkaXRvciA9PiB7XG4gICAgICAgIGNvbnN0IHBhdGggPSBlZGl0b3IuZ2V0UGF0aCgpO1xuICAgICAgICAvLyBpZiB0aGUgcGF0aCBvZiB0aGUgZWRpdG9yIGlzIG5vdCBudWxsIEFORFxuICAgICAgICAvLyBpcyBwYXJ0IG9mIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgcm9vdCB0aGF0IHdvdWxkIGJlIHJlbW92ZWQgQU5EXG4gICAgICAgIC8vIGlzIG5vdCBwYXJ0IG9mIGFueSBvdGhlciBvcGVuIHJvb3QsIHRoZW4gY2xvc2UgdGhlIGZpbGUuXG4gICAgICAgIGlmIChcbiAgICAgICAgICBwYXRoICE9IG51bGwgJiZcbiAgICAgICAgICBwYXRoLnN0YXJ0c1dpdGgocm9vdE5vZGUudXJpKSAmJlxuICAgICAgICAgIHJvb3RzLmZpbHRlcihyb290ID0+IHBhdGguc3RhcnRzV2l0aChyb290KSkubGVuZ3RoID09PSAxXG4gICAgICAgICkge1xuICAgICAgICAgIGF0b20ud29ya3NwYWNlLnBhbmVGb3JVUkkocGF0aCkuZGVzdHJveUl0ZW0oZWRpdG9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICAvLyBhY3R1YWxseSBjbG9zZSB0aGUgcHJvamVjdFxuICAgICAgYXRvbS5wcm9qZWN0LnJlbW92ZVBhdGgoRmlsZVRyZWVIZWxwZXJzLmtleVRvUGF0aChyb290Tm9kZS51cmkpKTtcbiAgICB9XG4gIH1cblxuICBfc2VhcmNoSW5EaXJlY3RvcnkoZXZlbnQ6IEV2ZW50KTogdm9pZCB7XG4gICAgLy8gRGlzcGF0Y2ggYSBjb21tYW5kIHRvIHNob3cgdGhlIGBQcm9qZWN0RmluZFZpZXdgLiBUaGlzIG9wZW5zIHRoZSB2aWV3IGFuZCBmb2N1c2VzIHRoZSBzZWFyY2hcbiAgICAvLyBib3guXG4gICAgYXRvbS5jb21tYW5kcy5kaXNwYXRjaChcbiAgICAgICgoZXZlbnQudGFyZ2V0OiBhbnkpOiBIVE1MRWxlbWVudCksXG4gICAgICAncHJvamVjdC1maW5kOnNob3ctaW4tY3VycmVudC1kaXJlY3RvcnknXG4gICAgKTtcbiAgfVxuXG4gIF9zaG93SW5GaWxlTWFuYWdlcigpOiB2b2lkIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKG5vZGUgPT0gbnVsbCkge1xuICAgICAgLy8gT25seSBhbGxvdyByZXZlYWxpbmcgYSBzaW5nbGUgZGlyZWN0b3J5L2ZpbGUgYXQgYSB0aW1lLiBSZXR1cm4gb3RoZXJ3aXNlLlxuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBzaGVsbC5zaG93SXRlbUluRm9sZGVyKG5vZGUudXJpKTtcbiAgfVxuXG4gIF9jb3B5RnVsbFBhdGgoKTogdm9pZCB7XG4gICAgY29uc3Qgc2luZ2xlU2VsZWN0ZWROb2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgaWYgKHNpbmdsZVNlbGVjdGVkTm9kZSAhPSBudWxsKSB7XG4gICAgICBhdG9tLmNsaXBib2FyZC53cml0ZShzaW5nbGVTZWxlY3RlZE5vZGUubG9jYWxQYXRoKTtcbiAgICB9XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICAgIGZvciAoY29uc3QgZGlzcG9zYWJsZSBvZiB0aGlzLl9zdWJzY3JpcHRpb25Gb3JSZXBvc2l0b3J5LnZhbHVlcygpKSB7XG4gICAgICBkaXNwb3NhYmxlLmRpc3Bvc2UoKTtcbiAgICB9XG4gICAgdGhpcy5fc3RvcmUucmVzZXQoKTtcbiAgICB0aGlzLl9jb250ZXh0TWVudS5kaXNwb3NlKCk7XG4gIH1cblxuICBzZXJpYWxpemUoKTogRmlsZVRyZWVDb250cm9sbGVyU3RhdGUge1xuICAgIHJldHVybiB7XG4gICAgICB0cmVlOiB0aGlzLl9zdG9yZS5leHBvcnREYXRhKCksXG4gICAgfTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQ29udHJvbGxlcjtcbiJdfQ==