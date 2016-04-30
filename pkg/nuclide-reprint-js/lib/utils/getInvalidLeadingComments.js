'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Node} from 'ast-types-flow';

import Immutable from 'immutable';

/**
 * This traverses an entire ast and determines which trailing comments are
 * duplicates of other leading comments. Comments are invalidated based on
 * their starting position.
 */
function getInvalidLeadingComments(node: Node): Immutable.Set<number> {
  const result = [];
  traverse(node, result);
  return Immutable.Set(result);
}

/**
 * A dumb traversal method. It will break if node contains any sort of
 * circular structure.
 */
function traverse(node: any, result: Array<number>): void {
  if (!node) {
    return;
  }

  if (Object.prototype.toString.call(node) === '[object Object]') {
    if (typeof node.type === 'string') {
      Object.keys(node).forEach(key => {
        const value = node[key];

        // Leading comments are invalid trailing comments.
        if (key === 'innerComments' && value) {
          value.forEach(comment => {
            // Some sanity checks on the comments.
            if (
              comment &&
              typeof comment.type === 'string' &&
              comment.start != null
            ) {
              result.push(comment.start);
            }
          });
        }

        traverse(value, result);
      });
    }
  }

  if (Array.isArray(node)) {
    node.forEach(value => {
      traverse(value, result);
    });
  }
}

module.exports = getInvalidLeadingComments;
