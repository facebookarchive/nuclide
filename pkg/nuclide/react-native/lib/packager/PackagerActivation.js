'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeDisposable, Disposable} from 'atom';

export class PackagerActivation {

  _disposables: IDisposable;

  constructor() {
    this._disposables = new CompositeDisposable(
      atom.commands.add('atom-workspace', {
        'nuclide-react-native:start-packager': () => this._start(),
        'nuclide-react-native:stop-packager': () => this._stop(),
        'nuclide-react-native:restart-packager': () => this._restart(),
      }),
      new Disposable(() => this._stop()),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _restart(): void {
  }

  _start(): void {
  }

  _stop(): void {
  }

}
