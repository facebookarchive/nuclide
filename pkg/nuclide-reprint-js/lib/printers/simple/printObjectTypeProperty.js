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
import type {ObjectTypeProperty} from 'ast-types-flow';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printObjectTypeProperty(
  print: Print,
  node: ObjectTypeProperty,
): Lines {
  // TODO: What does static mean here?
  return flatten([
    print(node.key),
    markers.noBreak,
    node.optional ? '?:' : ':',
    markers.noBreak,
    markers.space,
    print(node.value),
  ]);
}

module.exports = printObjectTypeProperty;
