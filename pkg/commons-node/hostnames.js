/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

export function shortenHostname(hostname: string): string {
  let ret = hostname;
  if (ret.endsWith('.facebook.com')) {
    ret = ret.slice(0, -13);
  }
  if (ret.startsWith('our.')) {
    ret = ret.slice(4);
  }
  if (ret.startsWith('svcscm.')) {
    ret = ret.slice(7);
  }
  if (ret.startsWith('twsvcscm.')) {
    ret = ret.slice(9);
  }
  return ret;
}

export function isOnDemandHostname(hostname: string): boolean {
  return (
    hostname.match(/sandcastle[0-9]+(.+).facebook.com/) != null ||
    hostname.match(/od[0-9]+(.+).facebook.com/) != null
  );
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
