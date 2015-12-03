'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import URL from 'url';

const PROTOCOL = 'atom:';
const HOSTNAME = 'nuclide-gadgets';

type Parsed = {
  gadgetId: string,
};

export function format(options: Parsed): string {
  return URL.format({
    protocol: PROTOCOL,
    hostname: HOSTNAME,
    pathname: encodeURIComponent(options.gadgetId),
    slashes: true,
  });
}

export function parse(uri: string): ?Parsed {
  const {protocol, hostname, pathname} = URL.parse(uri);

  if (protocol !== PROTOCOL || hostname !== HOSTNAME) {
    // This isn't a URL we're supposed to handle.
    return null;
  }

  const [gadgetId] = (pathname || '')
    .replace(/^\/+/g, '')
    .split('/', 1)
    .map(decodeURIComponent);
  return gadgetId ? {gadgetId} : null;
}
