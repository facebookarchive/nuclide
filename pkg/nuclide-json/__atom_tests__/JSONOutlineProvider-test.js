"use strict";

var _atom = require("atom");

function _JSONOutlineProvider() {
  const data = require("../lib/JSONOutlineProvider");

  _JSONOutlineProvider = function () {
    return data;
  };

  return data;
}

/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
describe('getOutline', () => {
  it('should outline the top-level properties of an object', () => {
    const json = '{"foo": {"subobj": 5}, "bar": 6}';
    const outline = (0, _JSONOutlineProvider().getOutline)(json);

    if (!(outline != null)) {
      throw new Error("Invariant violation: \"outline != null\"");
    }

    const outlineTrees = outline.outlineTrees;
    expect(outlineTrees.length).toBe(2);
    expect(outlineTrees[0].plainText).toEqual('foo');
    expect(outlineTrees[0].startPosition).toEqual(new _atom.Point(0, 1));
    expect(outlineTrees[0].endPosition).toEqual(new _atom.Point(0, 21));
    expect(outlineTrees[0].children.length).toEqual(0);
    expect(outlineTrees[1].plainText).toEqual('bar');
    expect(outlineTrees[1].startPosition).toEqual(new _atom.Point(0, 23));
    expect(outlineTrees[1].endPosition).toEqual(new _atom.Point(0, 31));
    expect(outlineTrees[1].children.length).toEqual(0);
  });
  it('should skip non-standard property names', () => {
    // This won't be valid JSON, but since we are using a real JS parser we need to make sure that
    // this sort of input doesn't do really weird stuff.
    const json = '{"foo": 5, [5 + 3]: 3, "bar": 2, 3: 4}';
    const outline = (0, _JSONOutlineProvider().getOutline)(json);

    if (!(outline != null)) {
      throw new Error("Invariant violation: \"outline != null\"");
    }

    const outlineTrees = outline.outlineTrees;
    expect(outlineTrees.length).toBe(2);
    expect(outlineTrees[0].plainText).toEqual('foo');
    expect(outlineTrees[0].startPosition).toEqual(new _atom.Point(0, 1));
    expect(outlineTrees[0].endPosition).toEqual(new _atom.Point(0, 9));
    expect(outlineTrees[0].children.length).toEqual(0);
    expect(outlineTrees[1].plainText).toEqual('bar');
    expect(outlineTrees[1].startPosition).toEqual(new _atom.Point(0, 23));
    expect(outlineTrees[1].endPosition).toEqual(new _atom.Point(0, 31));
    expect(outlineTrees[1].children.length).toEqual(0);
  });
  it('should return null on a syntax error', () => {
    // This is kind of sad but the babel-core parser doesn't seem to do any error recovery.
    expect((0, _JSONOutlineProvider().getOutline)('{')).toBeNull();
  });
  it('should return null if there is not a top-level object', () => {
    expect((0, _JSONOutlineProvider().getOutline)('[]')).toBeNull();
  });
});