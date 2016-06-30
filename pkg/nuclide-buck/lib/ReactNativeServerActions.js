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
}

ReactNativeServerActions.ActionType = Object.freeze({
  START_NODE_EXECUTOR_SERVER: 'START_NODE_EXECUTOR_SERVER',
});
