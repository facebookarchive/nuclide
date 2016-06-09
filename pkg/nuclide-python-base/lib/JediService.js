'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {NuclideUri} from '../../nuclide-remote-uri';

// This file contains RPC definitions for jediserver.py.

export type PythonCompletion = {
  type: string;
  text: string;
  description?: string;
  params?: Array<string>;
};

export type PythonCompletionsResult = {
  completions: Array<PythonCompletion>;
};

export type PythonDefinition = {
  type: string;
  text: string;
  file: NuclideUri;
  line: number;
  column: number;
};

export type PythonDefinitionsResult = {
  definitions: Array<PythonDefinition>;
};

export type PythonReference = {
  type: string;
  text: string;
  file: NuclideUri;
  line: number;
  column: number;
  parentName?: string;
};

export type PythonReferencesResult = {
  references: Array<PythonReference>;
};

export type Position = {
  line: number;
  column: number;
};

export type PythonFunctionItem = {
  kind: 'function';
  name: string;
  start: Position;
  end: Position;
  children?: Array<PythonOutlineItem>;
  docblock?: string;
  params?: Array<string>;
};

export type PythonClassItem = {
  kind: 'class';
  name: string;
  start: Position;
  end: Position;
  children?: Array<PythonOutlineItem>;
  docblock?: string;
  // Class params, i.e. superclasses.
  params?: Array<string>;
};

export type PythonStatementItem = {
  kind: 'statement';
  name: string;
  start: Position;
  end: Position;
  docblock?: string;
};

export type PythonOutlineItem = PythonFunctionItem | PythonClassItem | PythonStatementItem;

export type PythonOutlineResult = {
  items: Array<PythonOutlineItem>
};

export async function get_completions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?PythonCompletionsResult> {
  throw new Error('RPC Stub');
}

export async function get_definitions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?PythonDefinitionsResult> {
  throw new Error('RPC Stub');
}

export async function get_references(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?PythonReferencesResult> {
  throw new Error('RPC Stub');
}

export function get_outline(
  src: NuclideUri,
  contents: string,
): Promise<?PythonOutlineResult> {
  throw new Error('RPC Stub');
}
