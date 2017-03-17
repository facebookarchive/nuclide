/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {FileTreeNode} from './FileTreeNode';
import type Immutable from 'immutable';

import ContextMenu from '../../commons-atom/ContextMenu';
import getElementFilePath from '../../commons-atom/getElementFilePath';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {EVENT_HANDLER_SELECTOR} from './FileTreeConstants';
import {FileTreeStore} from './FileTreeStore';

import nuclideUri from '../../commons-node/nuclideUri';

type MenuItemSingle = {
  +label: string,
  +command: string,
  shouldDisplay?: (event: MouseEvent) => boolean,
};

type MenuItemGroup = {
  +label: string,
  +submenu: Array<atom$ContextMenuItem>,
  shouldDisplay?: (event: MouseEvent) => boolean,
};

type MenuItemSeparator = {
  +type: string,
};

type MenuItemDefinition = MenuItemSingle | MenuItemGroup | MenuItemSeparator;


// It's just atom$ContextMenuItem with an optional `callback` property added.
// I wish flow would let add it in a more elegant way.
type AtomContextMenuItemWithCallback = {
  command?: string,
  callback?: () => mixed,
  created?: (event: MouseEvent) => void,
  enabled?: boolean,
  label?: string,
  shouldDisplay?: (event: MouseEvent) => boolean,
  submenu?: Array<atom$ContextMenuItem>,
  type?: string,
  visible?: boolean,
};

export type FileTreeContextMenuItem = atom$ContextMenuItem | AtomContextMenuItemWithCallback;

const FILE_TREE_CSS = '.nuclide-file-tree';

const NEW_MENU_PRIORITY = 0;
const ADD_PROJECT_MENU_PRIORITY = 1000;
const SOURCE_CONTROL_MENU_PRIORITY = 2000;
const MODIFY_FILE_MENU_PRIORITY = 3000;
const SPLIT_MENU_PRIORITY = 4000;
const TEST_SECTION_PRIORITY = 5000;
const SHOW_IN_MENU_PRIORITY = 6000;

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
export default class FileTreeContextMenu {
  _contextMenu: ContextMenu;
  _sourceControlMenu: ContextMenu;
  _store: FileTreeStore;
  _disposables: UniversalDisposable;

  constructor() {
    this._contextMenu = new ContextMenu(
      {
        type: 'root',
        cssSelector: EVENT_HANDLER_SELECTOR,
      },
    );
    this._disposables = new UniversalDisposable();
    this._store = FileTreeStore.getInstance();

    const shouldDisplaySetToCurrentWorkingRootOption = () => {
      const node = this._store.getSingleSelectedNode();
      return node != null && node.isContainer && this._store.hasCwd() && !node.isCwd;
    };

    this._addContextMenuItemGroup([
      {
        label: 'Set to Current Working Root',
        command: 'nuclide-file-tree:set-current-working-root',
        shouldDisplay: shouldDisplaySetToCurrentWorkingRootOption,
      },
      {
        type: 'separator',
        shouldDisplay: shouldDisplaySetToCurrentWorkingRootOption,
      },
      {
        label: 'New',
        shouldDisplay: () => {
          return this._store.getSingleSelectedNode() != null;
        },
        submenu: [
          {
            label: 'File',
            command: 'nuclide-file-tree:add-file',
          },
          {
            label: 'Folder',
            command: 'nuclide-file-tree:add-folder',
          },
        ],
      },
    ],
    NEW_MENU_PRIORITY);

    this._addContextMenuItemGroup([
      {
        label: 'Add Project Folder',
        command: 'application:add-project-folder',
      },
      {
        label: 'Add Remote Project Folder',
        command: 'nuclide-remote-projects:connect',
      },
      {
        label: 'Remove Project Folder',
        command: 'nuclide-file-tree:remove-project-folder-selection',
        shouldDisplay: () => {
          const node = this.getSingleSelectedNode();
          return node != null && node.isRoot;
        },
      },
    ],
    ADD_PROJECT_MENU_PRIORITY);

    this._sourceControlMenu = new ContextMenu({
      type: 'submenu',
      label: 'Source Control',
      parent: this._contextMenu,
      shouldDisplay: (e: MouseEvent) => {
        return !this._sourceControlMenu.isEmpty() && !this._store.getSelectedNodes().isEmpty();
      },
    });
    this._contextMenu.addSubmenu(
      this._sourceControlMenu,
      SOURCE_CONTROL_MENU_PRIORITY,
    );
    this._contextMenu.addItem(
      {
        type: 'separator',
        shouldDisplay: (e: MouseEvent) => !this._sourceControlMenu.isEmpty(),
      },
      SOURCE_CONTROL_MENU_PRIORITY + 1,
    );

    this._addContextMenuItemGroup([
      {
        label: 'Rename',
        command: 'nuclide-file-tree:rename-selection',
        shouldDisplay: () => {
          const node = this._store.getSingleSelectedNode();
          // For now, rename does not apply to root nodes.
          return node != null && !node.isRoot;
        },
      },
      {
        label: 'Duplicate',
        command: 'nuclide-file-tree:duplicate-selection',
        shouldDisplay: () => {
          const node = this.getSingleSelectedNode();
          return node != null && !node.isContainer;
        },
      },
      {
        label: 'Delete',
        command: 'nuclide-file-tree:remove',
        shouldDisplay: () => {
          const nodes = this.getSelectedNodes();
          // We can delete multiple nodes as long as no root node is selected
          return nodes.size > 0 && nodes.every(node => node != null && !node.isRoot);
        },
      },
    ],
    MODIFY_FILE_MENU_PRIORITY);

    this._addContextMenuItemGroup([
      {
        label: 'Split',
        shouldDisplay: () => {
          const node = this.getSingleSelectedNode();
          return node != null && !node.isContainer;
        },
        submenu: [
          {
            label: 'Up',
            command: 'nuclide-file-tree:open-selected-entry-up',
          },
          {
            label: 'Down',
            command: 'nuclide-file-tree:open-selected-entry-down',
          },
          {
            label: 'Left',
            command: 'nuclide-file-tree:open-selected-entry-left',
          },
          {
            label: 'Right',
            command: 'nuclide-file-tree:open-selected-entry-right',
          },
        ],
      },
    ],
    SPLIT_MENU_PRIORITY);

    // Add the "Show in X" menu group. There's a bit of hackery going on here: we want these items
    // to be applied to anyhing that matches our CSS selector, but we also want them to occur in a
    // specific order in the file tree context menu. Since `atom.contextMenu` doesn't support
    // priority, we add them twice. Ideally, these menu items wouldn't be in the file tree package
    // at all, but for historical reasons they are. Someday maybe we can pull them out.
    const showInXItems = [
      {
        label: 'Copy Full Path',
        command: 'file:copy-full-path',
        shouldDisplay: event => getElementFilePath(((event.target: any): HTMLElement)) != null,
      },
      {
        label: `Show in ${getFileManagerName()}`,
        command: 'file:show-in-file-manager',
        shouldDisplay: event => {
          const path = getElementFilePath(((event.target: any): HTMLElement));
          return path != null && !nuclideUri.isRemote(path);
        },
      },
      {
        label: 'Search in Directory',
        command: 'nuclide-file-tree:search-in-directory',
        shouldDisplay: () => {
          const nodes = this.getSelectedNodes();
          return nodes.size > 0 && nodes.every(node => node.isContainer);
        },
      },
      {type: 'separator'},
    ];

    this._disposables.add(
      atom.contextMenu.add({
        'atom-text-editor, [data-path]:not(.nuclide-file-tree-path)': showInXItems,
      }),
    );
    this._addContextMenuItemGroup(showInXItems, SHOW_IN_MENU_PRIORITY);
  }

  /**
   * @param priority must be an integer in the range [0, 1000).
   */
  addItemToTestSection(originalItem: FileTreeContextMenuItem, priority: number): IDisposable {
    if (priority < 0 || priority >= 1000) {
      throw Error(`Illegal priority value: ${priority}`);
    }

    return this._addItemToMenu(originalItem, this._contextMenu, TEST_SECTION_PRIORITY + priority);
  }

  /**
   * @param priority must be an integer in the range [0, 1000).
   */
  addItemToProjectMenu(originalItem: FileTreeContextMenuItem, priority: number): IDisposable {
    if (priority < 0 || priority >= 1000) {
      throw Error(`Illegal priority value: ${priority}`);
    }

    return this._addItemToMenu(
      originalItem,
      this._contextMenu,
      ADD_PROJECT_MENU_PRIORITY + priority,
    );
  }

  addItemToSourceControlMenu(originalItem: FileTreeContextMenuItem, priority: number): IDisposable {
    return this._addItemToMenu(originalItem, this._sourceControlMenu, priority);
  }

  _addItemToMenu(
    originalItem: FileTreeContextMenuItem,
    menu: ContextMenu,
    priority: number,
  ): IDisposable {
    const {itemDisposable, item} = initCommandIfPresent(originalItem);
    itemDisposable.add(menu.addItem(item, priority));

    this._disposables.add(itemDisposable);
    return new UniversalDisposable(() => {
      this._disposables.remove(itemDisposable);
      itemDisposable.dispose();
    });
  }

  getSelectedNodes(): Immutable.OrderedSet<FileTreeNode> {
    return this._store.getSelectedNodes();
  }

  getSingleSelectedNode(): ?FileTreeNode {
    return this._store.getSingleSelectedNode();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _addContextMenuItemGroup(menuItems: Array<MenuItemDefinition>, priority_: number): void {
    let priority = priority_;
    // Atom is smart about only displaying a separator when there are items to
    // separate, so there will never be a dangling separator at the end.
    // $FlowFixMe: The conversion between MenuItemDefinition and atom$ContextMenuItem is a mess.
    const allItems: Array<atom$ContextMenuItem> = menuItems.concat([{type: 'separator'}]);
    allItems.forEach(item => {
      this._contextMenu.addItem(item, ++priority);
    });
  }

  /**
   * @return A {boolean} whether the "Show in File Manager" context menu item should be displayed
   * for the current selection and the given `platform`.
   */
  _shouldDisplayShowInFileManager(event: Event, platform: string): boolean {
    const path = getElementFilePath(((event.target: any): HTMLElement));
    return (
      path != null &&
      nuclideUri.isAbsolute(path) &&
      process.platform === platform
    );
  }
}

function initCommandIfPresent(item: FileTreeContextMenuItem): {
  itemDisposable: UniversalDisposable,
  item: atom$ContextMenuItem,
} {
  const itemDisposable = new UniversalDisposable();
  if (typeof item.callback === 'function' && item.label != null) {
    const command = item.command || generateNextInternalCommand(item.label);
    itemDisposable.add(atom.commands.add(FILE_TREE_CSS, command, item.callback));
    return {itemDisposable, item: {...item, command}};
  }

  return {itemDisposable, item};
}

let nextInternalCommandId = 0;

function generateNextInternalCommand(itemLabel: string): string {
  const cmdName = itemLabel.toLowerCase().replace(/[^\w]+/g, '-') + '-' + nextInternalCommandId++;
  return `nuclide-file-tree:${cmdName}`;
}

function getFileManagerName(): string {
  switch (process.platform) {
    case 'darwin': return 'Finder';
    case 'win32': return 'Explorer';
    default: return 'File Manager';
  }
}
