"use strict";

function _definitionManager() {
  const data = require("../lib/definitionManager");

  _definitionManager = function () {
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
describe('getSnippetFromDefinition', () => {
  it('should render a snippet without props', () => {
    const definition = {
      name: 'FDSTest',
      requiredProps: [],
      defaultProps: [],
      leadingComment: null
    };
    expect((0, _definitionManager().getSnippetFromDefinition)(definition)).toBe('FDSTest $1/>');
  });
  it('should render basic required props', () => {
    const definition = {
      name: 'FDSTest',
      requiredProps: [{
        name: 'value',
        typeAnnotation: 'number'
      }],
      defaultProps: [],
      leadingComment: null
    };
    expect((0, _definitionManager().getSnippetFromDefinition)(definition)).toBe(`FDSTest
  value={$1}
$2/>`);
  });
  it('should render a string annotated prop with nested tabstop', () => {
    const definition = {
      name: 'FDSTest',
      requiredProps: [{
        name: 'value',
        typeAnnotation: 'number'
      }, {
        name: 'label',
        typeAnnotation: 'string'
      }],
      defaultProps: [],
      leadingComment: null
    };
    expect((0, _definitionManager().getSnippetFromDefinition)(definition)).toBe('FDSTest\n\
  value={$1}\n\
  label=${2:"$3"}\n\
$4/>');
  });
  it('should render a tabstop in JSX tags for children prop', () => {
    const definition = {
      name: 'FDSTest',
      requiredProps: [{
        name: 'value',
        typeAnnotation: 'number'
      }, {
        name: 'children',
        typeAnnotation: 'React.Element'
      }],
      defaultProps: [],
      leadingComment: null
    };
    expect((0, _definitionManager().getSnippetFromDefinition)(definition)).toBe('FDSTest\n\
  value={$1}\n\
>\n\
  $2\n\
</FDSTest>');
  });
  it('should not render default props even if required', () => {
    const definition = {
      name: 'FDSTest',
      requiredProps: [{
        name: 'value',
        typeAnnotation: 'number'
      }, {
        name: 'label',
        typeAnnotation: 'string'
      }],
      defaultProps: ['label'],
      leadingComment: null
    };
    expect((0, _definitionManager().getSnippetFromDefinition)(definition)).toBe(`FDSTest
  value={$1}
$2/>`);
  });
});
describe('getDocumentationObject', () => {
  it('should return blank object if no leading comment', () => {
    expect((0, _definitionManager().getDocumentationObject)({
      name: 'FDS',
      requiredProps: [],
      defaultProps: [],
      leadingComment: null
    })).toEqual({});
  });
  it('should return blank object if no @explorer-desc directive', () => {
    expect((0, _definitionManager().getDocumentationObject)({
      name: 'FDS',
      requiredProps: [],
      defaultProps: [],
      leadingComment: 'a'.repeat(240)
    })).toEqual({});
  });
  it('should return blank object if it includes @no-completion-description directive', () => {
    expect((0, _definitionManager().getDocumentationObject)({
      name: 'FDS',
      requiredProps: [],
      defaultProps: [],
      leadingComment: 'a'.repeat(240) + ' @no-completion-description'
    })).toEqual({});
  });
  it('should return documentation with simple string', () => {
    expect((0, _definitionManager().getDocumentationObject)({
      name: 'FDS',
      requiredProps: [],
      defaultProps: [],
      leadingComment: '@explorer-desc\n\nThis is an adequate description.\n\nDo not include me!'
    })).toEqual({
      documentation: 'This is an adequate description.'
    });
  });
  it('should return blank object if comment is too short', () => {
    expect((0, _definitionManager().getDocumentationObject)({
      name: 'FDS',
      requiredProps: [],
      defaultProps: [],
      leadingComment: '@explorer-desc\n\nhello'
    })).toEqual({});
  });
  it('should return truncated documentation with long', () => {
    expect((0, _definitionManager().getDocumentationObject)({
      name: 'FDS',
      requiredProps: [],
      defaultProps: [],
      leadingComment: '@explorer-desc\n\n' + 'a'.repeat(241)
    })).toEqual({
      documentation: 'a'.repeat(240) + '…'
    });
  });
});
describe('getHoverFromComponentDefinition', () => {
  it('should return a hover object', () => {
    const definition = {
      name: 'FDSTest',
      requiredProps: [],
      defaultProps: [],
      leadingComment: `  @explorer-desc
  ====== Foo
      // Example!
      // Some code!
  Bar`
    };
    expect((0, _definitionManager().getHoverFromComponentDefinition)(definition).contents).toEqual({
      language: 'markdown',
      value: `### Foo
    // Example!
    // Some code!
Bar`
    });
  });
});