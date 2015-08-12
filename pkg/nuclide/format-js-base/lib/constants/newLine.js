'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var jscs = require('jscodeshift');

/**
 * This module helps support a hack to easily introduce new lines into the AST.
 */
module.exports = {
  statement: jscs.expressionStatement(jscs.identifier('$$newline$$')),
  regex: /[^\n]*\$\$newline\$\$[^\n]*\n/g,
};
