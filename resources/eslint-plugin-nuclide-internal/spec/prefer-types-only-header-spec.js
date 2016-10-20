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

const rule = require('../prefer-types-only-header');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('prefer-types-only-header', rule, {
  valid: [
    {code: 'export {}'},
    {code: 'export default {}'},
    {code: 'export type T = {}'},
    {code: 'module.exports'},
    {code: 'exports.foo'},
    {code: "'use babel';"},
    {code: "'use babel'; export type T = {}; export default {}"},
    {code: "'use babel'; export type T = {}; export {}"},
    {code: "'use babel'; export type T = {}; module.exports"},
    {code: "'use babel'; export type T = {}; exports.foo"},
  ],
  invalid: [
    {
      code: "'use babel'; export type T = {}",
      errors: [{type: 'Program', message: 'types-only modules should use the types header'}],
    },
  ],
});
