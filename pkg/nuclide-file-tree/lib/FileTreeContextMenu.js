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
var ADD_PROJECT_MENU_PRIORITY = 1000;
var SOURCE_CONTROL_MENU_PRIORITY = 2000;
var MODIFY_FILE_MENU_PRIORITY = 3000;
var SPLIT_MENU_PRIORITY = 4000;
var TEST_SECTION_PRIORITY = 5000;
var SHOW_IN_MENU_PRIORITY = 6000;

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

  /**
   * @param priority must be an integer in the range [0, 1000).
   */

  _createClass(FileTreeContextMenu, [{
    key: 'addItemToTestSection',
    value: function addItemToTestSection(item, priority) {
      if (priority < 0 || priority >= 1000) {
        throw Error('Illegal priority value: ' + priority);
      }
      return this._contextMenu.addItem(item, TEST_SECTION_PRIORITY + priority);
    }
  }, {
    key: 'addItemToSourceControlMenu',
    value: function addItemToSourceControlMenu(item, priority) {
      return this._sourceControlMenu.addItem(item, priority);
    }

    /**
     * This is appropriate to use as the target for a command that is triggered exclusively by an
     * item in the file tree context menu.
     */
  }, {
    key: 'getCSSSelectorForFileTree',
    value: function getCSSSelectorForFileTree() {
      return '.nuclide-file-tree-toolbar-container';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIkZpbGVUcmVlQ29udGV4dE1lbnUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7a0NBY3dCLDRCQUE0Qjs7OztvQkFDbEIsTUFBTTs7aUNBQ0gscUJBQXFCOzs2QkFDOUIsaUJBQWlCOztvQkFFNUIsTUFBTTs7OztBQW9CdkIsSUFBTSxpQkFBaUIsR0FBRyxDQUFDLENBQUM7QUFDNUIsSUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUM7QUFDdkMsSUFBTSw0QkFBNEIsR0FBRyxJQUFJLENBQUM7QUFDMUMsSUFBTSx5QkFBeUIsR0FBRyxJQUFJLENBQUM7QUFDdkMsSUFBTSxtQkFBbUIsR0FBRyxJQUFJLENBQUM7QUFDakMsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7QUFDbkMsSUFBTSxxQkFBcUIsR0FBRyxJQUFJLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7SUEyRTdCLG1CQUFtQjtBQU1aLFdBTlAsbUJBQW1CLEdBTVQ7OzswQkFOVixtQkFBbUI7O0FBT3JCLFFBQUksQ0FBQyxZQUFZLEdBQUcsb0NBQ2xCO0FBQ0UsVUFBSSxFQUFFLE1BQU07QUFDWixpQkFBVywyQ0FBd0I7S0FDcEMsQ0FDRixDQUFDO0FBQ0YsUUFBSSxDQUFDLGNBQWMsR0FBRywrQkFBeUIsQ0FBQztBQUNoRCxRQUFJLENBQUMsTUFBTSxHQUFHLDZCQUFjLFdBQVcsRUFBRSxDQUFDOztBQUUxQyxRQUFJLENBQUMsd0JBQXdCLENBQUMsQ0FDNUI7QUFDRSxXQUFLLEVBQUUsNkJBQTZCO0FBQ3BDLGFBQU8sRUFBRSw0Q0FBNEM7QUFDckQsbUJBQWEsRUFBRSx5QkFBTTtBQUNuQixZQUFNLElBQUksR0FBRyxNQUFLLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO0FBQ2pELGVBQU8sSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLENBQUMsTUFBTSxJQUFJLE1B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dUIsa0NBQUMsU0FBb0MsRUFBRSxRQUFnQixFQUFROzs7Ozs7QUFJckYsVUFBTSxRQUFxQyxHQUFHLFNBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFDLElBQUksRUFBRSxXQUFXLEVBQUMsQ0FBQyxDQUFDLENBQUM7QUFDdEYsY0FBUSxDQUFDLE9BQU8sQ0FBQyxVQUFBLElBQUksRUFBSTtBQUN2QixlQUFLLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsUUFBUSxDQUFDLENBQUM7T0FDN0MsQ0FBQyxDQUFDO0tBQ0o7Ozs7Ozs7O1dBTThCLHlDQUFDLFFBQWdCLEVBQVc7QUFDekQsVUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLHFCQUFxQixFQUFFLENBQUM7QUFDMUMsYUFDRSxJQUFJLElBQUksSUFBSSxJQUNaLGtCQUFLLFVBQVUsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQ3pCLE9BQU8sQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUM3QjtLQUNIOzs7U0F2T0csbUJBQW1COzs7QUEwT3pCLE1BQU0sQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUMiLCJmaWxlIjoiRmlsZVRyZWVDb250ZXh0TWVudS5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2UgYmFiZWwnO1xuLyogQGZsb3cgKi9cblxuLypcbiAqIENvcHlyaWdodCAoYykgMjAxNS1wcmVzZW50LCBGYWNlYm9vaywgSW5jLlxuICogQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBsaWNlbnNlIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgaW5cbiAqIHRoZSByb290IGRpcmVjdG9yeSBvZiB0aGlzIHNvdXJjZSB0cmVlLlxuICovXG5cbmltcG9ydCB0eXBlIHtGaWxlVHJlZU5vZGV9IGZyb20gJy4vRmlsZVRyZWVOb2RlJztcbmltcG9ydCB0eXBlIEltbXV0YWJsZSBmcm9tICdpbW11dGFibGUnO1xuXG5pbXBvcnQgQ29udGV4dE1lbnUgZnJvbSAnLi4vLi4vbnVjbGlkZS1jb250ZXh0LW1lbnUnO1xuaW1wb3J0IHtDb21wb3NpdGVEaXNwb3NhYmxlfSBmcm9tICdhdG9tJztcbmltcG9ydCB7RVZFTlRfSEFORExFUl9TRUxFQ1RPUn0gZnJvbSAnLi9GaWxlVHJlZUNvbnN0YW50cyc7XG5pbXBvcnQge0ZpbGVUcmVlU3RvcmV9IGZyb20gJy4vRmlsZVRyZWVTdG9yZSc7XG5cbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xuXG50eXBlIE1lbnVJdGVtU2luZ2xlID0ge1xuICBsYWJlbDogc3RyaW5nO1xuICBjb21tYW5kOiBzdHJpbmc7XG4gIHNob3VsZERpc3BsYXk/OiAoZXZlbnQ6IE1vdXNlRXZlbnQpID0+IGJvb2xlYW47XG59O1xuXG50eXBlIE1lbnVJdGVtR3JvdXAgPSB7XG4gIGxhYmVsOiBzdHJpbmc7XG4gIHN1Ym1lbnU6IEFycmF5PGF0b20kQ29udGV4dE1lbnVJdGVtPjtcbiAgc2hvdWxkRGlzcGxheT86IChldmVudDogTW91c2VFdmVudCkgPT4gYm9vbGVhbjtcbn07XG5cbnR5cGUgTWVudUl0ZW1TZXBhcmF0b3IgPSB7XG4gIHR5cGU6IHN0cmluZztcbn07XG5cbnR5cGUgTWVudUl0ZW1EZWZpbml0aW9uID0gTWVudUl0ZW1TaW5nbGUgfCBNZW51SXRlbUdyb3VwIHwgTWVudUl0ZW1TZXBhcmF0b3I7XG5cbmNvbnN0IE5FV19NRU5VX1BSSU9SSVRZID0gMDtcbmNvbnN0IEFERF9QUk9KRUNUX01FTlVfUFJJT1JJVFkgPSAxMDAwO1xuY29uc3QgU09VUkNFX0NPTlRST0xfTUVOVV9QUklPUklUWSA9IDIwMDA7XG5jb25zdCBNT0RJRllfRklMRV9NRU5VX1BSSU9SSVRZID0gMzAwMDtcbmNvbnN0IFNQTElUX01FTlVfUFJJT1JJVFkgPSA0MDAwO1xuY29uc3QgVEVTVF9TRUNUSU9OX1BSSU9SSVRZID0gNTAwMDtcbmNvbnN0IFNIT1dfSU5fTUVOVV9QUklPUklUWSA9IDYwMDA7XG5cbi8qKlxuICogVGhpcyBjb250ZXh0IG1lbnUgd3JhcHBlciBleGlzdHMgdG8gYWRkcmVzcyBzb21lIG9mIHRoZSBsaW1pdGF0aW9ucyBpbiB0aGUgQ29udGV4dE1lbnVNYW5hZ2VyOlxuICogaHR0cHM6Ly9hdG9tLmlvL2RvY3MvYXBpL2xhdGVzdC9Db250ZXh0TWVudU1hbmFnZXIuXG4gKlxuICogU3BlY2lmaWNhbGx5LCBhIGNvbnRleHQgbWVudSBpdGVtIHdvdWxkIG9mdGVuIGxpa2UgdG8ga25vdyB3aGljaCBmaWxlIChvciBkaXJlY3RvcnkpIHRoZSB1c2VyXG4gKiByaWdodC1jbGlja2VkIG9uIGluIHRoZSBmaWxlIHRyZWUgd2hlbiBzZWxlY3RpbmcgdGhlIG1lbnUgaXRlbS4gVGhlIGZ1bmRhbWVudGFsIHByb2JsZW0gaXMgdGhhdFxuICogdGhlIHdheSBhIG1lbnUgaXRlbSBpcyBub3RpZmllZCB0aGF0IGl0IHdhcyBzZWxlY3RlZCBpcyB0aGF0IHRoZSBBdG9tIGNvbW1hbmQgYXNzb2NpYXRlZCB3aXRoXG4gKiB0aGUgaXRlbSBpcyBmaXJlZC4gQnkgdGhlIHRpbWUgdGhlIGZ1bmN0aW9uIGFzc29jaWF0ZWQgd2l0aCB0aGUgY29tbWFuZCBpcyBjYWxsZWQsIHRoZSBzdGF0ZVxuICogd2l0aCB3aGljaCB0aGUgbWVudSBpdGVtIHdhcyBjcmVhdGVkIGlzIGxvc3QuIEhlcmUgd2UgaW50cm9kdWNlIGEgcGF0dGVybiB3aGVyZSB0aGUgY2FsbGJhY2tcbiAqIHJlZ2lzdGVyZWQgd2l0aCB0aGUgY29tbWFuZCBjYW4gZ2V0IHRoZSBzZWxlY3Rpb24gdmlhIHRoZSBGaWxlVHJlZUNvbnRleHRNZW51OlxuICogYGBgXG4gKiAvLyBTdWJzY3JpYmUgdG8gdGhlIG51Y2xpZGUtZmlsZS10cmVlLmNvbnRleHQtbWVudSBzZXJ2aWNlIGJ5IGVuc3VyaW5nIHRoZSBwYWNrYWdlLmpzb24gZm9yIHlvdXJcbiAqIC8vIEF0b20gcGFja2FnZSBjb250YWlucyB0aGUgZm9sbG93aW5nIHN0YW56YTpcbiAqIFwiY29uc3VtZWRTZXJ2aWNlc1wiOiB7XG4gKiAgIFwibnVjbGlkZS1maWxlLXRyZWUuY29udGV4dC1tZW51XCI6IHtcbiAqICAgICBcInZlcnNpb25zXCI6IHtcbiAqICAgICAgIFwiMC4xLjBcIjogXCJhZGRJdGVtc1RvRmlsZVRyZWVDb250ZXh0TWVudVwiXG4gKiAgICAgfVxuICogICB9XG4gKiB9LFxuICpcbiAqIC8vIEluY2x1ZGUgdGhlIGZvbGxvd2luZyBpbiB0aGUgbWFpbi5qcyBmaWxlIGZvciB5b3VyIHBhY2thZ2U6XG4gKiBpbXBvcnQge0NvbXBvc2l0ZURpc3Bvc2FibGV9IGZyb20gJ2F0b20nO1xuICogaW1wb3J0IGludmFyaWFudCBmcm9tICdhc3NlcnQnO1xuICpcbiAqIGxldCBzdWJzY3JpcHRpb25zOiA/Q29tcG9zaXRlRGlzcG9zYWJsZSA9IG51bGw7XG4gKlxuICogZXhwb3J0IGZ1bmN0aW9uIGFjdGl2YXRlKHN0YXRlOiA/T2JqZWN0KTogdm9pZCB7XG4gKiAgIHN1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICogfVxuICpcbiAqIGV4cG9ydCBmdW5jdGlvbiBkZWFjdGl2YXRlKCk6IHZvaWQge1xuICogICBpZiAoc3Vic2NyaXB0aW9ucyAhPSBudWxsKSB7XG4gKiAgICAgc3Vic2NyaXB0aW9ucy5kaXNwb3NlKCk7XG4gKiAgICAgc3Vic2NyaXB0aW9ucyA9IG51bGw7XG4gKiAgIH1cbiAqIH1cbiAqXG4gKiBleHBvcnQgZnVuY3Rpb24gYWRkSXRlbXNUb0ZpbGVUcmVlQ29udGV4dE1lbnUoY29udGV4dE1lbnU6IEZpbGVUcmVlQ29udGV4dE1lbnUpOiB2b2lkIHtcbiAqICAgaW52YXJpYW50KHN1YnNjcmlwdGlvbnMpO1xuICpcbiAqICAgc3Vic2NyaXB0aW9ucy5hZGQoXG4gKiAgICAgYXRvbS5jb21tYW5kcy5hZGQoXG4gKiAgICAgICAnYXRvbS13b3Jrc3BhY2UnLFxuICogICAgICAgJ2NvbW1hbmQtdGhhdC1zaG91bGQtb25seS1iZS1maXJlZC1mcm9tLXRoZS1jb250ZXh0LW1lbnUnLFxuICogICAgICAgKCkgPT4ge1xuICogICAgICAgICBBcnJheS5mcm9tKGNvbnRleHRNZW51LmdldFNlbGVjdGVkTm9kZXMoKSlcbiAqICAgICAgICAgICAuZmlsdGVyKG5vZGUgPT4gIW5vZGUuaXNDb250YWluZXIpXG4gKiAgICAgICAgICAgLmZvckVhY2goKG5vZGU6IEZpbGVUcmVlTm9kZSkgPT4ge1xuICogICAgICAgICAgICAgY29uc3QgdXJpID0gbm9kZS51cmk7XG4gKiAgICAgICAgICAgICAvLyBETyBXSEFUIFlPVSBMSUtFIFdJVEggVEhFIFVSSSFcbiAqICAgICAgICAgICB9KTtcbiAqICAgICAgIH0sXG4gKiAgICAgKVxuICogICApO1xuICogICBzdWJzY3JpcHRpb25zLmFkZChjb250ZXh0TWVudS5hZGRJdGVtVG9Tb3VyY2VDb250cm9sTWVudShcbiAqICAgICB7XG4gKiAgICAgICBsYWJlbDogJ0xhYmVsIGZvciB0aGUgbWVudSBpdGVtIHRoYXQgYWN0cyBvbiBhIGZpbGUnLFxuICogICAgICAgY29tbWFuZDogJ2NvbW1hbmQtdGhhdC1zaG91bGQtb25seS1iZS1maXJlZC1mcm9tLXRoZS1jb250ZXh0LW1lbnUnLFxuICogICAgICAgc2hvdWxkRGlzcGxheSgpIHtcbiAqICAgICAgICAgcmV0dXJuIEFycmF5LmZyb20oY29udGV4dE1lbnUuZ2V0U2VsZWN0ZWROb2RlcygpKS5zb21lKG5vZGUgPT4gIW5vZGUuaXNDb250YWluZXIpO1xuICogICAgICAgfSxcbiAqICAgICB9LFxuICogICAgIDEwMDAsIC8vIHByaW9yaXR5XG4gKiAgICkpO1xuICogfVxuICogYGBgXG4gKlxuICogTm90ZSB0aGF0IGl0IGlzIGEgbGl0dGxlIG9kZCB0byByZWdpc3RlciBhIGNvbW1hbmQgdGhhdCBvbmx5IG1ha2VzIHNlbnNlIGluIHRoZSBjb250ZXh0IG9mIHdoYXRcbiAqIGlzIGN1cnJlbnRseSBzZWxlY3RlZCBpbiB0aGUgZmlsZSB0cmVlLiBJZGVhbGx5LCB0aGVyZSB3b3VsZCBiZSBhIHdheSB0byBtYWtlIHRoaXMgYSBcInByaXZhdGVcIlxuICogY29tbWFuZCB0aGF0IGNvdWxkIG5vdCBiZSBzZWxlY3RlZCBmcm9tIHRoZSBjb21tYW5kIHBhbGV0dGUuIChPciByZWFsbHksIGp1c3QgYXNzb2NpYXRlIGFcbiAqIGNhbGxiYWNrIGZ1bmN0aW9uIHdpdGggYSBtZW51IGl0ZW0gaW5zdGVhZCBvZiBhIGNvbW1hbmQuKVxuICovXG5jbGFzcyBGaWxlVHJlZUNvbnRleHRNZW51IHtcbiAgX2NvbnRleHRNZW51OiBDb250ZXh0TWVudTtcbiAgX3NvdXJjZUNvbnRyb2xNZW51OiBDb250ZXh0TWVudTtcbiAgX3N0b3JlOiBGaWxlVHJlZVN0b3JlO1xuICBfc3Vic2NyaXB0aW9uczogQ29tcG9zaXRlRGlzcG9zYWJsZTtcblxuICBjb25zdHJ1Y3RvcigpIHtcbiAgICB0aGlzLl9jb250ZXh0TWVudSA9IG5ldyBDb250ZXh0TWVudShcbiAgICAgIHtcbiAgICAgICAgdHlwZTogJ3Jvb3QnLFxuICAgICAgICBjc3NTZWxlY3RvcjogRVZFTlRfSEFORExFUl9TRUxFQ1RPUixcbiAgICAgIH1cbiAgICApO1xuICAgIHRoaXMuX3N1YnNjcmlwdGlvbnMgPSBuZXcgQ29tcG9zaXRlRGlzcG9zYWJsZSgpO1xuICAgIHRoaXMuX3N0b3JlID0gRmlsZVRyZWVTdG9yZS5nZXRJbnN0YW5jZSgpO1xuXG4gICAgdGhpcy5fYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ1NldCB0byBDdXJyZW50IFdvcmtpbmcgUm9vdCcsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpzZXQtY3VycmVudC13b3JraW5nLXJvb3QnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgbm9kZS5pc1Jvb3QgJiYgdGhpcy5fc3RvcmUuaGFzQ3dkKCkgJiYgIW5vZGUuaXNDd2Q7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ05ldycsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICByZXR1cm4gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCkgIT0gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgIGxhYmVsOiAnRmlsZScsXG4gICAgICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6YWRkLWZpbGUnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgbGFiZWw6ICdGb2xkZXInLFxuICAgICAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOmFkZC1mb2xkZXInLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgTkVXX01FTlVfUFJJT1JJVFkpO1xuXG4gICAgdGhpcy5fYWRkQ29udGV4dE1lbnVJdGVtR3JvdXAoW1xuICAgICAge1xuICAgICAgICBsYWJlbDogJ0FkZCBQcm9qZWN0IEZvbGRlcicsXG4gICAgICAgIGNvbW1hbmQ6ICdhcHBsaWNhdGlvbjphZGQtcHJvamVjdC1mb2xkZXInLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdBZGQgUmVtb3RlIFByb2plY3QgRm9sZGVyJyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtcmVtb3RlLXByb2plY3RzOmNvbm5lY3QnLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdSZW1vdmUgUHJvamVjdCBGb2xkZXInLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6cmVtb3ZlLXByb2plY3QtZm9sZGVyLXNlbGVjdGlvbicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZSAhPSBudWxsICYmIG5vZGUuaXNSb290O1xuICAgICAgICB9LFxuICAgICAgfSxcbiAgICBdLFxuICAgIEFERF9QUk9KRUNUX01FTlVfUFJJT1JJVFkpO1xuXG4gICAgdGhpcy5fc291cmNlQ29udHJvbE1lbnUgPSBuZXcgQ29udGV4dE1lbnUoe1xuICAgICAgdHlwZTogJ3N1Ym1lbnUnLFxuICAgICAgbGFiZWw6ICdTb3VyY2UgQ29udHJvbCcsXG4gICAgICBwYXJlbnQ6IHRoaXMuX2NvbnRleHRNZW51LFxuICAgIH0pO1xuICAgIHRoaXMuX2NvbnRleHRNZW51LmFkZFN1Ym1lbnUoXG4gICAgICB0aGlzLl9zb3VyY2VDb250cm9sTWVudSxcbiAgICAgIFNPVVJDRV9DT05UUk9MX01FTlVfUFJJT1JJVFksXG4gICAgKTtcbiAgICB0aGlzLl9jb250ZXh0TWVudS5hZGRJdGVtKFxuICAgICAge1xuICAgICAgICB0eXBlOiAnc2VwYXJhdG9yJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKGU6IE1vdXNlRXZlbnQpID0+ICF0aGlzLl9zb3VyY2VDb250cm9sTWVudS5pc0VtcHR5KCksXG4gICAgICB9LFxuICAgICAgU09VUkNFX0NPTlRST0xfTUVOVV9QUklPUklUWSArIDEsXG4gICAgKTtcblxuICAgIHRoaXMuX2FkZENvbnRleHRNZW51SXRlbUdyb3VwKFtcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdSZW5hbWUnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6cmVuYW1lLXNlbGVjdGlvbicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6ICgpID0+IHtcbiAgICAgICAgICBjb25zdCBub2RlID0gdGhpcy5fc3RvcmUuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgLy8gRm9yIG5vdywgcmVuYW1lIGRvZXMgbm90IGFwcGx5IHRvIHJvb3Qgbm9kZXMuXG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbCAmJiAhbm9kZS5pc1Jvb3Q7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0R1cGxpY2F0ZScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpkdXBsaWNhdGUtc2VsZWN0aW9uJyxcbiAgICAgICAgc2hvdWxkRGlzcGxheTogKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IG5vZGUgPSB0aGlzLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICAgICAgICAgIHJldHVybiBub2RlICE9IG51bGwgJiYgIW5vZGUuaXNDb250YWluZXI7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ0RlbGV0ZScsXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpyZW1vdmUnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICAgICAgICAvLyBXZSBjYW4gZGVsZXRlIG11bHRpcGxlIG5vZGVzIGFzIGxvbmcgYXMgbm8gcm9vdCBub2RlIGlzIHNlbGVjdGVkXG4gICAgICAgICAgcmV0dXJuIG5vZGVzLnNpemUgPiAwICYmIG5vZGVzLmV2ZXJ5KG5vZGUgPT4gbm9kZSAhPSBudWxsICYmICFub2RlLmlzUm9vdCk7XG4gICAgICAgIH0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgTU9ESUZZX0ZJTEVfTUVOVV9QUklPUklUWSk7XG5cbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU3BsaXQnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbCAmJiAhbm9kZS5pc0NvbnRhaW5lcjtcbiAgICAgICAgfSxcbiAgICAgICAgc3VibWVudTogW1xuICAgICAgICAgIHtcbiAgICAgICAgICAgICdsYWJlbCc6ICdVcCcsXG4gICAgICAgICAgICAnY29tbWFuZCc6ICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LXVwJyxcbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgICdsYWJlbCc6ICdEb3duJyxcbiAgICAgICAgICAgICdjb21tYW5kJzogJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktZG93bicsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICAnbGFiZWwnOiAnTGVmdCcsXG4gICAgICAgICAgICAnY29tbWFuZCc6ICdudWNsaWRlLWZpbGUtdHJlZTpvcGVuLXNlbGVjdGVkLWVudHJ5LWxlZnQnLFxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgJ2xhYmVsJzogJ1JpZ2h0JyxcbiAgICAgICAgICAgICdjb21tYW5kJzogJ251Y2xpZGUtZmlsZS10cmVlOm9wZW4tc2VsZWN0ZWQtZW50cnktcmlnaHQnLFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIF0sXG4gICAgU1BMSVRfTUVOVV9QUklPUklUWSk7XG5cbiAgICB0aGlzLl9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChbXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnQ29weSBGdWxsIFBhdGgnLFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6Y29weS1mdWxsLXBhdGgnLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZSA9IHRoaXMuZ2V0U2luZ2xlU2VsZWN0ZWROb2RlKCk7XG4gICAgICAgICAgcmV0dXJuIG5vZGUgIT0gbnVsbDtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgIGxhYmVsOiAnU2hvdyBpbiBGaW5kZXInLCAvLyBNYWMgT1MgWFxuICAgICAgICBjb21tYW5kOiAnbnVjbGlkZS1maWxlLXRyZWU6c2hvdy1pbi1maWxlLW1hbmFnZXInLFxuICAgICAgICBzaG91bGREaXNwbGF5OiB0aGlzLl9zaG91bGREaXNwbGF5U2hvd0luRmlsZU1hbmFnZXIuYmluZCh0aGlzLCAnZGFyd2luJyksXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICBsYWJlbDogJ1Nob3cgaW4gRXhwbG9yZXInLCAvLyBXaW5kb3dzXG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6IHRoaXMuX3Nob3VsZERpc3BsYXlTaG93SW5GaWxlTWFuYWdlci5iaW5kKHRoaXMsICd3aW4zMicpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTaG93IGluIEZpbGUgTWFuYWdlcicsIC8vIExpbnV4XG4gICAgICAgIGNvbW1hbmQ6ICdudWNsaWRlLWZpbGUtdHJlZTpzaG93LWluLWZpbGUtbWFuYWdlcicsXG4gICAgICAgIHNob3VsZERpc3BsYXk6IHRoaXMuX3Nob3VsZERpc3BsYXlTaG93SW5GaWxlTWFuYWdlci5iaW5kKHRoaXMsICdsaW51eCcpLFxuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgbGFiZWw6ICdTZWFyY2ggaW4gRGlyZWN0b3J5JyxcbiAgICAgICAgY29tbWFuZDogJ251Y2xpZGUtZmlsZS10cmVlOnNlYXJjaC1pbi1kaXJlY3RvcnknLFxuICAgICAgICBzaG91bGREaXNwbGF5OiAoKSA9PiB7XG4gICAgICAgICAgY29uc3Qgbm9kZXMgPSB0aGlzLmdldFNlbGVjdGVkTm9kZXMoKTtcbiAgICAgICAgICByZXR1cm4gbm9kZXMuc2l6ZSA+IDAgJiYgbm9kZXMuZXZlcnkobm9kZSA9PiBub2RlLmlzQ29udGFpbmVyKTtcbiAgICAgICAgfSxcbiAgICAgIH0sXG4gICAgXSxcbiAgICBTSE9XX0lOX01FTlVfUFJJT1JJVFkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEBwYXJhbSBwcmlvcml0eSBtdXN0IGJlIGFuIGludGVnZXIgaW4gdGhlIHJhbmdlIFswLCAxMDAwKS5cbiAgICovXG4gIGFkZEl0ZW1Ub1Rlc3RTZWN0aW9uKGl0ZW06IGF0b20kQ29udGV4dE1lbnVJdGVtLCBwcmlvcml0eTogbnVtYmVyKTogSURpc3Bvc2FibGUge1xuICAgIGlmIChwcmlvcml0eSA8IDAgfHwgcHJpb3JpdHkgPj0gMTAwMCkge1xuICAgICAgdGhyb3cgRXJyb3IoYElsbGVnYWwgcHJpb3JpdHkgdmFsdWU6ICR7cHJpb3JpdHl9YCk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9jb250ZXh0TWVudS5hZGRJdGVtKGl0ZW0sIFRFU1RfU0VDVElPTl9QUklPUklUWSArIHByaW9yaXR5KTtcbiAgfVxuXG4gIGFkZEl0ZW1Ub1NvdXJjZUNvbnRyb2xNZW51KGl0ZW06IGF0b20kQ29udGV4dE1lbnVJdGVtLCBwcmlvcml0eTogbnVtYmVyKTogSURpc3Bvc2FibGUge1xuICAgIHJldHVybiB0aGlzLl9zb3VyY2VDb250cm9sTWVudS5hZGRJdGVtKGl0ZW0sIHByaW9yaXR5KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBUaGlzIGlzIGFwcHJvcHJpYXRlIHRvIHVzZSBhcyB0aGUgdGFyZ2V0IGZvciBhIGNvbW1hbmQgdGhhdCBpcyB0cmlnZ2VyZWQgZXhjbHVzaXZlbHkgYnkgYW5cbiAgICogaXRlbSBpbiB0aGUgZmlsZSB0cmVlIGNvbnRleHQgbWVudS5cbiAgICovXG4gIGdldENTU1NlbGVjdG9yRm9yRmlsZVRyZWUoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gJy5udWNsaWRlLWZpbGUtdHJlZS10b29sYmFyLWNvbnRhaW5lcic7XG4gIH1cblxuICBnZXRTZWxlY3RlZE5vZGVzKCk6IEltbXV0YWJsZS5PcmRlcmVkU2V0PEZpbGVUcmVlTm9kZT4ge1xuICAgIHJldHVybiB0aGlzLl9zdG9yZS5nZXRTZWxlY3RlZE5vZGVzKCk7XG4gIH1cblxuICBnZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTogP0ZpbGVUcmVlTm9kZSB7XG4gICAgcmV0dXJuIHRoaXMuX3N0b3JlLmdldFNpbmdsZVNlbGVjdGVkTm9kZSgpO1xuICB9XG5cbiAgZGlzcG9zZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9zdWJzY3JpcHRpb25zLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIF9hZGRDb250ZXh0TWVudUl0ZW1Hcm91cChtZW51SXRlbXM6IEFycmF5PE1lbnVJdGVtRGVmaW5pdGlvbj4sIHByaW9yaXR5OiBudW1iZXIpOiB2b2lkIHtcbiAgICAvLyBBdG9tIGlzIHNtYXJ0IGFib3V0IG9ubHkgZGlzcGxheWluZyBhIHNlcGFyYXRvciB3aGVuIHRoZXJlIGFyZSBpdGVtcyB0b1xuICAgIC8vIHNlcGFyYXRlLCBzbyB0aGVyZSB3aWxsIG5ldmVyIGJlIGEgZGFuZ2xpbmcgc2VwYXJhdG9yIGF0IHRoZSBlbmQuXG4gICAgLy8gJEZsb3dGaXhNZTogVGhlIGNvbnZlcnNpb24gYmV0d2VlbiBNZW51SXRlbURlZmluaXRpb24gYW5kIGF0b20kQ29udGV4dE1lbnVJdGVtIGlzIGEgbWVzcy5cbiAgICBjb25zdCBhbGxJdGVtczogQXJyYXk8YXRvbSRDb250ZXh0TWVudUl0ZW0+ID0gbWVudUl0ZW1zLmNvbmNhdChbe3R5cGU6ICdzZXBhcmF0b3InfV0pO1xuICAgIGFsbEl0ZW1zLmZvckVhY2goaXRlbSA9PiB7XG4gICAgICB0aGlzLl9jb250ZXh0TWVudS5hZGRJdGVtKGl0ZW0sICsrcHJpb3JpdHkpO1xuICAgIH0pO1xuICB9XG5cbiAgLyoqXG4gICAqIEByZXR1cm4gQSB7Ym9vbGVhbn0gd2hldGhlciB0aGUgXCJTaG93IGluIEZpbGUgTWFuYWdlclwiIGNvbnRleHQgbWVudSBpdGVtIHNob3VsZCBiZSBkaXNwbGF5ZWRcbiAgICogZm9yIHRoZSBjdXJyZW50IHNlbGVjdGlvbiBhbmQgdGhlIGdpdmVuIGBwbGF0Zm9ybWAuXG4gICAqL1xuICBfc2hvdWxkRGlzcGxheVNob3dJbkZpbGVNYW5hZ2VyKHBsYXRmb3JtOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBjb25zdCBub2RlID0gdGhpcy5nZXRTaW5nbGVTZWxlY3RlZE5vZGUoKTtcbiAgICByZXR1cm4gKFxuICAgICAgbm9kZSAhPSBudWxsICYmXG4gICAgICBwYXRoLmlzQWJzb2x1dGUobm9kZS51cmkpICYmXG4gICAgICBwcm9jZXNzLnBsYXRmb3JtID09PSBwbGF0Zm9ybVxuICAgICk7XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBGaWxlVHJlZUNvbnRleHRNZW51O1xuIl19