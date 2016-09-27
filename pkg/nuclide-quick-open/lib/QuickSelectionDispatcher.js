'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import Dispatcher from '../../commons-node/Dispatcher';

type QuickSelectionAction =
  {
    actionType: 'ACTIVE_PROVIDER_CHANGED',
    providerName: string,
  } |
  {
    actionType: 'QUERY',
    query: string,
  };

export const ActionTypes = Object.freeze({
  ACTIVE_PROVIDER_CHANGED: 'ACTIVE_PROVIDER_CHANGED',
  QUERY: 'QUERY',
});

// Flow hack: Every QuickSelectionAction actionType must be in ActionTypes.
(('': $PropertyType<QuickSelectionAction, 'actionType'>): $Keys<typeof ActionTypes>);

let instance: ?QuickSelectionDispatcher = null;

export default class QuickSelectionDispatcher extends Dispatcher<QuickSelectionAction> {
  static getInstance(): QuickSelectionDispatcher {
    if (!instance) {
      instance = new QuickSelectionDispatcher();
    }
    return instance;
  }
}
