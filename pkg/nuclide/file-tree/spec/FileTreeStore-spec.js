'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import FileTreeActions from '../lib/FileTreeActions';
import FileTreeStore from '../lib/FileTreeStore';

import pathModule from 'path';

describe('FileTreeStore', () => {
  const dir1 = pathModule.join(__dirname, 'fixtures', 'dir1') + '/';
  const fooTxt = pathModule.join(__dirname, 'fixtures', 'dir1', 'foo.txt');
  const dir2 = pathModule.join(__dirname, 'fixtures', 'dir2') + '/';

  const actions: FileTreeActions = FileTreeActions.getInstance();
  const store: FileTreeStore = FileTreeStore.getInstance();

  afterEach(() => {
    store.reset();
  });

  it('should be initialized with no root keys', () => {
    var rootKeys = store.getRootKeys();
    expect(Array.isArray(rootKeys)).toBe(true);
    expect(rootKeys.length).toBe(0);
  });

  describe('isEmpty', () => {
    it('returns true when the store is empty, has no roots', () => {
      expect(store.isEmpty()).toBe(true);
    });

    it('returns false when the store has data, has roots', () => {
      actions.setRootKeys([dir1]);
      expect(store.isEmpty()).toBe(false);
    });
  });

  it('should update root keys via actions', () => {
    actions.setRootKeys([dir1, dir2]);
    var rootKeys = store.getRootKeys();
    expect(Array.isArray(rootKeys)).toBe(true);
    expect(rootKeys.join('|')).toBe(`${dir1}|${dir2}`);
  });

  it('should expand root keys as they are added', () => {
    var rootKey = pathModule.join(__dirname, 'fixtures') + '/';
    actions.setRootKeys([rootKey]);
    var node = store.getNode(rootKey, rootKey);
    expect(node.isExpanded()).toBe(true);
  });

  it('should consider non-existent keys collapsed', () => {
    var rootKey = pathModule.join(__dirname, 'fixtures') + '/';
    var node = store.getNode(rootKey, rootKey + 'asdf');
    expect(node.isExpanded()).toBe(false);
  });

  it('toggles selected items', () => {
    actions.setRootKeys([dir1]);
    actions.toggleSelectNode(dir1, dir1);
    var node = store.getNode(dir1, dir1);
    expect(node.isSelected()).toBe(true);
    actions.toggleSelectNode(dir1, dir1);
    expect(node.isSelected()).toBe(false);
  });

  it('deselects items in other roots when a single node is selected', () => {
    actions.setRootKeys([dir1, dir2]);
    actions.toggleSelectNode(dir1, dir1);
    var node1 = store.getNode(dir1, dir1);
    var node2 = store.getNode(dir2, dir2);

    // Node 1 is selected, node 2 is not selected
    expect(node1.isSelected()).toBe(true);
    expect(node2.isSelected()).toBe(false);

    // Selecting a single node, node2, deselects nodes in all other roots
    actions.selectSingleNode(dir2, dir2);
    expect(node1.isSelected()).toBe(false);
    expect(node2.isSelected()).toBe(true);
  });

  describe('getSelectedKeys', () => {
    beforeEach(() => {
      /*
       * Create two roots and select them both. It'll look like the following:
       *
       *   → **dir1**
       *   → **dir2**
       */
      actions.setRootKeys([dir1, dir2]);
      actions.toggleSelectNode(dir1, dir1);
      actions.toggleSelectNode(dir2, dir2);
    });

    it('returns selected nodes from all roots when no argument is given', () => {
      // Convert the `Immutable.Set` to a native `Array` for simpler use w/ Jasmine.
      var selectedNodes = store.getSelectedKeys().toArray();
      expect(selectedNodes).toEqual([dir1, dir2]);
    });

    it('returns selected nodes from a specific root', () => {
      // Convert the `Immutable.Set` to a native `Array` for simpler use w/ Jasmine.
      var selectedNodes = store.getSelectedKeys(dir1).toArray();
      expect(selectedNodes).toEqual([dir1]);
    });
  });

  describe('getSelectedNodes', () => {
    it('returns selected nodes from all roots', () => {
      actions.setRootKeys([dir1, dir2]);
      actions.toggleSelectNode(dir1, dir1);
      actions.toggleSelectNode(dir2, dir2);

      // Convert the `Immutable.Set` to a native `Array` for simpler use w/ Jasmine.
      var selectedNodes = store.getSelectedNodes().map(node => node.nodeKey).toArray();
      expect(selectedNodes).toEqual([dir1, dir2]);
    });

    it('returns an empty Set when no nodes are selected', () => {
      var selectedNodes = store.getSelectedNodes().map(node => node.nodeKey).toArray();
      expect(selectedNodes).toEqual([]);
    });
  });

  describe('getSingleSelectedNode', () => {
    beforeEach(() => {
      /*
       * Create two roots. It'll look like the following:
       *
       *   → dir1
       *   → dir2
       */
      actions.setRootKeys([dir1, dir2]);
    });

    it('returns null when no nodes are selected', () => {
      expect(store.getSingleSelectedNode()).toBeNull();
    });

    it('returns null when more than 1 node is selected', () => {
      actions.toggleSelectNode(dir1, dir1);
      actions.toggleSelectNode(dir2, dir2);
      expect(store.getSingleSelectedNode()).toBeNull();
    });

    it('returns a node when only 1 is selected', () => {
      actions.toggleSelectNode(dir2, dir2);
      expect(store.getSingleSelectedNode().nodeKey).toEqual(dir2);
    });
  });

  describe('trackedNode', () => {
    it('resets when there is a new selection', () => {
      actions.setRootKeys([dir1]);
      actions.setTrackedNode(dir1, dir1);

      // Root is tracked after setting it.
      var trackedNode = store.getTrackedNode();
      expect(trackedNode && trackedNode.nodeKey).toBe(dir1);

      actions.selectSingleNode(dir1, dir1);

      // New selection, which happens on user interaction via select and collapse, resets the
      // tracked node.
      expect(store.getTrackedNode()).toBe(null);
    });
  });

  describe('getChildKeys', () => {
    it("clears loading and expanded states when there's an error fetching children", () => {
      waitsForPromise(async () => {
        actions.setRootKeys([dir1]);
        actions.expandNode(dir1, fooTxt);
        expect(store.isExpanded(dir1, fooTxt)).toBe(true);
        store.getChildKeys(dir1, fooTxt);
        expect(store.isLoading(dir1, fooTxt)).toBe(true);

        try {
          // Await **internal-only** API because the public `getChildKeys` API hides the fact that
          // it queues an async fetch. The return value is not relevant to this test, only that its
          // side effects be awaited.
          await store._fetchChildKeys(fooTxt);
        } catch (e) {
          // This will always throw an exception, but that's irrelevant to this test. The side
          // effects after this try/catch capture the purpose of this test.
        }

        expect(store.isExpanded(dir1, fooTxt)).toBe(false);
        expect(store.isLoading(dir1, fooTxt)).toBe(false);
      });
    });
  });

  it('omits hidden nodes', () => {
    waitsForPromise(async () => {
      actions.setRootKeys([dir1]);
      actions.expandNode(dir1, fooTxt);
      actions.setIgnoredNames(['foo.*']);

      // Await **internal-only** API because the public `getChildKeys` API hides the fact that
      // it queues an async fetch. The return value is not relevant to this test, only that its
      // side effects be awaited.
      await store._fetchChildKeys(dir1);

      expect(store.getChildKeys(dir1, dir1).length).toBe(0);
    });
  });

  it('shows nodes if the pattern changes to no longer match', () => {
    waitsForPromise(async () => {
      actions.setRootKeys([dir1]);
      actions.expandNode(dir1, fooTxt);
      actions.setIgnoredNames(['foo.*']);

      // Await **internal-only** API because the public `getChildKeys` API hides the fact that
      // it queues an async fetch. The return value is not relevant to this test, only that its
      // side effects be awaited.
      await store._fetchChildKeys(dir1);

      actions.setIgnoredNames(['bar.*']);

      expect(store.getChildKeys(dir1, dir1).length).toBe(1);
    });
  });

  it('obeys the hideIgnoredNames setting', () => {
    waitsForPromise(async () => {
      actions.setRootKeys([dir1]);
      actions.expandNode(dir1, fooTxt);
      actions.setIgnoredNames(['foo.*']);
      actions.setHideIgnoredNames(false);

      // Await **internal-only** API because the public `getChildKeys` API hides the fact that
      // it queues an async fetch. The return value is not relevant to this test, only that its
      // side effects be awaited.
      await store._fetchChildKeys(dir1);

      expect(store.getChildKeys(dir1, dir1).length).toBe(1);
    });
  });

});
