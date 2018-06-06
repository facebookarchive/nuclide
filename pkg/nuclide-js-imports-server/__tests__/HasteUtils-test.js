'use strict';

var _nullthrows;

function _load_nullthrows() {
  return _nullthrows = _interopRequireDefault(require('nullthrows'));
}

var _HasteUtils;

function _load_HasteUtils() {
  return _HasteUtils = require('../src/lib/HasteUtils');
}

var _AutoImportsManager;

function _load_AutoImportsManager() {
  return _AutoImportsManager = require('../src/lib/AutoImportsManager');
}

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

describe('getHasteName', () => {
  it('returns null for non-haste files', () => {
    const ast = (0, (_nullthrows || _load_nullthrows()).default)((0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)('export function f() {}'));
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/test.js', ast, {
      isHaste: true,
      useNameReducers: false,
      nameReducers: [],
      nameReducerWhitelist: [],
      nameReducerBlacklist: []
    })).toBe(null);
  });

  it('special-cases mocks', () => {
    const ast = (0, (_nullthrows || _load_nullthrows()).default)((0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)('/* @providesModule asdfasdf */'));
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/__mocks__/test.mock.js', ast, {
      isHaste: true,
      useNameReducers: false,
      nameReducers: [],
      nameReducerWhitelist: [],
      nameReducerBlacklist: []
    })).toBe('test');
  });

  it('detects @providesModule', () => {
    const ast = (0, (_nullthrows || _load_nullthrows()).default)((0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)('/* @providesModule test1234\nblah */ export function f() {}'));
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/test.js', ast, {
      isHaste: true,
      useNameReducers: false,
      nameReducers: [],
      nameReducerWhitelist: [],
      nameReducerBlacklist: []
    })).toBe('test1234');
  });

  it('uses name reducers', () => {
    const ast = (0, (_nullthrows || _load_nullthrows()).default)((0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)('export function f() {}'));
    const providesModuleAst = (0, (_nullthrows || _load_nullthrows()).default)((0, (_AutoImportsManager || _load_AutoImportsManager()).parseFile)('/* @providesModule test1234\nblah */ export function f() {}'));
    const hasteSettings = {
      isHaste: true,
      useNameReducers: true,
      nameReducers: [
      // basename
      { regexp: /^.*\/([a-zA-Z0-9$_.-]+\.js(\.flow)?)$/, replacement: '$1' },
      // strip .js or .js.flow suffix
      { regexp: /^(.*)\.js(\.flow)?$/, replacement: '$1' }],
      nameReducerWhitelist: [/\/a\/.*/],
      nameReducerBlacklist: [/\/a\/b\/.*/]
    };
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/a/test.js', ast, hasteSettings)).toBe('test');
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/a/test2.js.flow', ast, hasteSettings)).toBe('test2');
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/a/b/test.js', ast, hasteSettings)).toBe(null);
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/b/test.js', ast, hasteSettings)).toBe(null);

    // Falls back to @providesModule, even when blacklisted.
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/b/test.js', providesModuleAst, hasteSettings)).toBe('test1234');

    // No whitelist = everything
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/c/test.js', ast, Object.assign({}, hasteSettings, {
      nameReducerWhitelist: []
    }))).toBe('test');

    // Test default reducer
    expect((0, (_HasteUtils || _load_HasteUtils()).getHasteName)('/a/test.js', ast, Object.assign({}, hasteSettings, { nameReducers: [] }))).toBe('test');
  });
}); /**
     * Copyright (c) 2015-present, Facebook, Inc.
     * All rights reserved.
     *
     * This source code is licensed under the license found in the LICENSE file in
     * the root directory of this source tree.
     *
     *  strict-local
     * @format
     */