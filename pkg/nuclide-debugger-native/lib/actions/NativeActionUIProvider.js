/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 * @format
 */

import type {DebuggerConfigAction} from '../../../nuclide-debugger-base';

import React from 'react';
import {AttachUIComponent} from '../AttachUIComponent';
import {LaunchAttachActions} from '../LaunchAttachActions';
import {LaunchAttachStore} from '../LaunchAttachStore';
import {LaunchUIComponent} from '../LaunchUIComponent';
import invariant from 'invariant';

export function getComponent(
  store: LaunchAttachStore,
  actions: LaunchAttachActions,
  debuggerTypeName: string,
  action: DebuggerConfigAction,
  configIsValidChanged: (valid: boolean) => void,
): React.Element<any> {
  actions.updateAttachTargetList();
  if (action === 'attach') {
    return (
      <AttachUIComponent
        store={store}
        actions={actions}
        configIsValidChanged={configIsValidChanged}
      />
    );
  } else {
    invariant(action === 'launch');
    return (
      <LaunchUIComponent
        store={store}
        actions={actions}
        configIsValidChanged={configIsValidChanged}
      />
    );
  }
}

export function isEnabled(action: DebuggerConfigAction): Promise<boolean> {
  return Promise.resolve(true);
}

export const name = 'Native';
