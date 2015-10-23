'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {HomeFragments} from 'nuclide-home-interfaces';

module.exports = {

  config: {
    scriptRegex: {
      type: 'string',
      default: '^(?!/var.*)',
      description: 'Regular expression to filter connection script path.',
    },

    idekeyRegex: {
      type: 'string',
      default: '',
      description: 'Regular expression to filter connection idekey. Usually your OS user id.',
    },

    xdebugPort: {
      type: 'number',
      default: 9000,
      description: 'Port for DBGP connection to HHVM.'
    },

    endDebugWhenNoRequests: {
      type: 'boolean',
      default: false,
      description: 'Whether or not to end debug session when there is no http requests.',
    },

    logLevel: {
      type: 'string',
      default: 'INFO',
      description: 'Specify that level of logging from debugger, ' +
        'supported values: ALL | TRACE | DEBUG | INFO | WARN | ERROR | FATAL | OFF.',
    },
  },

  activate(state: mixed): void {
  },

  provideNuclideDebuggerHhvm(): nuclide_debugger$Service {
    var Service = require('./Service');
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
