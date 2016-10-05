'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Task, TaskEvent} from '../../commons-node/tasks';
import type {TaskMetadata} from '../../nuclide-task-runner/lib/types';
import type {ArcToolbarModel as ArcToolbarModelType} from './ArcToolbarModel';
import type {CwdApi} from '../../nuclide-current-working-directory/lib/CwdApi';
import type {Message} from '../../nuclide-console/lib/types';

import UniversalDisposable from '../../commons-node/UniversalDisposable';
import {taskFromObservable} from '../../commons-node/tasks';
import {observableFromSubscribeFunction} from '../../commons-node/event';
import {createExtraUiComponent} from './ui/createExtraUiComponent';
import {React} from 'react-for-atom';
import {Observable, Subject} from 'rxjs';

export default class ArcBuildSystem {
  _model: ArcToolbarModelType;
  _extraUi: ?ReactClass<any>;
  id: string;
  name: string;
  _tasks: ?Observable<Array<TaskMetadata>>;
  _cwdApi: ?CwdApi;
  _outputMessages: Subject<Message>;
  _disposables: UniversalDisposable;

  constructor() {
    this.id = 'arcanist';
    this._outputMessages = new Subject();
    this._model = this._getModel();
    this.name = this._model.getName();
    this._disposables = new UniversalDisposable(this._outputMessages);
  }

  setCwdApi(cwdApi: ?CwdApi): void {
    this._cwdApi = cwdApi;
    this._model.setCwdApi(cwdApi);
  }

  _getModel(): ArcToolbarModelType {
    let ArcToolbarModel;
    try {
      // $FlowFB
      ArcToolbarModel = require('./fb/FbArcToolbarModel').FbArcToolbarModel;
    } catch (_) {
      ArcToolbarModel = require('./ArcToolbarModel').ArcToolbarModel;
    }
    return new ArcToolbarModel(this._outputMessages);
  }

  observeTaskList(cb: (taskList: Array<TaskMetadata>) => mixed): IDisposable {
    if (this._tasks == null) {
      this._tasks = Observable.concat(
        Observable.of(this._model.getTaskList()),
        observableFromSubscribeFunction(this._model.onChange.bind(this._model))
          .map(() => this._model.getTaskList()),
      );
    }
    return new UniversalDisposable(
      this._tasks.subscribe({next: cb}),
    );
  }

  getExtraUi(): ReactClass<any> {
    if (this._extraUi == null) {
      this._extraUi = createExtraUiComponent(this._model);
    }
    return this._extraUi;
  }

  getIcon(): ReactClass<any> {
    return ArcIcon;
  }

  getOutputMessages(): Observable<Message> {
    return this._outputMessages;
  }

  runTask(taskType: string): Task {
    if (!this._model.getTaskList().some(task => task.type === taskType)) {
      throw new Error(`There's no hhvm task named "${taskType}"`);
    }

    const taskFunction = getTaskRunFunction(this._model, taskType);
    return taskFromObservable(taskFunction());
  }

  dispose(): void {
    this._disposables.dispose();
  }
}

function getTaskRunFunction(
  model: ArcToolbarModelType,
  taskType: string,
): () => Observable<TaskEvent> {
  switch (taskType) {
    case 'build':
      return () => model.arcBuild();
    default:
      throw new Error(`Invalid task type: ${taskType}`);
  }
}

const ArcIcon = () => <span>arc</span>;
