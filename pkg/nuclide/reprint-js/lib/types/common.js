'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type Immutable from 'immutable';
import type {Node} from 'ast-types-flow';
import type Options from '../options/Options';

export type Path = Immutable.List<Node>;
export type Lines = Array<string | Lines>;
export type Print = (node: any) => Lines;

export type Context = {
  /**
   * The starting position of invalid leading comments.
   */
  invalidLeadingComments: Immutable.Set<number>,
  /**
   * The starting position of invalid trailing comments.
   */
  invalidTrailingComments: Immutable.Set<number>,
  options: Options,
  path: Immutable.List<Node>,
};

export type Output = {
  source: string,
};
