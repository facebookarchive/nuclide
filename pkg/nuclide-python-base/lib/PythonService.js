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

import {asyncExecute} from '../../commons-node/process';
import {maybeToString} from '../../commons-node/string';
import nuclideUri from '../../nuclide-remote-uri';
import JediServerManager from './JediServerManager';

export type PythonCompletion = {
  type: string;
  text: string;
  description?: string;
  params?: Array<string>;
};

export type PythonDefinition = {
  type: string;
  text: string;
  file: NuclideUri;
  line: number;
  column: number;
};

export type PythonReference = {
  type: string;
  text: string;
  file: NuclideUri;
  line: number;
  column: number;
  parentName?: string;
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

let formatterPath;
function getFormatterPath() {
  if (formatterPath) {
    return formatterPath;
  }

  formatterPath = 'yapf';

  try {
    const overridePath = require('./fb/find-formatter-path')();
    if (overridePath) {
      formatterPath = overridePath;
    }
  } catch (e) {
    // Ignore.
  }

  return formatterPath;
}

const serverManager = new JediServerManager();

export async function getCompletions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?Array<PythonCompletion>> {
  const service = await serverManager.getJediService(src);
  return service.get_completions(
      src,
      contents,
      line,
      column,
    );
}

export async function getDefinitions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?Array<PythonDefinition>> {
  const service = await serverManager.getJediService(src);
  return service.get_definitions(
      src,
      contents,
      line,
      column,
    );
}

export async function getReferences(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
): Promise<?Array<PythonReference>> {
  const service = await serverManager.getJediService(src);
  return service.get_references(
      src,
      contents,
      line,
      column,
    );
}

export async function getOutline(
  src: NuclideUri,
  contents: string,
): Promise<?Array<PythonOutlineItem>> {
  const service = await serverManager.getJediService(src);
  return service.get_outline(src, contents);
}

export async function formatCode(
  src: NuclideUri,
  contents: string,
  start: number,
  end: number,
): Promise<string> {
  const libCommand = getFormatterPath();
  const dirName = nuclideUri.dirname(nuclideUri.getPath(src));

  const result = await asyncExecute(
    libCommand,
    ['--line', `${start}-${end}`],
    {cwd: dirName, stdin: contents},
  );

  /*
   * At the moment, yapf outputs 3 possible exit codes:
   * 0 - success, no content change.
   * 2 - success, contents changed.
   * 1 - internal failure, most likely due to syntax errors.
   *
   * See: https://github.com/google/yapf/issues/228#issuecomment-198682079
   */
  if (result.exitCode === 1) {
    throw new Error(`"${libCommand}" failed, likely due to syntax errors.`);
  } else if (result.exitCode == null) {
    throw new Error(
      `"${libCommand}" failed with error: ${maybeToString(result.errorMessage)}, ` +
      `stderr: ${result.stderr}, stdout: ${result.stdout}.`
    );
  } else if (contents !== '' && result.stdout === '') {
    // Throw error if the yapf output is empty, which is almost never desirable.
    throw new Error('Empty output received from yapf.');
  }

  return result.stdout;
}
