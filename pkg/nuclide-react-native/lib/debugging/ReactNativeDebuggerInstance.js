'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {event as commonsEvent} from '../../../nuclide-commons';
import {DebuggerInstance, DebuggerProcessInfo} from '../../../nuclide-debugger-atom';
import {Session} from '../../../nuclide-debugger-node/lib/Session';
import {
  DebuggerProxyClient,
} from '../../../nuclide-react-native-node-executor/lib/DebuggerProxyClient';
import {CompositeDisposable, Disposable} from 'atom';
import Rx from 'rx';
import {Server as WebSocketServer} from 'ws';

const {observableFromSubscribeFunction} = commonsEvent;

/**
 * This class represents a React Native debugging session in Nuclide. Debugging React Native
 * consists of the following:
 *
 * 1. Hijacking React Native JS execution and performing it in a node process. This is the job of
 *    DebuggerProxyClient.
 * 2. Debugging the node process.
 */
export class ReactNativeDebuggerInstance extends DebuggerInstance {
  _disposables: CompositeDisposable;
  _connected: Promise<void>;

  constructor(processInfo: DebuggerProcessInfo, debugPort: number) {
    super(processInfo);

    let didConnect;
    this._connected = new Promise(resolve => { didConnect = resolve; });

    const session$ = Rx.Observable.create(observer => (
      // `Session` is particular about what order everything is closed in, so we manage it carefully
      // here.
      new CompositeDisposable(
        uiConnection$
          .combineLatest(pid$)
          .flatMapLatest(([ws, pid]) => createSessionStream(ws, debugPort))
          .subscribe(observer),
        uiConnection$.connect(),
        pid$.connect(),
      )
    ));

    this._disposables = new CompositeDisposable(
      // Tell the user if we can't connect to the debugger UI.
      uiConnection$.subscribeOnError(err => {
        atom.notifications.addError(
          'Error connecting to debugger UI.',
          {
            detail: 'Make sure that port 8080 is open.',
            stack: err.stack,
            dismissable: true,
          },
        );

        this.dispose();
      }),

      pid$.first().subscribe(() => { didConnect(); }),

      session$.subscribe(),
    );
  }

  dispose(): void {
    this._disposables.dispose();
  }

  async getWebsocketAddress(): Promise<string> {
    await this._connected;

    // TODO(natthu): Assign random port instead.
    return 'ws=localhost:8080/';
  }

}

/**
 * A stream of PIDs to debug, obtained by connecting to the packager via the DebuggerProxyClient.
 * This stream is shared so that only one client is created when there is more than one subscriber.
 */
const pid$ = Rx.Observable.using(
  () => {
    const client = new DebuggerProxyClient();
    client.connect();
    return {
      client,
      dispose: () => { client.disconnect(); },
    };
  },
  ({client}) => observableFromSubscribeFunction(client.onDidEvalApplicationScript.bind(client)),
)
.publish();

/**
 * Connections from the Chrome UI. There will only be one connection at a time. This stream won't
 * complete unless the connection closes.
 */
const uiConnection$ = Rx.Observable.using(
  () => {
    // TODO(natthu): Assign random port instead.
    const server = new WebSocketServer({port: 8080});
    return {
      server,
      dispose: () => { server.close(); },
    };
  },
  ({server}) => (
    Rx.Observable.merge(
      Rx.Observable.fromEvent(server, 'error').flatMap(Rx.Observable.throw),
      Rx.Observable.fromEvent(server, 'connection'),
    )
      .takeUntil(Rx.Observable.fromEvent(server, 'close'))
  ),
)
.publish();

function createSessionStream(ws: WebSocket, debugPort: number): Rx.Observable<Session> {
  const config = {
    debugPort,
    // This makes the node inspector not load all the source files on startup:
    preload: false,
  };

  return Rx.Observable.create(observer => {
    // Creating a new Session is actually side-effecty.
    const session = new Session(config, debugPort, ws);
    observer.onNext(session);
    return new Disposable(() => { session.close(); });
  });
}
