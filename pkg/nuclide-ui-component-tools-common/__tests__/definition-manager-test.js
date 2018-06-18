/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {ComponentDefinition} from '../lib/types';
import {getSnippetFromDefinition} from '../lib/definitionManager';

describe('getSnippetFromDefinition', () => {
  it('should render a snippet without props', () => {
    const definition: ComponentDefinition = {
      name: 'FDSTest',
      requiredProps: [],
      defaultProps: [],
      leadingComment: null,
    };
    expect(getSnippetFromDefinition(definition)).toBe('FDSTest $1/>');
  });

  it('should render basic required props', () => {
    const definition: ComponentDefinition = {
      name: 'FDSTest',
      requiredProps: [
        {
          name: 'value',
          typeAnnotation: 'number',
        },
      ],
      defaultProps: [],
      leadingComment: null,
    };
    expect(getSnippetFromDefinition(definition)).toBe(`FDSTest
  value={\$1}
\$2/>`);
  });

  it('should render a string annotated prop with nested tabstop', () => {
    const definition: ComponentDefinition = {
      name: 'FDSTest',
      requiredProps: [
        {
          name: 'value',
          typeAnnotation: 'number',
        },
        {
          name: 'label',
          typeAnnotation: 'string',
        },
      ],
      defaultProps: [],
      leadingComment: null,
    };
    expect(getSnippetFromDefinition(definition)).toBe(
      'FDSTest\n\
  value={$1}\n\
  label=${2:"$3"}\n\
$4/>',
    );
  });

  it('should render a tabstop in JSX tags for children prop', () => {
    const definition: ComponentDefinition = {
      name: 'FDSTest',
      requiredProps: [
        {
          name: 'value',
          typeAnnotation: 'number',
        },
        {
          name: 'children',
          typeAnnotation: 'React.Element',
        },
      ],
      defaultProps: [],
      leadingComment: null,
    };
    expect(getSnippetFromDefinition(definition)).toBe(
      'FDSTest\n\
  value={$1}\n\
>\n\
  $2\n\
</FDSTest>',
    );
  });

  it('should not render default props even if required', () => {
    const definition: ComponentDefinition = {
      name: 'FDSTest',
      requiredProps: [
        {
          name: 'value',
          typeAnnotation: 'number',
        },
        {
          name: 'label',
          typeAnnotation: 'string',
        },
      ],
      defaultProps: ['label'],
      leadingComment: null,
    };
    expect(getSnippetFromDefinition(definition)).toBe(`FDSTest
  value={\$1}
\$2/>`);
  });
});
