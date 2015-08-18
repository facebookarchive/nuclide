'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var FileTreeStore = require('../lib/FileTreeStore');
var FileTreeActions = require('../lib/FileTreeActions');
var pathModule = require('path');

describe('FileTreeStore', () => {
  var store: FileTreeStore = FileTreeStore.getInstance();
  var actions: FileTreeActions = FileTreeActions.getInstance();

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
    store.reset();
  });

  it('should expand root keys as they are added', () => {
    var rootKey = pathModule.join(__dirname, 'fixtures') + '/';
    actions.setRootKeys([rootKey]);
    var node = store.getNode(rootKey, rootKey);
    expect(node.isExpanded()).toBe(true);
    store.reset();
  });

  it('should consider non-existent keys collapsed', () => {
    var rootKey = pathModule.join(__dirname, 'fixtures') + '/';
    var node = store.getNode(rootKey, rootKey + 'asdf');
    expect(node.isExpanded()).toBe(false);
    store.reset();
  });
});
