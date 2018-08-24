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

import type {NuclideUri} from 'nuclide-commons/nuclideUri';
import type {Task} from '../../commons-node/tasks';
import type {TaskMetadata} from '../../nuclide-task-runner/lib/types';

import {VsAdapterTypes} from 'nuclide-debugger-common';
import {Observable} from 'rxjs';
import UniversalDisposable from 'nuclide-commons/UniversalDisposable';
import {observableFromSubscribeFunction} from 'nuclide-commons/event';
import {taskFromObservable} from '../../commons-node/tasks';
import {bindObservableAsProps} from 'nuclide-commons-ui/bindObservableAsProps';
import {Icon} from 'nuclide-commons-ui/Icon';
import {getDebuggerService} from 'nuclide-commons-atom/debugger';

import {debug} from './HhvmDebug';
import HhvmToolbar from './HhvmToolbar';
import ProjectStore from './ProjectStore';
import * as React from 'react';

export default class HhvmBuildSystem {
  id: string;
  name: string;
  _projectStore: ProjectStore;
  _extraUi: ?React.ComponentType<any>;

  constructor() {
    this.id = 'hhvm';
    this.name = 'HHVM';
    this._projectStore = new ProjectStore();
  }

  dispose() {
    this._projectStore.dispose();
  }

  getExtraUi(): React.ComponentType<any> {
    if (this._extraUi == null) {
      const projectStore = this._projectStore;
      const subscription = observableFromSubscribeFunction(
        projectStore.onChange.bind(projectStore),
      );
      this._extraUi = bindObservableAsProps(
        subscription.startWith(null).mapTo({projectStore}),
        HhvmToolbar,
      );
    }
    return this._extraUi;
  }

  getPriority(): number {
    return 1; // Take precedence over the Arcanist build toolbar.
  }

  getIcon(): React.ComponentType<any> {
    return () => (
      <Icon icon="nuclicon-hhvm" className="nuclide-hhvm-task-runner-icon" />
    );
  }

  runTask(taskName: string): Task {
    return taskFromObservable(
      Observable.fromPromise(
        debug(
          this._projectStore.getDebugMode(),
          this._projectStore.getProjectRoot(),
          this._projectStore.getDebugTarget(),
          this._projectStore.getUseTerminal(),
          this._projectStore.getScriptArguments(),
        ),
      ).ignoreElements(),
    );
  }

  setProjectRoot(
    projectRoot: ?NuclideUri,
    callback: (enabled: boolean, taskList: Array<TaskMetadata>) => mixed,
  ): IDisposable {
    const enabledObservable = observableFromSubscribeFunction(
      this._projectStore.onChange.bind(this._projectStore),
    )
      .map(() => this._projectStore)
      .filter(
        store =>
          store.getProjectRoot() === projectRoot &&
          // eslint-disable-next-line eqeqeq
          store.isHHVMProject() !== null,
      )
      .map(store => store.isHHVMProject() === true)
      .distinctUntilChanged();

    const getTask = (disabled: boolean) => [
      {
        type: 'debug',
        label: 'Debug',
        description: disabled
          ? 'The HHVM debugger is already attached to this server'
          : this._projectStore.getDebugMode() === 'webserver'
            ? 'Attach HHVM debugger to webserver'
            : 'Debug Hack/PHP Script',
        icon: 'nuclicon-debugger',
        cancelable: false,
        disabled,
      },
    ];

    const tasksObservable = Observable.concat(
      Observable.of(null),
      Observable.fromPromise(getDebuggerService()),
    ).switchMap(debugService => {
      if (debugService == null) {
        return Observable.of(getTask(false));
      }
      return Observable.concat(
        Observable.of(getTask(false)),
        Observable.merge(
          observableFromSubscribeFunction(
            debugService.onDidChangeDebuggerSessions.bind(debugService),
          ),
          observableFromSubscribeFunction(
            this._projectStore.onChange.bind(this._projectStore),
          ),
        ).switchMap(() => {
          const disabled =
            this._projectStore.getDebugMode() === 'webserver' &&
            debugService
              .getDebugSessions()
              .some(
                c =>
                  c.adapterType === VsAdapterTypes.HHVM &&
                  c.targetUri === projectRoot,
              );
          return Observable.of(getTask(disabled));
        }),
      );
    });

    const subscription = Observable.combineLatest(
      enabledObservable,
      tasksObservable,
    ).subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._projectStore.setProjectRoot(projectRoot);

    return new UniversalDisposable(subscription);
  }
}
