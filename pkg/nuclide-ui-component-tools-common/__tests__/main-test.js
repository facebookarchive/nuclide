"use strict";

function _() {
  const data = require("..");

  _ = function () {
    return data;
  };

  return data;
}

function _uiComponentAst() {
  const data = require("../lib/uiComponentAst");

  _uiComponentAst = function () {
    return data;
  };

  return data;
}

function _common() {
  const data = require("../__fixtures__/common");

  _common = function () {
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
describe('getComponentNameFromUri', () => {
  it('returns null', () => {
    expect((0, _uiComponentAst().getComponentNameFromUri)('')).toBeNull();
  });
  it('returns a component name', () => {
    expect((0, _uiComponentAst().getComponentNameFromUri)('/foo/bar/Component.react.js')).toBe('Component');
  });
  it('returns null for invalid path', () => {
    expect((0, _uiComponentAst().getComponentNameFromUri)('Component')).toBeNull();
    expect((0, _uiComponentAst().getComponentNameFromUri)('Component.react.example.js')).toBeNull();
    expect((0, _uiComponentAst().getComponentNameFromUri)('Component.js')).toBeNull();
  });
});
describe('getComponentDefinitionFromAst', () => {
  it('returns a valid component definition', () => {
    const ast = (0, _uiComponentAst().parseCode)(_common().BASIC_FDSTEST_COMPONENT_WITH_PROPS_SOURCE);

    if (!ast) {
      throw new Error("Invariant violation: \"ast\"");
    }

    const definition = (0, _().getComponentDefinitionFromAst)('foo/bar/FDSTest.react.js', ast);

    if (!definition) {
      throw new Error("Invariant violation: \"definition\"");
    }

    expect(definition.name).toBe('FDSTest');
    expect(definition.requiredProps.length).toBe(2);
    expect(definition.defaultProps.length).toBe(2);
    expect(definition.leadingComment).toBe(`@explorer-desc

Test!`);
  });
});