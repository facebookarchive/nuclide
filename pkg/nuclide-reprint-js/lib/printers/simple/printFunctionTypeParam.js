'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {FunctionTypeParam} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printFunctionTypeParam(print: Print, node: FunctionTypeParam): Lines {
  return flatten([
    print(node.name),
    markers.noBreak,
    node.optional ? '?:' : ':',
    markers.noBreak,
    markers.space,
    print(node.typeAnnotation),
  ]);
}

module.exports = printFunctionTypeParam;
