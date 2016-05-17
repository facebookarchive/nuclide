'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {CompositeSubscription} from '../../../commons-node/stream';
import {observableFromSubscribeFunction} from '../../../commons-node/event';
import {DebuggerInstance, DebuggerProcessInfo} from '../../../nuclide-debugger-atom';
import {
  DebuggerProxyClient,
} from '../../../nuclide-react-native-node-executor/lib/DebuggerProxyClient';
import Rx from 'rxjs';
import WS from 'ws';
// $FlowIssue: Flow doesn't recognize this nested module.
import {using as observableUsing} from 'rxjs/observable/using';
import type {Session as SessionType} from '../../../nuclide-debugger-node/lib/Session';

const PORT = 38913;

/**
 * This class represents a React Native debugging session in Nuclide. Debugging React Native
 * consists of the following:
 *
 * 1. Hijacking React Native JS execution and performing it in a node process. This is the job of
 *    DebuggerProxyClient.
 * 2. Debugging the node process.
 */
export class ReactNativeDebuggerInstance extends DebuggerInstance {
  _subscriptions: rx$ISubscription;
  _connected: Promise<void>;

  constructor(processInfo: DebuggerProcessInfo, debugPort: number) {
    super(processInfo);

    let didConnect;
    this._connected = new Promise(resolve => { didConnect = resolve; });

    const session$ = Rx.Observable.create(observer => (
      // `Session` is particular about what order everything is closed in, so we manage it carefully
      // here.
      new CompositeSubscription(
        uiConnection$
          .combineLatest(pid$)
          .switchMap(([ws, pid]) => createSessionStream(ws, debugPort))
          .subscribe(observer),
        uiConnection$.connect(),
        pid$.connect(),
      )
    ));

    this._subscriptions = new CompositeSubscription(
      // Tell the user if we can't connect to the debugger UI.
      uiConnection$.subscribe(
        null,
        err => {
          atom.notifications.addError(
            'Error connecting to debugger UI.',
            {
              detail: `Make sure that port ${PORT} is open.`,
              stack: err.stack,
              dismissable: true,
            },
          );

          this.dispose();
        },
      ),

      pid$.first().subscribe(() => { didConnect(); }),

      session$.subscribe(),
    );
  }

  dispose(): void {
    this._subscriptions.unsubscribe();
  }

  async getWebsocketAddress(): Promise<string> {
    await this._connected;

    // TODO(natthu): Assign random port instead.
    return `ws=localhost:${PORT}/`;
  }

}

/**
 * A stream of PIDs to debug, obtained by connecting to the packager via the DebuggerProxyClient.
 * This stream is shared so that only one client is created when there is more than one subscriber.
 */
const pid$ = observableUsing(
  () => {
    const client = new DebuggerProxyClient();
    client.connect();
    return {
      client,
      unsubscribe: () => { client.disconnect(); },
    };
  },
  ({client}) => observableFromSubscribeFunction(client.onDidEvalApplicationScript.bind(client)),
)
.publish();

/**
 * Connections from the Chrome UI. There will only be one connection at a time. This stream won't
 * complete unless the connection closes.
 */
const uiConnection$ = observableUsing(
  () => {
    // TODO(natthu): Assign random port instead.
    const server = new WS.Server({port: PORT});
    return {
      server,
      unsubscribe: () => { server.close(); },
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

function createSessionStream(ws: WS, debugPort: number): Rx.Observable<SessionType> {
  const config = {
    debugPort,
    // This makes the node inspector not load all the source files on startup:
    preload: false,
  };

  return Rx.Observable.create(observer => {
    // Creating a new Session is actually side-effecty.
    const {Session} = require('../../../nuclide-debugger-node/lib/Session');
    const session = new Session(config, debugPort, ws);
    observer.next(session);
    return () => { session.close(); };
  });
}
