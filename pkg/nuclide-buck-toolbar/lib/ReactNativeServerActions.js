'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Dispatcher} from 'flux';

export default class ReactNativeServerActions {

  _dispatcher: Dispatcher;

  static ActionType: {[key: string]: string};

  constructor(dispatcher: Dispatcher) {
    this._dispatcher = dispatcher;
  }

  startNodeExecutorServer() {
    this._dispatcher.dispatch({
      actionType: ReactNativeServerActions.ActionType.START_NODE_EXECUTOR_SERVER,
    });
  }

  startServer(serverCommand: string) {
    this._dispatcher.dispatch({
      actionType: ReactNativeServerActions.ActionType.START_SERVER,
      serverCommand,
    });
  }

  stopServer() {
    this._dispatcher.dispatch({actionType: ReactNativeServerActions.ActionType.STOP_SERVER});
  }

  restartServer(serverCommand: string) {
    this._dispatcher.dispatch({
      actionType: ReactNativeServerActions.ActionType.RESTART_SERVER,
      serverCommand,
    });
  }
}

ReactNativeServerActions.ActionType = {
  START_NODE_EXECUTOR_SERVER: 'START_NODE_EXECUTOR_SERVER',
  START_SERVER: 'START_SERVER',
  STOP_SERVER: 'STOP_SERVER',
  RESTART_SERVER: 'RESTART_SERVER',
};
