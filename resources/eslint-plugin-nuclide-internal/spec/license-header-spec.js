'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

/* NON-TRANSPILED FILE */
/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

const rule = require('../license-header');
const RuleTester = require('eslint').RuleTester;

const {HEADERS} = rule;

// Having this in a test causes prefer-object-spread to load and breaks the test :/
HEADERS.noFlow = HEADERS.noFlow
  .replace(', prefer-object-spread/prefer-object-spread: 0', '');

const SHEBANG = '#!/usr/bin/env node';
const LINE = '';
const CODE = 'module.exports = {};';
const USE_BABEL = "'use babel';";

const LICENSE_ERROR = 'Expected a license header';

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('license-header', rule, {
  valid: [
    {code: [HEADERS.standard].join('\n')},
    {code: [HEADERS.standard, LINE].join('\n')},
    {code: [HEADERS.standard, LINE, CODE].join('\n')},

    {code: [HEADERS.noFlow].join('\n')},
    {code: [HEADERS.noFlow, LINE].join('\n')},
    {code: [HEADERS.noFlow, LINE, CODE].join('\n')},

    {code: [SHEBANG, HEADERS.noFlow].join('\n')},
    {code: [SHEBANG, HEADERS.noFlow, LINE].join('\n')},
    {code: [SHEBANG, HEADERS.noFlow, LINE, CODE].join('\n')},
  ],
  invalid: [
    {
      code: [SHEBANG, HEADERS.standard].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [USE_BABEL, HEADERS.standard].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [SHEBANG].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [SHEBANG, LINE].join('\n'),
      errors: [LICENSE_ERROR],
    },
    {
      code: [CODE, LINE].join('\n'),
      errors: [LICENSE_ERROR],
    },
  ],
});
