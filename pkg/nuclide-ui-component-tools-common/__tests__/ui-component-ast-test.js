'use strict';

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

describe('ui-component-ast', () => {
  it('parses a React component module', () => {
    const ast = (0, (_uiComponentAst || _load_uiComponentAst()).parseCode)((_common || _load_common()).BASIC_FDSTEST_COMPONENT_WITH_PROPS_SOURCE);
    expect(ast).toBeTruthy();
  });

  it('retrieves required props from a React component', () => {
    const requiredProps = (0, (_uiComponentAst || _load_uiComponentAst()).getRequiredProps)('FDSTest', (_common || _load_common()).BASIC_FDSTEST_COMPONENT_WITH_PROPS_SOURCE);
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
    const requiredProps = (0, (_uiComponentAst || _load_uiComponentAst()).getRequiredProps)('FDSTest', `
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
    const defaultProps = (0, (_uiComponentAst || _load_uiComponentAst()).getDefaultPropNames)('FDSTest', (0, (_uiComponentAst || _load_uiComponentAst()).parseCode)((_common || _load_common()).BASIC_FDSTEST_COMPONENT_WITH_PROPS_SOURCE));
    expect(defaultProps).toEqual(['type', 'optionalValue']);
  });

  it('gets default prop names with declaration indirection', () => {
    const defaultProps = (0, (_uiComponentAst || _load_uiComponentAst()).getDefaultPropNames)('FDSTest', (0, (_uiComponentAst || _load_uiComponentAst()).parseCode)(`
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

    expect((0, (_uiComponentAst || _load_uiComponentAst()).getDefaultPropNames)('FDSTest', (0, (_uiComponentAst || _load_uiComponentAst()).parseCode)(code))).toEqual([]);
    expect((0, (_uiComponentAst || _load_uiComponentAst()).getRequiredProps)('FDSTest', code)).toEqual([]);
  });
});

describe('formatLeadingComment', () => {
  it('returns identity', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).formatLeadingComment)('Hello')).toBe('Hello');
  });

  it('strips asterisks', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).formatLeadingComment)(` * Hello!`)).toBe('Hello!');
  });

  it('removes trailing blank lines', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).formatLeadingComment)(`
 * Hello!
 *
    `)).toBe('Hello!');
  });

  it('strips trailing whitespace', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).formatLeadingComment)(' * Hello!  ')).toBe('Hello!');
  });

  it('maintains vertical whitespace in the middle', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).formatLeadingComment)(` * Hello!
 *
 * It is me!
 *
 * Wow!
 `)).toBe(`Hello!

It is me!

Wow!`);
  });

  it('joins consecutive lines', () => {
    expect((0, (_uiComponentAst || _load_uiComponentAst()).formatLeadingComment)(` * Hello!
  * It is me!`)).toBe('Hello! It is me!');
  });
});