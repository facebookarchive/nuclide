/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {NuclideDebuggerProvider} from 'nuclide-debugger-common';

import createPackage from 'nuclide-commons-atom/createPackage';
import passesGK from '../../commons-node/passesGK';
import {OcamlLaunchProvider} from './OCamlLaunchProvider';
import PythonLaunchAttachProvider from './PythonLaunchAttachProvider';
import NodeLaunchAttachProvider from './NodeLaunchAttachProvider';
import ReactNativeLaunchAttachProvider from './ReactNativeLaunchAttachProvider';
import PrepackLaunchAttachProvider from './PrepackLaunchAttachProvider';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import fsPromise from 'nuclide-commons/fsPromise';
import {listenToRemoteDebugCommands} from './utils';
// eslint-disable-next-line rulesdir/prefer-nuclide-uri
import path from 'path';

class Activation {
  _subscriptions: UniversalDisposable;

  constructor() {
    this._subscriptions = new UniversalDisposable(
      listenToRemoteDebugCommands(),
    );

    this._registerPythonDebugProvider();
    this._registerNodeDebugProvider();
    this._registerReactNativeDebugProvider();
    this._registerPrepackDebugProvider();
    this._registerOcamlDebugProvider();
  }

  _registerPythonDebugProvider(): void {
    this._registerDebugProvider({
      name: 'Python',
      getLaunchAttachProvider: connection => {
        return new PythonLaunchAttachProvider(connection);
      },
    });
  }

  _registerNodeDebugProvider(): void {
    this._registerDebugProvider({
      name: 'Node',
      getLaunchAttachProvider: connection => {
        return new NodeLaunchAttachProvider(connection);
      },
    });
  }

  _registerDebugProvider(provider: NuclideDebuggerProvider): void {
    this._subscriptions.add(
      atom.packages.serviceHub.provide(
        'nuclide-debugger.provider',
        '0.0.0',
        provider,
      ),
    );
  }

  async _registerReactNativeDebugProvider(): Promise<void> {
    const isOpenSource = !await fsPromise.exists(
      path.join(__dirname, 'fb-config.js'),
    );
    if ((await passesGK('nuclide_debugger_reactnative')) || isOpenSource) {
      this._registerDebugProvider({
        name: 'React Native',
        getLaunchAttachProvider: connection => {
          return new ReactNativeLaunchAttachProvider(connection);
        },
      });
    }
  }

  async _registerPrepackDebugProvider(): Promise<void> {
    const isOpenSource = !await fsPromise.exists(
      path.join(__dirname, 'fb-config.js'),
    );
    if ((await passesGK('nuclide_debugger_prepack')) || isOpenSource) {
      this._registerDebugProvider({
        name: 'Prepack',
        getLaunchAttachProvider: connection => {
          return new PrepackLaunchAttachProvider(connection);
        },
      });
    }
  }

  async _registerOcamlDebugProvider(): Promise<void> {
    if (await passesGK('nuclide_debugger_ocaml')) {
      this._registerDebugProvider({
        name: 'OCaml',
        getLaunchAttachProvider: connection => {
          return new OcamlLaunchProvider(connection);
        },
      });
    }
  }

  dispose(): void {
    this._subscriptions.dispose();
  }
}

createPackage(module.exports, Activation);
