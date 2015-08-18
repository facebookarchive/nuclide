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

describe('FileTreeStore', () => {
  var store: FileTreeStore = FileTreeStore.getInstance();
  var actions: FileTreeActions = FileTreeActions.getInstance();

  it('should be initialized with no root keys', () => {
    var rootKeys = store.getRootKeys();
    expect(Array.isArray(rootKeys)).toBe(true);
    expect(rootKeys.length).toBe(0);
  });

  it('should update root keys via actions', () => {
    actions.setRootKeys(['/foo/', '/bar/']);
    var rootKeys = store.getRootKeys();
    expect(Array.isArray(rootKeys)).toBe(true);
    expect(rootKeys.join('|')).toBe('/foo/|/bar/');
  });

  it('should expand root keys as they are added', () => {
    var rootKey = '/asdf/';
    actions.setRootKeys([rootKey]);
    var node = store.getNode(rootKey, rootKey);
    expect(node.isExpanded()).toBe(true);
  });

  it('should consider non-existent keys collapsed', () => {
    var node = store.getNode('/a/', '/a/b/c/');
    expect(node.isExpanded()).toBe(false);
  });
});
