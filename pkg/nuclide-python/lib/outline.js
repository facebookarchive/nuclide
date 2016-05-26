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
import type {TextToken} from '../../nuclide-tokenized-text/lib/rpc-types';

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
import {asyncExecute} from '../../commons-node/process';
import {getPythonPath} from './config';

const SHOW_NO_VARIABLES = 'none';
const SHOW_CONSTANTS = 'constants';
const SHOW_ALL_VARIABLES = 'all';

type ShowVariableMode = 'none' | 'constants' | 'all';

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

export async function pythonTextToOutline(
  showGlobalVariables: boolean,
  text: string
): Promise<?Outline> {
  try {
    const tree = await getPythonTree(text);
    return tree == null ? null : treeToOutline(showGlobalVariables, tree);
  } catch (e) {
    logger.error('Exception getting outline: ', e);
    return null;
  }
}

function treeToOutline(showGlobalVariables: boolean, tree: PythonTree): ?Outline {
  switch (tree.kind) {
    case 'Module':
      return {
        outlineTrees: treesToOutlineTrees(showGlobalVariables
          ? SHOW_ALL_VARIABLES : SHOW_CONSTANTS, tree.body),
      };
    default:
      logger.error(`Cannot convert python tree kind ${tree.kind}`);
      return null;
  }
}

async function getPythonTree(text: string): Promise<?PythonTree> {
  const result = await asyncExecute(
    getPythonPath(),
    [path.join(__dirname, '../python/outline.py')],
    {stdin: text});
  if (result.exitCode !== 0) {
    logger.error(`Python tree failed to get results: stderr: ${result.stderr}`);
    return null;
  }
  return JSON.parse(result.stdout);
}

function treesToOutlineTrees(
  showVariables: ShowVariableMode,
  trees: Array<PythonTree>
): Array<OutlineTree> {
  return ((trees.map(tree => treeToOutlineTree(showVariables, tree))
      .filter(outlineTree => outlineTree != null): any): Array<OutlineTree>);
}

function treeToOutlineTree(showVariables: ShowVariableMode, tree: PythonTree): ?OutlineTree {
  switch (tree.kind) {
    case 'FunctionDef':
      return functionDefToOutline(tree);
    case 'ClassDef':
      return classDefToOutline(tree);
    case 'Assign':
      return assignToOutline(showVariables, tree);
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

function assignToOutline(mode: ShowVariableMode, tree: AssignTree): ?OutlineTree {
  if (mode === SHOW_NO_VARIABLES) {
    return null;
  }
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
  if (mode === SHOW_CONSTANTS && id !== id.toUpperCase()) {
    return null;
  }
  return {
    tokenizedText: [
      plain(id),
    ],
    representativeName: id,
    startPosition: treeToPoint(target),
    children: [],
  };
}

function classDefToOutline(tree: ClassDefTree): OutlineTree {
  return {
    tokenizedText: [
      keyword('class'),
      whitespace(' '),
      method(tree.name),
    ],
    representativeName: tree.name,
    startPosition: treeToPoint(tree),
    children: treesToOutlineTrees(SHOW_NO_VARIABLES, tree.body),
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
    representativeName: tree.name,
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
