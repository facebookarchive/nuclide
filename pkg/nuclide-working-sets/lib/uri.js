'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import nuclideUri from '../../nuclide-remote-uri';

import type {NuclideUri} from '../../nuclide-remote-uri';

export function dedupeUris(uris: Array<NuclideUri>): Array<NuclideUri> {
  const dedepped = uris.map(nuclideUri.trimTrailingSeparator);
  dedepped.sort();

  let lastOKPrefix = '';

  return dedepped.filter((u, i) => {
    if (i !== 0 && u.startsWith(lastOKPrefix)) {
      return false;
    }

    lastOKPrefix = nuclideUri.ensureTrailingSeparator(dedepped[i]);
    return true;
  });
}
