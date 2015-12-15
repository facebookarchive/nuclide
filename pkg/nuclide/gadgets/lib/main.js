'use babel';
/* @flow */

/*
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the LICENSE file in
 * the root directory of this source tree.
 */

import type {Gadget} from '../../gadgets-interfaces';

import invariant from 'assert';
import {Disposable} from 'atom';

let activation: ?Object = null;

export function activate(state: ?Object) {
  if (activation != null) {
    return;
  }
  const Activation = require('./Activation');
  activation = new Activation(state);
}

export function deactivate() {
  if (activation == null) {
    return;
  }
  activation.dispose();
  activation = null;
}

export function consumeGadget(gadget: Gadget): atom$Disposable {
  invariant(activation);
  activation.commands.registerGadget(gadget);
  return new Disposable(() => {
    if (activation == null) {
      return;
    }
    activation.commands.unregisterGadget(gadget.gadgetId);
  });
}
