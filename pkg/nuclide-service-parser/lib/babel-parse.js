'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Program} from 'ast-types-flow';

import parse from 'babel-core/lib/helpers/parse';

const BABYLON_OPTIONS = {
  allowHashBang: true,
  sourceType: 'module',
  ecmaVersion: Infinity,
  features: {
    'es7.asyncFunctions': true,
    'es7.classProperties': true,
    'es7.comprehensions': true,
    'es7.decorators': true,
    'es7.doExpressions': true,
    'es7.exponentiationOperator': true,
    'es7.exportExtensions': true,
    'es7.functionBind': true,
    'es7.objectRestSpread': true,
    'es7.trailingFunctionCommas': true,
  },
  plugins: {
    jsx: true,
    flow: true,
  },
};

export default function babelParse(source: string): ?Program {
  const ast = parse(source, BABYLON_OPTIONS);
  if (ast.program && ast.program.type === 'Program') {
    return ast.program;
  } else {
    return null;
  }
}
