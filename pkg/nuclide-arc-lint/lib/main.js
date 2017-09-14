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

import type {LinterProvider} from 'atom-ide-ui';

import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import createPackage from 'nuclide-commons-atom/createPackage';
import * as ArcanistDiagnosticsProvider from './ArcanistDiagnosticsProvider';

class Activation {
  _disposables: UniversalDisposable;

  constructor() {
    this._disposables = new UniversalDisposable();
  }

  dispose() {
    this._disposables.dispose();
  }

  provideLinter(): LinterProvider {
    return {
      name: 'Arc lint',
      grammarScopes: ['*'],
      scope: 'file',
      lint: editor => ArcanistDiagnosticsProvider.lint(editor),
    };
  }
}

createPackage(module.exports, Activation);
