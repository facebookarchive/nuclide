'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Collection} from '../types/ast';
import type {Options} from '../types/options';

var jscs = require('jscodeshift');

var getFirstNodePath = require('../utils/getFirstNodePath');
var getJSXIdentifiers = require('../utils/getJSXIdentifiers');
var getUndeclaredIdentifiers = require('../utils/getUndeclaredIdentifiers');

function addMissingRequires(root: Collection, options: Options): void {
  var first = getFirstNodePath(root, options);
  if (!first) {
    return;
  }

  // Helper to add simple requires.
  function addRequire(name: string, moduleName: string): void {
    var node = jscs.variableDeclaration(
      'var',
      [jscs.variableDeclarator(
        jscs.identifier(name),
        jscs.callExpression(
          jscs.identifier('require'),
          [jscs.literal(moduleName)]
        )
      )]
    );
    first.insertAfter(node);
  }

  // Add the missing requires.
  getUndeclaredIdentifiers(root, options).forEach(name => {
    var moduleName = options.commonAliases.get(name) || name;
    addRequire(name, moduleName);
  });

  // JSX identifiers are always non-declaration identifiers. They always have
  // to be declared somewhere else in a regular variable.
  getJSXIdentifiers(root, options).forEach(name => {
    var moduleName = options.commonAliases.get(name) || name + '.react';
    addRequire(name, moduleName);
  });
}

module.exports = addMissingRequires;
