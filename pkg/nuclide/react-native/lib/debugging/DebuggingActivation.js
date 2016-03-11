'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type DebuggerProcessInfo from '../../../debugger/atom/lib/DebuggerProcessInfo';
import type {nuclide_debugger$Service} from '../../../debugger/interfaces/service';

import serviceHubPlus from '../../../service-hub-plus';
import {ReactNativeDebuggerInstance} from './ReactNativeDebuggerInstance';
import {ReactNativeProcessInfo} from './ReactNativeProcessInfo';
import {CompositeDisposable, Disposable} from 'atom';
import Rx from 'rx';

/**
 * Connects the executor to the debugger.
 */
export class DebuggingActivation {
  _disposables: IDisposable;
  _startDebuggingDisposable: ?IDisposable;

  constructor() {
    this._disposables = new CompositeDisposable(
      atom.commands.add('atom-workspace', {
        'nuclide-react-native:start-debugging': () => this._startDebugging(),
      }),
      new Disposable(() => {
        if (this._startDebuggingDisposable != null) {
          this._startDebuggingDisposable.dispose();
        }
      }),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  _startDebugging(): void {
    if (this._startDebuggingDisposable != null) {
      this._startDebuggingDisposable.dispose();
    }

    // Stop any current debugger and show the debugger view.
    const workspace = atom.views.getView(atom.workspace);
    atom.commands.dispatch(workspace, 'nuclide-debugger:stop-debugging');
    atom.commands.dispatch(workspace, 'nuclide-debugger:show');

    const debuggerServiceStream = Rx.Observable.fromPromise(
      serviceHubPlus.consumeFirstProvider('nuclide-debugger.remote')
    );
    const processInfoLists = Rx.Observable.fromPromise(getProcessInfoList());
    this._startDebuggingDisposable = debuggerServiceStream.combineLatest(processInfoLists)
      .subscribe(([debuggerService, processInfoList]) => {
        const processInfo = processInfoList[0];
        if (processInfo != null) {
          debuggerService.startDebugging(processInfo);
        }
      });
  }

  provideNuclideDebugger(): nuclide_debugger$Service {
    return {
      name: 'React Native',
      getProcessInfoList,
      ReactNativeDebuggerInstance,
    };
  }

}

function getProcessInfoList(): Promise<Array<DebuggerProcessInfo>> {
  // TODO(matthewwithanm): Use project root instead of first directory.
  const currentProjectDir = atom.project.getDirectories()[0];

  // TODO: Check if it's an RN app?
  // TODO: Query packager for running RN app?

  if (currentProjectDir == null) {
    atom.notifications.addError(
      'You must have an open project to debug a React Native application'
    );
    return Promise.resolve([]);
  }

  const targetUri = currentProjectDir.getPath();
  return Promise.resolve([new ReactNativeProcessInfo(targetUri)]);
}
