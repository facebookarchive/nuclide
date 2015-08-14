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

  it('should be initialized', () => {
    var rootDirectories = store.get('rootDirectories');
    expect(Array.isArray(rootDirectories)).toBe(true);
    expect(rootDirectories.length).toBe(0);
    expect(store.get('foo')).toBe(undefined);
  });

  it('should get updated via actions', () => {
    actions.setRootDirectories(['a', 'b']);
    var rootDirectories = store.get('rootDirectories');
    expect(Array.isArray(rootDirectories)).toBe(true);
    expect(rootDirectories.join(',')).toBe('a,b');
  });
});
