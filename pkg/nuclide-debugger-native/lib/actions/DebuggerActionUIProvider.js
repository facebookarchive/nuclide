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
import {LaunchAttachActions} from '../LaunchAttachActions';
import {LaunchAttachStore} from '../LaunchAttachStore';

export type DebuggerActionUIProvider = {
  getComponent: (
    store: LaunchAttachStore,
    actions: LaunchAttachActions,
    debuggerTypeName: string,
    action: DebuggerConfigAction,
    configIsValidChanged: (valid: boolean) => void,
  ) => React.Element<any>,
  name: string,
  isEnabled: (action: DebuggerConfigAction) => Promise<boolean>,
};
