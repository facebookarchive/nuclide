"use strict";

function _FileTreeSelectionRange() {
  const data = require("../lib/FileTreeSelectionRange");

  _FileTreeSelectionRange = function () {
    return data;
  };

  return data;
}

function _FileTreeNode() {
  const data = require("../lib/FileTreeNode");

  _FileTreeNode = function () {
    return data;
  };

  return data;
}

function _FileTreeActions() {
  const data = _interopRequireDefault(require("../lib/FileTreeActions"));

  _FileTreeActions = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireWildcard(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
    return data;
  };

  return data;
}

function _FileTreeSelectionManager() {
  const data = require("../lib/FileTreeSelectionManager");

  _FileTreeSelectionManager = function () {
    return data;
  };

  return data;
}

function _nuclideWorkingSetsCommon() {
  const data = require("../../nuclide-working-sets-common");

  _nuclideWorkingSetsCommon = function () {
    return data;
  };

  return data;
}

function _promise() {
  const data = require("../../../modules/nuclide-commons/promise");

  _promise = function () {
    return data;
  };

  return data;
}

function _BuildTempDirTree() {
  const data = require("../__mocks__/helpers/BuildTempDirTree");

  _BuildTempDirTree = function () {
    return data;
  };

  return data;
}

function Selectors() {
  const data = _interopRequireWildcard(require("../lib/FileTreeSelectors"));

  Selectors = function () {
    return data;
  };

  return data;
}

function _temp() {
  const data = _interopRequireDefault(require("temp"));

  _temp = function () {
    return data;
  };

  return data;
}

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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
 * @emails oncall+nuclide
 */
_temp().default.track();

const tempCleanup = (0, _promise().denodeify)(_temp().default.cleanup);
describe('FileTreeSelectionRange', () => {
  function createNode(rootUri, uri) {
    return new (_FileTreeNode().FileTreeNode)({
      rootUri,
      uri
    }, Object.assign({}, _FileTreeStore().DEFAULT_CONF, {
      selectionManager: new (_FileTreeSelectionManager().FileTreeSelectionManager)(() => {})
    }));
  }

  describe('RangeKey', () => {
    it('properly construct the object', () => {
      const key = new (_FileTreeSelectionRange().RangeKey)('a', 'b');
      expect(key.rootKey() === 'a').toBe(true);
      expect(key.nodeKey() === 'b').toBe(true);
    });
    it('properly construct with factory method', () => {
      const node = createNode('a', 'b');

      const key = _FileTreeSelectionRange().RangeKey.of(node);

      expect(key.rootKey() === 'a').toBe(true);
      expect(key.nodeKey() === 'b').toBe(true);
    });
    it('properly test equality', () => {
      const key1 = new (_FileTreeSelectionRange().RangeKey)('a', 'b');
      const key2 = new (_FileTreeSelectionRange().RangeKey)('a', 'b');
      expect(key1 === key2).toBe(false);
      expect(key1).toEqual(key2);
      expect(key1.equals(key2)).toBe(true);
    });
  });
  describe('SelectionRange', () => {
    const key1 = new (_FileTreeSelectionRange().RangeKey)('a', '1');
    const key2 = new (_FileTreeSelectionRange().RangeKey)('a', '2');
    const key3 = new (_FileTreeSelectionRange().RangeKey)('a', '3');
    it('properly construct the object', () => {
      const range = new (_FileTreeSelectionRange().SelectionRange)(key1, key2);
      expect(range.anchor().equals(key1)).toBe(true);
      expect(range.range().equals(key2)).toBe(true);
    });
    describe('factory method', () => {
      it('properly construct new object based on existing ones', () => {
        const range = new (_FileTreeSelectionRange().SelectionRange)(key1, key2);
        const range2 = range.withNewRange(key2);
        expect(range2.anchor().equals(key1)).toBe(true);
        expect(range2.range().equals(key2)).toBe(true);
        const range3 = range.withNewAnchor(key3);
        expect(range3.anchor().equals(key3)).toBe(true);
        expect(range3.range().equals(key2)).toBe(true);

        const range4 = _FileTreeSelectionRange().SelectionRange.ofSingleItem(key2);

        expect(range4.anchor().equals(key2)).toBe(true);
        expect(range4.range().equals(key2)).toBe(true);
      });
    });
    it('properly test equality', () => {
      const range1 = new (_FileTreeSelectionRange().SelectionRange)(key1, key2);
      const range2 = new (_FileTreeSelectionRange().SelectionRange)(key1, key2);
      expect(range1.equals(range2)).toBe(true);
    });
  });
  describe('RangeUtil', () => {
    const store = new (_FileTreeStore().default)();
    const actions = new (_FileTreeActions().default)(store);

    async function prepareFileTree() {
      const map = await (0, _BuildTempDirTree().buildTempDirTree)('dir/foo/foo1', 'dir/foo/foo2', 'dir/bar/bar1', 'dir/bar/bar2', 'dir/bar/bar3');
      const dir = map.get('dir'); // flowlint-next-line sketchy-null-string:off

      if (!dir) {
        throw new Error("Invariant violation: \"dir\"");
      }

      actions.setRootKeys([dir]);
      return map;
    }

    let map = new Map();
    beforeEach(async () => {
      await (async () => {
        map = await prepareFileTree();
        const dir = map.get('dir'); // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error("Invariant violation: \"dir\"");
        } // Await **internal-only** API because the public `expandNodeDeep` API does not
        // return the promise that can be awaited on


        await store._expandNodeDeep(dir, dir);
      })();
    });
    afterEach(async () => {
      actions.updateWorkingSet(new (_nuclideWorkingSetsCommon().WorkingSet)([]));
      actions.reset();
      await tempCleanup();
    });
    describe('findSelectedNode', () => {
      it('returns the node itself if it is shown and selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1'); // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error("Invariant violation: \"dir\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error("Invariant violation: \"bar1\"");
        }

        actions.setSelectedNode(dir, bar1);
        const node = Selectors().getNode(store, dir, bar1);

        if (!node) {
          throw new Error("Invariant violation: \"node\"");
        }

        expect(_FileTreeSelectionRange().RangeUtil.findSelectedNode(node)).toBe(node);
      });
      it('searches the next selected node if passed in node is unselected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        const bar3 = map.get('dir/bar/bar3'); // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error("Invariant violation: \"dir\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error("Invariant violation: \"bar1\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!bar3) {
          throw new Error("Invariant violation: \"bar3\"");
        }

        actions.setSelectedNode(dir, bar3);
        const node = Selectors().getNode(store, dir, bar1);

        if (!node) {
          throw new Error("Invariant violation: \"node\"");
        }

        expect(_FileTreeSelectionRange().RangeUtil.findSelectedNode(node)).toBe(Selectors().getNode(store, dir, bar3));
      });
      it('searches the prev selected node if nothing else is selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        const bar3 = map.get('dir/bar/bar3'); // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error("Invariant violation: \"dir\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error("Invariant violation: \"bar1\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!bar3) {
          throw new Error("Invariant violation: \"bar3\"");
        }

        actions.setSelectedNode(dir, bar1);
        const node = Selectors().getNode(store, dir, bar3);

        if (!node) {
          throw new Error("Invariant violation: \"node\"");
        }

        expect(_FileTreeSelectionRange().RangeUtil.findSelectedNode(node)).toBe(Selectors().getNode(store, dir, bar1));
      });
      it('returns null if nothing is selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1'); // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error("Invariant violation: \"dir\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error("Invariant violation: \"bar1\"");
        }

        const node = Selectors().getNode(store, dir, bar1);

        if (!node) {
          throw new Error("Invariant violation: \"node\"");
        }

        expect(_FileTreeSelectionRange().RangeUtil.findSelectedNode(node)).toBe(null);
      });
      it('searches the next selected node if itself is not shown', () => {
        const dir = map.get('dir');
        const foo = map.get('dir/foo');
        const foo1 = map.get('dir/foo/foo1');
        const bar1 = map.get('dir/bar/bar1'); // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error("Invariant violation: \"dir\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!foo) {
          throw new Error("Invariant violation: \"foo\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!foo1) {
          throw new Error("Invariant violation: \"foo1\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error("Invariant violation: \"bar1\"");
        }

        actions.collapseNode(dir, foo);
        actions.setSelectedNode(dir, bar1);
        const node = Selectors().getNode(store, dir, foo1);

        if (!node) {
          throw new Error("Invariant violation: \"node\"");
        }

        expect(_FileTreeSelectionRange().RangeUtil.findSelectedNode(node)).toBe(Selectors().getNode(store, dir, bar1));
      });
      it('only searches the selected node within the working set', () => {
        const dir = map.get('dir');
        const foo1 = map.get('dir/foo/foo1');
        const bar1 = map.get('dir/bar/bar1'); // flowlint-next-line sketchy-null-string:off

        if (!dir) {
          throw new Error("Invariant violation: \"dir\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!foo1) {
          throw new Error("Invariant violation: \"foo1\"");
        } // flowlint-next-line sketchy-null-string:off


        if (!bar1) {
          throw new Error("Invariant violation: \"bar1\"");
        }

        actions.updateWorkingSet(new (_nuclideWorkingSetsCommon().WorkingSet)([foo1, bar1]));
        actions.setSelectedNode(dir, bar1);
        const node = Selectors().getNode(store, dir, foo1);

        if (!node) {
          throw new Error("Invariant violation: \"node\"");
        }

        expect(_FileTreeSelectionRange().RangeUtil.findSelectedNode(node)).toBe(Selectors().getNode(store, dir, bar1));
      });
    });
  });
});