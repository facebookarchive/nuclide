'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */


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
    }
  },

  activate(state: mixed): void {
  },

  provideNuclideDebuggerHhvm(): nuclide_debugger$Service {
    var Service = require('./Service');
    return Service;
  },
};
