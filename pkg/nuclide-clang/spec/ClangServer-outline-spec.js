'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import invariant from 'assert';
import fs from 'fs';
import path from 'path';

import ClangServer from '../lib/ClangServer';
import {getServiceRegistry} from '../lib/ClangServerManager';

const TEST_FILE = path.join(__dirname, 'fixtures', 'outline.cpp');
const FILE_CONTENTS = fs.readFileSync(TEST_FILE, 'utf8');

describe('ClangServer', () => {
  it('can return outline data', () => {
    waitsForPromise(async () => {
      const server = new ClangServer(TEST_FILE, getServiceRegistry(), ['-x', 'c++']);
      const response = await server.get_outline(
        FILE_CONTENTS,
      );
      invariant(response != null);
      expect(response).toEqual([
        {
          extent: {
            start: {
              column: 0,
              line: 0,
            },
            end: {
              column: 14,
              line: 0,
            },
          },
          cursor_kind: 'VAR_DECL',
          name: 'global_var',
          cursor_type: 'int',
        },
        {
          cursor_kind: 'NAMESPACE',
          name: 'test_namespace',
          extent: {
            start: {
              column: 0,
              line: 2,
            },
            end: {
              column: 1,
              line: 9,
            },
          },
          children: [
            {
              cursor_kind: 'NAMESPACE',
              name: '',
              extent: {
                start: {
                  column: 0,
                  line: 3,
                },
                end: {
                  column: 1,
                  line: 8,
                },
              },
              children: [
                {
                  cursor_kind: 'FUNCTION_DECL',
                  name: 'function',
                  extent: {
                    start: {
                      column: 0,
                      line: 5,
                    },
                    end: {
                      column: 1,
                      line: 6,
                    },
                  },
                  params: [
                    'const int',
                    'param',
                  ],
                  tparams: [
                  ],
                },
              ],
            },
          ],
        },
        {
          cursor_kind: 'FUNCTION_TEMPLATE',
          name: 'templated_function',
          extent: {
            start: {
              column: 0,
              line: 11,
            },
            end: {
              column: 1,
              line: 14,
            },
          },
          params: [
            'x',
          ],
          tparams: [
            'T',
          ],
        },
        {
          cursor_kind: 'CLASS_DECL',
          name: 'TestClass',
          extent: {
            start: {
              column: 0,
              line: 16,
            },
            end: {
              column: 1,
              line: 23,
            },
          },
          children: [
            {
              cursor_kind: 'FUNCTION_TEMPLATE',
              name: 'method',
              extent: {
                start: {
                  column: 2,
                  line: 17,
                },
                end: {
                  column: 3,
                  line: 19,
                },
              },
              params: [
                'param',
              ],
              tparams: [
                'T',
              ],
            },
            {
              cursor_kind: 'CXX_METHOD',
              name: 'partialMethod',
              extent: {
                start: {
                  column: 2,
                  line: 21,
                },
                end: {
                  column: 22,
                  line: 21,
                },
              },
              params: [
              ],
              tparams: [
              ],
            },
            {
              extent: {
                start: {
                  column: 2,
                  line: 22,
                },
                end: {
                  column: 23,
                  line: 22,
                },
              },
              cursor_kind: 'VAR_DECL',
              name: 'partialVar',
              cursor_type: 'int',
            },
          ],
        },
        {
          extent: {
            start: {
              column: 0,
              line: 25,
            },
            end: {
              column: 25,
              line: 25,
            },
          },
          cursor_kind: 'VAR_DECL',
          name: 'TestClass::partialVar',
          cursor_type: 'int',
        },
        {
          cursor_kind: 'CXX_METHOD',
          name: 'TestClass::partialMethod',
          extent: {
            start: {
              column: 0,
              line: 27,
            },
            end: {
              column: 1,
              line: 28,
            },
          },
          params: [
          ],
          tparams: [
          ],
        },
        {
          cursor_kind: 'CLASS_TEMPLATE',
          name: 'TemplateClass<Ty>',
          extent: {
            start: {
              column: 0,
              line: 30,
            },
            end: {
              column: 1,
              line: 32,
            },
          },
          children: [
          ],
        },
        {
          cursor_kind: 'ENUM_DECL',
          name: 'TestEnum',
          extent: {
            start: {
              column: 0,
              line: 34,
            },
            end: {
              column: 1,
              line: 37,
            },
          },
          children: [
            {
              cursor_kind: 'ENUM_CONSTANT_DECL',
              name: 'ENUM_VALUE_1',
              extent: {
                start: {
                  column: 2,
                  line: 35,
                },
                end: {
                  column: 14,
                  line: 35,
                },
              },
            },
            {
              cursor_kind: 'ENUM_CONSTANT_DECL',
              name: 'ENUM_VALUE_2',
              extent: {
                start: {
                  column: 2,
                  line: 36,
                },
                end: {
                  column: 14,
                  line: 36,
                },
              },
            },
          ],
        },
      ]);
    });
  });
});
