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

export function shortenHostname(host: string): string {
  const ignoredEnding = '.facebook.com';
  if (host.endsWith(ignoredEnding)) {
    return host.slice(0, host.length - ignoredEnding.length);
  } else {
    return host;
  }
}
