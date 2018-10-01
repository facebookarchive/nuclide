"use strict";

var _atom = require("atom");

function _ObjectiveCBracketBalancer() {
  const data = _interopRequireDefault(require("../lib/ObjectiveCBracketBalancer"));

  _ObjectiveCBracketBalancer = function () {
    return data;
  };

  return data;
}

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
const {
  getOpenBracketInsertPosition
} = _ObjectiveCBracketBalancer().default;

describe('ObjectiveCBracketBalancer', () => {
  describe('getOpenBracketInsertPosition', () => {
    it('returns the correct point on a line that contains no space before the close' + ' bracket', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer(']'), _atom.Point.fromObject([0, 0]))).toEqual(_atom.Point.fromObject([0, 0]));
    });
    it('returns the correct point on a line that contains only whitespace before the close' + ' bracket', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('   ]'), _atom.Point.fromObject([0, 3]))).toEqual(_atom.Point.fromObject([0, 3]));
    });
    it('inserts an open bracket at the start of an unbalanced simple expression', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('self setEnabled:NO]'), _atom.Point.fromObject([0, 18]))).toEqual(_atom.Point.fromObject([0, 0]));
    });
    it('does not insert an open bracket when completing a balanced simple expression', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('[self setEnabled:NO]'), _atom.Point.fromObject([0, 19]))).toEqual(null);
    });
    it('inserts an open bracket at the beginning of an unbalanced nested expression', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('[self foo] setEnabled:NO]'), _atom.Point.fromObject([0, 24]))).toEqual(_atom.Point.fromObject([0, 0]));
    });
    it('does not insert an open bracket when completing a balanced nested expression', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('[[self foo] setEnabled:NO]'), _atom.Point.fromObject([0, 25]))).toEqual(null);
    });
    it('inserts an open bracket at the beginning of an unbalanced nested expression with an open' + ' bracket in a string literal', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('[self fooWithBar:@"tricky ["] setEnabled:NO]'), _atom.Point.fromObject([0, 43]))).toEqual(_atom.Point.fromObject([0, 0]));
    });
    it('inserts an open bracket at the beginning of an unbalanced nested expression with an open' + ' bracket in a char literal', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer("[self fooWithBar:'['] setEnabled:NO]"), _atom.Point.fromObject([0, 35]))).toEqual(_atom.Point.fromObject([0, 0]));
    });
    it('does not insert an open bracket at the beginning of a balanced nested expression with an' + ' open bracket in a char literal', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer("[foo('[') setEnabled:NO]"), _atom.Point.fromObject([0, 23]))).toEqual(null);
    });
    it('inserts an open bracket before the nearest expression when within an existing balanced' + ' bracket pair', () => {
      // Start with:  [self setFoo:@"bar" |]
      //                          cursor  ^
      // Type ] and we should insert the [ before @"bar"
      // Ending with: [self setFoo:[@"bar" ]]
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('[self setFoo:@"bar" ]'), _atom.Point.fromObject([0, 20]))).toEqual(_atom.Point.fromObject([0, 13]));
    });
    it('inserts an open bracket at the beginning of an unbalanced expression across multiple lines', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('foo setFoo:@"foo"\nbar:@"bar"\nbaz:@"baz"]'), _atom.Point.fromObject([2, 10]))).toEqual(_atom.Point.fromObject([0, 0]));
    });
    it('does not insert an open bracket at the beginning of a balanced expression across multiple' + ' lines', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('[foo setFoo:@"foo"\nbar:@"bar"\nbaz:@"baz"]'), _atom.Point.fromObject([2, 10]))).toEqual(null);
    });
    it('inserts an open bracket after an equals sign when initalizing or messaging a class', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('NSObject *foo = NSObject alloc]'), _atom.Point.fromObject([0, 30]))).toEqual(_atom.Point.fromObject([0, 16]));
    });
    it('does not insert an open bracket after an equals sign when initalizing or messaging a class' + ' with balanced brackets', () => {
      expect(getOpenBracketInsertPosition(new _atom.TextBuffer('[[NSObject alloc] init]'), _atom.Point.fromObject([0, 22]))).toEqual(null);
    });
  });
});