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
import {parse, normalize, pathModuleFor} from '../../nuclide-remote-uri';

import type {NuclideUri} from '../../nuclide-remote-uri';

export function normalizePathUri(uri: NuclideUri): string {
  const {hostname, path} = parse(uri);
  if (hostname != null && hostname !== '') {
    // TODO: advinsky replace with remote-uri.normalize() when task t10040084 is closed
    return `nuclide://${hostname}${normalizePath(path)}`;
  } else {
    return normalizePath(uri);
  }
}

export function dedupeNormalizedUris(uris: Array<string>): Array<string> {
  const dedepped = uris.slice();
  dedepped.sort();

  let lastOkIndex = -1;

  return dedepped.filter((u, i) => {
    const sep = pathModuleFor(u).sep;
    if (i !== 0 && u.startsWith(dedepped[lastOkIndex] + sep)) {
      return false;
    }

    lastOkIndex = i;
    return true;
  });
}

export function splitUri(uri: string): Array<string> {
  const sep = pathModuleFor(uri).sep;
  // Can't user remote-uri.parse() here, as the (normzlized) URI might no longer conform
  const {hostname, path} = url.parse(uri);

  if (hostname) {
    const tokensInPath = path ? path.split(sep) : [];
    return [hostname, sep, ...tokensInPath];
  } else {
    const tokensInPath = uri.split(sep);
    return ['localhost', sep, ...tokensInPath];
  }
}

export function isUriBelow(ancestorUri: string, descendantUri: string): boolean {
  const sep = pathModuleFor(ancestorUri).sep;
  return descendantUri.startsWith(ancestorUri) &&
    (descendantUri[ancestorUri.length] === sep || ancestorUri.length === descendantUri.length);
}

function normalizePath(path?: string): string {
  invariant(path);
  const normalized = normalize(path);
  const sep = pathModuleFor(path).sep;
  if (normalized.endsWith(sep)) {
    return normalized.slice(0, -1);
  }

  return normalized;
}
