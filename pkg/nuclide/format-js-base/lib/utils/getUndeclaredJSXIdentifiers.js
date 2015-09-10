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

var getDeclaredIdentifiers = require('./getDeclaredIdentifiers');
var getJSXIdentifiers = require('./getJSXIdentifiers');

function getUndeclaredJSXIdentifiers(
  root: Collection,
  options: SourceOptions
): Set<string> {
  var declaredIdentifiers = getDeclaredIdentifiers(root, options);
  var jsxIdentifiers = getJSXIdentifiers(root);
  var undeclared = new Set();
  for (var id of jsxIdentifiers) {
    if (!declaredIdentifiers.has(id)) {
      undeclared.add(id);
    }
  }
  return undeclared;
}

module.exports = getUndeclaredJSXIdentifiers;
