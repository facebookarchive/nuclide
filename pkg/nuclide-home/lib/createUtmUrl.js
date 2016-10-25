'use strict';
'use babel';

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createUtmUrl;

function createUtmUrl(url, campaign) {
  return `${ url }/?utm_source=nuclide&utm_medium=app&utm_campaign=${ campaign }`;
}
module.exports = exports['default'];