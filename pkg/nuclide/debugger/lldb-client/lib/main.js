'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {nuclide_debugger$Service} from '../../interfaces/service';

module.exports = {
  activate(state: mixed): void {
  },

  provideNuclideDebuggerLLDB(): nuclide_debugger$Service {
    const Service = require('./Service');
    return Service;
  },

};
