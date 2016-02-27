'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {ShellMessageManager} from './ShellMessageManager';

export class ShellActivation {

  _disposables: IDisposable;
  _shellManager: ShellMessageManager;

  constructor() {
    // TODO: Enable following when RN changes land
    // this._disposables = new CompositeDisposable(
    //   atom.commands.add('atom-workspace', {
    //     'nuclide-react-native:reload-app': () => this._reload(),
    //   }),
    // );
    this._shellManager = new ShellMessageManager();
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _reload(): void {
    const message = {
      version: 1,
      target: 'bridge',
      action: 'reload',
    };
    this._shellManager.send(message);
  }

}
