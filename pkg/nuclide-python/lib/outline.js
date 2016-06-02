'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
OutlineTree,
Outline,
} from '../../nuclide-outline-view';
import type {TextToken} from '../../nuclide-tokenized-text';
import type {
  JediOutlineItem,
  JediClassItem,
  JediFunctionItem,
  JediStatementItem,
} from '../../nuclide-python-base';
import type {NuclideUri} from '../../nuclide-remote-uri';

import {Point} from 'atom';
import {
 keyword,
 method,
 param,
 whitespace,
 plain,
} from '../../nuclide-tokenized-text';
import {getServiceByNuclideUri} from '../../nuclide-remote-connection';

type ShowVariableMode = 'none' | 'constants' | 'all';

function itemToOutlineTree(
  mode: ShowVariableMode,
  item: JediOutlineItem
): ?OutlineTree {
  switch (item.kind) {
    case 'class':
      return classToOutlineTree('all', item);
    case 'function':
      return functionToOutlineTree(item);
    case 'statement':
      return statementToOutlineTree(mode, item);
  }
}

function itemsToOutline(
  mode: ShowVariableMode,
  items: ?Array<JediOutlineItem>
): Array<OutlineTree> {
  if (!items || items.length === 0) {
    return [];
  }
  const result = [];
  items.map(i => itemToOutlineTree(mode, i)).forEach(tree => {
    if (tree) {
      result.push(tree);
    }
  });
  return result;
}

function classToOutlineTree(
  mode: ShowVariableMode,
  item: JediClassItem
): OutlineTree {
  return {
    tokenizedText: [
      keyword('class'),
      whitespace(' '),
      method(item.name),
    ],
    representativeName: item.name,
    children: itemsToOutline(mode, item.children),
    ...itemToPositions(item),
  };
}

function functionToOutlineTree(item: JediFunctionItem): OutlineTree {
  return {
    tokenizedText: [
      keyword('def'),
      whitespace(' '),
      method(item.name),
      plain('('),
      ...argsToText(item.params || []),
      plain(')'),
    ],
    representativeName: item.name,
    children: [],
    ...itemToPositions(item),
  };
}

function statementToOutlineTree(
  mode: ShowVariableMode,
  item: JediStatementItem
): ?OutlineTree {
  if (mode === 'none') {
    return null;
  }
  const name = item.name;
  // Only show initialization of constants, which according to python
  // style are all upper case.
  if (mode === 'constants' && name !== name.toUpperCase()) {
    return null;
  }

  return {
    tokenizedText: [
      plain(name),
    ],
    representativeName: name,
    children: [],
    ...itemToPositions(item),
  };
}

function argsToText(args: Array<string>): Array<TextToken> {
  const result = [];

  function startArg() {
    if (result.length > 0) {
      result.push(plain(','));
      result.push(whitespace(' '));
    }
  }
  args.forEach(arg => {
    startArg();
    if (arg.startsWith('**')) {
      result.push(plain('**'));
      result.push(param(arg.slice(2)));
    } else if (arg.startsWith('*')) {
      result.push(plain('*'));
      result.push(param(arg.slice(1)));
    } else {
      result.push(param(arg));
    }
  });

  return result;
}

function itemToPositions(item: JediOutlineItem): {
  startPosition: atom$Point;
  endPosition: atom$Point;
} {
  const {start, end} = item;
  return {
    startPosition: new Point(start.line - 1, start.column),
    // Outline's endPosition is inclusive, while Jedi's is exclusive.
    // By decrementing the end column, we avoid situations where
    // two items are highlighted at once. End column may end up as -1,
    // which still has the intended effect.
    endPosition: new Point(end.line - 1, end.column - 1),
  };
}

export async function generateOutline(
  src: NuclideUri,
  contents: string,
  mode: ShowVariableMode
): Promise<?Outline> {
  const service = await getServiceByNuclideUri('JediService', src);
  if (!service) {
    return null;
  }

  const result = await service.getOutline(src, contents);
  if (result == null) {
    return null;
  }

  return {
    outlineTrees: itemsToOutline(mode, result.items),
  };
}
