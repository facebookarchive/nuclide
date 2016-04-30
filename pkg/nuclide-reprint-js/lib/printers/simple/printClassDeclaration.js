'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {ClassDeclaration} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printClassDeclaration(print: Print, node: ClassDeclaration): Lines {
  let parts = flatten([
    'class',
    markers.noBreak,
    markers.space,
    print(node.id),
    node.typeParameters
      ? [markers.noBreak, print(node.typeParameters)]
      : markers.empty,
    markers.noBreak,
    markers.space,
  ]);

  if (node.superClass) {
    const superClass = node.superClass;
    parts = flatten([
      parts,
      'extends',
      markers.noBreak,
      markers.space,
      print(superClass),
      node.superTypeParameters
        ? [markers.noBreak, print(node.superTypeParameters)]
        : markers.empty,
      markers.noBreak,
      markers.space,
    ]);
  }

  return flatten([
    parts,
    print(node.body),
    markers.hardBreak,
  ]);
}

module.exports = printClassDeclaration;
