/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {DebuggerLaunchAttachProvider} from '../../nuclide-debugger-base';
import React from 'react';
import {AttachUiComponent} from './AttachUiComponent';
import invariant from 'assert';

import type EventEmitter from 'events';

export class IwdpLaunchAttachProvider extends DebuggerLaunchAttachProvider {
  constructor(debuggingTypeName: string, targetUri: string) {
    super(debuggingTypeName, targetUri);
  }

  getActions(): Promise<Array<string>> {
    return Promise.resolve(['Attach']);
  }

  getComponent(action: string, parentEventEmitter: EventEmitter): ?React.Element<any> {
    if (action === 'Attach') {
      return (
        <AttachUiComponent
          targetUri={this.getTargetUri()}
          parentEmitter={parentEventEmitter}
        />
      );
    } else {
      invariant(false, 'Unrecognized action for component.');
    }
  }

  dispose(): void {}
}
