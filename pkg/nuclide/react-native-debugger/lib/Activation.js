'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {event as eventLib} from '../../commons';
import {DebuggerProxyClient} from '../../react-native-node-executor/lib/DebuggerProxyClient';
import serviceHub from '../../service-hub-plus';
import {CompositeDisposable, Disposable} from 'atom';
import Rx from 'rx';

const {observableFromSubscribeFunction} = eventLib;

export class Activation {
  _connectionDisposables: ?CompositeDisposable;
  _disposables: CompositeDisposable;

  constructor(state: ?Object) {
    this._disposables = new CompositeDisposable(
      atom.commands.add('atom-workspace', {
        'nuclide-react-native-debugger:connect': this._connect.bind(this),
        'nuclide-react-native-debugger:disconnect': this._disconnect.bind(this),
      }),
      new Disposable(() => this._disconnect()),
    );
  }

  _connect(): void {
    this._disconnect();
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

  _disconnect(): void {
    if (this._connectionDisposables == null) {
      return;
    }
    this._connectionDisposables.dispose();
    this._connectionDisposables = null;
  }

  dispose(): void {
    this._disposables.dispose();
    if (this._connectionDisposables != null) {
      this._connectionDisposables.dispose();
    }
  }

}
