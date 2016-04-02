'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

const {Dispatcher} = require('flux');

let quickopenDispatcher = null;
class QuickSelectionDispatcher {
  static ActionType = Object.freeze({
    ACTIVE_PROVIDER_CHANGED: 'ACTIVE_PROVIDER_CHANGED',
    QUERY: 'QUERY',
  });

  static getInstance(): Dispatcher {
    if (!quickopenDispatcher) {
      quickopenDispatcher = new Dispatcher();
    }
    return quickopenDispatcher;
  }
}

module.exports = QuickSelectionDispatcher;
