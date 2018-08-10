/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 * @emails oncall+nuclide
 */
import {
  RangeKey,
  SelectionRange,
  RangeUtil,
} from '../lib/FileTreeSelectionRange';

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import {FileTreeNode} from '../lib/FileTreeNode';
import createStore from '../lib/redux/createStore';
import {WorkingSet} from '../../nuclide-working-sets-common';

import {denodeify} from 'nuclide-commons/promise';
import {buildTempDirTree} from '../__mocks__/helpers/BuildTempDirTree';
import * as Selectors from '../lib/redux/Selectors';
import * as Actions from '../lib/redux/Actions';
import * as EpicHelpers from '../lib/redux/EpicHelpers';
import tempModule from 'temp';
tempModule.track();
const tempCleanup = denodeify(tempModule.cleanup);

import invariant from 'assert';

describe('FileTreeSelectionRange', () => {
  let store;
  beforeEach(() => {
    store = createStore();
  });

  function createNode(rootUri: NuclideUri, uri: NuclideUri): FileTreeNode {
    return new FileTreeNode(
      {rootUri, uri},
      Selectors.getConf(store.getState()),
    );
  }

  describe('RangeKey', () => {
    it('properly construct the object', () => {
      const key = new RangeKey('a', 'b');
      expect(key.rootKey() === 'a').toBe(true);
      expect(key.nodeKey() === 'b').toBe(true);
    });

    it('properly construct with factory method', () => {
      const node = createNode('a', 'b');
      const key = RangeKey.of(node);
      expect(key.rootKey() === 'a').toBe(true);
      expect(key.nodeKey() === 'b').toBe(true);
    });

    it('properly test equality', () => {
      const key1 = new RangeKey('a', 'b');
      const key2 = new RangeKey('a', 'b');
      expect(key1 === key2).toBe(false);
      expect(key1).toEqual(key2);
      expect(key1.equals(key2)).toBe(true);
    });
  });

  describe('SelectionRange', () => {
    const key1 = new RangeKey('a', '1');
    const key2 = new RangeKey('a', '2');
    const key3 = new RangeKey('a', '3');

    it('properly construct the object', () => {
      const range = new SelectionRange(key1, key2);
      expect(range.anchor().equals(key1)).toBe(true);
      expect(range.range().equals(key2)).toBe(true);
    });

    describe('factory method', () => {
      it('properly construct new object based on existing ones', () => {
        const range = new SelectionRange(key1, key2);
        const range2 = range.withNewRange(key2);
        expect(range2.anchor().equals(key1)).toBe(true);
        expect(range2.range().equals(key2)).toBe(true);
        const range3 = range.withNewAnchor(key3);
        expect(range3.anchor().equals(key3)).toBe(true);
        expect(range3.range().equals(key2)).toBe(true);
        const range4 = SelectionRange.ofSingleItem(key2);
        expect(range4.anchor().equals(key2)).toBe(true);
        expect(range4.range().equals(key2)).toBe(true);
      });
    });

    it('properly test equality', () => {
      const range1 = new SelectionRange(key1, key2);
      const range2 = new SelectionRange(key1, key2);
      expect(range1.equals(range2)).toBe(true);
    });
  });

  describe('RangeUtil', () => {
    async function prepareFileTree(): Promise<Map<string, string>> {
      const map: Map<string, string> = await buildTempDirTree(
        'dir/foo/foo1',
        'dir/foo/foo2',
        'dir/bar/bar1',
        'dir/bar/bar2',
        'dir/bar/bar3',
      );
      const dir = map.get('dir');
      // flowlint-next-line sketchy-null-string:off
      invariant(dir);
      EpicHelpers.setRootKeys(store, [dir]);
      return map;
    }

    let map: Map<string, string> = new Map();

    beforeEach(async () => {
      map = await prepareFileTree();
      const dir = map.get('dir');
      // flowlint-next-line sketchy-null-string:off
      invariant(dir);
      // Await **internal-only** API because the public `expandNodeDeep` API does not
      // return the promise that can be awaited on
      await EpicHelpers.expandNodeDeep(store, dir, dir);
    });

    afterEach(async () => {
      await tempCleanup();
    });

    describe('findSelectedNode', () => {
      it('returns the node itself if it is shown and selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        // flowlint-next-line sketchy-null-string:off
        invariant(dir);
        // flowlint-next-line sketchy-null-string:off
        invariant(bar1);
        store.dispatch(Actions.setSelectedNode(dir, bar1));
        const node = Selectors.getNode(store.getState(), dir, bar1);
        invariant(node);
        expect(RangeUtil.findSelectedNode(store.getState(), node)).toBe(node);
      });

      it('searches the next selected node if passed in node is unselected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        const bar3 = map.get('dir/bar/bar3');
        // flowlint-next-line sketchy-null-string:off
        invariant(dir);
        // flowlint-next-line sketchy-null-string:off
        invariant(bar1);
        // flowlint-next-line sketchy-null-string:off
        invariant(bar3);
        store.dispatch(Actions.setSelectedNode(dir, bar3));
        const node = Selectors.getNode(store.getState(), dir, bar1);
        invariant(node);
        expect(RangeUtil.findSelectedNode(store.getState(), node)).toBe(
          Selectors.getNode(store.getState(), dir, bar3),
        );
      });

      it('searches the prev selected node if nothing else is selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        const bar3 = map.get('dir/bar/bar3');
        // flowlint-next-line sketchy-null-string:off
        invariant(dir);
        // flowlint-next-line sketchy-null-string:off
        invariant(bar1);
        // flowlint-next-line sketchy-null-string:off
        invariant(bar3);
        store.dispatch(Actions.setSelectedNode(dir, bar1));
        const node = Selectors.getNode(store.getState(), dir, bar3);
        invariant(node);
        expect(RangeUtil.findSelectedNode(store.getState(), node)).toBe(
          Selectors.getNode(store.getState(), dir, bar1),
        );
      });

      it('returns null if nothing is selected', () => {
        const dir = map.get('dir');
        const bar1 = map.get('dir/bar/bar1');
        // flowlint-next-line sketchy-null-string:off
        invariant(dir);
        // flowlint-next-line sketchy-null-string:off
        invariant(bar1);
        const node = Selectors.getNode(store.getState(), dir, bar1);
        invariant(node);
        expect(RangeUtil.findSelectedNode(store.getState(), node)).toBe(null);
      });

      it('searches the next selected node if itself is not shown', () => {
        const dir = map.get('dir');
        const foo = map.get('dir/foo');
        const foo1 = map.get('dir/foo/foo1');
        const bar1 = map.get('dir/bar/bar1');
        // flowlint-next-line sketchy-null-string:off
        invariant(dir);
        // flowlint-next-line sketchy-null-string:off
        invariant(foo);
        // flowlint-next-line sketchy-null-string:off
        invariant(foo1);
        // flowlint-next-line sketchy-null-string:off
        invariant(bar1);
        store.dispatch(Actions.collapseNode(dir, foo));
        store.dispatch(Actions.setSelectedNode(dir, bar1));
        const node = Selectors.getNode(store.getState(), dir, foo1);
        invariant(node);
        expect(RangeUtil.findSelectedNode(store.getState(), node)).toBe(
          Selectors.getNode(store.getState(), dir, bar1),
        );
      });

      it('only searches the selected node within the working set', () => {
        const dir = map.get('dir');
        const foo1 = map.get('dir/foo/foo1');
        const bar1 = map.get('dir/bar/bar1');
        // flowlint-next-line sketchy-null-string:off
        invariant(dir);
        // flowlint-next-line sketchy-null-string:off
        invariant(foo1);
        // flowlint-next-line sketchy-null-string:off
        invariant(bar1);
        store.dispatch(Actions.updateWorkingSet(new WorkingSet([foo1, bar1])));
        store.dispatch(Actions.setSelectedNode(dir, bar1));
        const node = Selectors.getNode(store.getState(), dir, foo1);
        invariant(node);
        expect(RangeUtil.findSelectedNode(store.getState(), node)).toBe(
          Selectors.getNode(store.getState(), dir, bar1),
        );
      });
    });
  });
});
