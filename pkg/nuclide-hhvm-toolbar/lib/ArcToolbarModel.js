'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Task} from '../../nuclide-build/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';

import {Disposable} from 'atom';

export const TASKS: Array<Task> = [];

/*
 * This will provide the toolbar functionality for the open-source-supported HHVM targets.
 * e.g. HHVM Debugger
 */
export class ArcToolbarModel {

  _cwdApi: ?CwdApi;

  setCwdApi(cwdApi: ?CwdApi): void {
    this._cwdApi = cwdApi;
  }

  getActiveProjectPath(): ?string {
    if (this._cwdApi == null) {
      return atom.project.getPaths()[0];
    }
    const workingDirectory = this._cwdApi.getCwd();
    if (workingDirectory != null) {
      return workingDirectory.getPath();
    } else {
      return null;
    }
  }

  onChange(callback: () => mixed): IDisposable {
    return new Disposable(() => {});
  }

  async updateBuildTarget(value: string): Promise<void> {
    throw new Error('arc build targets not supported');
  }

  isArcSupported(): boolean {
    return false;
  }

  getActiveBuildTarget(): string {
    return '';
  }

  getName(): string {
    return 'HHVM';
  }

  getTasks(): Array<Task> {
    return TASKS;
  }

  async arcBuild(): Promise<void> {
    throw new Error('arc build not supported');
  }

  async loadBuildTargets(): Promise<Array<string>> {
    throw new Error('arc build not supported');
  }
}
