'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type LazyTreeNode from '../lib/LazyTreeNode';

var LazyTestTreeNode = require('./LazyTestTreeNode');

describe('LazyTreeNode', () => {
  it('caches the fetched children', () => {
    waitsForPromise(async () => {
      var children = null;
      async function fetchChildren(parentNode: LazyTreeNode): Promise<Array<LazyTreeNode>> {
        children = [
          new LazyTestTreeNode({label: 'B'}, /* parent */ parentNode, false),
          new LazyTestTreeNode({label: 'C'}, /* parent */ parentNode, false),
        ];
        return children;
      }
      var node = new LazyTestTreeNode({label: 'A'}, /* parent */ null, true, fetchChildren);

      expect(await node.fetchChildren()).toEqual(children);
      expect(node.getCachedChildren()).toEqual(children);
    });
  });

  describe('isRoot', () => {
    it('returns true for a root', () => {
      waitsForPromise(async () => {
        var children = null;
        async function fetchChildren(parentNode: LazyTreeNode): Promise<Array<LazyTreeNode>> {
          children = [
            new LazyTestTreeNode({label: 'B'}, /* parent */ parentNode, false),
            new LazyTestTreeNode({label: 'C'}, /* parent */ parentNode, false),
          ];
          return children;
        }
        var node = new LazyTestTreeNode({label: 'A'}, /* parent */ null, true, fetchChildren);
        expect(await node.fetchChildren()).toEqual(children);
        expect(node.isRoot()).toBe(true);
      });
    });
    it('returns false for a fetched, non-root node', () => {
      waitsForPromise(async () => {
        var children = null;
        async function fetchChildren(parentNode: LazyTreeNode): Promise<Array<LazyTreeNode>> {
          children = [
            new LazyTestTreeNode({label: 'B'}, /* parent */ parentNode, false),
            new LazyTestTreeNode({label: 'C'}, /* parent */ parentNode, false),
          ];
          return children;
        }
        var node = new LazyTestTreeNode({label: 'A'}, /* parent */ null, true, fetchChildren);
        expect(await node.fetchChildren()).toEqual(children);
        expect(node.getCachedChildren()[0].isRoot()).toBe(false);
      });
    });
  });
});
