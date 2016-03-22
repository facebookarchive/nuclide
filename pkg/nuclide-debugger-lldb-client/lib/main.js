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
} from '../../nuclide-debugger-interfaces/service';
import type OutputService from '../../nuclide-console/lib/OutputService';

import logger from './utils';
import {getConfig} from './utils';
import {setOutputService} from '../../nuclide-debugger-common/lib/OutputServiceManager';


module.exports = {
  activate(state: mixed): void {
    logger.setLogLevel(getConfig().clientLogLevel);
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
