/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import type {Task} from '../../commons-node/tasks';
import type {Directory} from '../../nuclide-remote-connection';
import type {TaskMetadata} from '../../nuclide-task-runner/lib/types';

import {Observable} from 'rxjs';
import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {taskFromObservable} from '../../commons-node/tasks';
import {bindObservableAsProps} from '../../nuclide-ui/bindObservableAsProps';
import {Icon} from '../../nuclide-ui/Icon';

import {debug} from './HhvmDebug';
import HhvmToolbar from './HhvmToolbar';
import ProjectStore from './ProjectStore';
import {React} from 'react-for-atom';

export default class HhvmBuildSystem {
  id: string;
  name: string;
  _projectStore: ProjectStore;
  _extraUi: ?ReactClass<any>;

  constructor() {
    this.id = 'hhvm';
    this.name = 'HHVM';
    this._projectStore = new ProjectStore();
  }

  dispose() {
    this._projectStore.dispose();
  }

  observeTaskList(callback: (taskList: Array<TaskMetadata>) => mixed): IDisposable {
    return new UniversalDisposable(
      Observable.concat(
        Observable.of(this.getTaskList()),
        observableFromSubscribeFunction(this._projectStore.onChange.bind(this._projectStore))
          .map(() => this.getTaskList()),
      )
        // Wait until the project type has finished loading.
        .filter(() => this._projectStore.isHHVMProject() != null)
        .subscribe(callback),
    );
  }

  getExtraUi(): ReactClass<any> {
    if (this._extraUi == null) {
      const projectStore = this._projectStore;
      const subscription = observableFromSubscribeFunction(
        projectStore.onChange.bind(projectStore),
      );
      this._extraUi = bindObservableAsProps(
        subscription
          .startWith(null)
          .mapTo({projectStore}),
        HhvmToolbar,
      );
    }
    return this._extraUi;
  }

  getTaskList(): Array<TaskMetadata> {
    const disabled = !this._projectStore.isHHVMProject();
    return [
      {
        type: 'debug',
        label: 'Debug',
        description: 'Debug a HHVM project',
        icon: 'triangle-right',
        disabled,
        priority: 1,  // Take precedence over the Arcanist build toolbar.
        runnable: !disabled,
        cancelable: false,
      },
    ];
  }

  getPriority(): number {
    return 1; // Take precedence over the Arcanist build toolbar.
  }

  getIcon(): ReactClass<any> {
    return () => <Icon icon="nuclicon-hhvm" className="nuclide-hhvm-task-runner-icon" />;
  }

  runTask(taskName: string): Task {
    return taskFromObservable(
      Observable.fromPromise(debug(
        this._projectStore.getDebugMode(),
        this._projectStore.getProjectRoot(),
        this._projectStore.getDebugTarget(),
      ))
        .ignoreElements(),
    );
  }

  setProjectRoot(projectRoot: ?Directory): void {
    this.setProjectRootNew(projectRoot, (enabled, taskList) => {});
  }

  setProjectRootNew(
    projectRoot: ?Directory,
    callback: (enabled: boolean, taskList: Array<TaskMetadata>) => mixed,
  ): IDisposable {
    const path = projectRoot == null ? null : projectRoot.getPath();

    const enabledObservable =
      observableFromSubscribeFunction(this._projectStore.onChange.bind(this._projectStore))
        .map(() => this._projectStore)
        .filter(store => store.getProjectRoot() === path && store.isHHVMProject() !== null)
        .map(store => store.isHHVMProject() === true)
        .distinctUntilChanged();

    const tasksObservable = Observable.of([
      {
        type: 'debug',
        label: 'Debug',
        description: 'Debug an HHVM project',
        icon: 'nuclicon-debugger',
        cancelable: false,
      },
    ]);

    const subscription = Observable.combineLatest(enabledObservable, tasksObservable)
      .subscribe(([enabled, tasks]) => callback(enabled, tasks));

    this._projectStore.setProjectRoot(path);

    return new UniversalDisposable(subscription);
  }
}
