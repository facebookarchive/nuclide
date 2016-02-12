'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {event as eventLib} from '../../../commons';
import {DebuggerProxyClient} from '../../../react-native-node-executor/lib/DebuggerProxyClient';
import serviceHub from '../../../service-hub-plus';
import {CompositeDisposable, Disposable} from 'atom';
import Rx from 'rx';

const {observableFromSubscribeFunction} = eventLib;

/**
 * Connects the executor to the debugger.
 */
export class DebuggingActivation {

  _disposables: CompositeDisposable;
  _connectionDisposables: ?IDisposable;

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
    const client = new DebuggerProxyClient();
    this._connectionDisposables = new CompositeDisposable(
      new Disposable(() => client.disconnect()),
      // $FlowIgnore: Not sure how to annotate combineLatest
      Rx.Observable.combineLatest(
        observableFromSubscribeFunction(client.onDidEvalApplicationScript.bind(client)),
        Rx.Observable.fromPromise(serviceHub.consumeFirstProvider('nuclide-debugger.remote')),
      )
        .subscribe(([pid, debuggerService]) => {
          debuggerService.debugNode(pid);
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

}
