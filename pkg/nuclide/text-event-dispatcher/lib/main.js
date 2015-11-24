'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import {TextEventDispatcher as TED} from './TextEventDispatcher';
// Flow complains if I use the same name for the type and the value :(
export type TextEventDispatcher = TED;

let dispatcher = null;
module.exports = {
  getInstance() {
    if (!dispatcher) {
      dispatcher = new TED();
    }
    return dispatcher;
  },
};
