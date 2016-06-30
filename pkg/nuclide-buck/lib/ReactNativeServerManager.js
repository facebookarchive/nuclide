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
import ExecutorServer from '../../nuclide-react-native-node-executor';
import ReactNativeServerActions from './ReactNativeServerActions';
import consumeFirstProvider from '../../commons-atom/consumeFirstProvider';

export default class ReactNativeServerManager {

  _actions: ReactNativeServerActions;
  _dispatcher: Dispatcher;
  _nodeExecutorServer: ?ExecutorServer;

  constructor(dispatcher: Dispatcher, actions: ReactNativeServerActions) {
    this._actions = actions;
    this._dispatcher = dispatcher;
    this._setupActions();
  }

  dispose() {
    if (this._nodeExecutorServer) {
      this._nodeExecutorServer.close();
    }
  }

  _setupActions() {
    this._dispatcher.register(action => {
      switch (action.actionType) {
        case ReactNativeServerActions.ActionType.START_NODE_EXECUTOR_SERVER:
          this._startNodeExecutorServer();
          break;
      }
    });
  }

  async _attachNodeDebugger(pid: number): Promise<void> {
    atom.commands.dispatch(atom.views.getView(atom.workspace), 'nuclide-debugger:show');
    const debuggerService = await consumeFirstProvider('nuclide-debugger.remote');
    debuggerService.debugNode(pid);
  }

  _startNodeExecutorServer() {
    if (!this._nodeExecutorServer) {
      const server = this._nodeExecutorServer = new ExecutorServer(8090);
      server.onDidEvalApplicationScript(this._attachNodeDebugger.bind(this));
    }
  }
}
