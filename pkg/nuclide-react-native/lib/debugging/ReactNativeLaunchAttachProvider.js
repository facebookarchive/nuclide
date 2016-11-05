'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerLaunchAttachProvider} from '../../../nuclide-debugger-base';
import {DebugUiComponent} from './DebugUiComponent';
import invariant from 'assert';
import {React} from 'react-for-atom';

import type EmitterEvent from 'events';

export class ReactNativeLaunchAttachProvider extends DebuggerLaunchAttachProvider {

  getActions(): Promise<Array<string>> {
    return Promise.resolve(['Attach']);
  }

  getComponent(action: string, parentEventEmitter: EmitterEvent): ?React.Element<any> {
    invariant(action === 'Attach');
    return <DebugUiComponent targetUri={this.getTargetUri()} parentEmitter={parentEventEmitter} />;
  }

  dispose(): void {
  }
}
