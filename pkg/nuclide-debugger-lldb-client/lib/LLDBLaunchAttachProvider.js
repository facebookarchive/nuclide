'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-atom';
import {React} from 'react-for-atom';
import {Dispatcher} from 'flux';
import {LaunchAttachStore} from './LaunchAttachStore';
import {LaunchUIComponent} from './LaunchUIComponent';
import {AttachUIComponent} from './AttachUIComponent';
import {LaunchAttachActions} from './LaunchAttachActions';

export class LLDBLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  _dispatcher: Dispatcher;
  _actions: LaunchAttachActions;
  _store: LaunchAttachStore;

  constructor(debuggingTypeName: string, targetUri: string) {
    super(debuggingTypeName, targetUri);
    this._dispatcher = new Dispatcher();
    this._actions = new LaunchAttachActions(this._dispatcher, this.getTargetUri());
    this._store = new LaunchAttachStore(this._dispatcher);
  }

  getActions(): Array<string> {
    return ['Attach', 'Launch'];
  }

  getComponent(action: string): ?React.Element {
    if (action === 'Launch') {
      return <LaunchUIComponent store={this._store} actions={this._actions} />;
    } else if (action === 'Attach') {
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
