'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {BlameProvider} from 'nuclide-blame-base/blame-types';

let blameProvider;

module.exports = {
  // $FlowIssue https://github.com/facebook/flow/issues/620
  config: require('../package.json').nuclide.config,

  activate(state: ?Object): void {
  },

  provideHgBlameProvider(): BlameProvider {
    if (!blameProvider) {
      blameProvider = require('./HgBlameProvider');
    }
    return blameProvider;
  },
};
