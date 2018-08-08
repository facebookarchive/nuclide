"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compress = compress;
exports.decompress = decompress;

var _zlib = _interopRequireDefault(require("zlib"));

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
function compress(data) {
  return _zlib.default.deflateSync(data);
}

function decompress(data) {
  return _zlib.default.inflateSync(data).toString('utf-8');
}