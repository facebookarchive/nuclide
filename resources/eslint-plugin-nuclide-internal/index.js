'use strict';
/* @noflow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

module.exports = {
  rules: {
    'comment-style': require('./comment-style'),
    'fb-license-header': require('./fb-license-header'),
    'import-type-style': require('./import-type-style'),
  },
  rulesConfig: {
    'comment-style': 0,
    'fb-license-header': 0,
    'import-type-style': 0,
  },
};
