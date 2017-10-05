'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _asyncToGenerator = _interopRequireDefault(require('async-to-generator'));

var _dns = _interopRequireDefault(require('dns'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = (() => {
  var _ref = (0, _asyncToGenerator.default)(function* (host) {
    try {
      return yield lookup(host, 6);
    } catch (e) {
      if (e.code === 'ENOTFOUND') {
        return lookup(host, 4);
      }
      throw e;
    }
  });

  function lookupPreferIpv6(_x) {
    return _ref.apply(this, arguments);
  }

  return lookupPreferIpv6;
})(); /**
       * Copyright (c) 2017-present, Facebook, Inc.
       * All rights reserved.
       *
       * This source code is licensed under the BSD-style license found in the
       * LICENSE file in the root directory of this source tree. An additional grant
       * of patent rights can be found in the PATENTS file in the same directory.
       *
       * 
       * @format
       */

function lookup(host, family) {
  return new Promise((resolve, reject) => {
    _dns.default.lookup(host, family, (error, address) => {
      if (error) {
        reject(error);
      } else if (address != null) {
        resolve(address);
      } else {
        reject(Error('One of error or address must be set.'));
      }
    });
  });
}