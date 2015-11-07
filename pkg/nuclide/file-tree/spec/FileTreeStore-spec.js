'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {Directory} from 'atom';
import FileTreeActions from '../lib/FileTreeActions';
import FileTreeHelpers from '../lib/FileTreeHelpers';
import FileTreeStore from '../lib/FileTreeStore';

import {fixtures} from 'nuclide-test-helpers';
import fs from 'fs';
import pathModule from 'path';

import {denodeify} from 'nuclide-commons';

import tempModule from 'temp';
tempModule.track();
const tempMkDir = denodeify(tempModule.mkdir);
const tempCleanup = denodeify(tempModule.cleanup);

import {makeTree} from 'fs-plus';
const mkdir = denodeify(makeTree);

import touchModule from 'touch';
const touch = denodeify(touchModule);

class MockRepository {
  isProjectAtRoot() {
    return true;
  }
  isPathIgnored() {
    return true;
  }
}

/**
 * Builds a temporary folder tree structure. Receives a variargs array of leaf node names
 * and creates the structure in a temporary folder.
 * To create an empty directory as leaf pass a name with '/' suffix. E.g. '/dir1/dir2/'
 * Returns a map that maps between the node names (without the '/' suffixes) and the actual
 * paths on the file system.
 * For a deep node passed such as 'dir1/dir2/foo.txt' each of the intermediate
 * nodes 'dir1', 'dir1/dir2', 'dir1/dir2' and 'dir1/dir2/foo.txt' entries will be
 * present in the returned map
 */
 /*eslint babel/no-await-in-loop:0 */
async function buildTempDirTree(...paths: Array<string>): Promise<Map<string, string>> {
  const rootPath = await tempMkDir('/');
  const fileMap = new Map();

  for (let i = 0; i < paths.length; i++) {
    const pathItem = paths[i];
    const arrPathItemParts = pathItem.split(pathModule.sep);
    const itemLocalDirPath = arrPathItemParts.slice(0, -1).join(pathModule.sep);
    const itemGlobalDirPath = pathModule.join(rootPath, itemLocalDirPath);
    const itemLocalFileName = arrPathItemParts[arrPathItemParts.length - 1];

    await mkdir(itemGlobalDirPath);
    if (itemLocalFileName) {
      await touch(pathModule.join(itemGlobalDirPath, itemLocalFileName));
    }

    arrPathItemParts.forEach((val, j) => {
      const pathPrefix = arrPathItemParts.slice(0, j + 1).join(pathModule.sep);
      let prefixNodePath = pathModule.join(rootPath, pathPrefix);
      if (j < arrPathItemParts.length - 1 || pathPrefix.endsWith('/')) {
        prefixNodePath += '/';
      }

      fileMap.set(pathPrefix, prefixNodePath);
    });
  }

  return fileMap;
}

describe('FileTreeStore', () => {
  let dir1 = '';
  let fooTxt = '';
  let dir2 = '';

  const actions: FileTreeActions = FileTreeActions.getInstance();
  const store: FileTreeStore = FileTreeStore.getInstance();

  /*
   * `getChildKeys` is the public API used by UIs. It queues Promises, which are stored in the
   * `isLoading` map. Fetch via the public API and return the **internal-only** Promise to enable
   * tests to await loading children.
   */
  function loadChildKeys(rootKey: string, nodeKey: string): Promise<void> {
    store.getChildKeys(rootKey, nodeKey);
    return Promise.resolve(store._getLoading(nodeKey));
  }

  beforeEach(() => {
    waitsForPromise(async () => {
      const tmpFixturesDir = await fixtures.copyFixture('.', __dirname);
      dir1 = pathModule.join(tmpFixturesDir, 'dir1');
      fooTxt = pathModule.join(dir1, 'foo.txt');
      dir2 = pathModule.join(tmpFixturesDir, 'dir2');
    });
  });

  afterEach(() => {
    waitsForPromise(async () => {
      store.reset();
      await tempCleanup();
    });
  });

  it('should be initialized with no root keys', () => {
    const rootKeys = store.getRootKeys();
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
    const rootKeys = store.getRootKeys();
    expect(Array.isArray(rootKeys)).toBe(true);
    expect(rootKeys.join('|')).toBe(`${dir1}|${dir2}`);
  });

  it('should expand root keys as they are added', () => {
    const rootKey = pathModule.join(__dirname, 'fixtures') + '/';
    actions.setRootKeys([rootKey]);
    const node = store.getNode(rootKey, rootKey);
    expect(node.isExpanded()).toBe(true);
  });

  it('should consider non-existent keys collapsed', () => {
    const rootKey = pathModule.join(__dirname, 'fixtures') + '/';
    const node = store.getNode(rootKey, rootKey + 'asdf');
    expect(node.isExpanded()).toBe(false);
  });

  it('toggles selected items', () => {
    actions.setRootKeys([dir1]);
    actions.toggleSelectNode(dir1, dir1);
    const node = store.getNode(dir1, dir1);
    expect(node.isSelected()).toBe(true);
    actions.toggleSelectNode(dir1, dir1);
    expect(node.isSelected()).toBe(false);
  });

  it('deselects items in other roots when a single node is selected', () => {
    actions.setRootKeys([dir1, dir2]);
    actions.toggleSelectNode(dir1, dir1);
    const node1 = store.getNode(dir1, dir1);
    const node2 = store.getNode(dir2, dir2);

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
      const selectedNodes = store.getSelectedKeys().toArray();
      expect(selectedNodes).toEqual([dir1, dir2]);
    });

    it('returns selected nodes from a specific root', () => {
      // Convert the `Immutable.Set` to a native `Array` for simpler use w/ Jasmine.
      const selectedNodes = store.getSelectedKeys(dir1).toArray();
      expect(selectedNodes).toEqual([dir1]);
    });
  });

  describe('getSelectedNodes', () => {
    it('returns selected nodes from all roots', () => {
      actions.setRootKeys([dir1, dir2]);
      actions.toggleSelectNode(dir1, dir1);
      actions.toggleSelectNode(dir2, dir2);

      // Convert the `Immutable.Set` to a native `Array` for simpler use w/ Jasmine.
      const selectedNodes = store.getSelectedNodes().map(node => node.nodeKey).toArray();
      expect(selectedNodes).toEqual([dir1, dir2]);
    });

    it('returns an empty Set when no nodes are selected', () => {
      const selectedNodes = store.getSelectedNodes().map(node => node.nodeKey).toArray();
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
      const trackedNode = store.getTrackedNode();
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
          await loadChildKeys(fooTxt, fooTxt);
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

      await loadChildKeys(dir1, dir1);

      expect(store.getChildKeys(dir1, dir1).length).toBe(0);
    });
  });

  it('shows nodes if the pattern changes to no longer match', () => {
    waitsForPromise(async () => {
      actions.setRootKeys([dir1]);
      actions.expandNode(dir1, fooTxt);
      actions.setIgnoredNames(['foo.*']);

      await loadChildKeys(dir1, dir1);

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

      await loadChildKeys(dir1, dir1);

      expect(store.getChildKeys(dir1, dir1).length).toBe(1);
    });
  });

  describe('recovering from failed subscriptions', () => {
    it('fetches children on re-expansion of failed directories', () => {
      waitsForPromise(async () => {
        const unsubscribeableDir = new Directory(dir1);
        // Force subscription to fail to mimic network failure, etc.
        spyOn(unsubscribeableDir, 'onDidChange').andCallFake(() => {
          throw new Error('This error **should** be thrown.');
        });

        // Return the always-fail directory when it is expanded.
        spyOn(FileTreeHelpers, 'getDirectoryByKey').andReturn(unsubscribeableDir);

        actions.setRootKeys([dir1]);
        actions.expandNode(dir1, dir1);
        await loadChildKeys(dir1, dir1);

        // Children should load but the subscription should fail.
        expect(store.getCachedChildKeys(dir1, dir1)).toEqual([fooTxt]);

        // Add a new file, 'bar.baz', for which the store will not get a notification because
        // the subscription failed.
        const barBaz = pathModule.join(dir1, 'bar.baz');
        fs.writeFileSync(barBaz, '');
        await loadChildKeys(dir1, dir1);
        expect(store.getCachedChildKeys(dir1, dir1)).toEqual([fooTxt]);

        // Collapsing and re-expanding a directory should forcibly fetch its children regardless of
        // whether a subscription is possible.
        actions.collapseNode(dir1, dir1);
        actions.expandNode(dir1, dir1);
        await loadChildKeys(dir1, dir1);

        // The subscription should fail again, but the children should be refetched and match the
        // changed structure (i.e. include the new 'bar.baz' file).
        expect(store.getCachedChildKeys(dir1, dir1)).toEqual([barBaz, fooTxt]);
      });
    });
  });

  it('omits vcs-excluded paths', () => {
    waitsForPromise(async () => {
      actions.setRootKeys([dir1]);
      actions.expandNode(dir1, fooTxt);
      actions.setExcludeVcsIgnoredPaths(true);

      const mockRepo = new MockRepository();
      spyOn(store, '_repositoryForPath').andReturn(mockRepo);

      await loadChildKeys(dir1, dir1);
      expect(store.getCachedChildKeys(dir1, dir1).length).toBe(0);
    });
  });

  it('includes vcs-excluded paths when told to', () => {
    waitsForPromise(async () => {
      actions.setRootKeys([dir1]);
      actions.expandNode(dir1, fooTxt);
      actions.setExcludeVcsIgnoredPaths(false);

      const mockRepo = new MockRepository();
      spyOn(store, '_repositoryForPath').andReturn(mockRepo);

      await loadChildKeys(dir1, dir1);
      expect(store.getCachedChildKeys(dir1, dir1).length).toBe(1);
    });
  });

  it('expands deep nested structure of the node', () => {
    waitsForPromise( async () => {
      const map = await buildTempDirTree('dir3/dir31/foo31.txt', 'dir3/dir32/bar32.txt');
      const dir3 = map.get('dir3');
      const dir31 = map.get('dir3/dir31');
      actions.setRootKeys([dir3]);

      // Await **internal-only** API because the public `expandNodeDeep` API does not
      // return the promise that can be awaited on
      await store._expandNodeDeep(dir3, dir3);
      expect(store.getChildKeys(dir31, dir31).length).toBe(1);
    });
  });

  it('collapses deep nested structore', () => {
    waitsForPromise(async () => {
      const map = await buildTempDirTree('dir3/dir31/foo31.txt', 'dir3/dir32/bar32.txt');
      const dir3 = map.get('dir3');
      const dir31 = map.get('dir3/dir31');
      actions.setRootKeys([dir3]);

      // Await **internal-only** API because the public `expandNodeDeep` API does not
      // return the promise that can be awaited on
      await store._expandNodeDeep(dir3, dir3);
      expect(store.isExpanded(dir3, dir31)).toBe(true);
      actions.collapseNodeDeep(dir3, dir3);
      expect(store.isExpanded(dir3, dir31)).toBe(false);
    });
  });

  it('stops expanding after adding 100 items to the tree in BFS order', () => {
    waitsForPromise(async () => {
      const arrFiles = [];
      for (let i = 0; i < 100; i++) {
        arrFiles.push(`dir3/dir31/foo${i}.txt`);
      }
      arrFiles.push('dir3/dir32/bar.txt');

      const map = await buildTempDirTree(...arrFiles);
      const dir3 = map.get('dir3');
      const dir31 = map.get('dir3/dir31');
      const dir32 = map.get('dir3/dir32');
      actions.setRootKeys([dir3]);

      // Await **internal-only** API because the public `expandNodeDeep` API does not
      // return the promise that can be awaited on
      await store._expandNodeDeep(dir3, dir3);
      expect(store.isExpanded(dir3, dir31)).toBe(true);
      expect(store.isExpanded(dir3, dir32)).toBe(false);
    });
  });
});
