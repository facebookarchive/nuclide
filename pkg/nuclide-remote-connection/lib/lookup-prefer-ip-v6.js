'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import dns from 'dns';

type DnsFamily = 4 | 6;

export default async function lookupPreferIpv6(
  host: string,
): Promise<string> {
  try {
    return await lookup(host, 6);
  } catch (e) {
    if (e.code === 'ENOTFOUND') {
      return await lookup(host, 4);
    }
    throw e;
  }
}

function lookup(host: string, family: DnsFamily): Promise<string> {
  return new Promise((resolve, reject) => {
    dns.lookup(host, family, (error: ?Error, address: ?string) => {
      if (error) {
        reject(error);
      } else if (address != null) {
        resolve(address);
      } else {
        reject('One of error or address must be set.');
      }
    });
  });
}
