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
    'flow-object-type': require('./flow-object-type'),
    'import-type-style': require('./import-type-style'),
    'license-header': require('./license-header'),
  },
  rulesConfig: {
    'comment-style': 0,
    'flow-object-type': 0,
    'import-type-style': 0,
    'license-header': 0,
  },
};
