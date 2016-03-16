'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CwdApi} from './CwdApi';
import {CompositeDisposable} from 'atom';

export class Activation {
  _cwdApi: CwdApi;
  _disposables: CompositeDisposable;

  constructor(rawState: ?Object) {
    const state = rawState || {};
    const {initialCwdPath} = state;
    this._cwdApi = new CwdApi(initialCwdPath);
    this._disposables = new CompositeDisposable(
      this._cwdApi,
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  provideApi(): CwdApi {
    return this._cwdApi;
  }

  serialize(): Object {
    const cwd = this._cwdApi.getCwd();
    return {
      initialCwdPath: cwd == null ? null : cwd.getPath(),
    };
  }

}
