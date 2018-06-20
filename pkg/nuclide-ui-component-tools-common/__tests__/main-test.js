'use strict';

var _;

function _load_() {
  return _ = require('..');
}

var _uiComponentAst;

function _load_uiComponentAst() {
  return _uiComponentAst = require('../lib/uiComponentAst');
}

var _common;

function _load_common() {
  return _common = require('../__mocks__/common');
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
 */

describe('getComponentNameFromUri', () => {
  it('returns null', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).getComponentNameFromUri)('')).toBeNull();
  });

  it('returns a component name', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).getComponentNameFromUri)('/foo/bar/Component.react.js')).toBe('Component');
  });

  it('returns a component name for identity path', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).getComponentNameFromUri)('Component')).toBe('Component');
  });
});

describe('getComponentDefinitionFromAst', () => {
  it('returns a valid component definition', () => {
    const ast = (0, (_uiComponentAst || _load_uiComponentAst()).parseCode)((_common || _load_common()).BASIC_FDSTEST_COMPONENT_WITH_PROPS_SOURCE);

    if (!ast) {
      throw new Error('Invariant violation: "ast"');
    }

    const definition = (0, (_ || _load_()).getComponentDefinitionFromAst)('foo/bar/FDSTest.react.js', ast);

    if (!definition) {
      throw new Error('Invariant violation: "definition"');
    }

    expect(definition.name).toBe('FDSTest');
    expect(definition.requiredProps.length).toBe(2);
    expect(definition.defaultProps.length).toBe(2);
    expect(definition.leadingComment).toBe(`@explorer-desc

Test!`);
  });
});