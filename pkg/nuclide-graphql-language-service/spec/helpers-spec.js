/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {Point} from '../lib/utils/Range';
import {getASTNodeAtPoint, pointToOffset} from '../lib/utils/getASTNodeAtPoint';

import {parse} from 'graphql/language';

const doc = `
query A {
field
}

fragment B on B {
  b
}`;

describe('getASTNodeAtPoint', () => {
  const ast = parse(doc);
  it('gets the node at the beginning', () => {
    const point = new Point(2, 0);
    const node = getASTNodeAtPoint(doc, ast, point);
    expect(node).toBeDefined();
    if (node != null) {
      expect(node.name.value).toEqual('field');
    }
  });

  it('does not find the node before the beginning', () => {
    const point = new Point(0, 0);
    const node = getASTNodeAtPoint(doc, ast, point);
    expect(node).toBeDefined();
    if (node != null) {
      expect(node.kind).toEqual('Document');
    }
  });

  it('gets the node at the end', () => {
    const point = new Point(2, 5);
    const node = getASTNodeAtPoint(doc, ast, point);
    expect(node).toBeDefined();
    if (node != null) {
      expect(node.name.value).toEqual('field');
    }
  });

  it('does not find the node after the end', () => {
    const point = new Point(4, 0);
    const node = getASTNodeAtPoint(doc, ast, point);
    expect(node).toBeDefined();
    if (node != null) {
      expect(node.kind).toEqual('Document');
    }
  });
});

describe('pointToOffset', () => {
  it('works for single lines', () => {
    const text = 'lorem';
    expect(pointToOffset(text, new Point(0, 2))).toEqual(2);
  });

  it('takes EOL into account', () => {
    const text = 'lorem\n';
    expect(
      pointToOffset(text, new Point(1, 0)),
    ).toEqual(
      text.length,
    );
  });
});
