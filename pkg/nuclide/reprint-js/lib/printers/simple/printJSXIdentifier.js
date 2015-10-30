'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {JSXIdentifier} from 'ast-types-flow';
import type {Lines, Print} from '../../types/common';

function printJSXIdentifier(print: Print, node: JSXIdentifier): Lines {
  return [node.name];
}

module.exports = printJSXIdentifier;
