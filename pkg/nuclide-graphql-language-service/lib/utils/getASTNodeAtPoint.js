'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getASTNodeAtPoint = getASTNodeAtPoint;
exports.pointToOffset = pointToOffset;

var _Range;

function _load_Range() {
  return _Range = require('./Range');
}

var _graphql;

function _load_graphql() {
  return _graphql = require('graphql');
}

function getASTNodeAtPoint(query, ast, point) {
  const offset = pointToOffset(query, point);
  let nodeContainingPoint;
  (0, (_graphql || _load_graphql()).visit)(ast, {
    enter(node) {
      if (node.kind !== 'Name' && // We're usually interested in their parents
      node.loc.start <= offset && offset <= node.loc.end) {
        nodeContainingPoint = node;
      } else {
        return false;
      }
    },
    leave(node) {
      if (node.loc.start <= offset && offset <= node.loc.end) {
        return false;
      }
    }
  });
  return nodeContainingPoint;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   */

function pointToOffset(text, point) {
  const linesUntilPoint = text.split('\n').slice(0, point.row);
  return point.column + linesUntilPoint.map(line => line.length + 1).reduce((a, b) => a + b, 0);
}