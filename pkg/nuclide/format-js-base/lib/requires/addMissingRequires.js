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
import type {SourceOptions} from '../options/SourceOptions';

var jscs = require('jscodeshift');

var getFirstNodePath = require('../utils/getFirstNodePath');
var getUndeclaredIdentifiers = require('../utils/getUndeclaredIdentifiers');
var getUndeclaredJSXIdentifiers = require('../utils/getUndeclaredJSXIdentifiers');

function addMissingRequires(root: Collection, options: SourceOptions): void {
  var first = getFirstNodePath(root);
  if (!first) {
    return;
  }

  var {moduleMap} = options;

  // Add the missing requires.
  getUndeclaredIdentifiers(root, options).forEach(name => {
    var node = moduleMap.getRequire(name, {path: options.sourcePath});
    first.insertAfter(node);
  });

  // Add missing JSX requires.
  getUndeclaredJSXIdentifiers(root, options).forEach(name => {
    var node = moduleMap.getRequire(name, {
      path: options.sourcePath,
      jsxIdentifier: true,
    });
    first.insertAfter(node);
  });
}

module.exports = addMissingRequires;
