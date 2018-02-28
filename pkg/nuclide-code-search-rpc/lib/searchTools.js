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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {CodeSearchResult} from './types';
import {asyncFind} from 'nuclide-commons/promise';
import os from 'os';

import which from 'nuclide-commons/which';
import {Observable} from 'rxjs';
import {search as agAckSearch} from './AgAckHandler';
import {search as grepSearch} from './GrepHandler';
import {search as rgSearch} from './RgHandler';

export const WINDOWS_TOOLS = ['rg', 'grep'];
export const POSIX_TOOLS = ['ag', 'rg', 'ack', 'grep'];

const searchToolHandlers = new Map([
  [
    'ag',
    (directory: string, query: RegExp) => agAckSearch(directory, query, 'ag'),
  ],
  [
    'ack',
    (directory: string, query: RegExp) => agAckSearch(directory, query, 'ack'),
  ],
  ['rg', rgSearch],
  ['grep', grepSearch],
]);

export async function resolveTool(tool: ?string): Promise<?string> {
  if (tool != null) {
    return tool;
  }
  return asyncFind(os.platform() === 'win32' ? WINDOWS_TOOLS : POSIX_TOOLS, t =>
    which(t).then(cmd => (cmd != null ? t : null)),
  );
}

export function searchWithTool(
  tool: ?string,
  directory: NuclideUri,
  regex: RegExp,
): Observable<CodeSearchResult> {
  return Observable.defer(() => resolveTool(tool)).switchMap(actualTool => {
    const handler = searchToolHandlers.get(actualTool);
    if (handler != null) {
      return handler(directory, regex);
    }
    return Observable.empty();
  });
}
