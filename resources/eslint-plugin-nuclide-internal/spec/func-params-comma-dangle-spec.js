'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const rule = require('../func-params-comma-dangle');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester({
  parser: 'babel-eslint',
});

ruleTester.run('func-params-comma-dangle', rule, {
  valid: [
    {
      code: 'function f() {}',
    },
    {
      code: 'function f(\n) {}',
    },
    {
      code: 'function f(a) {}',
    },
    {
      code: 'function f(\na) {}',
    },
    {
      code: 'f = function() {}',
    },
    {
      code: 'f = function(\n) {}',
    },
    {
      code: 'f = function(a) {}',
    },
    {
      code: 'f = function(\na) {}',
    },
    {
      code: 'f = function(a) {}',
    },
    {
      code: 'f = () => {}',
    },
    {
      code: 'f = (\n) => {}',
    },
    {
      code: 'f = (a) => {}',
    },
    {
      code: 'f = (\na) => {}',
    },
    {
      code: 'f = a => {}',
    },
    ///
    {
      code: 'function f(...a) {}',
    },
    {
      code: 'function f(\n...a) {}',
    },
    {
      code: 'function f(\n...a\n) {}',
    },
    {
      code: 'function f(a,...b) {}',
    },
    {
      code: 'function f(a,\n...b) {}',
    },
    {
      code: 'function f(a,\n...b\n) {}',
    },
  ],
  invalid: [
    //
    // FunctionDeclaration
    //
    {
      code: 'function f(\na\n) {} ',
      output: 'function f(\na,\n) {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(a\n) {} ',
      output: 'function f(a,\n) {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(\na = 1\n) {}',
      output: 'function f(\na = 1,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'function f(a = 1\n) {}',
      output: 'function f(a = 1,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'function f(\na: number\n) {}',
      output: 'function f(\na: number,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(a: number\n) {}',
      output: 'function f(a: number,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    ///
    {
      code: 'function f(\na,\nb\n) {} ',
      output: 'function f(\na,\nb,\n) {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(a,\nb\n) {} ',
      output: 'function f(a,\nb,\n) {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(\na,\nb = 1\n) {}',
      output: 'function f(\na,\nb = 1,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'function f(a,\nb = 1\n) {}',
      output: 'function f(a,\nb = 1,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'function f(\na,\nb: number\n) {}',
      output: 'function f(\na,\nb: number,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(a,\nb: number\n) {}',
      output: 'function f(a,\nb: number,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },


    //
    // FunctionExpression
    //
    {
      code: 'f = function(\na\n) {} ',
      output: 'f = function(\na,\n) {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(a\n) {} ',
      output: 'f = function(a,\n) {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(\na = 1\n) {}',
      output: 'f = function(\na = 1,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = function(a = 1\n) {}',
      output: 'f = function(a = 1,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = function(\na: number\n) {}',
      output: 'f = function(\na: number,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(a: number\n) {}',
      output: 'f = function(a: number,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    ///
    {
      code: 'f = function(\na,\nb\n) {} ',
      output: 'f = function(\na,\nb,\n) {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(a,\nb\n) {} ',
      output: 'f = function(a,\nb,\n) {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(\na,\nb = 1\n) {}',
      output: 'f = function(\na,\nb = 1,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = function(a,\nb = 1\n) {}',
      output: 'f = function(a,\nb = 1,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = function(\na,\nb: number\n) {}',
      output: 'f = function(\na,\nb: number,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(a,\nb: number\n) {}',
      output: 'f = function(a,\nb: number,\n) {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },


    //
    // ArrowFunctionExpression
    //
    {
      code: 'f = (\na\n) => {} ',
      output: 'f = (\na,\n) => {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = (a\n) => {} ',
      output: 'f = (a,\n) => {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = (\na = 1\n) => {}',
      output: 'f = (\na = 1,\n) => {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = (a = 1\n) => {}',
      output: 'f = (a = 1,\n) => {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    // A babel-eslint bug is incorrectly ignoring the type annotation when
    // calculating the param loc.
    // {
    //   code: 'f = (\na: number\n) => {}',
    //   output: 'f = (\na: number,\n) => {}',
    //   errors: [
    //     {
    //       message: 'Missing trailing comma.',
    //       type: 'Identifier',
    //     },
    //   ],
    // },
    // {
    //   code: 'f = (a: number\n) => {}',
    //   output: 'f = (a: number,\n) => {}',
    //   errors: [
    //     {
    //       message: 'Missing trailing comma.',
    //       type: 'Identifier',
    //     },
    //   ],
    // },
    ///
    {
      code: 'f = (\na,\nb\n) => {} ',
      output: 'f = (\na,\nb,\n) => {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = (a,\nb\n) => {} ',
      output: 'f = (a,\nb,\n) => {} ',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = (\na,\nb = 1\n) => {}',
      output: 'f = (\na,\nb = 1,\n) => {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = (a,\nb = 1\n) => {}',
      output: 'f = (a,\nb = 1,\n) => {}',
      errors: [
        {
          message: 'Missing trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    // {
    //   code: 'f = (\na,\nb: number\n) => {}',
    //   output: 'f = (\na,\nb: number,\n) => {}',
    //   errors: [
    //     {
    //       message: 'Missing trailing comma.',
    //       type: 'Identifier',
    //     },
    //   ],
    // },
    // {
    //   code: 'f = (a,\nb: number\n) => {}',
    //   output: 'f = (a,\nb: number,\n) => {}',
    //   errors: [
    //     {
    //       message: 'Missing trailing comma.',
    //       type: 'Identifier',
    //     },
    //   ],
    // },


    //
    // FunctionDeclaration
    //
    {
      code: 'function f(a,) {} ',
      output: 'function f(a) {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(\na,) {} ',
      output: 'function f(\na) {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(a = 1,) {}',
      output: 'function f(a = 1) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'function f(\na = 1,) {}',
      output: 'function f(\na = 1) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'function f(a: number,) {}',
      output: 'function f(a: number) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(\na: number,) {}',
      output: 'function f(\na: number) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    ///
    {
      code: 'function f(\na,b,) {} ',
      output: 'function f(\na,b) {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(\na,\nb,) {} ',
      output: 'function f(\na,\nb) {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(\na,b = 1,) {}',
      output: 'function f(\na,b = 1) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'function f(\na,\nb = 1,) {}',
      output: 'function f(\na,\nb = 1) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'function f(\na,\nb: number,) {}',
      output: 'function f(\na,\nb: number) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'function f(\na,\nb: number,) {}',
      output: 'function f(\na,\nb: number) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },


    //
    // FunctionExpression
    //
    {
      code: 'f = function(a,) {} ',
      output: 'f = function(a) {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(\na,) {} ',
      output: 'f = function(\na) {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(a = 1,) {}',
      output: 'f = function(a = 1) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = function(\na = 1,) {}',
      output: 'f = function(\na = 1) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = function(a: number,) {}',
      output: 'f = function(a: number) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(\na: number,) {}',
      output: 'f = function(\na: number) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    ///
    {
      code: 'f = function(\na,b,) {} ',
      output: 'f = function(\na,b) {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(a,\nb,) {} ',
      output: 'f = function(a,\nb) {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(\na,b = 1,) {}',
      output: 'f = function(\na,b = 1) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = function(a,\nb = 1,) {}',
      output: 'f = function(a,\nb = 1) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = function(\na,b: number,) {}',
      output: 'f = function(\na,b: number) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = function(a,\nb: number,) {}',
      output: 'f = function(a,\nb: number) {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },


    //
    // ArrowFunctionExpression
    //
    {
      code: 'f = (a,) => {} ',
      output: 'f = (a) => {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = (\na,) => {} ',
      output: 'f = (\na) => {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = (a = 1,) => {}',
      output: 'f = (a = 1) => {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = (\na = 1,) => {}',
      output: 'f = (\na = 1) => {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    // A babel-eslint bug is incorrectly ignoring the type annotation when
    // calculating the param loc.
    // {
    //   code: 'f = (\na: number,) => {}',
    //   output: 'f = (\na: number) => {}',
    //   errors: [
    //     {
    //       message: 'Unexpected trailing comma.',
    //       type: 'Identifier',
    //     },
    //   ],
    // },
    // {
    //   code: 'f = (a: number,) => {}',
    //   output: 'f = (a: number) => {}',
    //   errors: [
    //     {
    //       message: 'Unexpected trailing comma.',
    //       type: 'Identifier',
    //     },
    //   ],
    // },
    ///
    {
      code: 'f = (\na,\nb,) => {} ',
      output: 'f = (\na,\nb) => {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = (a,\nb,) => {} ',
      output: 'f = (a,\nb) => {} ',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'Identifier',
        },
      ],
    },
    {
      code: 'f = (\na,\nb = 1,) => {}',
      output: 'f = (\na,\nb = 1) => {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    {
      code: 'f = (a,\nb = 1,) => {}',
      output: 'f = (a,\nb = 1) => {}',
      errors: [
        {
          message: 'Unexpected trailing comma.',
          type: 'AssignmentPattern',
        },
      ],
    },
    // {
    //   code: 'f = (\na,\nb: number,) => {}',
    //   output: 'f = (\na,\nb: number) => {}',
    //   errors: [
    //     {
    //       message: 'Unexpected trailing comma.',
    //       type: 'Identifier',
    //     },
    //   ],
    // },
    // {
    //   code: 'f = (a,\nb: number,) => {}',
    //   output: 'f = (a,\nb: number) => {}',
    //   errors: [
    //     {
    //       message: 'Unexpected trailing comma.',
    //       type: 'Identifier',
    //     },
    //   ],
    // },
  ],
});
