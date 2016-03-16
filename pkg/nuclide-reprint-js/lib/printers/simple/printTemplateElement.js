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
import type {TemplateElement} from 'ast-types-flow';

function printTemplateElement(print: Print, node: TemplateElement): Lines {
  return [node.value.raw];
}

module.exports = printTemplateElement;
