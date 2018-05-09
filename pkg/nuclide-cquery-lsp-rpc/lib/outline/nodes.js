/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {OutlineTree} from 'atom-ide-ui';

import {type} from 'nuclide-commons/tokenized-text';
import {Point} from 'simple-text-buffer';

export function createNamespaceNode(
  name: string,
  startPosition: ?atom$Point,
): OutlineTree {
  return {
    representativeName: name,
    plainText: name,
    startPosition: startPosition == null ? new Point(0, 0) : startPosition,
    children: [],
    kind: 'module',
    tokenizedText: [type(name)],
  };
}
