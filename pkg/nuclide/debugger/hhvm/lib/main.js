'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HomeFragments} from '../../../home-interfaces';

module.exports = {
  activate(state: mixed): void {
  },

  provideNuclideDebuggerHhvm(): nuclide_debugger$Service {
    const Service = require('./Service');
    return Service;
  },

  getHomeFragments(): HomeFragments {
    return {
      feature: {
        title: 'HHVM Debugger',
        icon: 'plug',
        description: 'Connect to a HHVM server process and debug Hack code from within Nuclide.',
        command: 'nuclide-debugger:toggle',
      },
      priority: 6,
    };
  },

};
