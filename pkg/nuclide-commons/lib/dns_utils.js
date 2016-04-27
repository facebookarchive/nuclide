var lookupPreferIpv6 = _asyncToGenerator(function* (host) {
  try {
    return yield lookup(host, 6);
  } catch (e) {
    if (e.code === 'ENOTFOUND') {
      return yield lookup(host, 4);
    }
    throw e;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { var callNext = step.bind(null, 'next'); var callThrow = step.bind(null, 'throw'); function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(callNext, callThrow); } } callNext(); }); }; }

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var _dns = require('dns');

var _dns2 = _interopRequireDefault(_dns);

function lookup(host, family) {
  return new Promise(function (resolve, reject) {
    _dns2['default'].lookup(host, family, function (error, address) {
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

module.exports = {
  lookup: lookup,
  lookupPreferIpv6: lookupPreferIpv6
};