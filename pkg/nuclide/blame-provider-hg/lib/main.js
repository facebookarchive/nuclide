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

var blameProvider;

module.exports = {
  config: {
    showVerboseBlame: {
      type: 'boolean',
      default: false,
      description: 'Show complete name returned from "hg blame", instead of shortened name.',
    },
  },

  activate(state: ?Object): void {
  },

  provideHgBlameProvider(): BlameProvider {
    if (!blameProvider) {
      blameProvider = require('./HgBlameProvider');
    }
    return blameProvider;
  },
};
