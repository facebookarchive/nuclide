'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {OutputService} from '../../nuclide-console/lib/types';
import type {TaskRunnerServiceApi} from '../../nuclide-task-runner/lib/types';
import type {SwiftPMTaskRunner as SwiftPMTaskRunnerType} from './taskrunner/SwiftPMTaskRunner';
import type {SwiftPMTaskRunnerStoreState} from './taskrunner/SwiftPMTaskRunnerStoreState';

import invariant from 'assert';
import {CompositeDisposable, Disposable} from 'atom';
import {SwiftPMTaskRunner} from './taskrunner/SwiftPMTaskRunner';

let _disposables: ?CompositeDisposable = null;
let _taskRunner: ?SwiftPMTaskRunnerType = null;
let _initialState: ?Object = null;

export function activate(rawState: ?Object): void {
  invariant(_disposables == null);
  _initialState = rawState;
  _disposables = new CompositeDisposable(
    new Disposable(() => { _taskRunner = null; }),
    new Disposable(() => { _initialState = null; }),
  );
}

export function deactivate(): void {
  invariant(_disposables != null);
  _disposables.dispose();
  _disposables = null;
}

export function consumeTaskRunnerServiceApi(
  serviceApi: TaskRunnerServiceApi,
): void {
  invariant(_disposables != null);
  _disposables.add(serviceApi.register(_getTaskRunner()));
}

export function consumeOutputService(service: OutputService): void {
  invariant(_disposables != null);
  _disposables.add(service.registerOutputProvider({
    messages: _getTaskRunner().getOutputMessages(),
    id: 'swift',
  }));
}

export function serialize(): ?SwiftPMTaskRunnerStoreState {
  if (_taskRunner != null) {
    return _taskRunner.serialize();
  }
}

function _getTaskRunner(): SwiftPMTaskRunner {
  if (_taskRunner == null) {
    invariant(_disposables != null);
    _taskRunner = new SwiftPMTaskRunner(_initialState);
    _disposables.add(_taskRunner);
  }
  return _taskRunner;
}
