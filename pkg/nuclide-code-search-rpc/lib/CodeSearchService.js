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

import {findArcProjectIdOfPath} from '../../nuclide-arcanist-rpc';
import {search} from './AgAckService';
import {ConnectableObservable, Observable} from 'rxjs';

const MAX_RESULTS = 1000;

export async function isEligibleForDirectory(
  rootDirectory: NuclideUri,
): Promise<boolean> {
  const projectId = await findArcProjectIdOfPath(rootDirectory);
  if (projectId == null) {
    return true;
  }

  try {
    // $FlowFB
    const bigGrep = require('../../commons-atom/fb-biggrep-query'); // eslint-disable-line nuclide-internal/no-cross-atom-imports
    const corpus = bigGrep.ARC_PROJECT_CORPUS[projectId];
    if (corpus != null) {
      return false;
    }
  } catch (err) {}
  return true;
}

export function searchWithTool(
  tool: string,
  directory: NuclideUri,
  query: string,
): ConnectableObservable<CodeSearchResult> {
  if (tool === 'ag' || tool === 'ack') {
    return search(directory, query, tool).take(MAX_RESULTS).publish();
  }
  return Observable.empty().publish();
}
