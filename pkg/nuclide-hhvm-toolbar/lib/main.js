'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TaskRunnerServiceApi} from '../../nuclide-task-runner/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {OutputService} from '../../nuclide-console/lib/types';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {Disposable} from 'atom';
import invariant from 'assert';
import HhvmBuildSystem from './HhvmBuildSystem';

class Activation {

  _disposables: UniversalDisposable;
  _buildSystem: ?HhvmBuildSystem;
  _cwdApi: ?CwdApi;

  constructor(state: ?Object) {
    this._disposables = new UniversalDisposable();
  }

  setCwdApi(cwdApi: ?CwdApi) {
    this._cwdApi = cwdApi;
    if (this._buildSystem != null) {
      this._buildSystem.setCwdApi(cwdApi);
    }
  }

  consumeBuildSystemRegistry(registry: TaskRunnerServiceApi): void {
    this._disposables.add(registry.register(this._getBuildSystem()));
  }

  consumeOutputService(api: OutputService): void {
    this._disposables.add(
      api.registerOutputProvider({
        id: 'Arc Build',
        messages: this._getBuildSystem().getOutputMessages(),
      }),
    );
  }

  _getBuildSystem(): HhvmBuildSystem {
    if (this._buildSystem == null) {
      const buildSystem = new HhvmBuildSystem();
      if (this._cwdApi != null) {
        buildSystem.setCwdApi(this._cwdApi);
      }
      this._disposables.add(buildSystem);
      this._buildSystem = buildSystem;
    }
    return this._buildSystem;
  }

  dispose() {
    this._disposables.dispose();
  }

}

let activation: ?Activation = null;

export function activate(state: ?Object) {
  if (!activation) {
    activation = new Activation(state);
  }
}

export function consumeBuildSystemRegistry(registry: TaskRunnerServiceApi): void {
  invariant(activation);
  activation.consumeBuildSystemRegistry(registry);
}

export function consumeCwdApi(api: CwdApi): IDisposable {
  invariant(activation);
  activation.setCwdApi(api);
  return new Disposable(() => {
    if (activation != null) {
      activation.setCwdApi(null);
    }
  });
}

export function consumeOutputService(api: OutputService): void {
  invariant(activation != null);
  activation.consumeOutputService(api);
}

export function deactivate() {
  if (activation != null) {
    activation.dispose();
    activation = null;
  }
}
