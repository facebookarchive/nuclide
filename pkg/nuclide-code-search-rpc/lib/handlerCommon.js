/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {ProcessMessage} from 'nuclide-commons/process';
import type {Observable} from 'rxjs';

import {observeProcess} from 'nuclide-commons/process';

// Grep and related tools (ag, ack, rg) have exit code 1 with no results.
export function observeGrepLikeProcess(
  command: string,
  args: Array<string>,
  cwd?: string,
): Observable<ProcessMessage> {
  return observeProcess(command, args, {
    cwd,
    // An exit code of 0 or 1 is normal for grep-like tools.
    isExitError: ({exitCode, signal}) => {
      return (
        // flowlint-next-line sketchy-null-string:off
        !signal && (exitCode == null || exitCode > 1)
      );
    },
  });
}
