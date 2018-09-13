/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {NuclideUri} from 'nuclide-commons/nuclideUri';

import nuclideUri from 'nuclide-commons/nuclideUri';

export function shortenHostname(hostOrUri: string | NuclideUri): string {
  let result = hostOrUri;
  if (nuclideUri.isRemote(result)) {
    result = nuclideUri.getHostname(result);
  }
  if (result.endsWith('.facebook.com')) {
    result = result.slice(0, -13);
  }
  if (result.startsWith('our.')) {
    result = result.slice(4);
  }
  if (result.startsWith('svcscm.')) {
    result = result.slice(7);
  }
  if (result.startsWith('twsvcscm.')) {
    result = result.slice(9);
  }
  return result;
}

export function convertToSandcastleHost(
  fbHost: string,
  scHost: string,
): string {
  let prefix = '';
  if (fbHost.endsWith('intern.facebook.com')) {
    prefix = fbHost.slice(0, -20);
  } else if (fbHost.endsWith('facebook.com')) {
    prefix = fbHost.slice(0, -13);
  }
  // Replace leading 'our' with the prefix (prefix does not trail with '.').
  if (scHost.startsWith('our.')) {
    return prefix + scHost.slice(3);
  }
  return scHost;
}
