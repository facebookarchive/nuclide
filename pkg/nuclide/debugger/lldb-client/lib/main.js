'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {
  nuclide_debugger$Service,
  NuclideDebuggerProvider,
} from '../../interfaces/service';
import type OutputService from '../../../output/lib/OutputService';

import {setOutputService} from '../../common/lib/OutputServiceManager';

module.exports = {
  activate(state: mixed): void {
  },

  consumeOutputService(api: OutputService): void {
    setOutputService(api);
  },

  provideNuclideDebuggerLLDB(): nuclide_debugger$Service {
    const Service = require('./Service');
    return Service;
  },

  createDebuggerProvider(): NuclideDebuggerProvider {
    return require('./DebuggerProvider');
  },
};
