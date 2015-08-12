'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Collection, NodePath} from '../types/ast';
import type {Options} from '../types/options';

var jscs = require('jscodeshift');

/**
 * This gets the first safe node path to start adding requires after. Could be
 * null, in which case scripts should bail out and do nothing.
 *
 * TODO: Don't assume there is a 'use-strict' that we can use as the first path
 * TODO: Alternatively, always add the 'use-strict' as something we can use
 */
function getFirstNodePath(root: Collection, options: Options): NodePath {
  return root
    .find(jscs.ExpressionStatement, {expression: {value: 'use strict'}})
    .paths()[0];
}

module.exports = getFirstNodePath;
