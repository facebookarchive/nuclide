'use strict';

var _FileTreeContextMenu;

function _load_FileTreeContextMenu() {
  return _FileTreeContextMenu = _interopRequireDefault(require('../lib/FileTreeContextMenu'));
}

var _FileTreeConstants;

function _load_FileTreeConstants() {
  return _FileTreeConstants = require('../lib/FileTreeConstants');
}

var _waits_for;

function _load_waits_for() {
  return _waits_for = _interopRequireDefault(require('../../../jest/waits_for'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 */

describe('FileTreeContextMenu', () => {
  let menu;

  beforeEach(async () => {
    menu = new (_FileTreeContextMenu || _load_FileTreeContextMenu()).default();
    await (0, (_waits_for || _load_waits_for()).default)(() => fileTreeItemsOrNull() != null);
  });

  afterEach(() => {
    menu.dispose();
  });

  it('updates atom.contextMenu', () => {
    const items = fileTreeItems();
    expect(items.some(x => x.label === 'New')).toBeTruthy();
  });

  it('removes items on dispose and allows multiple dispose calls', () => {
    menu.dispose();
    const items = fileTreeItemsOrNull();
    expect(items).toBeNull();
  });

  it('puts ShowIn items in the same group', () => {
    const groups = itemGroups(fileTreeItems());
    expect(groups.get('Copy Full Path')).toBe(groups.get('Search in Directory'));
  });

  it('has separators between groups', () => {
    const groups = itemGroups(fileTreeItems());
    const distinct = [getNonNull(groups, 'New'), getNonNull(groups, 'Add Folder'), getNonNull(groups, 'Rename'), getNonNull(groups, 'Split'), getNonNull(groups, 'Copy Full Path')];
    expect(new Set(distinct).size).toEqual(distinct.length);
  });

  it('includes Source Control submenu on demand', async () => {
    function includesSourceControl() {
      return fileTreeItems().some(x => x.label === 'Source Control');
    }
    expect(includesSourceControl()).toBeFalsy();
    menu.addItemToSourceControlMenu(testItem(), 100);
    await (0, (_waits_for || _load_waits_for()).default)(() => includesSourceControl());
  });

  it('supports addItemToShowInSection', async () => {
    const item = testItem();
    const label = item.label;

    if (!(label != null)) {
      throw new Error('Invariant violation: "label != null"');
    }

    menu.addItemToShowInSection(item, 100);
    await (0, (_waits_for || _load_waits_for()).default)(() => fileTreeItems().some(x => x.label === label));
    const groups = itemGroups(fileTreeItems());
    expect(getNonNull(groups, label)).toBe(getNonNull(groups, 'Copy Full Path'));
  });
});

function testItem() {
  return {
    label: 'Test Label',
    command: 'command-for-test',
    shouldDisplay() {
      return true;
    }
  };
}

function fileTreeItems() {
  const items = fileTreeItemsOrNull();

  if (!(items != null)) {
    throw new Error('Invariant violation: "items != null"');
  }

  return items;
}

function fileTreeItemsOrNull() {
  const itemSets = atom.contextMenu.itemSets.filter(x => x.selector === (_FileTreeConstants || _load_FileTreeConstants()).EVENT_HANDLER_SELECTOR);

  if (!(itemSets.length <= 1)) {
    throw new Error('Invariant violation: "itemSets.length <= 1"');
  }

  return itemSets.length === 0 ? null : itemSets[0].items;
}

function itemGroups(items) {
  const map = new Map();
  let array = [];
  for (const item of items) {
    if (item.type === 'separator') {
      array = [];
    } else if (typeof item.label === 'string') {
      map.set(item.label, array);
      array.push(item);
    }
  }
  return map;
}

function getNonNull(map, key) {
  const value = map.get(key);

  if (!(value != null)) {
    throw new Error(`Key not found: '${String(key)}'`);
  }

  return value;
}