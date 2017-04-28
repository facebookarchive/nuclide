/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {refmtResult} from './ReasonService';

import {runCommand, getOriginalEnvironment} from '../../commons-node/process';

export async function refmt(content: string, flags: Array<string>): Promise<refmtResult> {
  const refmtPath = getPathToRefmt();
  const options = {
    // Starts the process with the user's bashrc, which might contain a
    // different refmt. See `MerlinProcess` for the same consistent
    // logic. This also implies .nucliderc isn't considered, if there's any
    // extra override; to simulate the same behavior, do this in your bashrc:
    // if [ "$TERM" = "nuclide"]; then someOverrideLogic if
    env: await getOriginalEnvironment(),
    input: content,
  };
  try {
    const stdout = await runCommand(refmtPath, flags, options).toPromise();
    return {type: 'result', formattedResult: stdout};
  } catch (err) {
    // Unsuccessfully exited. Two cases: syntax error and refmt nonexistent.
    if (err.errno === 'ENOENT') {
      return {type: 'error', error: 'refmt is not found. Is it available in the path?'};
    }
    return {type: 'error', error: err.stderr};
  }
}
/**
 * @return The path to ocamlmerlin on the user's machine. It is recommended not to cache the result
 *   of this function in case the user updates his or her preferences in Atom, in which case the
 *   return value will be stale.
 */
function getPathToRefmt(): string {
  return global.atom
    && global.atom.config.get('nuclide.nuclide-ocaml.pathToRefmt') || 'refmt';
}
