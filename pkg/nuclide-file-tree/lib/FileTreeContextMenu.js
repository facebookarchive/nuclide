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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nuclideContextMenu2;

function _nuclideContextMenu() {
  return _nuclideContextMenu2 = _interopRequireDefault(require('../../nuclide-context-menu'));
}

var _atom2;

function _atom() {
  return _atom2 = require('atom');
}

var _FileTreeConstants2;

function _FileTreeConstants() {
  return _FileTreeConstants2 = require('./FileTreeConstants');
}

var _FileTreeStore2;

function _FileTreeStore() {
  return _FileTreeStore2 = require('./FileTreeStore');
}

var _nuclideRemoteUri2;

function _nuclideRemoteUri() {
  return _nuclideRemoteUri2 = _interopRequireDefault(require('../../nuclide-remote-uri'));
}

// It's just atom$ContextMenuItem with an optional `callback` property added.
// I wish flow would let add it in a more elegant way.

var FILE_TREE_CSS = '.nuclide-file-tree';

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
 * import {CompositeDisposable, Disposable} from 'atom';
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
 * export function addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
 *   invariant(subscriptions);
 *
 *   const contextDisposable = contextMenu.addItemToSourceControlMenu(
 *     {
 *       label: 'Label for the menu item that acts on a file',
 *       command: 'command-that-should-only-be-fired-from-the-context-menu',
 *       // If the callback below is given a new atom command with the given name will be
 *       // automatically registered. You can omit it if you prefer to register the command
 *       // manually.
 *       callback() {
 *         Array.from(contextMenu.getSelectedNodes())
 *           .filter(node => !node.isContainer)
 *           .forEach((node: FileTreeNode) => {
 *             const uri = node.uri;
 *             // DO WHAT YOU LIKE WITH THE URI!
 *           });
 *       },
 *       shouldDisplay() {
 *         return Array.from(contextMenu.getSelectedNodes()).some(node => !node.isContainer);
 *       },
 *     },
 *     1000, // priority
 *   );
 *
 *   subscriptions.add(contextDisposable);
 *   return new Disposable(() => {
 *     invariant(subscriptions);
 *     if (subscriptions != null) {
 *       subscriptions.remove(contextDisposable);
 *     }
 *   });
 * }
 * ```
 */

var FileTreeContextMenu = (function () {
  function FileTreeContextMenu() {
    var _this = this;

    _classCallCheck(this, FileTreeContextMenu);

    this._contextMenu = new (_nuclideContextMenu2 || _nuclideContextMenu()).default({
      type: 'root',
      cssSelector: (_FileTreeConstants2 || _FileTreeConstants()).EVENT_HANDLER_SELECTOR
    });
    this._subscriptions = new (_atom2 || _atom()).CompositeDisposable();
    this._store = (_FileTreeStore2 || _FileTreeStore()).FileTreeStore.getInstance();

    var shouldDisplaySetToCurrentWorkingRootOption = function shouldDisplaySetToCurrentWorkingRootOption() {
      var node = _this._store.getSingleSelectedNode();
      return node != null && node.isRoot && _this._store.hasCwd() && !node.isCwd;
    };

    this._addContextMenuItemGroup([{
      label: 'Set to Current Working Root',
      command: 'nuclide-file-tree:set-current-working-root',
      shouldDisplay: shouldDisplaySetToCurrentWorkingRootOption
    }, {
      type: 'separator',
      shouldDisplay: shouldDisplaySetToCurrentWorkingRootOption
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

    this._sourceControlMenu = new (_nuclideContextMenu2 || _nuclideContextMenu()).default({
      type: 'submenu',
      label: 'Source Control',
      parent: this._contextMenu,
      shouldDisplay: function shouldDisplay(e) {
        return !_this._sourceControlMenu.isEmpty() && !_this._store.getSelectedNodes().isEmpty();
      }
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
        label: 'Up',
        command: 'nuclide-file-tree:open-selected-entry-up'
      }, {
        label: 'Down',
        command: 'nuclide-file-tree:open-selected-entry-down'
      }, {
        label: 'Left',
        command: 'nuclide-file-tree:open-selected-entry-left'
      }, {
        label: 'Right',
        command: 'nuclide-file-tree:open-selected-entry-right'
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
    value: function addItemToTestSection(originalItem, priority) {
      if (priority < 0 || priority >= 1000) {
        throw Error('Illegal priority value: ' + priority);
      }

      return this._addItemToMenu(originalItem, this._contextMenu, TEST_SECTION_PRIORITY + priority);
    }
  }, {
    key: 'addItemToSourceControlMenu',
    value: function addItemToSourceControlMenu(originalItem, priority) {
      return this._addItemToMenu(originalItem, this._sourceControlMenu, priority);
    }
  }, {
    key: '_addItemToMenu',
    value: function _addItemToMenu(originalItem, menu, priority) {
      var _this2 = this;

      var _initCommandIfPresent = initCommandIfPresent(originalItem);

      var itemDisposable = _initCommandIfPresent.itemDisposable;
      var item = _initCommandIfPresent.item;

      itemDisposable.add(menu.addItem(item, priority));

      this._subscriptions.add(itemDisposable);
      return new (_atom2 || _atom()).Disposable(function () {
        _this2._subscriptions.remove(itemDisposable);
        itemDisposable.dispose();
      });
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
      var _this3 = this;

      // Atom is smart about only displaying a separator when there are items to
      // separate, so there will never be a dangling separator at the end.

      var allItems = menuItems.concat([{ type: 'separator' }]);
      allItems.forEach(function (item) {
        _this3._contextMenu.addItem(item, ++priority);
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
      return node != null && (_nuclideRemoteUri2 || _nuclideRemoteUri()).default.isAbsolute(node.uri) && process.platform === platform;
    }
  }]);

  return FileTreeContextMenu;
})();

function initCommandIfPresent(item) {
  var itemDisposable = new (_atom2 || _atom()).CompositeDisposable();
  if (item.callback != null && item.label != null) {
    var _command = item.command || generateNextInternalCommand(item.label);
    itemDisposable.add(atom.commands.add(FILE_TREE_CSS, _command, item.callback));
    return { itemDisposable: itemDisposable, item: _extends({}, item, { command: _command }) };
  }

  return { itemDisposable: itemDisposable, item: item };
}

var nextInternalCommandId = 0;

function generateNextInternalCommand(itemLabel) {
  var cmdName = itemLabel.toLowerCase().replace(/[^\w]+/g, '-') + '-' + nextInternalCommandId++;
  return 'nuclide-file-tree:' + cmdName;
}

module.exports = FileTreeContextMenu;
// $FlowFixMe: The conversion between MenuItemDefinition and atom$ContextMenuItem is a mess.