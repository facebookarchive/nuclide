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
/* eslint-disable babel/func-params-comma-dangle, prefer-object-spread/prefer-object-spread */

const rule = require('../type-alias-semi');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('type-alias-semi', rule, {
  valid: [
    {code: 'type T = {};'},
    {code: 'type T = TT;'},
    {code: 'var T'},
    {code: 'let t'},
  ],
  invalid: [
    {
      code: 'type T = {}',
      output: 'type T = {};',
      errors: [{
        message: 'Missing semicolon.',
        type: 'TypeAlias',
      }],
    },
    {
      code: 'type T = TT',
      output: 'type T = TT;',
      errors: [{
        message: 'Missing semicolon.',
        type: 'TypeAlias',
      }],
    },
  ],
});
