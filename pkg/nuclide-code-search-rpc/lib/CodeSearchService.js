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
import {ConnectableObservable} from 'rxjs';

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

export function searchWithAg(
  directory: NuclideUri,
  query: string,
): ConnectableObservable<CodeSearchResult> {
  return search(directory, query, 'ag').take(MAX_RESULTS).publish();
}

export function searchWithAck(
  directory: NuclideUri,
  query: string,
): ConnectableObservable<CodeSearchResult> {
  return search(directory, query, 'ack').take(MAX_RESULTS).publish();
}
