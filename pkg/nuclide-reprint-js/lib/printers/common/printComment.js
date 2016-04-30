'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Lines} from '../../types/common';

import flatten from '../../utils/flatten';
import markers from '../../constants/markers';

function printComment(node: any): Lines {
  if (node.type === 'CommentBlock') {
    return flatten([('/*' + node.value + '*/').split('\n').map(part => {
      const trimmed = part.trim();
      return [
        trimmed.startsWith('*') ? ' ' + trimmed : trimmed,
        markers.hardBreak,
      ];
    })]);
  }

  if (node.type === 'CommentLine') {
    return ['//', node.value, markers.hardBreak];
  }

  return [];
}

module.exports = printComment;
