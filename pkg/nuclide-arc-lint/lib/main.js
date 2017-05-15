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

import type {BusySignalProvider} from '../../nuclide-busy-signal/lib/types';
import type {BusySignalProviderBase} from '../../nuclide-busy-signal';
import type {LinterProvider} from '../../nuclide-diagnostics-common';

import createPackage from 'nuclide-commons-atom/createPackage';
// eslint-disable-next-line nuclide-internal/no-cross-atom-imports
import {DedupedBusySignalProviderBase} from '../../nuclide-busy-signal';
import * as ArcanistDiagnosticsProvider from './ArcanistDiagnosticsProvider';

class Activation {
  _busySignalProvider: BusySignalProviderBase;

  constructor() {
    this._busySignalProvider = new DedupedBusySignalProviderBase();
  }

  provideBusySignal(): BusySignalProvider {
    return this._busySignalProvider;
  }

  provideLinter(): LinterProvider {
    return {
      name: 'Arc',
      grammarScopes: ['*'],
      scope: 'file',
      lint: editor => {
        const path = editor.getPath();
        if (path == null) {
          return null;
        }
        return this._busySignalProvider.reportBusy(
          `Waiting for arc lint results for \`${editor.getTitle()}\``,
          () => ArcanistDiagnosticsProvider.lint(editor),
          {onlyForFile: path},
        );
      },
    };
  }
}

createPackage(module.exports, Activation);
