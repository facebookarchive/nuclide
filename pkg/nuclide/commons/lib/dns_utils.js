'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

async function lookupPreferIpv6(host: string): Promise<string> {
  try {
    return await lookup(host, 6);
  } catch (e) {
    if (e.code === 'ENOTFOUND') {
      return await lookup(host, 4);
    }
    throw e;
  }
}

function lookup(host, family) {
  return new Promise((resolve, reject) => {
    var dns = require('dns');
    dns.lookup(host, family, (error, address) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(address);
    });
  });
}

module.exports = {
  lookup,
  lookupPreferIpv6,
};
