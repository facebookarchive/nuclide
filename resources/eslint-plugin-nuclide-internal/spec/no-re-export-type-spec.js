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

const rule = require('../no-re-export-type');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('no-re-export-type', rule, {
  valid: [
    {
      code: 'import foo from "foo"; export {foo}',
    },

    // No value exports:
    {
      code: 'import foo from "foo"; export type {foo}',
    },
    {
      code: 'import {foo} from "foo"; export type {foo}',
    },
    {
      code: 'import typeof * as foo from "foo"; export type {foo}',
    },
    {
      code: 'export type {foo} from "foo"',
    },

    // You'd never do these, but it's valid wrt re-exporting types:
    {
      code: 'import type foo from "foo"; export {foo}',
    },
    {
      code: 'import type foo from "foo"; export {foo} from "foo"',
    },
    {
      code: 'import type foo from "foo"; export type foo = {}',
    },
    {
      code: 'import typeof * as foo from "foo"; export {foo}',
    },
  ],
  invalid: [
    {
      code: 'export let x; export type {foo} from "foo"',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportNamedDeclaration',
        },
      ],
    },
    {
      code: 'export let x; import type foo from "foo"; export type {foo}',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },
    {
      code: 'export let x; import type foo from "foo"; export type {foo} from "foo"',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportNamedDeclaration',
        },
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },
    {
      code: 'export let x; import type {foo} from "foo"; export type {foo}',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },
    {
      code: 'export let x; import type {foo} from "foo"; export type {foo} from "foo"',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportNamedDeclaration',
        },
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },
    {
      code: 'export let x; import typeof * as foo from "foo"; export type {foo}',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },
    {
      code: 'export let x; import typeof * as foo from "foo"; export type {foo} from "foo"',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportNamedDeclaration',
        },
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },
    {
      code: 'export let x; import typeof * as foo from "foo"; export type {foo}',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },
    {
      code: 'export let x; import type {bar as foo} from "foo"; export type {foo}',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },

    // Make sure `export * from ""` counts as a value export:
    {
      code: 'export * from ""; import type foo from "foo"; export type {foo}',
      errors: [
        {
          message: 'Unexpected type re-exporting. Import the type where it\'s used instead.',
          type: 'ExportSpecifier',
        },
      ],
    },
  ],
});
