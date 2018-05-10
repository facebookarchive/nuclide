/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

import type {
  NuclideDebuggerProvider,
  DebuggerConfigurationProvider,
} from 'nuclide-debugger-common';

import createPackage from 'nuclide-commons-atom/createPackage';
import {VsAdapterTypes} from 'nuclide-debugger-common';
import {getNativeAutoGenConfig} from 'nuclide-debugger-common/autogen-utils';
import passesGK from '../../commons-node/passesGK';
import AutoGenLaunchAttachProvider from 'nuclide-debugger-common/AutoGenLaunchAttachProvider';
import HhvmLaunchAttachProvider from './HhvmLaunchAttachProvider';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import fsPromise from 'nuclide-commons/fsPromise';
import {getPrepackAutoGenConfig, resolveConfiguration} from './utils';
// eslint-disable-next-line nuclide-internal/prefer-nuclide-uri
import path from 'path';

class Activation {
  _subscriptions: UniversalDisposable;

  constructor() {
    this._subscriptions = new UniversalDisposable();

    fsPromise.exists(path.join(__dirname, 'fb-marker')).then(exists => {
      const isOpenSource = !exists;
      this._registerPrepackDebugProvider(isOpenSource);
      this._registerLLDBProvider();
      this._registerHHVMDebugProvider();
    });
  }

  _registerDebugProvider(provider: NuclideDebuggerProvider): void {
    this._subscriptions.add(
      atom.packages.serviceHub.provide('debugger.provider', '0.0.0', provider),
    );
  }

  async _registerPrepackDebugProvider(isOpenSource: boolean): Promise<void> {
    if ((await passesGK('nuclide_debugger_prepack')) || isOpenSource) {
      this._registerDebugProvider({
        name: 'Prepack',
        getLaunchAttachProvider: connection => {
          return new AutoGenLaunchAttachProvider(
            'Prepack',
            connection,
            getPrepackAutoGenConfig(),
          );
        },
      });
    }
  }

  _registerLLDBProvider() {
    this._registerDebugProvider({
      name: 'Native - LLDB (C/C++)',
      getLaunchAttachProvider: connection => {
        return new AutoGenLaunchAttachProvider(
          'Native - LLDB (C/C++)',
          connection,
          getNativeAutoGenConfig(VsAdapterTypes.NATIVE_LLDB),
        );
      },
    });
  }

  async _registerHHVMDebugProvider(): Promise<void> {
    this._registerDebugProvider({
      name: 'Hack / PHP',
      getLaunchAttachProvider: connection => {
        return new HhvmLaunchAttachProvider('Hack / PHP', connection);
      },
    });
  }

  createDebuggerConfigurator(): DebuggerConfigurationProvider {
    return {
      resolveConfiguration,
      adapterType: VsAdapterTypes.NATIVE_LLDB,
    };
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}

createPackage(module.exports, Activation);
