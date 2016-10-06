'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {TaskEvent} from '../../commons-node/tasks';
import type {TaskMetadata} from '../../nuclide-task-runner/lib/types';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {Level, Message} from '../../nuclide-console/lib/types';
import type {Observable, Subject} from 'rxjs';

import {Disposable} from 'atom';

export const TASKS: Array<TaskMetadata> = [];

/*
 * This will provide the toolbar functionality for the open-source-supported HHVM targets.
 * e.g. HHVM Debugger
 */
export class ArcToolbarModel {

  _cwdApi: ?CwdApi;
  _outputMessages: Subject<Message>;

  constructor(outputMessages: Subject<Message>) {
    this._outputMessages = outputMessages;
  }

  setCwdApi(cwdApi: ?CwdApi): void {
    this._cwdApi = cwdApi;
  }

  logOutput(text: string, level: Level) {
    this._outputMessages.next({text, level});
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

  setActiveBuildTarget(value: string): void {
    throw new Error('arc build targets not supported');
  }

  isArcSupported(): boolean {
    return false;
  }

  getActiveBuildTarget(): string {
    return '';
  }

  getName(): string {
    return 'Arcanist';
  }

  getTaskList(): Array<TaskMetadata> {
    return TASKS;
  }

  async arcBuild(): Observable<TaskEvent> {
    throw new Error('arc build not supported');
  }

  getBuildTargets(): ?Array<string> {
    throw new Error('arc build not supported');
  }

  updateBuildTargets(): void {
    throw new Error('arc build not supported');
  }

  getBuildTargetsError(): ?Error {
    throw new Error('arc build not supported');
  }

  viewActivated(): void {
    throw new Error('arc build not supported');
  }

  viewDeactivated(): void {
    throw new Error('arc build not supported');
  }

}
