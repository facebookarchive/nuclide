var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nuclideContextMenu = require('../../nuclide-context-menu');

var _nuclideContextMenu2 = _interopRequireDefault(_nuclideContextMenu);

var _atom = require('atom');

var _FileTreeConstants = require('./FileTreeConstants');

var _FileTreeStore = require('./FileTreeStore');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var NEW_MENU_PRIORITY = 0;
var SOURCE_CONTROL_MENU_PRIORITY = 150;
var ADD_PROJECT_MENU_PRIORITY = 100;
var MODIFY_FILE_MENU_PRIORITY = 200;
var SPLIT_MENU_PRIORITY = 300;
var SHOW_IN_MENU_PRIORITY = 400;

/**
 * This context menu wrapper exists to address some of the limitations in the ContextMenuManager:
 * https://atom.io/docs/api/latest/ContextMenuManager.
 *
 * Specifically, a context menu item would often like to know which file (or directory) the user
 * right-clicked on in the file tree when selecting the menu item. The fundamental problem is that
 * the way a menu item is notified that it was selected is that the Atom command associated with
 * the item is fired. By the time the function associated with the command is called, the state
 * with which the menu item was created is lost. Here we introduce a pattern where the callback
 * registered with the command can get the selection via the FileTreeContextMenu:
 * ```
 * // Subscribe to the nuclide-file-tree.context-menu service by ensuring the package.json for your
 * // Atom package contains the following stanza:
 * "consumedServices": {
 *   "nuclide-file-tree.context-menu": {
 *     "versions": {
 *       "0.1.0": "addItemsToFileTreeContextMenu"
 *     }
 *   }
 * },
 *
 * // Include the following in the main.js file for your package:
 * import {CompositeDisposable} from 'atom';
 * import invariant from 'assert';
 *
 * let subscriptions: ?CompositeDisposable = null;
 *
 * export function activate(state: ?Object): void {
 *   subscriptions = new CompositeDisposable();
 * }
 *
 * export function deactivate(): void {
 *   if (subscriptions != null) {
 *     subscriptions.dispose();
 *     subscriptions = null;
 *   }
 * }
 *
 * export function addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): void {
 *   invariant(subscriptions);
 *
 *   subscriptions.add(
 *     atom.commands.add(
 *       'atom-workspace',
 *       'command-that-should-only-be-fired-from-the-context-menu',
 *       () => {
 *         Array.from(contextMenu.getSelectedNodes())
 *           .filter(node => !node.isContainer)
 *           .forEach((node: FileTreeNode) => {
 *             const uri = node.uri;
 *             // DO WHAT YOU LIKE WITH THE URI!
 *           });
 *       },
 *     )
 *   );
 *   subscriptions.add(contextMenu.addItemToSourceControlMenu(
 *     {
 *       label: 'Label for the menu item that acts on a file',
 *       command: 'command-that-should-only-be-fired-from-the-context-menu',
 *       shouldDisplay() {
 *         return Array.from(contextMenu.getSelectedNodes()).some(node => !node.isContainer);
 *       },
 *     },
 *     1000, // priority
 *   ));
 * }
 * ```
 *
 * Note that it is a little odd to register a command that only makes sense in the context of what
 * is currently selected in the file tree. Ideally, there would be a way to make this a "private"
 * command that could not be selected from the command palette. (Or really, just associate a
 * callback function with a menu item instead of a command.)
 */

var FileTreeContextMenu = (function () {
  function FileTreeContextMenu() {
    var _this = this;

    _classCallCheck(this, FileTreeContextMenu);

    this._contextMenu = new _nuclideContextMenu2['default']({
      type: 'root',
      cssSelector: _FileTreeConstants.EVENT_HANDLER_SELECTOR
    });
    this._subscriptions = new _atom.CompositeDisposable();
    this._store = _FileTreeStore.FileTreeStore.getInstance();

    this._addContextMenuItemGroup([{
      label: 'Set to Current Working Root',
      command: 'nuclide-file-tree:set-current-working-root',
      shouldDisplay: function shouldDisplay() {
        var node = _this._store.getSingleSelectedNode();
        return node != null && node.isRoot && _this._store.hasCwd() && !node.isCwd;
      }
    }, {
      label: 'New',
      shouldDisplay: function shouldDisplay() {
        return _this._store.getSingleSelectedNode() != null;
      },
      submenu: [{
        label: 'File',
        command: 'nuclide-file-tree:add-file'
      }, {
        label: 'Folder',
        command: 'nuclide-file-tree:add-folder'
      }]
    }], NEW_MENU_PRIORITY);

    this._addContextMenuItemGroup([{
      label: 'Add Project Folder',
      command: 'application:add-project-folder'
    }, {
      label: 'Add Remote Project Folder',
      command: 'nuclide-remote-projects:connect'
    }, {
      label: 'Remove Project Folder',
      command: 'nuclide-file-tree:remove-project-folder-selection',
      shouldDisplay: function shouldDisplay() {
        var node = _this.getSingleSelectedNode();
        return node != null && node.isRoot;
      }
    }], ADD_PROJECT_MENU_PRIORITY);

    this._sourceControlMenu = new _nuclideContextMenu2['default']({
      type: 'submenu',
      label: 'Source Control',
      parent: this._contextMenu
    });
    this._contextMenu.addSubmenu(this._sourceControlMenu, SOURCE_CONTROL_MENU_PRIORITY);
    this._contextMenu.addItem({
      type: 'separator',
      shouldDisplay: function shouldDisplay(e) {
        return !_this._sourceControlMenu.isEmpty();
      }
    }, SOURCE_CONTROL_MENU_PRIORITY + 1);

    this._addContextMenuItemGroup([{
      label: 'Rename',
      command: 'nuclide-file-tree:rename-selection',
      shouldDisplay: function shouldDisplay() {
        var node = _this._store.getSingleSelectedNode();
        // For now, rename does not apply to root nodes.
        return node != null && !node.isRoot;
      }
    }, {
      label: 'Duplicate',
      command: 'nuclide-file-tree:duplicate-selection',
      shouldDisplay: function shouldDisplay() {
        var node = _this.getSingleSelectedNode();
        return node != null && !node.isContainer;
      }
    }, {
      label: 'Delete',
      command: 'nuclide-file-tree:remove',
      shouldDisplay: function shouldDisplay() {
        var nodes = _this.getSelectedNodes();
        // We can delete multiple nodes as long as no root node is selected
        return nodes.size > 0 && nodes.every(function (node) {
          return node != null && !node.isRoot;
        });
      }
    }], MODIFY_FILE_MENU_PRIORITY);

    this._addContextMenuItemGroup([{
      label: 'Split',
      shouldDisplay: function shouldDisplay() {
        var node = _this.getSingleSelectedNode();
        return node != null && !node.isContainer;
      },
      submenu: [{
        'label': 'Up',
        'command': 'nuclide-file-tree:open-selected-entry-up'
      }, {
        'label': 'Down',
        'command': 'nuclide-file-tree:open-selected-entry-down'
      }, {
        'label': 'Left',
        'command': 'nuclide-file-tree:open-selected-entry-left'
      }, {
        'label': 'Right',
        'command': 'nuclide-file-tree:open-selected-entry-right'
      }]
    }], SPLIT_MENU_PRIORITY);

    this._addContextMenuItemGroup([{
      label: 'Copy Full Path',
      command: 'nuclide-file-tree:copy-full-path',
      shouldDisplay: function shouldDisplay() {
        var node = _this.getSingleSelectedNode();
        return node != null;
      }
    }, {
      label: 'Show in Finder', // Mac OS X
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'darwin')
    }, {
      label: 'Show in Explorer', // Windows
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'win32')
    }, {
      label: 'Show in File Manager', // Linux
      command: 'nuclide-file-tree:show-in-file-manager',
      shouldDisplay: this._shouldDisplayShowInFileManager.bind(this, 'linux')
    }, {
      label: 'Search in Directory',
      command: 'nuclide-file-tree:search-in-directory',
      shouldDisplay: function shouldDisplay() {
        var nodes = _this.getSelectedNodes();
        return nodes.size > 0 && nodes.every(function (node) {
          return node.isContainer;
        });
      }
    }], SHOW_IN_MENU_PRIORITY);
  }

  _createClass(FileTreeContextMenu, [{
    key: 'addItemToSourceControlMenu',
    value: function addItemToSourceControlMenu(item, priority) {
      return this._sourceControlMenu.addItem(item, priority);
    }
  }, {
    key: 'getSelectedNodes',
    value: function getSelectedNodes() {
      return this._store.getSelectedNodes();
    }
  }, {
    key: 'getSingleSelectedNode',
    value: function getSingleSelectedNode() {
      return this._store.getSingleSelectedNode();
    }
  }, {
    key: 'dispose',
    value: function dispose() {
      this._subscriptions.dispose();
    }
  }, {
    key: '_addContextMenuItemGroup',
    value: function _addContextMenuItemGroup(menuItems, priority) {
      var _this2 = this;

      // Atom is smart about only displaying a separator when there are items to
      // separate, so there will never be a dangling separator at the end.

      var allItems = menuItems.concat([{ type: 'separator' }]);
      allItems.forEach(function (item) {
        _this2._contextMenu.addItem(item, ++priority);
      });
    }

    /**
     * @return A {boolean} whether the "Show in File Manager" context menu item should be displayed
     * for the current selection and the given `platform`.
     */
  }, {
    key: '_shouldDisplayShowInFileManager',
    value: function _shouldDisplayShowInFileManager(platform) {
      var node = this.getSingleSelectedNode();
      return node != null && _path2['default'].isAbsolute(node.uri) && process.platform === platform;
    }
  }]);

  return FileTreeContextMenu;
})();

module.exports = FileTreeContextMenu;
// $FlowFixMe: The conversion between MenuItemDefinition and atom$ContextMenuItem is a mess.
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udGV4dE1lbnUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7a0NBY3dCLDRCQUE0Qjs7OztvQkFDbEIsTUFBTTs7aUNBQ0gscUJBQXFCOzs2QkFDOUIsaUJBQWlCOztvQkFFNUIsTUFBTTs7OztBQW9CdkIsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDNUIsSUFBTSw0QkFBNEIsR0FBRyxHQUFHLENBQUM7QUFDekMsSUFBTSx5QkFBeUIsR0FBRyxHQUFHLENBQUM7QUFDdEMsSUFBTSx5QkFBeUIsR0FBRyxHQUFHLENBQUM7QUFDdEMsSUFBTSxtQkFBbUIsR0FBRyxHQUFHLENBQUM7QUFDaEMsSUFBTSxxQkFBcUIsR0FBRyxHQUFHLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEyRTVCLG1CQUFtQjtBQU1aLFdBTlAsbUJBQW1CLEdBTVQ7OzswQkFOVixtQkFBbUI7O0FBT3JCLFFBQUksQ0FBQyxZQUFZLEdBQUcsb0NBQ2xCO0FBQ0UsVUFBSSxFQUFFLE1BQU07QUFDWixpQkFBVywyQ0FBd0I7S0FDcEMsQ0FDRixDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsTUFBTSxHQUFHLDZCQUFjLFdBQVcsRUFBRSxDQUFDOztBQUUxQyxRQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FDNUI7QUFDRSxXQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGFBQU8sRUFBRSw0Q0FBNEM7QUFDckQsbUJBQWEsRUFBRSx5QkFBTTtBQUNuQixZQUFNLElBQUksR0FBRyxNQUFLLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQ2pELGVBQU8sSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLE1BQUssTUFBTSxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMs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QUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQzFDLGFBQ0UsSUFBSSxJQUFJLElBQUksSUFDWixrQkFBSyxVQUFVLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUN6QixPQUFPLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FDN0I7S0FDSDs7O1NBck5HLG1CQUFtQjs7O0FBd056QixNQUFNLENBQUMsT0FBTyxHQUFHLG1CQUFtQixDQUFDIiwiZmlsZSI6IkZpbGVUcmVlQ29udGV4dE1lbnUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIGJhYmVsJztcbi8qIEBmbG93ICovXG5cbi8qXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTUtcHJlc2VudCwgRmFjZWJvb2ssIEluYy5cbiAqIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKlxuICogVGhpcyBzb3VyY2UgY29kZSBpcyBsaWNlbnNlZCB1bmRlciB0aGUgbGljZW5zZSBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGluXG4gKiB0aGUgcm9vdCBkaXJlY3Rvcnkgb2YgdGhpcyBzb3VyY2UgdHJlZS5cbiAqL1xuXG5pbXBvcnQgdHlwZSB7RmlsZVRyZWVOb2RlfSBmcm9tICcuL0ZpbGVUcmVlTm9kZSc7XG5pbXBvcnQgdHlwZSBJbW11dGFibGUgZnJvbSAnaW1tdXRhYmxlJztcblxuaW1wb3J0IENvbnRleHRNZW51IGZyb20gJy4uLy4uL251Y2xpZGUtY29udGV4dC1tZW51JztcbmltcG9ydCB7Q29tcG9zaXRlRGlzcG9zYWJsZX0gZnJvbSAnYXRvbSc7XG5pbXBvcnQge0VWRU5UX0hBTkRMRVJfU0VMRUNUT1J9IGZyb20gJy4vRmlsZVRyZWVDb25zdGFudHMnO1xuaW1wb3J0IHtGaWxlVHJlZVN0b3JlfSBmcm9tICcuL0ZpbGVUcmVlU3RvcmUnO1xuXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxudHlwZSBNZW51SXRlbVNpbmdsZSA9IHtcbiAgbGFiZWw6IHN0cmluZztcbiAgY29tbWFuZDogc3RyaW5nO1xuICBzaG91bGREaXNwbGF5PzogKGV2ZW50OiBNb3VzZUV2ZW50KSA9PiBib29sZWFuO1xufTtcblxudHlwZSBNZW51SXRlbUdyb3VwID0ge1xuICBsYWJlbDogc3RyaW5nO1xuICBzdWJtZW51OiBBcnJheTxhdG9tJENvbnRleHRNZW51SXRlbT47XG4gIHNob3VsZERpc3BsYXk/OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGJvb2xlYW47XG59O1xuXG50eXBlIE1lbnVJdGVtU2VwYXJhdG9yID0ge1xuICB0eXBlOiBzdHJpbmc7XG59O1xuXG50eXBlIE1lbnVJdGVtRGVmaW5pdGlvbiA9IE1lbnVJdGVtU2luZ2xlIHwgTWVudUl0ZW1Hcm91cCB8IE1lbnVJdGVtU2VwYXJhdG9yO1xuXG5jb25zdCBORVdfTUVOVV9QUklPUklUWSA9IDA7XG5jb25zdCBTT1VSQ0VfQ09OVFJPTF9NRU5VX1BSSU9SSVRZID0gMTUwO1xuY29uc3QgQUREX1BST0pFQ1RfTUVOVV9QUklPUklUWSA9IDEwMDtcbmNvbnN0IE1PRElGWV9GSUxFX01FTlVfUFJJT1JJVFkgPSAyMDA7XG5jb25zdCBTUExJVF9NRU5VX1BSSU9SSVRZID0gMzAwO1xuY29uc3QgU0hPV19JTl9NRU5VX1BSSU9SSVRZID0gNDAwO1xuXG4vKipcbiAqIFRoaXMgY29udGV4dCBtZW51IHdyYXBwZXIgZXhpc3RzIHRvIGFkZHJlc3Mgc29tZSBvZiB0aGUgbGltaXRhdGlvbnMgaW4gdGhlIENvbnRleHRNZW51TWFuYWdlcjpcbiAqIGh0dHBzOi8vYXRvbS5pby9kb2NzL2FwaS9sYXRlc3QvQ29udGV4dE1lbnVNYW5hZ2VyLlxuICpcbiAqIFNwZWNpZmljYWxseSwgYSBjb250ZXh0IG1lbnUgaXRlbSB3b3VsZCBvZnRlbiBsaWtlIHRvIGtub3cgd2hpY2ggZmlsZSAob3IgZGlyZWN0b3J5KSB0aGUgdXNlclxuICogcmlnaHQtY2xpY2tlZCBvbiBpbiB0aGUgZmlsZSB0cmVlIHdoZW4gc2VsZWN0aW5nIHRoZSBtZW51IGl0ZW0uIFRoZSBmdW5kYW1lbnRhbCBwcm9ibGVtIGlzIHRoYXRcbiAqIHRoZSB3YXkgYSBtZW51IGl0ZW0gaXMgbm90aWZpZWQgdGhhdCBpdCB3YXMgc2VsZWN0ZWQgaXMgdGhhdCB0aGUgQXRvbSBjb21tYW5kIGFzc29jaWF0ZWQgd2l0aFxuICogdGhlIGl0ZW0gaXMgZmlyZWQuIEJ5IHRoZSB0aW1lIHRoZSBmdW5jdGlvbiBhc3NvY2lhdGVkIHdpdGggdGhlIGNvbW1hbmQgaXMgY2FsbGVkLCB0aGUgc3RhdGVcbiAqIHdpdGggd2hpY2ggdGhlIG1lbnUgaXRlbSB3YXMgY3JlYXRlZCBpcyBsb3N0LiBIZXJlIHdlIGludHJvZHVjZSBhIHBhdHRlcm4gd2hlcmUgdGhlIGNhbGxiYWNrXG4gKiByZWdpc3RlcmVkIHdpdGggdGhlIGNvbW1hbmQgY2FuIGdldCB0aGUgc2VsZWN0aW9uIHZpYSB0aGUgRmlsZVRyZWVDb250ZXh0TWVudTpcbiAqIGBgYFxuICogLy8gU3Vic2NyaWJlIHRvIHRoZSBudWNsaWRlLWZpbGUtdHJlZS5jb250ZXh0LW1lbnUgc2VydmljZSBieSBlbnN1cmluZyB0aGUgcGFja2FnZS5qc29uIGZvciB5b3VyXG4gKiAvLyBBdG9tIHBhY2thZ2UgY29udGFpbnMgdGhlIGZvbGxvd2luZyBzdGFuemE6XG4gKiBcImNvbnN1bWVkU2VydmljZXNcIjoge1xuICogICBcIm51Y2xpZGUtZmlsZS10cmVlLmNvbnRleHQtbWVudVwiOiB7XG4gKiAgICAgXCJ2ZXJzaW9uc1wiOiB7XG4gKiAgICAgICBcIjAuMS4wXCI6IFwiYWRkSXRlbXNUb0ZpbGVUcmVlQ29udGV4dE1lbnVcIlxuICogICAgIH1cbiAqICAgfVxuICogfSxcbiAqXG4gKiAvLyBJbmNsdWRlIHRoZSBmb2xsb3dpbmcgaW4gdGhlIG1haW4uanMgZmlsZSBmb3IgeW91ciBwYWNrYWdlOlxuICogaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbiAqIGltcG9ydCBpbnZhcmlhbnQgZnJvbSAnYXNzZXJ0JztcbiAqXG4gKiBsZXQgc3Vic2NyaXB0aW9uczogP0NvbXBvc2l0ZURpc3Bvc2FibGUgPSBudWxsO1xuICpcbiAqIGV4cG9ydCBmdW5jdGlvbiBhY3RpdmF0ZShzdGF0ZTogP09iamVjdCk6IHZvaWQge1xuICogICBzdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAqIH1cbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gZGVhY3RpdmF0ZSgpOiB2b2lkIHtcbiAqICAgaWYgKHN1YnNjcmlwdGlvbnMgIT0gbnVsbCkge1xuICogICAgIHN1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICogICAgIHN1YnNjcmlwdGlvbnMgPSBudWxsO1xuICogICB9XG4gKiB9XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIGFkZEl0ZW1zVG9GaWxlVHJlZUNvbnRleHRNZW51KGNvbnRleHRNZW51OiBGaWxlVHJlZUNvbnRleHRNZW51KTogdm9pZCB7XG4gKiAgIGludmFyaWFudChzdWJzY3JpcHRpb25zKTtcbiAqXG4gKiAgIHN1YnNjcmlwdGlvbnMuYWRkKFxuICogICAgIGF0b20uY29tbWFuZHMuYWRkKFxuICogICAgICAgJ2F0b20td29ya3NwYWNlJyxcbiAqICAgICAgICdjb21tYW5kLXRoYXQtc2hvdWxkLW9ubHktYmUtZmlyZWQtZnJvbS10aGUtY29udGV4dC1tZW51JyxcbiAqICAgICAgICgpID0+IHtcbiAqICAgICAgICAgQXJyYXkuZnJvbShjb250ZXh0TWVudS5nZXRTZWxlY3RlZE5vZGVzKCkpXG4gKiAgICAgICAgICAgLmZpbHRlcihub2RlID0+ICFub2RlLmlzQ29udGFpbmVyKVxuICogICAgICAgICAgIC5mb3JFYWNoKChub2RlOiBGaWxlVHJlZU5vZGUpID0+IHtcbiAqICAgICAgICAgICAgIGNvbnN0IHVyaSA9IG5vZGUudXJpO1xuICogICAgICAgICAgICAgLy8gRE8gV0hBVCBZT1UgTElLRSBXSVRIIFRIRSBVUkkhXG4gKiAgICAgICAgICAgfSk7XG4gKiAgICAgICB9LFxuICogICAgIClcbiAqICAgKTtcbiAqICAgc3Vic2NyaXB0aW9ucy5hZGQoY29udGV4dE1lbnUuYWRkSXRlbVRvU291cmNlQ29udHJvbE1lbnUoXG4gKiAgICAge1xuICogICAgICAgbGFiZWw6ICdMYWJlbCBmb3IgdGhlIG1lbnUgaXRlbSB0aGF0IGFjdHMgb24gYSBmaWxlJyxcbiAqICAgICAgIGNvbW1hbmQ6ICdjb21tYW5kLXRoYXQtc2hvdWxkLW9ubHktYmUtZmlyZWQtZnJvbS10aGUtY29udGV4dC1tZW51JyxcbiAqICAgICAgIHNob3VsZERpc3BsYXkoKSB7XG4gKiAgICAgICAgIHJldHVybiBBcnJheS5mcm9tKGNvbnRleHRNZW51LmdldFNlbGVjdGVkTm9kZXMoKSkuc29tZShub2RlID0+ICFub2RlLmlzQ29udGFpbmVyKTtcbiAqICAgICAgIH0sXG4gKiAgICAgfSxcbiAqICAgICAxMDAwLCAvLyBwcmlvcml0eVxuICogICApKTtcbiAqIH1cbiAqIGBgYFxuICpcbiAqIE5vdGUgdGhhdCBpdCBpcyBhIGxpdHRsZSBvZGQgdG8gcmVnaXN0ZXIgYSBjb21tYW5kIHRoYXQgb25seSBtYWtlcyBzZW5zZSBpbiB0aGUgY29udGV4dCBvZiB3aGF0XG4gKiBpcyBjdXJyZW50bHkgc2VsZWN0ZWQgaW4gdGhlIGZpbGUgdHJlZS4gSWRlYWxseSwgdGhlcmUgd291bGQgYmUgYSB3YXkgdG8gbWFrZSB0aGlzIGEgXCJwcml2YXRlXCJcbiAqIGNvbW1hbmQgdGhhdCBjb3VsZCBub3QgYmUgc2VsZWN0ZWQgZnJvbSB0aGUgY29tbWFuZCBwYWxldHRlLiAoT3IgcmVhbGx5LCBqdXN0IGFzc29jaWF0ZSBhXG4gKiBjYWxsYmFjayBmdW5jdGlvbiB3aXRoIGEgbWVudSBpdGVtIGluc3RlYWQgb2YgYSBjb21tYW5kLilcbiAqL1xuY2xhc3MgRmlsZVRyZWVDb250ZXh0TWVudSB7XG4gIF9jb250ZXh0TWVudTogQ29udGV4dE1lbnU7XG4gIF9zb3VyY2VDb250cm9sTWVudTogQ29udGV4dE1lbnU7XG4gIF9zdG9yZTogRmlsZVRyZWVTdG9yZTtcbiAgX3N1YnNjcmlwdGlvbnM6IENvbXBvc2l0ZURpc3Bvc2FibGU7XG5cbiAgY29uc3RydWN0b3IoKSB7XG4gICAgdGhpcy5fY29udGV4dE1lbnUgPSBuZXcgQ29udGV4dE1lbnUoXG4gICAgICB7XG4gICAgICAgIHR5cGU6ICdyb290JyxcbiAgICAgICAgY3NzU2VsZWN0b3I6IEVWRU5UX0hBTkRMRVJfU0VMRUNUT1IsXG4gICAgICB9XG4gICAgKTtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zID0gbmV3IENvbXBvc2l0ZURpc3Bvc2FibGUoKTtcbiAgICB0aGlzLl9zdG9yZSA9IEZpbGVUcmVlU3RvcmUuZ2V0SW5zdGFuY2UoKTtcblxuICAgIHRoaXMuX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTZXQgdG8gQ3VycmVudCBXb3JraW5nIFJvb3QnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2V0LWN1cnJlbnQtd29ya2luZy1yb290JyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLl9zdG9yZS5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmIG5vZGUuaXNSb290ICYmIHRoaXMuX3N0b3JlLmhhc0N3ZCgpICYmICFub2RlLmlzQ3dkO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdOZXcnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpICE9IG51bGw7XG4gICAgICAgIH0sXG4gICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBsYWJlbDogJ0ZpbGUnLFxuICAgICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1maWxlJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRm9sZGVyJyxcbiAgICAgICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTphZGQtZm9sZGVyJyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdLFxuICAgIE5FV19NRU5VX1BSSU9SSVRZKTtcblxuICAgIHRoaXMuX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdBZGQgUHJvamVjdCBGb2xkZXInLFxuICAgICAgICBjb21tYW5kOiAnYXBwbGljYXRpb246YWRkLXByb2plY3QtZm9sZGVyJyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQWRkIFJlbW90ZSBQcm9qZWN0IEZvbGRlcicsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLXJlbW90ZS1wcm9qZWN0czpjb25uZWN0JyxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnUmVtb3ZlIFByb2plY3QgRm9sZGVyJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnJlbW92ZS1wcm9qZWN0LWZvbGRlci1zZWxlY3Rpb24nLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbCAmJiBub2RlLmlzUm9vdDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBBRERfUFJPSkVDVF9NRU5VX1BSSU9SSVRZKTtcblxuICAgIHRoaXMuX3NvdXJjZUNvbnRyb2xNZW51ID0gbmV3IENvbnRleHRNZW51KHtcbiAgICAgIHR5cGU6ICdzdWJtZW51JyxcbiAgICAgIGxhYmVsOiAnU291cmNlIENvbnRyb2wnLFxuICAgICAgcGFyZW50OiB0aGlzLl9jb250ZXh0TWVudSxcbiAgICB9KTtcbiAgICB0aGlzLl9jb250ZXh0TWVudS5hZGRTdWJtZW51KFxuICAgICAgdGhpcy5fc291cmNlQ29udHJvbE1lbnUsXG4gICAgICBTT1VSQ0VfQ09OVFJPTF9NRU5VX1BSSU9SSVRZLFxuICAgICk7XG4gICAgdGhpcy5fY29udGV4dE1lbnUuYWRkSXRlbShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3NlcGFyYXRvcicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6IChlOiBNb3VzZUV2ZW50KSA9PiAhdGhpcy5fc291cmNlQ29udHJvbE1lbnUuaXNFbXB0eSgpLFxuICAgICAgfSxcbiAgICAgIFNPVVJDRV9DT05UUk9MX01FTlVfUFJJT1JJVFkgKyAxLFxuICAgICk7XG5cbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnUmVuYW1lJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnJlbmFtZS1zZWxlY3Rpb24nLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIC8vIEZvciBub3csIHJlbmFtZSBkb2VzIG5vdCBhcHBseSB0byByb290IG5vZGVzLlxuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgIW5vZGUuaXNSb290O1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdEdXBsaWNhdGUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6ZHVwbGljYXRlLXNlbGVjdGlvbicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmICFub2RlLmlzQ29udGFpbmVyO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdEZWxldGUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgICAgICAgLy8gV2UgY2FuIGRlbGV0ZSBtdWx0aXBsZSBub2RlcyBhcyBsb25nIGFzIG5vIHJvb3Qgbm9kZSBpcyBzZWxlY3RlZFxuICAgICAgICAgIHJldHVybiBub2Rlcy5zaXplID4gMCAmJiBub2Rlcy5ldmVyeShub2RlID0+IG5vZGUgIT0gbnVsbCAmJiAhbm9kZS5pc1Jvb3QpO1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICAgIE1PRElGWV9GSUxFX01FTlVfUFJJT1JJVFkpO1xuXG4gICAgdGhpcy5fYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ1NwbGl0JyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgIW5vZGUuaXNDb250YWluZXI7XG4gICAgICAgIH0sXG4gICAgICAgIHN1Ym1lbnU6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnbGFiZWwnOiAnVXAnLFxuICAgICAgICAgICAgJ2NvbW1hbmQnOiAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS11cCcsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnbGFiZWwnOiAnRG93bicsXG4gICAgICAgICAgICAnY29tbWFuZCc6ICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWRvd24nLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgJ2xhYmVsJzogJ0xlZnQnLFxuICAgICAgICAgICAgJ2NvbW1hbmQnOiAnbnVjbGlkZS1maWxlLXRyZWU6b3Blbi1zZWxlY3RlZC1lbnRyeS1sZWZ0JyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICdsYWJlbCc6ICdSaWdodCcsXG4gICAgICAgICAgICAnY29tbWFuZCc6ICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXJpZ2h0JyxcbiAgICAgICAgICB9LFxuICAgICAgICBdLFxuICAgICAgfSxcbiAgICBdLFxuICAgIFNQTElUX01FTlVfUFJJT1JJVFkpO1xuXG4gICAgdGhpcy5fYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0NvcHkgRnVsbCBQYXRoJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOmNvcHktZnVsbC1wYXRoJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGw7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1Nob3cgaW4gRmluZGVyJywgLy8gTWFjIE9TIFhcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnNob3ctaW4tZmlsZS1tYW5hZ2VyJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogdGhpcy5fc2hvdWxkRGlzcGxheVNob3dJbkZpbGVNYW5hZ2VyLmJpbmQodGhpcywgJ2RhcndpbicpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTaG93IGluIEV4cGxvcmVyJywgLy8gV2luZG93c1xuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2hvdy1pbi1maWxlLW1hbmFnZXInLFxuICAgICAgICBzaG91bGREaXNwbGF5OiB0aGlzLl9zaG91bGREaXNwbGF5U2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzLCAnd2luMzInKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU2hvdyBpbiBGaWxlIE1hbmFnZXInLCAvLyBMaW51eFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2hvdy1pbi1maWxlLW1hbmFnZXInLFxuICAgICAgICBzaG91bGREaXNwbGF5OiB0aGlzLl9zaG91bGREaXNwbGF5U2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzLCAnbGludXgnKSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU2VhcmNoIGluIERpcmVjdG9yeScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpzZWFyY2gtaW4tZGlyZWN0b3J5JyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGVzID0gdGhpcy5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGVzLnNpemUgPiAwICYmIG5vZGVzLmV2ZXJ5KG5vZGUgPT4gbm9kZS5pc0NvbnRhaW5lcik7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgU0hPV19JTl9NRU5VX1BSSU9SSVRZKTtcbiAgfVxuXG4gIGFkZEl0ZW1Ub1NvdXJjZUNvbnRyb2xNZW51KGl0ZW06IGF0b20kQ29udGV4dE1lbnVJdGVtLCBwcmlvcml0eTogbnVtYmVyKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9zb3VyY2VDb250cm9sTWVudS5hZGRJdGVtKGl0ZW0sIHByaW9yaXR5KTtcbiAgfVxuXG4gIGdldFNlbGVjdGVkTm9kZXMoKTogSW1tdXRhYmxlLk9yZGVyZWRTZXQ8RmlsZVRyZWVOb2RlPiB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgfVxuXG4gIGdldFNpbmdsZVNlbGVjdGVkTm9kZSgpOiA/RmlsZVRyZWVOb2RlIHtcbiAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMuZGlzcG9zZSgpO1xuICB9XG5cbiAgX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKG1lbnVJdGVtczogQXJyYXk8TWVudUl0ZW1EZWZpbml0aW9uPiwgcHJpb3JpdHk6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIEF0b20gaXMgc21hcnQgYWJvdXQgb25seSBkaXNwbGF5aW5nIGEgc2VwYXJhdG9yIHdoZW4gdGhlcmUgYXJlIGl0ZW1zIHRvXG4gICAgLy8gc2VwYXJhdGUsIHNvIHRoZXJlIHdpbGwgbmV2ZXIgYmUgYSBkYW5nbGluZyBzZXBhcmF0b3IgYXQgdGhlIGVuZC5cbiAgICAvLyAkRmxvd0ZpeE1lOiBUaGUgY29udmVyc2lvbiBiZXR3ZWVuIE1lbnVJdGVtRGVmaW5pdGlvbiBhbmQgYXRvbSRDb250ZXh0TWVudUl0ZW0gaXMgYSBtZXNzLlxuICAgIGNvbnN0IGFsbEl0ZW1zOiBBcnJheTxhdG9tJENvbnRleHRNZW51SXRlbT4gPSBtZW51SXRlbXMuY29uY2F0KFt7dHlwZTogJ3NlcGFyYXRvcid9XSk7XG4gICAgYWxsSXRlbXMuZm9yRWFjaChpdGVtID0+IHtcbiAgICAgIHRoaXMuX2NvbnRleHRNZW51LmFkZEl0ZW0oaXRlbSwgKytwcmlvcml0eSk7XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogQHJldHVybiBBIHtib29sZWFufSB3aGV0aGVyIHRoZSBcIlNob3cgaW4gRmlsZSBNYW5hZ2VyXCIgY29udGV4dCBtZW51IGl0ZW0gc2hvdWxkIGJlIGRpc3BsYXllZFxuICAgKiBmb3IgdGhlIGN1cnJlbnQgc2VsZWN0aW9uIGFuZCB0aGUgZ2l2ZW4gYHBsYXRmb3JtYC5cbiAgICovXG4gIF9zaG91bGREaXNwbGF5U2hvd0luRmlsZU1hbmFnZXIocGxhdGZvcm06IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgIHJldHVybiAoXG4gICAgICBub2RlICE9IG51bGwgJiZcbiAgICAgIHBhdGguaXNBYnNvbHV0ZShub2RlLnVyaSkgJiZcbiAgICAgIHByb2Nlc3MucGxhdGZvcm0gPT09IHBsYXRmb3JtXG4gICAgKTtcbiAgfVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpbGVUcmVlQ29udGV4dE1lbnU7XG4iXX0=