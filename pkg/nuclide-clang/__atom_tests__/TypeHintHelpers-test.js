"use strict";

var _atom = require("atom");

function _libclang() {
  const data = _interopRequireDefault(require("../lib/libclang"));

  _libclang = function () {
    return data;
  };

  return data;
}

function _TypeHintHelpers() {
  const data = _interopRequireDefault(require("../lib/TypeHintHelpers"));

  _TypeHintHelpers = function () {
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
describe('TypeHintHelpers', () => {
  const mockEditor = null;
  let mockDeclaration;
  beforeEach(() => {
    jest.spyOn(_libclang().default, 'getDeclaration').mockImplementation(async () => mockDeclaration);
  });
  it('can return a typehint', async () => {
    mockDeclaration = {
      type: 'test',
      extent: new _atom.Range([0, 0], [1, 1])
    };
    const hint = await _TypeHintHelpers().default.typeHint(mockEditor, new _atom.Point(0, 0));
    expect(hint).toEqual({
      hint: [{
        type: 'snippet',
        value: 'test'
      }],
      range: new _atom.Range(new _atom.Point(0, 0), new _atom.Point(1, 1))
    });
  });
  it('truncates lengthy typehints', async () => {
    mockDeclaration = {
      type: 'a'.repeat(512),
      extent: new _atom.Range([0, 0], [1, 1])
    };
    const hint = await _TypeHintHelpers().default.typeHint(mockEditor, new _atom.Point(0, 0));
    expect(hint).toEqual({
      hint: [{
        type: 'snippet',
        value: 'a'.repeat(256) + '...'
      }],
      range: new _atom.Range(new _atom.Point(0, 0), new _atom.Point(1, 1))
    });
  });
  it('returns null when typehints are unavailable', async () => {
    mockDeclaration = {
      type: null,
      extent: {
        range: new _atom.Range([0, 0], [1, 1])
      }
    };
    const hint = await _TypeHintHelpers().default.typeHint(mockEditor, new _atom.Point(0, 0));
    expect(hint).toBe(null);
  });
});