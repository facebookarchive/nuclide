'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type RemoteControlService from '../../../debugger/atom/lib/RemoteControlService';

import {event as commonsEvent} from '../../../commons';
import serviceHub from '../../../service-hub-plus';
import {DebuggerProxyClient} from '../../../react-native-node-executor/lib/DebuggerProxyClient';
import {ReactNativeProcessInfo} from './ReactNativeProcessInfo';
import {CompositeDisposable, Disposable} from 'atom';
import Rx from 'rx';

const {observableFromSubscribeFunction} = commonsEvent;

/**
 * Connects the executor to the debugger.
 */
export class DebuggingActivation {

  _connectionDisposables: ?IDisposable;
  _disposables: CompositeDisposable;
  _killOnSessionsEndedTimeoutId: ?number;
  _pendingDebuggerProcessInfo: ?ReactNativeProcessInfo;

  constructor() {
    this._disposables = new CompositeDisposable(
      atom.commands.add('atom-workspace', {
        'nuclide-react-native:start-debugging': () => this._startDebugging(),
        'nuclide-react-native:stop-debugging': () => this._stopDebugging(),
      }),
      new Disposable(() => this._stopDebugging()),
    );
  }

  dispose(): void {
    this._disposables.dispose();
    if (this._connectionDisposables != null) {
      this._connectionDisposables.dispose();
    }
  }

  _startDebugging(): void {
    this._stopDebugging();

    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');

    const client = new DebuggerProxyClient();
    const service$ = Rx.Observable.fromPromise(
      serviceHub.consumeFirstProvider('nuclide-debugger.remote')
    );

    this._connectionDisposables = new CompositeDisposable(
      new Disposable(() => client.disconnect()),
      new Disposable(() => { this._pendingDebuggerProcessInfo = null; }),

      // Start debugging as soon as we get the service. We won't yet have a pid so we use an
      // "unfinished" ProcessInfo instance, which we can later complete by calling `setPid()`
      service$.subscribe(debuggerService => { this._startDebuggerSession(debuggerService, null); }),

      // Update the debugger whenever we get a new pid. (This happens whenever the user reloads the
      // RN app.)
      // $FlowIgnore: Not sure how to annotate combineLatest
      Rx.Observable.combineLatest(
        service$,
        observableFromSubscribeFunction(client.onDidEvalApplicationScript.bind(client)),
      )
        .subscribe(([debuggerService, pid]) => {
          this._updateDebuggerSession(debuggerService, pid);
        }),
    );

    client.connect();
  }

  _stopDebugging(): void {
    if (this._connectionDisposables == null) {
      return;
    }
    this._connectionDisposables.dispose();
    this._connectionDisposables = null;
  }

  /**
   * Update the debugger once we receive a pid. When debugging is first started, this will mean
   * updating the pending process info (which was created before we had a pid). After that, however,
   * we can just build new process info objects and start debugging again. This is necessary because
   * 1) we must create a ProcessInfo object in order to signal to the debugger that we're starting
   * debugging and 2) once started, there's no way of telling the debugger to start a new session
   * without creating a new ProcessInfo instance.
   */
  _updateDebuggerSession(debuggerService: RemoteControlService, pid: number): void {
    const pendingProcessInfo = this._pendingDebuggerProcessInfo;
    if (pendingProcessInfo != null) {
      const currentPid = pendingProcessInfo.getPid();
      if (currentPid == null) {
        pendingProcessInfo.setPid(pid);
        return;
      }
    }

    this._pendingDebuggerProcessInfo = null;
    this._startDebuggerSession(debuggerService, pid);
  }

  _startDebuggerSession(debuggerService: RemoteControlService, pid: ?number): void {
    clearTimeout(this._killOnSessionsEndedTimeoutId);

    // TODO(matthewwithanm): Use project root instead of first directory.
    const currentProjectDir = atom.project.getDirectories()[0];

    if (currentProjectDir == null) {
      atom.notifications.addError(
        'You must have an open project to debug a React Native application'
      );
      return;
    }

    const targetUri = currentProjectDir.getPath();
    const processInfo = new ReactNativeProcessInfo({
      targetUri,
      pid,
      onAllSessionsEnded: () => {
        // We have no way to differentiate between when all sessions have closed because the user
        // closed the debugger and when all sessions have closed because the user has reloaded the
        // RN app. So we wait a bit to kill the client to make sure a new session isn't going to be
        // started (e.g. the user just reloaded the app).
        // TODO: Create a custom DebuggerInstance class that wraps the creation of the client and
        //       hides the fact that we have multiple sessions.
        this._killOnSessionsEndedTimeoutId = setTimeout(this._stopDebugging.bind(this), 2000);
      },
    });

    if (pid == null) {
      this._pendingDebuggerProcessInfo = processInfo;
    }

    debuggerService.startDebugging(processInfo);
  }

}
