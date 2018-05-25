'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _dns = _interopRequireDefault(require('dns'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Copyright (c) 2017-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *  strict
 * @format
 */

exports.default = async function lookupPreferIpv6(host) {
  try {
    return await lookup(host, 6);
  } catch (e) {
    if (e.code === 'ENOTFOUND') {
      return lookup(host, 4);
    }
    throw e;
  }
};

function lookup(host, family) {
  return new Promise((resolve, reject) => {
    _dns.default.lookup(host, family, (error, address, resultFamily) => {
      if (error) {
        reject(error);
      } else if (address != null) {
        if (!(resultFamily === 4 || resultFamily === 6)) {
          throw new Error('Invariant violation: "resultFamily === 4 || resultFamily === 6"');
        }

        resolve({ address, family: resultFamily });
      } else {
        reject(new Error('One of error or address must be set.'));
      }
    });
  });
}