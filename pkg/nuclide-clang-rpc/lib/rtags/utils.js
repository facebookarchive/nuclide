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

import type {Observable} from 'rxjs';

import {runCommand} from 'nuclide-commons/process';

export function rcCommand(
  args: Array<string>,
  input?: string,
): Observable<string> {
  return runCommand('rc', args, {encoding: 'utf8', input});
}
