/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 *
 * @flow
 */

import {React} from 'react-for-atom';
import {LaunchAttachActions} from '../LaunchAttachActions';
import {LaunchAttachStore} from '../LaunchAttachStore';

import type EventEmitter from 'events';

export type DebuggerActionUIProvider = {
  getComponent: (
    store: LaunchAttachStore,
    actions: LaunchAttachActions,
    parentEventEmitter: EventEmitter) => React.Element<any>,
  name: string,
  isEnabled: () => Promise<boolean>,
};
