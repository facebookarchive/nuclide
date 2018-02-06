/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import {
  keyword,
  whitespace,
  method,
  plain,
  param,
  type,
  className as class_,
} from 'nuclide-commons/tokenized-text';
import {addMatchers} from '../../nuclide-test-helpers';
import {parseOutlineTree} from '../lib/outline/CqueryOutlineParser';
import {
  simplifyNodeForTesting,
  createFunction,
  createVariable,
  createClass,
} from './utils';

describe('CqueryOutlineParser', () => {
  beforeEach(function() {
    addMatchers(this);
  });

  it('parses correctly obj-c functions with _nonNull and __strong', () => {
    const containerName =
      'Ret * _Nonnull (NSUInteger * _Nonnull __strong) funct';
    const name = 'funct';
    const tokenizedText = [
      keyword('Ret'),
      whitespace(' '),
      plain('*'),
      whitespace(' '),
      method('funct'),
      plain('('),
      keyword('NSUInteger'),
      whitespace(' '),
      plain('*'),
      plain(')'),
    ];

    expect(
      simplifyNodeForTesting(
        parseOutlineTree([createFunction(name, containerName)]),
      ),
    ).diffJson({
      kind: 'module',
      tokenizedText: [type('')],
      children: [
        {
          kind: 'method',
          tokenizedText,
          children: [],
        },
      ],
    });
  });

  it('removes a symbol with a range overlapping a variable', () => {
    // this happens for cases in obj-c like this one
    //   @property (atomic, copy) NSString* threadKey;
    // where the property defines several symbols, e.g. _threadKey, threadKey,
    // setThreadKey, etc. in an overlapping range with the initial symbol

    expect(
      simplifyNodeForTesting(
        parseOutlineTree([
          createVariable('_tt', '_tt', 1, 10, 30),
          createFunction('fun', 'int fun()', 1, 1, 15, 45),
          createFunction('fun2', 'int fun2()', 2, 2, 10, 30),
          createFunction('fun3', 'int fun3()', 2, 2, 5, 25),
        ]),
      ),
    ).diffJson({
      kind: 'module',
      tokenizedText: [type('')],
      children: [
        {
          kind: 'constant',
          tokenizedText: [param('_tt')],
          children: [],
        },
        {
          kind: 'method',
          tokenizedText: [
            keyword('int'),
            whitespace(' '),
            method('fun2'),
            plain('('),
            plain(')'),
          ],
          children: [],
        },
      ],
    });
  });

  it('removes obj-c method parameters when no parameter nodes are included', () => {
    // we do this because cquery doesn't report type information for these
    // parameters (T25738496)

    const methodContainerName = 'amethod:param:';
    const methodName = 'amethod';
    const methodTokenizedText = [method('amethod')];

    expect(
      simplifyNodeForTesting(
        parseOutlineTree([createFunction(methodName, methodContainerName)]),
      ),
    ).diffJson({
      kind: 'module',
      tokenizedText: [type('')],
      children: [
        {
          kind: 'method',
          tokenizedText: methodTokenizedText,
          children: [],
        },
      ],
    });
  });

  it('parses an obj-c class method along with its parameters', () => {
    // C-query is bugged and doesn't report the first parameter in the method
    // container name
    const methodContainerName = 'AClass::amethod:param2:';
    const paramContainerName1 = 'NSString *param1';
    const paramContainerName2 = 'NSObject *param2';

    const methodName = 'amethod:param2:';
    const paramName1 = 'param1';
    const paramName2 = 'param2';

    const paramTokenizedText1 = [
      keyword('NSString'),
      whitespace(' '),
      plain('*'),
      param('param1'),
    ];
    const paramTokenizedText2 = [
      keyword('NSObject'),
      whitespace(' '),
      plain('*'),
      param('param2'),
    ];
    const methodTokenizedText = [
      method('amethod'),
      plain(':'),
      ...paramTokenizedText1,
      plain(':'),
      ...paramTokenizedText2,
    ];

    expect(
      simplifyNodeForTesting(
        parseOutlineTree([
          createFunction(methodName, methodContainerName, 1, 10),
          createVariable(paramName1, paramContainerName1, 1),
          createVariable(paramName2, paramContainerName2, 1),
        ]),
      ),
    ).diffJson({
      kind: 'module',
      tokenizedText: [type('')],
      children: [
        {
          kind: 'module',
          tokenizedText: [type('AClass')],
          children: [
            {
              kind: 'method',
              tokenizedText: methodTokenizedText,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it('parses a global C++ function and removes its local variables', () => {
    const functionContainerName =
      'int afunction(std::vector<int> x, xtd::std::vector<int> y)';
    const paramContainerName1 = 'std::vector<int> x';
    const paramContainerName2 = 'xtd::std::vector<std::string> y';
    const localVariableContainerName = 'std::string z';

    const functionName = 'afunction';
    const paramName1 = 'x';
    const paramName2 = 'y';
    const localVariableName = 'z';

    const paramTokenizedText1 = [
      keyword('std'),
      plain(':'),
      plain(':'),
      keyword('vector'),
      plain('<'),
      keyword('int'),
      plain('>'),
      whitespace(' '),
      keyword('x'),
    ];

    const paramTokenizedText2 = [
      keyword('xtd'),
      plain(':'),
      plain(':'),
      keyword('std'),
      plain(':'),
      plain(':'),
      keyword('vector'),
      plain('<'),
      keyword('int'),
      plain('>'),
      whitespace(' '),
      keyword('y'),
    ];

    const functionTokenizedText = [
      keyword('int'),
      whitespace(' '),
      method('afunction'),
      plain('('),
      ...paramTokenizedText1,
      plain(','),
      whitespace(' '),
      ...paramTokenizedText2,
      plain(')'),
    ];

    expect(
      simplifyNodeForTesting(
        parseOutlineTree([
          createFunction(functionName, functionContainerName, 1, 10),
          createVariable(paramName1, paramContainerName1, 1),
          createVariable(paramName2, paramContainerName2, 1),
          createVariable(localVariableName, localVariableContainerName, 2),
        ]),
      ),
    ).diffJson({
      kind: 'module',
      tokenizedText: [type('')],
      children: [
        {
          kind: 'method',
          tokenizedText: functionTokenizedText,
          children: [],
        },
      ],
    });
  });

  it('parses a C++ function inside a namespace and shows its params if the corresponding params nodes are included, also removes its local variables', () => {
    const functionContainerName =
      'pp::int aNamespace::afunction(std::vector<int> x, xtd::std::vector<int> y)';
    const paramContainerName1 = 'std::vector<int> x';
    const paramContainerName2 = 'xtd::std::vector<std::string> y';
    const localVariableContainerName = 'std::string z';

    const functionName = 'afunction';
    const paramName1 = 'x';
    const paramName2 = 'y';
    const localVariableName = 'z';

    const paramTokenizedText1 = [
      keyword('std'),
      plain(':'),
      plain(':'),
      keyword('vector'),
      plain('<'),
      keyword('int'),
      plain('>'),
      whitespace(' '),
      keyword('x'),
    ];

    const paramTokenizedText2 = [
      keyword('xtd'),
      plain(':'),
      plain(':'),
      keyword('std'),
      plain(':'),
      plain(':'),
      keyword('vector'),
      plain('<'),
      keyword('int'),
      plain('>'),
      whitespace(' '),
      keyword('y'),
    ];

    const functionTokenizedText = [
      keyword('pp'),
      plain(':'),
      plain(':'),
      keyword('int'),
      whitespace(' '),
      method('afunction'),
      plain('('),
      ...paramTokenizedText1,
      plain(','),
      whitespace(' '),
      ...paramTokenizedText2,
      plain(')'),
    ];

    expect(
      simplifyNodeForTesting(
        parseOutlineTree([
          createFunction(functionName, functionContainerName, 1, 10),
          createVariable(paramName1, paramContainerName1, 1),
          createVariable(paramName2, paramContainerName2, 1),
          createVariable(localVariableName, localVariableContainerName, 2),
        ]),
      ),
    ).diffJson({
      kind: 'module',
      tokenizedText: [type('')],
      children: [
        {
          kind: 'module',
          tokenizedText: [type('aNamespace')],
          children: [
            {
              kind: 'method',
              tokenizedText: functionTokenizedText,
              children: [],
            },
          ],
        },
      ],
    });
  });

  it('parses a C++ class inside an anonymous namespace inside a named namespace with a method and a member', () => {
    const classContainerName = '(anon)::named::DisClass';
    const memberContainerName =
      'xtd::std::vector<std::string> (anon)::named::DisClass::member';
    const methodContainerName =
      'std::vector<int> (anon)::named::DisClass::method(int param) const';
    const paramContainerName = 'int param';

    const className = 'DisClass';
    const memberName = 'member';
    const methodName = 'method';
    const paramName = 'param';

    const paramTokenizedText = [
      keyword('int'),
      whitespace(' '),
      keyword('param'),
    ];
    const methodTokenizedText = [
      keyword('std'),
      plain(':'),
      plain(':'),
      keyword('vector'),
      plain('<'),
      keyword('int'),
      plain('>'),
      whitespace(' '),
      method('method'),
      plain('('),
      ...paramTokenizedText,
      plain(')'),
      whitespace(' '),
      keyword('const'),
    ];
    const memberTokenizedText = [
      keyword('xtd'),
      plain(':'),
      plain(':'),
      keyword('std'),
      plain(':'),
      plain(':'),
      keyword('vector'),
      plain('<'),
      keyword('std'),
      plain(':'),
      plain(':'),
      keyword('string'),
      plain('>'),
      whitespace(' '),
      param('member'),
    ];
    const classTokenizedText = [class_('DisClass')];

    expect(
      simplifyNodeForTesting(
        parseOutlineTree([
          createClass(className, classContainerName, 1, 10),
          createFunction(methodName, methodContainerName, 3, 5),
          createVariable(paramName, paramContainerName, 3),
          createVariable(memberName, memberContainerName, 6),
        ]),
      ),
    ).diffJson({
      kind: 'module',
      tokenizedText: [type('')],
      children: [
        {
          kind: 'module',
          tokenizedText: [type('namespace')],
          children: [
            {
              kind: 'module',
              tokenizedText: [type('named')],
              children: [
                {
                  kind: 'class',
                  tokenizedText: classTokenizedText,
                  children: [
                    {
                      kind: 'method',
                      tokenizedText: methodTokenizedText,
                      children: [],
                    },
                    {
                      kind: 'variable',
                      tokenizedText: memberTokenizedText,
                      children: [],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
