'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

var {Dispatcher} = require('flux');

var quickopenDispatcher;
class QuickSelectionDispatcher {
  static ActionTypes: {[key:string]: string};

  static getInstance(): Dispatcher {
    if (!quickopenDispatcher) {
      quickopenDispatcher = new Dispatcher();
    }
    return quickopenDispatcher;
  }
}

QuickSelectionDispatcher.ActionTypes = {
  ACTIVE_PROVIDER_CHANGED: 'ACTIVE_PROVIDER_CHANGED',
  QUERY: 'QUERY',
};

module.exports = QuickSelectionDispatcher;
