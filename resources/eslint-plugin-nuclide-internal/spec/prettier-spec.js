/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @noflow
 */
'use strict';

/* eslint comma-dangle: [1, always-multiline], prefer-object-spread/prefer-object-spread: 0 */

const rule = require('../prettier');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('prettier', rule, {
  valid: [
    {code: '/** @format */\na();\n'},
    {code: '/* something */ /** @format */\n a ( )'},
    {code: 'a (`\n * @format\n`)'},
  ],
  invalid: [
    {
      code: '/** @format */\na ( )',
      errors: [{
        fix: {text: '/** @format */\na();\n'},
      }],
    },
  ],
});
