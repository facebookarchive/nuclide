'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import {React} from 'react-for-atom';
import LaunchAttachDispatcher from './LaunchAttachDispatcher';
import {LaunchAttachStore} from './LaunchAttachStore';
import {AttachUIComponent} from './AttachUIComponent';
import {LaunchAttachActions} from './LaunchAttachActions';

export class NodeLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  _dispatcher: LaunchAttachDispatcher;
  _actions: LaunchAttachActions;
  _store: LaunchAttachStore;

  constructor(debuggingTypeName: string, targetUri: string) {
    super(debuggingTypeName, targetUri);
    this._dispatcher = new LaunchAttachDispatcher();
    this._actions = new LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new LaunchAttachStore(this._dispatcher);
  }

  getActions(): Array<string> {
    return ['Attach'];
  }

  getComponent(action: string): ?React.Element<*> {
    if (action === 'Attach') {
      this._actions.updateAttachTargetList();
      return <AttachUIComponent store={this._store} actions={this._actions} />;
    } else {
      return null;
    }
  }

  dispose(): void {
    this._store.dispose();
    this._actions.dispose();
  }
}
