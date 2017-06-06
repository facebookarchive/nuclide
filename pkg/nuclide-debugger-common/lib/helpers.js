'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.pathToUri = pathToUri;
exports.uriToPath = uriToPath;

var _url = _interopRequireDefault(require('url'));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function pathToUri(path) {
  return 'file://' + path;
} /**
   * Copyright (c) 2015-present, Facebook, Inc.
   * All rights reserved.
   *
   * This source code is licensed under the license found in the LICENSE file in
   * the root directory of this source tree.
   *
   * 
   * @format
   */

function uriToPath(uri) {
  const components = _url.default.parse(uri);
  // Some filename returned from hhvm does not have protocol.
  if (components.protocol !== 'file:' && components.protocol != null) {
    throw new Error(`unexpected file protocol. Got: ${components.protocol}`);
  }
  return (components.pathname || '') + (components.hash || '');
}