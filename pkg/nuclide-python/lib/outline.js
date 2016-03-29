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

import {Point} from 'atom';
import {getLogger} from '../../nuclide-logging';
import {
  keyword,
  method,
  param,
  whitespace,
  plain,
} from '../../nuclide-tokenized-text';
import path from 'path';
import {checkOutput} from '../../nuclide-commons';
import {getPythonPath} from './config';

const logger = getLogger();

type FunctionDefTree = {
  kind: 'FunctionDef';
  name: string;
  args: ArgumentsTree;
  body: Array<PythonTree>;
  lineno: number;
  col_offset: number;
};
type ClassDefTree = {
  kind: 'ClassDef';
  name: string;
  bases: Array<NameTree>;
  body: Array<PythonTree>;
  lineno: number;
  col_offset: number;
};
type AssignTree = {
  kind: 'Assign';
  targets: Array<PythonTree>;
  value: PythonTree;
  lineno: number;
  col_offset: number;
};
type ArgumentsTree = {
  kind: 'arguments';
  vararg: ?string;
  args: Array<NameTree>;
  defaults: Array<PythonTree>;
  kwarg: ?string;
};
type NameTree = {
  kind: 'Name';
  ctx: ParamTree | LoadTree;
  id: string;
  lineno: number;
  col_offset: number;
};
type ParamTree = {
  kind: 'Param';
};
type LoadTree = {
  kind: 'Load';
};
type ModuleTree = {
  kind: 'Module';
  body: Array<PythonTree>;
};
type ImportTree = {
  kind: 'Import';
  names: Array<AliasTree>;
  lineno: number;
  col_offset: number;
};
type ImportFromTree = {
  kind: 'ImportFrom';
  module: string;
  names: Array<AliasTree>;
  lineno: number;
  col_offset: number;
};
type AliasTree = {
  kind: 'alias';
  name: string;
  asname: ?string;
};
type PositionTree =
  AssignTree
  | ClassDefTree
  | FunctionDefTree
  | ImportTree
  | ImportFromTree
  | NameTree;
export type PythonTree =
  FunctionDefTree
  | AliasTree
  | ArgumentsTree
  | AssignTree
  | ClassDefTree
  | ImportTree
  | ImportFromTree
  | ModuleTree
  | NameTree
  | ParamTree;

export async function pythonTextToOutline(text: string): Promise<?Outline> {
  try {
    const tree = await getPythonTree(text);
    return tree == null ? null : treeToOutline(tree);
  } catch (e) {
    logger.error('Exception getting outline: ', e);
    return null;
  }
}

function treeToOutline(tree: PythonTree): ?Outline {
  const showConstants = true;
  switch (tree.kind) {
    case 'Module':
      return {
        outlineTrees: treesToOutlineTrees(showConstants, tree.body),
      };
    default:
      logger.error(`Cannot convert python tree kind ${tree.kind}`);
      return null;
  }
}

async function getPythonTree(text: string): Promise<?PythonTree> {
  const result = await checkOutput(
    getPythonPath(),
    [path.join(__dirname, '../python/outline.py')],
    {stdin: text});
  if (result.exitCode !== 0) {
    logger.error(`Python tree failed to get results: stderr: ${result.stderr}`);
    return null;
  }
  return JSON.parse(result.stdout);
}

function treesToOutlineTrees(showConstants: boolean, trees: Array<PythonTree>): Array<OutlineTree> {
  return ((trees.map(tree => treeToOutlineTree(showConstants, tree))
      .filter(outlineTree => outlineTree != null): any): Array<OutlineTree>);
}

function treeToOutlineTree(showConstants: boolean, tree: PythonTree): ?OutlineTree {
  switch (tree.kind) {
    case 'FunctionDef':
      return functionDefToOutline(tree);
    case 'ClassDef':
      return classDefToOutline(tree);
    case 'Assign':
      return showConstants ? assignToOutline(tree) : null;
    case 'Expr':
    case 'For':
    case 'If':
    case 'Import':
    case 'ImportFrom':
    case 'Print':
    case 'TryExcept':
      return null;
    default:
      logger.error(`Unexpected python outline tree kind ${tree.kind}`);
      return null;
  }
}

function assignToOutline(tree: AssignTree): ?OutlineTree {
  if (tree.targets.length !== 1) {
    return null;
  }
  const target = tree.targets[0];
  if (target.kind !== 'Name') {
    return null;
  }
  const id = target.id;
  // Only show initialization of constants, which according to python
  // style are all upper case.
  if (id !== id.toUpperCase()) {
    return null;
  }
  return {
    tokenizedText: [
      plain(id),
    ],
    startPosition: treeToPoint(target),
    children: [],
  };
}

function classDefToOutline(tree: ClassDefTree): OutlineTree {
  const showConstants = false;
  return {
    tokenizedText: [
      keyword('class'),
      whitespace(' '),
      method(tree.name),
    ],
    startPosition: treeToPoint(tree),
    children: treesToOutlineTrees(showConstants, tree.body),
  };
}

function functionDefToOutline(tree: FunctionDefTree): OutlineTree {
  return {
    tokenizedText: [
      keyword('def'),
      whitespace(' '),
      method(tree.name),
      plain('('),
      ...argsToText(tree.args),
      plain(')'),
    ],
    startPosition: treeToPoint(tree),
    children: [],
  };
}

function argsToText(args: ArgumentsTree): Array<TextToken> {

  function startArg() {
    if (result.length > 0) {
      result.push(plain(','));
      result.push(whitespace(' '));
    }
  }
  const result = [];
  const vararg = args.vararg;
  if (vararg != null) {
    result.push(plain('*'));
    result.push(param(vararg));
  }
  for (const arg of args.args) {
    startArg();
    result.push(param(arg.id));
  }
  const kwarg = args.kwarg;
  if (kwarg != null) {
    startArg();
    result.push(plain('**'));
    result.push(param(kwarg));
  }
  return result;
}

function treeToPoint(tree: PositionTree): atom$Point {
  return new Point(tree.lineno - 1, tree.col_offset);
}
