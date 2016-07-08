'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Context, Lines, Print} from '../../types/common';
import type {Literal} from 'ast-types-flow';

import escapeStringLiteral from '../../utils/escapeStringLiteral';
import flatten from '../../utils/flatten';
import invariant from 'assert';
import markers from '../../constants/markers';

function printLiteral(print: Print, node: Literal, context: Context): Lines {
  const last = context.path.last();

  // JSXAttributes should always use double quotes.
  if (last && last.type === 'JSXAttribute') {
    invariant(
      typeof node.value === 'string',
      'Literals within a JSXAttribute should always be a string',
    );
    return [escapeStringLiteral(node.value, {quotes: 'double'})];
  }

  // JSXElements don't need quotes, so we need special handling.
  if (last && last.type === 'JSXElement') {
    invariant(
      typeof node.value === 'string',
      'Literals within a JSXElement should always be a string',
    );
    const lines = node.value.split('\n');
    let spaceNeeded = true;
    return flatten(lines.map((line, i) => {
      // Note: Scope is already opened in the JSXElement.
      // We have to check in order to avoid consecutive spaces when the scope
      // is not broken.
      const breakMarker = spaceNeeded
        ? markers.scopeSpaceBreak
        : markers.scopeBreak;
      if (/^\s*$/.test(line)) {
        spaceNeeded = false;
      } else {
        spaceNeeded = true;
      }
      // $FlowFixMe(kad)
      return [
        i > 0 ? breakMarker : markers.empty,
        line,
      ];
    }));
  }

  return [literalToString(node)];
}

function literalToString(node: Literal): string {
  if (typeof node.value === 'string') {
    return escapeStringLiteral(node.value, {quotes: 'single'});
  }
  // It's not safe to use value for number literals that would lose precision.
  if (node.raw != null) {
    return node.raw;
  }
  return markers.empty;
}

module.exports = printLiteral;
