'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {React} from 'react-for-atom';
import {AttachUIComponent} from '../AttachUIComponent';
import {LaunchAttachActions} from '../LaunchAttachActions';
import {LaunchAttachStore} from '../LaunchAttachStore';

import type EventEmitter from 'events';

function _getComponent(
  store: LaunchAttachStore,
  actions: LaunchAttachActions,
  parentEventEmitter: EventEmitter): React.Element<any> {
  actions.updateAttachTargetList();
  return (
    <AttachUIComponent
      store={store}
      actions={actions}
      parentEmitter={parentEventEmitter}
    />
  );
}

module.exports = {
  getComponent: _getComponent,
  name: 'Attach',
};
