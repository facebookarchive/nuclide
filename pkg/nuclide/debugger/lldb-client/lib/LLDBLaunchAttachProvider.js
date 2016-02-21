'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerLaunchAttachProvider} from '../../atom';
import {React} from 'react-for-atom';
import {Dispatcher} from 'flux';
import {LaunchAttachStore} from './LaunchAttachStore';
import {LaunchUIComponent} from './LaunchUIComponent';
import {AttachUIComponent} from './AttachUIComponent';
import {LaunchAttachActions} from './LaunchAttachActions';

export class LLDBLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  constructor(debuggingTypeName: string, targetUri: string) {
    super(debuggingTypeName, targetUri);
  }

  getActions(): Array<string> {
    return ['Attach', 'Launch'];
  }

  getComponent(action: string): ?ReactElement {
    const dispatcher = new Dispatcher();
    const actions = new LaunchAttachActions(dispatcher, this.getTargetUri());
    const store = new LaunchAttachStore(dispatcher);
    if (action === 'Launch') {
      return <LaunchUIComponent store={store} actions={actions}/>;
    } else if (action === 'Attach') {
      return <AttachUIComponent store={store} actions={actions}/>;
    } else {
      return null;
    }
  }
}
