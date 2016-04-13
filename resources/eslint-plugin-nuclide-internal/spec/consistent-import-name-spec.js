'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const rule = require('../consistent-import-name');
const RuleTester = require('eslint').RuleTester;

const ruleTester = new RuleTester();

ruleTester.run('consistent-import-name', rule, {
  valid: [
    {code: 'var path = require("path")'},
    {code: 'var pathModule = require("path")'},
    {code: 'require("path")'},
    {code: 'var whateverModule = require("whateverModule")'},
    {
      code: 'import "path"',
      ecmaFeatures: {modules: true},
    },
    {
      code: 'import pathModule from "path"',
      ecmaFeatures: {modules: true},
    },
    {
      code: 'import * as path from "path"', // used as "import typeof"
      ecmaFeatures: {modules: true},
    },
  ],
  invalid: [
    {
      code: 'var pathUtils = require("path")',
      errors: [{
        message: 'path should be named "path" or "pathModule"',
        type: 'Identifier',
      }],
    },
    {
      code: 'var {path} = require("path")',
      ecmaFeatures: {destructuring: true},
      errors: [{
        message: 'path should be named "path" or "pathModule"',
        type: 'ObjectPattern',
      }],
    },
    {
      code: 'import pathUtils from "path"',
      ecmaFeatures: {modules: true},
      errors: [{
        message: 'path should be named "path" or "pathModule"',
        type: 'ImportDefaultSpecifier',
      }],
    },
    {
      code: 'import * as pathUtils from "path"',
      ecmaFeatures: {modules: true},
      errors: [{
        message: 'path should be named "path" or "pathModule"',
        type: 'ImportNamespaceSpecifier',
      }],
    },
    {
      code: 'import {path} from "path"',
      ecmaFeatures: {modules: true},
      errors: [{
        message: 'path should be named "path" or "pathModule"',
        type: 'ImportSpecifier',
      }],
    },
    {
      code: 'import pathModule, {path} from "path"',
      ecmaFeatures: {modules: true},
      errors: [{
        message: 'path should be named "path" or "pathModule"',
        type: 'ImportSpecifier',
      }],
    },
    {
      code: 'import pathUtils, {path} from "path"',
      ecmaFeatures: {modules: true},
      errors: [{
        message: 'path should be named "path" or "pathModule"',
        type: 'ImportDefaultSpecifier',
      }, {
        message: 'path should be named "path" or "pathModule"',
        type: 'ImportSpecifier',
      }],
    },
  ],
});
