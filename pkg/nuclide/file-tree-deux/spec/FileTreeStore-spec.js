'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var FileTreeActions = require('../lib/FileTreeActions');
var FileTreeStore = require('../lib/FileTreeStore');

var pathModule = require('path');

describe('FileTreeStore', () => {
  var actions: FileTreeActions = FileTreeActions.getInstance();
  var store: FileTreeStore = FileTreeStore.getInstance();

  afterEach(() => {
    store.reset();
  });

  it('should be initialized with no root keys', () => {
    var rootKeys = store.getRootKeys();
    expect(Array.isArray(rootKeys)).toBe(true);
    expect(rootKeys.length).toBe(0);
  });

  it('should update root keys via actions', () => {
    var dir1 = pathModule.join(__dirname, 'fixtures/dir1') + '/';
    var dir2 = pathModule.join(__dirname, 'fixtures/dir2') + '/';
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
    var dir1 = pathModule.join(__dirname, 'fixtures/dir1') + '/';
    actions.setRootKeys([dir1]);
    actions.toggleSelectNode(dir1, dir1);
    var node = store.getNode(dir1, dir1);
    expect(node.isSelected()).toBe(true);
    actions.toggleSelectNode(dir1, dir1);
    expect(node.isSelected()).toBe(false);
  });

  it('deselects items in other roots when a single node is selected', () => {
    var dir1 = pathModule.join(__dirname, 'fixtures/dir1') + '/';
    var dir2 = pathModule.join(__dirname, 'fixtures/dir2') + '/';
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

  describe('getSelectedNodes', () => {
    it('returns selected nodes from all roots', () => {
      var dir1 = pathModule.join(__dirname, 'fixtures/dir1') + '/';
      var dir2 = pathModule.join(__dirname, 'fixtures/dir2') + '/';
      actions.setRootKeys([dir1, dir2]);
      actions.toggleSelectNode(dir1, dir1);
      actions.toggleSelectNode(dir2, dir2);

      // Convert the `Immutable.Set` to a native `Array` for simpler use w/ Jasmine's `toContain`
      // matcher.
      var selectedNodes = store.getSelectedNodes().map(node => node.nodeKey).toArray();

      // Use two `toContain` comparisons because Immutable.Set does not guarantee insertion order.
      expect(selectedNodes).toContain(dir1);
      expect(selectedNodes).toContain(dir2);
    });

    it('returns an empty Set when no nodes are selected', () => {
      var selectedNodes = store.getSelectedNodes().map(node => node.nodeKey).toArray();
      expect(selectedNodes).toEqual([]);
    });
  });

  describe('trackedNode', () => {
    it('resets when there is a new selection', () => {
      var dir1 = pathModule.join(__dirname, 'fixtures/dir1') + '/';
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
});
