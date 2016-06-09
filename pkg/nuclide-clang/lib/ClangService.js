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
import type {
  ClangCompileResult,
  ClangCompletion,
  ClangDeclaration,
  ClangCursor,
  ClangOutlineTree,
} from './rpc-types';

import {Observable} from 'rxjs';
import {checkOutput} from '../../commons-node/process';
import ClangServerManager from './ClangServerManager';

const serverManager = new ClangServerManager();

/**
 * Compiles the specified source file (automatically determining the correct compilation flags).
 * It currently returns an Observable just to circumvent the 60s service timeout for Promises.
 * TODO(9519963): Stream back more detailed compile status message.
 *
 * If `clean` is provided, any existing Clang server for the file is restarted.
 */
export function compile(
  src: NuclideUri,
  contents: string,
  clean: boolean,
  defaultFlags?: Array<string>,
): Observable<?ClangCompileResult> {
  if (clean) {
    serverManager.reset(src);
  }
  const doCompile = async () => {
    // Note: restarts the server if the flags changed.
    const server = await serverManager.getClangServer(src, contents, defaultFlags, true);
    if (server != null) {
      return server.call('compile', {contents})
        .then(result => ({
          ...result,
          accurateFlags: !server.usesDefaultFlags(),
        }));
    }
  };
  return Observable.fromPromise(doCompile());
}

export async function getCompletions(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  tokenStartColumn: number,
  prefix: string,
  defaultFlags?: Array<string>,
): Promise<?Array<ClangCompletion>> {
  const server = await serverManager.getClangServer(src, contents, defaultFlags);
  if (server != null) {
    return server.call('get_completions', {
      contents,
      line,
      column,
      tokenStartColumn,
      prefix,
    });
  }
}

export async function getDeclaration(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  defaultFlags?: Array<string>,
): Promise<?ClangDeclaration> {
  const server = await serverManager.getClangServer(src, contents, defaultFlags);
  if (server != null) {
    return server.call('get_declaration', {
      contents,
      line,
      column,
    });
  }
}

// Fetches information for a declaration and all its parents.
// The first element in info will be for the declaration itself,
// the second will be for its direct semantic parent (if it exists), etc.
export async function getDeclarationInfo(
  src: NuclideUri,
  contents: string,
  line: number,
  column: number,
  defaultFlags: ?Array<string>,
): Promise<?Array<ClangCursor>> {
  const server = await serverManager.getClangServer(src, contents, defaultFlags);
  if (server != null) {
    return server.call('get_declaration_info', {
      contents,
      line,
      column,
    });
  }
}

export async function getOutline(
  src: NuclideUri,
  contents: string,
  defaultFlags: ?Array<string>,
): Promise<?Array<ClangOutlineTree>> {
  const server = await serverManager.getClangServer(src, contents, defaultFlags);
  if (server != null) {
    return server.call('get_outline', {
      contents,
    }, /* blocking */ true);
  }
}

export async function formatCode(
  src: NuclideUri,
  contents: string,
  cursor: number,
  offset?: number,
  length?: number,
): Promise<{newCursor: number; formatted: string}> {
  const args = [
    '-style=file',
    `-assume-filename=${src}`,
    `-cursor=${cursor}`,
  ];
  if (offset != null) {
    args.push(`-offset=${offset}`);
  }
  if (length != null) {
    args.push(`-length=${length}`);
  }
  const {stdout} = await checkOutput('clang-format', args, {stdin: contents});

  // The first line is a JSON blob indicating the new cursor position.
  const newLine = stdout.indexOf('\n');
  return {
    newCursor: JSON.parse(stdout.substring(0, newLine)).Cursor,
    formatted: stdout.substring(newLine + 1),
  };
}

/**
 * Kill the Clang server for a particular source file,
 * as well as all the cached compilation flags.
 */
export function reset(src: NuclideUri): void {
  serverManager.reset(src);
}

export function dispose(): void {
  serverManager.dispose();
}
