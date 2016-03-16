'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {TextEventDispatcher} from './TextEventDispatcher';
export type {TextEventDispatcher};

let dispatcher = null;
module.exports = {
  getInstance(): TextEventDispatcher {
    if (!dispatcher) {
      dispatcher = new TextEventDispatcher();
    }
    return dispatcher;
  },
};
