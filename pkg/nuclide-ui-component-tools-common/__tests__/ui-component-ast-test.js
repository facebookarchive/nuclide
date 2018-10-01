"use strict";

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
describe('ui-component-ast', () => {
  it('parses a React component module', () => {
    const ast = (0, _uiComponentAst().parseCode)(_common().BASIC_FDSTEST_COMPONENT_WITH_PROPS_SOURCE);
    expect(ast).toBeTruthy();
  });
  it('retrieves required props from a React component', () => {
    const requiredProps = (0, _uiComponentAst().getRequiredProps)('FDSTest', _common().BASIC_FDSTEST_COMPONENT_WITH_PROPS_SOURCE);
    expect(requiredProps).toEqual([{
      name: 'value',
      typeAnnotation: 'NumberTypeAnnotation',
      leadingComment: 'Test value.'
    }, {
      name: 'type',
      typeAnnotation: 'FDSType',
      leadingComment: 'A test required enum.'
    }]);
  });
  it('retrieves required props with $Exact longhand', () => {
    const requiredProps = (0, _uiComponentAst().getRequiredProps)('FDSTest', `
export type Props = $Exact<{
  value: number,
  type: string,
}>

class FDSTest extends React.PureComponent<Props> {}
    `);
    expect(requiredProps).toEqual([{
      name: 'value',
      typeAnnotation: 'NumberTypeAnnotation'
    }, {
      name: 'type',
      typeAnnotation: 'StringTypeAnnotation'
    }]);
  });
  it('gets default prop names', () => {
    const defaultProps = (0, _uiComponentAst().getDefaultPropNames)('FDSTest', (0, _uiComponentAst().parseCode)(_common().BASIC_FDSTEST_COMPONENT_WITH_PROPS_SOURCE));
    expect(defaultProps).toEqual(['type', 'optionalValue']);
  });
  it('gets default prop names with declaration indirection', () => {
    const defaultProps = (0, _uiComponentAst().getDefaultPropNames)('FDSTest', (0, _uiComponentAst().parseCode)(`
const Props = {
  value: number,
  type: string,
}

const DEFAULT_PROPS = {
  value: 0,
  type: 'foo',
};

class FDSTest extends React.PureComponent<Props> {
  static defaultProps = DEFAULT_PROPS;
}
    `));
    expect(defaultProps).toEqual(['value', 'type']);
  });
  it('parses a component with a blank object', () => {
    const code = `
type Props = {};
type DefaultProps = {};

class FDSTest extends React.PureComponent<Props> {
  static defaultProps: DefaultProps;
}`;
    expect((0, _uiComponentAst().getDefaultPropNames)('FDSTest', (0, _uiComponentAst().parseCode)(code))).toEqual([]);
    expect((0, _uiComponentAst().getRequiredProps)('FDSTest', code)).toEqual([]);
  });
});
describe('formatLeadingComment', () => {
  it('returns identity', () => {
    expect((0, _uiComponentAst().formatLeadingComment)('Hello')).toBe('Hello');
  });
  it('strips asterisks', () => {
    expect((0, _uiComponentAst().formatLeadingComment)(' * Hello!')).toBe('Hello!');
  });
  it('removes trailing blank lines', () => {
    expect((0, _uiComponentAst().formatLeadingComment)(`
 * Hello!
 *
    `)).toBe('Hello!');
  });
  it('strips trailing whitespace', () => {
    expect((0, _uiComponentAst().formatLeadingComment)(' * Hello!  ')).toBe('Hello!');
  });
  it('maintains vertical whitespace in the middle', () => {
    expect((0, _uiComponentAst().formatLeadingComment)(` * Hello!
 *
 * It is me!
 *
 * Wow!
 `)).toBe(`Hello!

It is me!

Wow!`);
  });
  it('joins consecutive lines', () => {
    expect((0, _uiComponentAst().formatLeadingComment)(` * Hello!
  * It is me!`)).toBe('Hello! It is me!');
  });
});