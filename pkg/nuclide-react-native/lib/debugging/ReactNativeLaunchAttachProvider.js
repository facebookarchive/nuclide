'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {DebuggerLaunchAttachProvider} from '../../../nuclide-debugger-atom';
import {DebugUiComponent} from './DebugUiComponent';
import invariant from 'assert';
import {React} from 'react-for-atom';

export class ReactNativeLaunchAttachProvider extends DebuggerLaunchAttachProvider {

  getActions(): Array<string> {
    return ['Attach'];
  }

  getComponent(action: string): ?React.Element<any> {
    invariant(action === 'Attach');
    return <DebugUiComponent targetUri={this.getTargetUri()} />;
  }

  dispose(): void {
  }
}
