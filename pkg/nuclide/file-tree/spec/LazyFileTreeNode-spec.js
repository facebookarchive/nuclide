'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */
var LazyFileTreeNode = require('../lib/LazyFileTreeNode');

describe('LazyFileTreeNode', () => {
  describe('getKey', () => {
    xit('only ends with one "/" if the file is a container', () => {
      var node = new LazyFileTreeNode({
          getPath() {
            return '/a/b/';
          },
          isDirectory() {
            return true;
          }});
      expect(node.getKey()).toEqual('/a/b/');
    });

    it('ends with a "/" if the file is a container', () => {
      var node = new LazyFileTreeNode({
          getPath() {
            return '/a/b';
          },
          isDirectory() {
            return true;
          }});
      expect(node.getKey()).toEqual('/a/b/');
    });

    it('does not end with a "/" if the file is not a container', () => {
      var node = new LazyFileTreeNode({
          getPath() {
            return '/a/b';
          },
          isDirectory() {
            return false;
          }});
      expect(node.getKey()).toEqual('/a/b');
    });
  });
});
