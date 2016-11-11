'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {DeepLinkParams} from './types';

import UniversalDisposable from '../../commons-node/UniversalDisposable';

export default class DeepLinkService {
  _disposable: UniversalDisposable;

  constructor() {
    this._disposable = new UniversalDisposable(
    );
  }

  dispose(): void {
    this._disposable.dispose();
  }

  subscribeToPath(
    path: string,
    callback: (params: DeepLinkParams) => mixed,
  ): IDisposable {
    return new UniversalDisposable(
    );
  }
}
