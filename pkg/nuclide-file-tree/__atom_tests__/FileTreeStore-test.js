"use strict";

var _atom = require("atom");

function _FileTreeActions() {
  const data = _interopRequireDefault(require("../lib/FileTreeActions"));

  _FileTreeActions = function () {
    return data;
  };

  return data;
}

function _FileTreeHelpers() {
  const data = _interopRequireDefault(require("../lib/FileTreeHelpers"));

  _FileTreeHelpers = function () {
    return data;
  };

  return data;
}

function _FileTreeStore() {
  const data = _interopRequireDefault(require("../lib/FileTreeStore"));

  _FileTreeStore = function () {
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

function _nuclideTestHelpers() {
  const data = require("../../nuclide-test-helpers");

  _nuclideTestHelpers = function () {
    return data;
  };

  return data;
}

var _fs = _interopRequireDefault(require("fs"));

function _nuclideUri() {
  const data = _interopRequireDefault(require("../../../modules/nuclide-commons/nuclideUri"));

  _nuclideUri = function () {
    return data;
  };

  return data;
}

var _path = _interopRequireDefault(require("path"));

function _waits_for() {
  const data = _interopRequireDefault(require("../../../jest/waits_for"));

  _waits_for = function () {
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

class MockRepository {
  isProjectAtRoot() {
    return true;
  }

  isPathIgnored() {
    return true;
  }

}

describe('FileTreeStore', () => {
  let dir1 = '';
  let fooTxt = '';
  let dir2 = '';
  const store = new (_FileTreeStore().default)();
  const actions = new (_FileTreeActions().default)(store);
  /*
   * Trigger the fetch through the **internal-only** API. Enables the
   * tests to await loading children.
   */

  function loadChildKeys(rootKey, nodeKey) {
    return store._getLoading(nodeKey) || Promise.resolve();
  }

  function getNode(rootKey, nodeKey) {
    const node = Selectors().getNode(store, rootKey, nodeKey);

    if (!node) {
      throw new Error("Invariant violation: \"node\"");
    }

    return node;
  }

  function shownChildren(rootKey, nodeKey) {
    const node = getNode(rootKey, nodeKey);
    return node.children.filter(n => n.shouldBeShown).valueSeq().toArray();
  }

  function isExpanded(rootKey, nodeKey) {
    return getNode(rootKey, nodeKey).isExpanded;
  }

  beforeEach(async () => {
    actions.reset();
    await tempCleanup();
    jest.clearAllMocks();
    jest.resetAllMocks();
    const tmpFixturesDir = await (0, _nuclideTestHelpers().copyFixture)('.', _path.default.resolve(__dirname, '../__mocks__'));
    dir1 = _nuclideUri().default.join(tmpFixturesDir, 'dir1/');
    fooTxt = _nuclideUri().default.join(dir1, 'foo.txt');
    dir2 = _nuclideUri().default.join(tmpFixturesDir, 'dir2/');
  });
  it('should be initialized with no root keys', () => {
    const rootKeys = Selectors().getRootKeys(store);
    expect(Array.isArray(rootKeys)).toBe(true);
    expect(rootKeys.length).toBe(0);
  });
  describe('isEmpty', () => {
    it('returns true when the store is empty, has no roots', () => {
      expect(Selectors().isEmpty(store)).toBe(true);
    });
    it('returns false when the store has data, has roots', () => {
      actions.setRootKeys([dir1]);
      expect(Selectors().isEmpty(store)).toBe(false);
    });
  });
  it('should update root keys via actions', () => {
    actions.setRootKeys([dir1, dir2]);
    const rootKeys = Selectors().getRootKeys(store);
    expect(Array.isArray(rootKeys)).toBe(true);
    expect(rootKeys.join('|')).toBe(`${dir1}|${dir2}`);
  });
  it('should expand root keys as they are added', () => {
    const rootKey = _nuclideUri().default.join(__dirname, 'fixtures') + '/';
    actions.setRootKeys([rootKey]);
    const node = getNode(rootKey, rootKey);
    expect(node.isExpanded).toBe(true);
  });
  it('toggles selected items', () => {
    actions.setRootKeys([dir1]);
    actions.setSelectedNode(dir1, dir1);
    let node = getNode(dir1, dir1);
    expect(node.isSelected()).toBe(true);
    actions.unselectNode(dir1, dir1);
    node = getNode(dir1, dir1);
    expect(node.isSelected()).toBe(false);
  });
  it('deselects items in other roots when a single node is selected', () => {
    actions.setRootKeys([dir1, dir2]);
    actions.setSelectedNode(dir1, dir1);
    let node1 = getNode(dir1, dir1);
    let node2 = getNode(dir2, dir2); // Node 1 is selected, node 2 is not selected

    expect(node1.isSelected()).toBe(true);
    expect(node2.isSelected()).toBe(false); // Selecting a single node, node2, deselects nodes in all other roots

    actions.setSelectedNode(dir2, dir2);
    node1 = getNode(dir1, dir1);
    node2 = getNode(dir2, dir2);
    expect(node1.isSelected()).toBe(false);
    expect(node2.isSelected()).toBe(true);
  });
  describe('getSelectedNodes', () => {
    it('returns selected nodes from all roots', () => {
      actions.setRootKeys([dir1, dir2]);
      actions.addSelectedNode(dir1, dir1);
      actions.addSelectedNode(dir2, dir2); // Convert the `Immutable.Set` to a native `Array` for simpler use w/ Jasmine.

      const selectedNodes = Selectors().getSelectedNodes(store).map(node => node.uri).toArray();
      expect(selectedNodes).toEqual([dir1, dir2]);
    });
    it('returns an empty Set when no nodes are selected', () => {
      const selectedNodes = Selectors().getSelectedNodes(store).map(node => node.uri).toArray();
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
      expect(Selectors().getSingleSelectedNode(store)).toBeNull();
    });
    it('returns null when more than 1 node is selected', () => {
      actions.addSelectedNode(dir1, dir1);
      actions.addSelectedNode(dir2, dir2);
      expect(Selectors().getSingleSelectedNode(store)).toBeNull();
    });
    it('returns a node when only 1 is selected', () => {
      actions.setSelectedNode(dir2, dir2);
      const singleSelectedNode = Selectors().getSingleSelectedNode(store);
      expect(singleSelectedNode).not.toBeNull();

      if (!singleSelectedNode) {
        throw new Error("Invariant violation: \"singleSelectedNode\"");
      }

      expect(singleSelectedNode.uri).toEqual(dir2);
    });
  });
  describe('getRootForPath', () => {
    beforeEach(async () => {
      actions.setRootKeys([dir1, dir2]);
      actions.expandNode(dir1, fooTxt);
      await loadChildKeys(dir1, dir1);
    });
    it('returns null if path does not belong to any root', () => {
      expect(Selectors().getRootForPath(store, 'random/path/file.txt')).toBeNull();
    });
    it('returns a root node if path exists in a root', () => {
      const node = Selectors().getRootForPath(store, fooTxt);
      expect(node).not.toBeNull();

      if (!node) {
        throw new Error("Invariant violation: \"node\"");
      }

      expect(node.uri).toEqual(dir1);
    });
  });
  describe('trackedNode', () => {
    it('resets when there is a new selection', () => {
      actions.setRootKeys([dir1]);
      actions.setTrackedNode(dir1, dir1); // Root is tracked after setting it.

      const trackedNode = Selectors().getTrackedNode(store);
      expect(trackedNode && trackedNode.uri).toBe(dir1);
      actions.setSelectedNode(dir1, dir1); // New selection, which happens on user interaction via select and collapse, resets the
      // tracked node.

      expect(Selectors().getTrackedNode(store)).toBe(getNode(dir1, dir1));
    });
  });
  describe('getChildKeys', () => {
    it("clears loading and expanded states when there's an error fetching children", async () => {
      jest.spyOn(_FileTreeHelpers().default, 'fetchChildren').mockImplementation(() => {
        return Promise.reject(new Error('This error **should** be thrown.'));
      });
      actions.setRootKeys([dir1]);
      let node = getNode(dir1, dir1);
      expect(node.isExpanded).toBe(true);
      expect(node.isLoading).toBe(true);

      try {
        await loadChildKeys(dir1, dir1);
      } catch (e) {// This will always throw an exception, but that's irrelevant to this test. The side
        // effects after this try/catch capture the purpose of this test.
      } finally {
        // $FlowFixMe
        _FileTreeHelpers().default.fetchChildren.mockRestore();
      }

      node = getNode(dir1, dir1);
      expect(node.isExpanded).toBe(false);
      expect(node.isLoading).toBe(false);
    });
  });
  describe('this._filter', () => {
    let node;
    beforeEach(() => {
      actions.setRootKeys([dir1]);
      node = getNode(dir1, dir1);
    });

    function checkNode(name, matches) {
      node = getNode(dir1, dir1);
      expect(node.highlightedText).toEqual(name);
      expect(node.matchesFilter).toEqual(matches);
    }

    function updateFilter() {
      expect(Selectors().getFilter(store)).toEqual('');
      actions.setRootKeys([dir1]);
      checkNode('', true);
      actions.addFilterLetter(node.name);
      expect(Selectors().getFilter(store)).toEqual(node.name);
      checkNode(node.name, true);
    }

    function doubleFilter() {
      updateFilter();
      actions.addFilterLetter(node.name);
      expect(Selectors().getFilter(store)).toEqual(node.name + node.name);
      checkNode('', false);
    }

    function clearFilter() {
      updateFilter();
      actions.addFilterLetter('t');
      checkNode('', false);
      actions.clearFilter();
      checkNode('', true);
    }

    it('should update when a letter is added', () => {
      updateFilter();
      actions.clearFilter();
    });
    it('should not match when filter does not equal name', () => {
      doubleFilter();
      actions.clearFilter();
    });
    it('should clear the filter, and return matching to normal', () => {
      node = getNode(dir1, dir1);
      clearFilter();
    });
    it('should remove filter letter', () => {
      updateFilter();
      actions.removeFilterLetter();
      checkNode(node.name.substr(0, node.name.length - 1), true);
      actions.clearFilter();
    });
  });
  it('omits hidden nodes', async () => {
    actions.setRootKeys([dir1]);
    actions.expandNode(dir1, fooTxt);
    actions.setIgnoredNames(['foo.*']);
    await loadChildKeys(dir1, dir1);
    expect(shownChildren(dir1, dir1).length).toBe(0);
  });
  it('shows nodes if the pattern changes to no longer match', async () => {
    actions.setRootKeys([dir1]);
    actions.expandNode(dir1, fooTxt);
    actions.setIgnoredNames(['foo.*']);
    await loadChildKeys(dir1, dir1);
    actions.setIgnoredNames(['bar.*']);
    expect(shownChildren(dir1, dir1).length).toBe(1);
  });
  it('obeys the hideIgnoredNames setting', async () => {
    actions.setRootKeys([dir1]);
    actions.expandNode(dir1, fooTxt);
    actions.setIgnoredNames(['foo.*']);
    actions.setHideIgnoredNames(false);
    await loadChildKeys(dir1, dir1);
    expect(shownChildren(dir1, dir1).length).toBe(1);
  });
  describe('recovering from failed subscriptions', () => {
    it('fetches children on re-expansion of failed directories', async () => {
      const unsubscribeableDir = new _atom.Directory(dir1); // Force subscription to fail to mimic network failure, etc.

      jest.spyOn(unsubscribeableDir, 'onDidChange').mockImplementation(() => {
        throw new Error('This error **should** be thrown.');
      }); // Return the always-fail directory when it is expanded.

      jest.spyOn(_FileTreeHelpers().default, 'getDirectoryByKey').mockReturnValue(unsubscribeableDir);
      actions.setRootKeys([dir1]);
      actions.expandNode(dir1, dir1);
      await loadChildKeys(dir1, dir1); // Children should load but the subscription should fail.

      expect(shownChildren(dir1, dir1).map(n => n.uri)).toEqual([fooTxt]); // Add a new file, 'bar.baz', for which the store will not get a notification because
      // the subscription failed.

      const barBaz = _nuclideUri().default.join(dir1, 'bar.baz');

      _fs.default.writeFileSync(barBaz, '');

      await loadChildKeys(dir1, dir1);
      expect(shownChildren(dir1, dir1).map(n => n.uri)).toEqual([fooTxt]); // Collapsing and re-expanding a directory should forcibly fetch its children regardless of
      // whether a subscription is possible.

      actions.collapseNode(dir1, dir1);
      actions.expandNode(dir1, dir1);
      await loadChildKeys(dir1, dir1); // The subscription should fail again, but the children should be refetched and match the
      // changed structure (i.e. include the new 'bar.baz' file).

      expect(shownChildren(dir1, dir1).map(n => n.uri)).toEqual([barBaz, fooTxt]); // $FlowFixMe

      _FileTreeHelpers().default.getDirectoryByKey.mockRestore();
    });
  });
  it('omits vcs-excluded paths', async () => {
    actions.setRootKeys([dir1]);
    actions.expandNode(dir1, fooTxt);
    actions.setExcludeVcsIgnoredPaths(true);
    actions.setHideVcsIgnoredPaths(true);
    const mockRepo = new MockRepository();

    store._updateConf(conf => {
      conf.reposByRoot[dir1] = mockRepo;
    });

    await loadChildKeys(dir1, dir1);
    expect(shownChildren(dir1, dir1).length).toBe(0);
  });
  it('includes vcs-excluded paths when told to', async () => {
    actions.setRootKeys([dir1]);
    actions.expandNode(dir1, fooTxt);
    actions.setExcludeVcsIgnoredPaths(false);
    actions.setHideVcsIgnoredPaths(false);
    const mockRepo = new MockRepository();

    store._updateConf(conf => {
      conf.reposByRoot[dir1] = mockRepo;
    });

    await loadChildKeys(dir1, dir1);
    expect(shownChildren(dir1, dir1).length).toBe(1);
  });
  it('includes vcs-excluded paths when explicitly told to', async () => {
    actions.setRootKeys([dir1]);
    actions.expandNode(dir1, fooTxt);
    actions.setExcludeVcsIgnoredPaths(true);
    actions.setHideVcsIgnoredPaths(false);
    const mockRepo = new MockRepository();

    store._updateConf(conf => {
      conf.reposByRoot[dir1] = mockRepo;
    });

    await loadChildKeys(dir1, dir1);
    expect(shownChildren(dir1, dir1).length).toBe(1);
  });
  it('expands deep nested structure of the node', async () => {
    await (async () => {
      const map = await (0, _BuildTempDirTree().buildTempDirTree)('dir3/dir31/foo31.txt', 'dir3/dir32/bar32.txt');
      const dir3 = map.get('dir3');
      const dir31 = map.get('dir3/dir31'); // flowlint-next-line sketchy-null-string:off

      if (!(dir3 && dir31)) {
        throw new Error("Invariant violation: \"dir3 && dir31\"");
      }

      actions.setRootKeys([dir3]); // Await **internal-only** API because the public `expandNodeDeep` API does not
      // return the promise that can be awaited on

      await store._expandNodeDeep(dir3, dir3);
      expect(shownChildren(dir3, dir31).length).toBe(1);
    })();
  });
  it('collapses deep nested structore', async () => {
    await (async () => {
      const map = await (0, _BuildTempDirTree().buildTempDirTree)('dir3/dir31/foo31.txt', 'dir3/dir32/bar32.txt');
      const dir3 = map.get('dir3');
      const dir31 = map.get('dir3/dir31'); // flowlint-next-line sketchy-null-string:off

      if (!(dir3 && dir31)) {
        throw new Error("Invariant violation: \"dir3 && dir31\"");
      }

      actions.setRootKeys([dir3]); // Await **internal-only** API because the public `expandNodeDeep` API does not
      // return the promise that can be awaited on

      await store._expandNodeDeep(dir3, dir3);
      expect(isExpanded(dir3, dir31)).toBe(true);
      actions.collapseNodeDeep(dir3, dir3);
      expect(isExpanded(dir3, dir31)).toBe(false);
    })();
  });
  it('stops expanding after adding 100 items to the tree in BFS order', async () => {
    await (async () => {
      const arrFiles = [];

      for (let i = 0; i < 100; i++) {
        arrFiles.push(`dir3/dir31/foo${i}.txt`);
      }

      arrFiles.push('dir3/dir32/bar.txt');
      const map = await (0, _BuildTempDirTree().buildTempDirTree)(...arrFiles);
      const dir3 = map.get('dir3');
      const dir31 = map.get('dir3/dir31');
      const dir32 = map.get('dir3/dir32'); // flowlint-next-line sketchy-null-string:off

      if (!(dir3 && dir31 && dir32)) {
        throw new Error("Invariant violation: \"dir3 && dir31 && dir32\"");
      }

      actions.setRootKeys([dir3]); // Await **internal-only** API because the public `expandNodeDeep` API does not
      // return the promise that can be awaited on

      await store._expandNodeDeep(dir3, dir3);
      expect(isExpanded(dir3, dir31)).toBe(true);
      expect(isExpanded(dir3, dir32)).toBe(false);
    })();
  });
  it('should be able to add, remove, then re-add a file', async () => {
    const foo2Txt = _nuclideUri().default.join(dir1, 'foo2.txt');

    actions.setRootKeys([dir1]);
    actions.expandNode(dir1, dir1);
    await loadChildKeys(dir1, dir1);

    _fs.default.writeFileSync(foo2Txt, ''); // Wait for the new file to be loaded.


    await (0, _waits_for().default)(() => Boolean(Selectors().getNode(store, dir1, foo2Txt))); // Ensure the child did not inherit the parent subscription.

    const child = getNode(dir1, foo2Txt);
    expect(child.subscription).toBe(null);

    _fs.default.unlinkSync(foo2Txt); // Ensure that file disappears from the tree.


    await (0, _waits_for().default)(() => Selectors().getNode(store, dir1, foo2Txt) == null); // Add the file back.

    _fs.default.writeFileSync(foo2Txt, ''); // Wait for the new file to be loaded.


    await (0, _waits_for().default)(() => Boolean(Selectors().getNode(store, dir1, foo2Txt)));
  });
});