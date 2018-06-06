'use strict';

var _FileTreeSelectionRange;

function _load_FileTreeSelectionRange() {
  return _FileTreeSelectionRange = require('../lib/FileTreeSelectionRange');
}

var _FileTreeNode;

function _load_FileTreeNode() {
  return _FileTreeNode = require('../lib/FileTreeNode');
}

var _FileTreeActions;

function _load_FileTreeActions() {
  return _FileTreeActions = _interopRequireDefault(require('../lib/FileTreeActions'));
}

var _FileTreeStore;

function _load_FileTreeStore() {
  return _FileTreeStore = require('../lib/FileTreeStore');
}

var _FileTreeSelectionManager;

function _load_FileTreeSelectionManager() {
  return _FileTreeSelectionManager = require('../lib/FileTreeSelectionManager');
}

var _nuclideWorkingSetsCommon;

function _load_nuclideWorkingSetsCommon() {
  return _nuclideWorkingSetsCommon = require('../../nuclide-working-sets-common');
}

var _promise;

function _load_promise() {
  return _promise = require('../../../modules/nuclide-commons/promise');
}

var _BuildTempDirTree;

function _load_BuildTempDirTree() {
  return _BuildTempDirTree = require('../__mocks__/helpers/BuildTempDirTree');
}

var _temp;

function _load_temp() {
  return _temp = _interopRequireDefault(require('temp'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

(_temp || _load_temp()).default.track();
const tempCleanup = (0, (_promise || _load_promise()).denodeify)((_temp || _load_temp()).default.cleanup);

describe('FileTreeSelectionRange', () => {
  function createNode(rootUri, uri) {
    return new (_FileTreeNode || _load_FileTreeNode()).FileTreeNode({ rootUri, uri }, Object.assign({}, (_FileTreeStore || _load_FileTreeStore()).DEFAULT_CONF, {
      selectionManager: new (_FileTreeSelectionManager || _load_FileTreeSelectionManager()).FileTreeSelectionManager(() => {})
    }));
  }

  describe('RangeKey', () => {
    it('properly construct the object', () => {
      const key = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey('a', 'b');
      expect(key.rootKey() === 'a').toBe(true);
      expect(key.nodeKey() === 'b').toBe(true);
    });

    it('properly construct with factory method', () => {
      const node = createNode('a', 'b');
      const key = (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey.of(node);
      expect(key.rootKey() === 'a').toBe(true);
      expect(key.nodeKey() === 'b').toBe(true);
    });

    it('properly test equality', () => {
      const key1 = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey('a', 'b');
      const key2 = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey('a', 'b');
      expect(key1 === key2).toBe(false);
      expect(key1).toEqual(key2);
      expect(key1.equals(key2)).toBe(true);
    });
  });

  describe('SelectionRange', () => {
    const key1 = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey('a', '1');
    const key2 = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey('a', '2');
    const key3 = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeKey('a', '3');

    it('properly construct the object', () => {
      const range = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange(key1, key2);
      expect(range.anchor().equals(key1)).toBe(true);
      expect(range.range().equals(key2)).toBe(true);
    });

    describe('factory method', () => {
      it('properly construct new object based on existing ones', () => {
        const range = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange(key1, key2);
        const range2 = range.withNewRange(key2);
        expect(range2.anchor().equals(key1)).toBe(true);
        expect(range2.range().equals(key2)).toBe(true);
        const range3 = range.withNewAnchor(key3);
        expect(range3.anchor().equals(key3)).toBe(true);
        expect(range3.range().equals(key2)).toBe(true);
        const range4 = (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange.ofSingleItem(key2);
        expect(range4.anchor().equals(key2)).toBe(true);
        expect(range4.range().equals(key2)).toBe(true);
      });
    });

    it('properly test equality', () => {
      const range1 = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange(key1, key2);
      const range2 = new (_FileTreeSelectionRange || _load_FileTreeSelectionRange()).SelectionRange(key1, key2);
      expect(range1.equals(range2)).toBe(true);
    });
  });

  describe('RangeUtil', () => {
    const actions = (_FileTreeActions || _load_FileTreeActions()).default.getInstance();
    const store = (_FileTreeStore || _load_FileTreeStore()).FileTreeStore.getInstance();

    async function prepareFileTree() {
      const map = await (0, (_BuildTempDirTree || _load_BuildTempDirTree()).buildTempDirTree)('dir/foo/foo1', 'dir/foo/foo2', 'dir/bar/bar1', 'dir/bar/bar2', 'dir/bar/bar3');
      const dir = map.get('dir');
      // flowlint-next-line sketchy-null-string:off

      if (!dir) {
        throw new Error('Invariant violation: "dir"');
      }

      actions.setRootKeys([dir]);
      return map;
    }

    let map = new Map();

    beforeEach(async () => {
      await (async () => {
        map = await prepareFileTree();
        const dir = map.get('dir');
        // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error('Invariant violation: "dir"');
        }
        // Await **internal-only** API because the public `expandNodeDeep` API does not
        // return the promise that can be awaited on


        await store._expandNodeDeep(dir, dir);
      })();
    });

    afterEach(async () => {
      await (async () => {
        actions.updateWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet([]));
        store.reset();
        await tempCleanup();
      })();
    });

    describe('findSelectedNode', () => {
      it('returns the node itself if it is shown and selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error('Invariant violation: "dir"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error('Invariant violation: "bar1"');
        }

        actions.setSelectedNode(dir, bar1);
        const node = store.getNode(dir, bar1);

        if (!node) {
          throw new Error('Invariant violation: "node"');
        }

        expect((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeUtil.findSelectedNode(node)).toBe(node);
      });

      it('searches the next selected node if passed in node is unselected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        const bar3 = map.get('dir/bar/bar3');
        // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error('Invariant violation: "dir"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error('Invariant violation: "bar1"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!bar3) {
          throw new Error('Invariant violation: "bar3"');
        }

        actions.setSelectedNode(dir, bar3);
        const node = store.getNode(dir, bar1);

        if (!node) {
          throw new Error('Invariant violation: "node"');
        }

        expect((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeUtil.findSelectedNode(node)).toBe(store.getNode(dir, bar3));
      });

      it('searches the prev selected node if nothing else is selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        const bar3 = map.get('dir/bar/bar3');
        // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error('Invariant violation: "dir"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error('Invariant violation: "bar1"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!bar3) {
          throw new Error('Invariant violation: "bar3"');
        }

        actions.setSelectedNode(dir, bar1);
        const node = store.getNode(dir, bar3);

        if (!node) {
          throw new Error('Invariant violation: "node"');
        }

        expect((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeUtil.findSelectedNode(node)).toBe(store.getNode(dir, bar1));
      });

      it('returns null if nothing is selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error('Invariant violation: "dir"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error('Invariant violation: "bar1"');
        }

        const node = store.getNode(dir, bar1);

        if (!node) {
          throw new Error('Invariant violation: "node"');
        }

        expect((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeUtil.findSelectedNode(node)).toBe(null);
      });

      it('searches the next selected node if itself is not shown', () => {
        const dir = map.get('dir');
        const foo = map.get('dir/foo');
        const foo1 = map.get('dir/foo/foo1');
        const bar1 = map.get('dir/bar/bar1');
        // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error('Invariant violation: "dir"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!foo) {
          throw new Error('Invariant violation: "foo"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!foo1) {
          throw new Error('Invariant violation: "foo1"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error('Invariant violation: "bar1"');
        }

        actions.collapseNode(dir, foo);
        actions.setSelectedNode(dir, bar1);
        const node = store.getNode(dir, foo1);

        if (!node) {
          throw new Error('Invariant violation: "node"');
        }

        expect((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeUtil.findSelectedNode(node)).toBe(store.getNode(dir, bar1));
      });

      it('only searches the selected node within the working set', () => {
        const dir = map.get('dir');
        const foo1 = map.get('dir/foo/foo1');
        const bar1 = map.get('dir/bar/bar1');
        // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error('Invariant violation: "dir"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!foo1) {
          throw new Error('Invariant violation: "foo1"');
        }
        // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error('Invariant violation: "bar1"');
        }

        actions.updateWorkingSet(new (_nuclideWorkingSetsCommon || _load_nuclideWorkingSetsCommon()).WorkingSet([foo1, bar1]));
        actions.setSelectedNode(dir, bar1);
        const node = store.getNode(dir, foo1);

        if (!node) {
          throw new Error('Invariant violation: "node"');
        }

        expect((_FileTreeSelectionRange || _load_FileTreeSelectionRange()).RangeUtil.findSelectedNode(node)).toBe(store.getNode(dir, bar1));
      });
    });
  });
});