'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Lines, Print} from '../../types/common';
import type {TypeAlias} from 'ast-types-flow';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printTypeAlias(print: Print, node: TypeAlias): Lines {
  return flatten([
    'type',
    markers.noBreak,
    markers.space,
    print(node.id),
    node.typeParameters ? print(node.typeParameters) : markers.empty,
    markers.noBreak,
    markers.space,
    '=',
    markers.space,
    print(node.right),
    markers.noBreak,
    ';',
    markers.hardBreak,
  ]);
}

module.exports = printTypeAlias;
