"use strict";

var _atom = require("atom");

function _ObjectiveCColonIndenter() {
  const data = _interopRequireDefault(require("../lib/ObjectiveCColonIndenter"));

  _ObjectiveCColonIndenter = function () {
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
 *  strict-local
 * @format
 * @emails oncall+nuclide
 */
const {
  getIndentedColonColumn
} = _ObjectiveCColonIndenter().default;

describe('ObjectiveCColonIndenter', () => {
  describe('getIndentedColonColumn', () => {
    it('returns null if no colons are found for a method declaration', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              + (Type *)arg
              arg:`), _atom.Point.fromObject([2, 17]))).toBeNull();
    });
    it('works on class method declarations', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              + (Type *)arg:(Type *)value
              arg:`), _atom.Point.fromObject([2, 17]))).toEqual(27);
    });
    it('works on instance method declarations', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              - (Type *)arg:(Type *)value
              arg:`), _atom.Point.fromObject([2, 17]))).toEqual(27);
    });
    it('returns null for single-line method calls', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer('[obj arg:value :'), _atom.Point.fromObject([0, 15]))).toBeNull();
    });
    it('works on multi-line method calls', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              [obj arg:value
                   arg:value
              arg:`), _atom.Point.fromObject([3, 17]))).toEqual(22);
    });
    it('returns null if no colons are found for a method call', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              [obj arg
              arg:`), _atom.Point.fromObject([2, 17]))).toBeNull();
    });
    it('returns null if no key characters are found', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              obj arg
              arg:`), _atom.Point.fromObject([2, 17]))).toBeNull();
    });
    it('works when the first line of the method has multiple colons', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              [obj arg:value arg:value
              arg:`), _atom.Point.fromObject([2, 17]))).toEqual(22);
    });
    it('works when the previous line is not indented properly', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              [obj arg:value
              arg:value
              arg:`), _atom.Point.fromObject([3, 17]))).toEqual(22);
    });
    it('works when the method is nested and on the same line as the outer method', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              [obj arg:[obj value:
              arg:`), _atom.Point.fromObject([2, 17]))).toEqual(33);
    });
    it('works when a previous argument is a nested method', () => {
      expect(getIndentedColonColumn(new _atom.TextBuffer(`
              [obj arg:[obj arg:value]
              arg:`), _atom.Point.fromObject([2, 17]))).toEqual(22);
    });
  });
});