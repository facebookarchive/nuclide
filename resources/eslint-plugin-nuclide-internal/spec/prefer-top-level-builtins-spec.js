'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const rule = require('../prefer-top-level-builtins');
const RuleTester = require('eslint').RuleTester;

const ATOM_BUILTIN_ERROR = {
  message: 'Atom builtin modules should be imported top-level.',
  nodeType: 'CallExpression',
};

const NODE_BUILTIN_ERROR = {
  message: 'Node builtin modules should be imported top-level.',
  nodeType: 'CallExpression',
};

const ruleTester = new RuleTester();

ruleTester.run('top-level-builtins', rule, {
  valid: [
    {code: 'require("fs")'},
    {code: 'var fs = require("fs")'},
    {code: 'module.exports = require("fs")'},

    {code: 'var a = require("a")'},
    {code: 'module.exports = function() { require("a") }'},
    {code: 'try { require("a") } catch(err) {}'},
    {
      code: 'function f(a = require("a")) {}',
      ecmaFeatures: {defaultParams: true},
    },
  ],
  invalid: [
    {
      code: 'module.exports = function() { require("atom") }',
      errors: [ATOM_BUILTIN_ERROR],
    },
    {
      code: 'module.exports = function() { require("fs") }',
      errors: [NODE_BUILTIN_ERROR],
    },
    {
      code: 'try { require("fs") } catch(err) {}',
      errors: [NODE_BUILTIN_ERROR],
    },
    {
      code: 'function f(fs = require("fs")) {}',
      ecmaFeatures: {defaultParams: true},
      errors: [NODE_BUILTIN_ERROR],
    },
  ],
});
