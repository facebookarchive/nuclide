'use strict';

var _atom = require('atom');

var _libclang;

function _load_libclang() {
  return _libclang = _interopRequireDefault(require('../lib/libclang'));
}

var _TypeHintHelpers;

function _load_TypeHintHelpers() {
  return _TypeHintHelpers = _interopRequireDefault(require('../lib/TypeHintHelpers'));
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('TypeHintHelpers', () => {
  const mockEditor = null;
  let mockDeclaration;
  beforeEach(() => {
    jest.spyOn((_libclang || _load_libclang()).default, 'getDeclaration').mockImplementation(async () => mockDeclaration);
  });

  it('can return a typehint', async () => {
    await (async () => {
      mockDeclaration = {
        type: 'test',
        extent: new _atom.Range([0, 0], [1, 1])
      };

      const hint = await (_TypeHintHelpers || _load_TypeHintHelpers()).default.typeHint(mockEditor, new _atom.Point(0, 0));
      expect(hint).toEqual({
        hint: [{ type: 'snippet', value: 'test' }],
        range: new _atom.Range(new _atom.Point(0, 0), new _atom.Point(1, 1))
      });
    })();
  });

  it('truncates lengthy typehints', async () => {
    await (async () => {
      mockDeclaration = {
        type: 'a'.repeat(512),
        extent: new _atom.Range([0, 0], [1, 1])
      };

      const hint = await (_TypeHintHelpers || _load_TypeHintHelpers()).default.typeHint(mockEditor, new _atom.Point(0, 0));
      expect(hint).toEqual({
        hint: [{ type: 'snippet', value: 'a'.repeat(256) + '...' }],
        range: new _atom.Range(new _atom.Point(0, 0), new _atom.Point(1, 1))
      });
    })();
  });

  it('returns null when typehints are unavailable', async () => {
    await (async () => {
      mockDeclaration = {
        type: null,
        extent: { range: new _atom.Range([0, 0], [1, 1]) }
      };

      const hint = await (_TypeHintHelpers || _load_TypeHintHelpers()).default.typeHint(mockEditor, new _atom.Point(0, 0));
      expect(hint).toBe(null);
    })();
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     * 
     * @format
     */