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
var getUndeclaredTypes = require('../utils/getUndeclaredTypes');

var {statement} = jscs.template;

function addMissingTypes(root: Collection, options: Options): void {
  var first = getFirstNodePath(root, options);
  if (!first) {
    return;
  }

  // Add the missing imports
  var undeclared = getUndeclaredTypes(root, options);
  undeclared.forEach(name => {
    var moduleName = options.commonAliases.get(name) || name;
    // TODO: remove this hack
    var node = statement`import type _ from '_';`;
    node.specifiers[0].id = jscs.identifier(name);
    node.specifiers[0].local = jscs.identifier(name);
    node.source = jscs.literal(moduleName);
    first.insertAfter(node);
  });
}

module.exports = addMissingTypes;
