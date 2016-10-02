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

import createPackage from '../../commons-atom/createPackage';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
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

  consumeCwdApi(api: CwdApi): IDisposable {
    this.setCwdApi(api);

    // Avoid retaining a reference to `this` after disposal.
    let pkg = this;
    this._disposables.add(() => { pkg = null; });
    return new UniversalDisposable(() => {
      if (pkg != null) {
        pkg.setCwdApi(null);
      }
    });
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

export default createPackage(Activation);
