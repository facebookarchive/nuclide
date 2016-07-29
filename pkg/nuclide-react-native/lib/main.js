'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {OutputService} from '../../nuclide-console/lib/types';
import type {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import type {
  nuclide_debugger$Service,
  NuclideDebuggerProvider,
} from '../../nuclide-debugger-interfaces/service';
import type {NuclideUri} from '../../commons-node/nuclideUri';
import type {Activation as ActivationType} from './Activation';

import nuclideUri from '../../commons-node/nuclideUri';
import {ReactNativeLaunchAttachProvider} from './debugging/ReactNativeLaunchAttachProvider';
import invariant from 'assert';

let activation: ?ActivationType = null;

export function activate(state: ?Object): void {
  invariant(activation == null);
  const {Activation} = require('./Activation');
  activation = new Activation(state);
}

export function deactivate(): void {
  invariant(activation != null);
  activation.dispose();
  activation = null;
}

export function provideNuclideDebugger(): nuclide_debugger$Service {
  invariant(activation != null);
  return activation.provideNuclideDebugger();
}

export function createDebuggerProvider(): NuclideDebuggerProvider {
  return {
    name: 'react-native',
    getLaunchAttachProvider(connection: NuclideUri): ?DebuggerLaunchAttachProvider {
      if (nuclideUri.isLocal(connection)) {
        return new ReactNativeLaunchAttachProvider('React Native', connection);
      }
      return null;
    },
  };
}

export function consumeOutputService(api: OutputService): void {
  invariant(activation != null);
  return activation.consumeOutputService(api);
}
