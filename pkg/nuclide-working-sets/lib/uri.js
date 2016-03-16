'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import url from 'url';
import invariant from 'assert';
import {parse, normalize} from '../../nuclide-remote-uri';

import type {NuclideUri} from '../../nuclide-remote-uri';

export function normalizePathUri(uri: NuclideUri): string {
  const {hostname, path} = parse(uri);
  if (hostname != null) {
    // TODO: advinsky replace with remote-uri.normalize() when task t10040084 is closed
    return `nuclide://${hostname}${normalizePath(path)}`;
  } else {
    return normalizePath(path);
  }
}

export function dedupeNormalizedUris(uris: Array<string>): Array<string> {
  const dedepped = uris.slice();
  dedepped.sort();

  let lastOkIndex = -1;

  return dedepped.filter((u, i) => {
    if (i !== 0 && u.startsWith(dedepped[lastOkIndex] + '/')) {
      return false;
    }

    lastOkIndex = i;
    return true;
  });
}

export function splitUri(uri: string): Array<string> {
  // Can't user remote-uri.parse() here, as the (normzlized) URI might no longer conform
  const {hostname, path} = url.parse(uri);
  const tokensInPath = path ? path.split('/') : [];

  if (hostname) {
    return [hostname, '/', ...tokensInPath];
  }

  return ['localhost', '/', ...tokensInPath];
}

export function isUriBelow(ancestorUri: string, descendantUri: string): boolean {
  return descendantUri.startsWith(ancestorUri) &&
    (descendantUri[ancestorUri.length] === '/'  || ancestorUri.length === descendantUri.length);
}

function normalizePath(path?: string): string {
  invariant(path);
  const normalized = normalize(path);
  if (normalized.endsWith('/')) {
    return normalized.slice(0, -1);
  }

  return normalized;
}
