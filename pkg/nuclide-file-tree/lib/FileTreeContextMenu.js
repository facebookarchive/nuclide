'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ContextMenu;

function _load_ContextMenu() {
  return _ContextMenu = _interopRequireDefault(require('nuclide-commons-atom/ContextMenu'));
}

var _getElementFilePath;

function _load_getElementFilePath() {
  return _getElementFilePath = _interopRequireDefault(require('../../commons-atom/getElementFilePath'));
}

var _UniversalDisposable;

function _load_UniversalDisposable() {
  return _UniversalDisposable = _interopRequireDefault(require('nuclide-commons/UniversalDisposable'));
}

var _FileTreeConstants;

function _load_FileTreeConstants() {
  return _FileTreeConstants = require('./FileTreeConstants');
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('./FileTreeStore');
}

var _nuclideUri;

function _load_nuclideUri() {
  return _nuclideUri = _interopRequireDefault(require('nuclide-commons/nuclideUri'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// It's just atom$ContextMenuItem with an optional `callback` property added.
// I wish flow would let add it in a more elegant way.
/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * 
 * @format
 */

const FILE_TREE_CSS = '.nuclide-file-tree';
// flowlint-next-line untyped-type-import:off


const PRIORITY_GROUP_SIZE = 1000;
const PRIORITY_GROUP_SEPARATOR_OFFSET = PRIORITY_GROUP_SIZE - 1;

const WORKING_ROOT_PRIORITY = 0;
const NEW_MENU_PRIORITY = 1000;
const ADD_PROJECT_MENU_PRIORITY = 2000;
const SOURCE_CONTROL_MENU_PRIORITY = 3000;
const MODIFY_FILE_MENU_PRIORITY = 4000;
const SPLIT_MENU_PRIORITY = 5000;
const TEST_SECTION_PRIORITY = 6000;
const SHOW_IN_MENU_PRIORITY = 7000;

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
 * let disposables: ?CompositeDisposable = null;
 *
 * export function activate(state: ?Object): void {
 *   disposables = new CompositeDisposable();
 * }
 *
 * export function deactivate(): void {
 *   if (disposables != null) {
 *     disposables.dispose();
 *     disposables = null;
 *   }
 * }
 *
 * export function addItemsToFileTreeContextMenu(contextMenu: FileTreeContextMenu): IDisposable {
 *   invariant(disposables);
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
 *   disposables.add(contextDisposable);
 *   return new Disposable(() => {
 *     invariant(disposables);
 *     if (disposables != null) {
 *       disposables.remove(contextDisposable);
 *     }
 *   });
 * }
 * ```
 */
class FileTreeContextMenu {

  constructor() {
    this._contextMenu = new (_ContextMenu || _load_ContextMenu()).default({
      type: 'root',
      cssSelector: (_FileTreeConstants || _load_FileTreeConstants()).EVENT_HANDLER_SELECTOR
    });
    this._disposables = new (_UniversalDisposable || _load_UniversalDisposable()).default();
    this._store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();
    this._disposables.add(this._contextMenu);

    const shouldDisplaySetToCurrentWorkingRootOption = () => {
      const node = this._store.getSingleSelectedNode();
      return node != null && node.isContainer && this._store.hasCwd() && !node.isCwd;
    };

    this._addContextMenuItemGroup([{
      label: 'Set to Current Working Root',
      command: 'nuclide-file-tree:set-current-working-root',
      shouldDisplay: shouldDisplaySetToCurrentWorkingRootOption
    }], WORKING_ROOT_PRIORITY);

    this._newMenu = new (_ContextMenu || _load_ContextMenu()).default({
      type: 'submenu',
      label: 'New',
      parent: this._contextMenu,
      shouldDisplay: e => {
        return this._store.getSingleSelectedNode() != null;
      }
    });
    this._newMenu.addItem({ label: 'File', command: 'nuclide-file-tree:add-file' }, 0);
    this._newMenu.addItem({ label: 'Folder', command: 'nuclide-file-tree:add-folder' }, 1);
    this._contextMenu.addSubmenu(this._newMenu, NEW_MENU_PRIORITY);
    this._contextMenu.addItem({ type: 'separator' }, NEW_MENU_PRIORITY + 1);
    this._disposables.add(this._newMenu);

    this._addContextMenuItemGroup([{
      label: 'Add Project Folder',
      command: 'application:add-project-folder'
    }, {
      label: 'Add Remote Project Folder',
      command: 'nuclide-remote-projects:connect'
    }, {
      label: 'Remove Project Folder',
      command: 'nuclide-file-tree:remove-project-folder-selection',
      shouldDisplay: () => {
        const node = this.getSingleSelectedNode();
        return node != null && node.isRoot;
      }
    }], ADD_PROJECT_MENU_PRIORITY);

    this._sourceControlMenu = new (_ContextMenu || _load_ContextMenu()).default({
      type: 'submenu',
      label: 'Source Control',
      parent: this._contextMenu,
      shouldDisplay: e => {
        return !this._sourceControlMenu.isEmpty() && !this._store.getSelectedNodes().isEmpty();
      }
    });
    this._contextMenu.addSubmenu(this._sourceControlMenu, SOURCE_CONTROL_MENU_PRIORITY);
    this._contextMenu.addItem({
      type: 'separator',
      shouldDisplay: e => !this._sourceControlMenu.isEmpty()
    }, SOURCE_CONTROL_MENU_PRIORITY + 1);
    this._disposables.add(this._sourceControlMenu);

    this._addContextMenuItemGroup([{
      label: 'Rename',
      command: 'nuclide-file-tree:rename-selection',
      shouldDisplay: () => {
        const node = this._store.getSingleSelectedNode();
        // For now, rename does not apply to root nodes.
        return node != null && !node.isRoot;
      }
    }, {
      label: 'Duplicate',
      command: 'nuclide-file-tree:duplicate-selection',
      shouldDisplay: () => {
        const node = this.getSingleSelectedNode();
        return node != null && !node.isContainer;
      }
    }, {
      label: 'Delete',
      command: 'nuclide-file-tree:remove',
      shouldDisplay: () => {
        const nodes = this.getSelectedNodes();
        // We can delete multiple nodes as long as no root node is selected
        return nodes.size > 0 && nodes.every(node => node != null && !node.isRoot);
      }
    }], MODIFY_FILE_MENU_PRIORITY);

    this._addContextMenuItemGroup([{
      label: 'Split',
      shouldDisplay: () => {
        const node = this.getSingleSelectedNode();
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

    // Add the "Show in X" menu group. There's a bit of hackery going on here: we want these items
    // to be applied to anyhing that matches our CSS selector, but we also want them to occur in a
    // specific order in the file tree context menu. Since `atom.contextMenu` doesn't support
    // priority, we add them twice. Ideally, these menu items wouldn't be in the file tree package
    // at all, but for historical reasons they are. Someday maybe we can pull them out.
    const showInXItems = [{
      label: 'Copy Full Path',
      command: 'file:copy-full-path',
      shouldDisplay: event => (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target) != null
    }, {
      label: `Show in ${getFileManagerName()}`,
      command: 'file:show-in-file-manager',
      shouldDisplay: event => {
        const path = (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target);
        return path != null && !(_nuclideUri || _load_nuclideUri()).default.isRemote(path);
      }
    }, {
      label: 'Search in Directory',
      command: 'nuclide-file-tree:search-in-directory',
      shouldDisplay: () => {
        const nodes = this.getSelectedNodes();
        return nodes.size > 0 && nodes.every(node => node.isContainer);
      }
    }];

    this._disposables.add(atom.contextMenu.add({
      'atom-text-editor, [data-path]:not(.nuclide-file-tree-path)': showInXItems
    }));
    this._addContextMenuItemGroup(showInXItems, SHOW_IN_MENU_PRIORITY);
  }

  /**
   * @param priority must be an integer in the range [0, 1000).
   */
  addItemToTestSection(originalItem, priority) {
    if (priority < 0 || priority >= PRIORITY_GROUP_SIZE) {
      throw Error(`Illegal priority value: ${priority}`);
    }

    return this._addItemToMenu(originalItem, this._contextMenu, TEST_SECTION_PRIORITY + priority);
  }

  /**
   * @param priority must be an integer in the range [0, 1000).
   */
  addItemToProjectMenu(originalItem, priority) {
    if (priority < 0 || priority >= PRIORITY_GROUP_SIZE) {
      throw Error(`Illegal priority value: ${priority}`);
    }

    return this._addItemToMenu(originalItem, this._contextMenu, ADD_PROJECT_MENU_PRIORITY + priority);
  }

  addItemToNewMenu(originalItem, priority) {
    return this._addItemToMenu(originalItem, this._newMenu, priority);
  }

  addItemToSourceControlMenu(originalItem, priority) {
    return this._addItemToMenu(originalItem, this._sourceControlMenu, priority);
  }

  /**
   * @param priority must be an integer in the range [0, 1000).
   */
  addItemToShowInSection(originalItem, priority) {
    if (priority < 0 || priority >= PRIORITY_GROUP_SIZE) {
      throw Error(`Illegal priority value: ${priority}`);
    }

    return this._addItemToMenu(originalItem, this._contextMenu, SHOW_IN_MENU_PRIORITY + priority);
  }

  _addItemToMenu(originalItem, menu, priority) {
    const { itemDisposable, item } = initCommandIfPresent(originalItem);
    itemDisposable.add(menu.addItem(item, priority));

    this._disposables.add(itemDisposable);
    return new (_UniversalDisposable || _load_UniversalDisposable()).default(() => {
      this._disposables.remove(itemDisposable);
      itemDisposable.dispose();
    });
  }

  getSelectedNodes() {
    return this._store.getSelectedNodes();
  }

  getSingleSelectedNode() {
    return this._store.getSingleSelectedNode();
  }

  dispose() {
    this._disposables.dispose();
  }

  _addContextMenuItemGroup(menuItems, priority_) {
    let priority = priority_;

    // $FlowFixMe: The conversion between MenuItemDefinition and atom$ContextMenuItem is a mess.
    menuItems.forEach(item => this._contextMenu.addItem(item, ++priority));

    // Atom is smart about only displaying a separator when there are items to
    // separate, so there will never be a dangling separator at the end.
    this._contextMenu.addItem({ type: 'separator' }, priority_ + PRIORITY_GROUP_SEPARATOR_OFFSET);
  }

  /**
   * @return A {boolean} whether the "Show in File Manager" context menu item should be displayed
   * for the current selection and the given `platform`.
   */
  _shouldDisplayShowInFileManager(event, platform) {
    const path = (0, (_getElementFilePath || _load_getElementFilePath()).default)(event.target);
    return path != null && (_nuclideUri || _load_nuclideUri()).default.isAbsolute(path) && process.platform === platform;
  }
}

exports.default = FileTreeContextMenu;
function initCommandIfPresent(item) {
  const itemDisposable = new (_UniversalDisposable || _load_UniversalDisposable()).default();
  if (typeof item.callback === 'function' && item.label != null) {
    const command = item.command || generateNextInternalCommand(item.label);
    itemDisposable.add(atom.commands.add(FILE_TREE_CSS, command, item.callback));
    return { itemDisposable, item: Object.assign({}, item, { command }) };
  }

  return { itemDisposable, item };
}

let nextInternalCommandId = 0;

function generateNextInternalCommand(itemLabel) {
  const cmdName = itemLabel.toLowerCase().replace(/[^\w]+/g, '-') + '-' + nextInternalCommandId++;
  return `nuclide-file-tree:${cmdName}`;
}

function getFileManagerName() {
  switch (process.platform) {
    case 'darwin':
      return 'Finder';
    case 'win32':
      return 'Explorer';
    default:
      return 'File Manager';
  }
}